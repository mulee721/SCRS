// @ts-nocheck
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { StudentsService } from '../students/students.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PasswordReset, PasswordResetDocument } from './entities/password-reset.schema';
import { MailService } from './mail.service';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private studentsService: StudentsService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectModel(PasswordReset.name) private passwordResetModel: Model<PasswordResetDocument>,
    private mailService: MailService,
  ) {}

  /**
   * Register a new student
   */
  async register(registerDto: RegisterDto) {
    // First, create user account (this will have the userId we need for student)
    const user = await this.usersService.create(
      registerDto.email,
      registerDto.email.split('@')[0], // Use email prefix as username
      registerDto.password,
      Role.STUDENT,
      'temp', // temp value, will be updated after student is created
    );

    // Then create student with the correct userId
    const student = await this.studentsService.create({
      name: registerDto.name,
      email: registerDto.email,
      phone: registerDto.phone,
      departmentId: registerDto.departmentId,
      academicYear: registerDto.academicYear,
      userId: user._id.toString(), // Pass userId
    });

    // Update user's refId to point to the student, and get the updated user
    const updatedUser = await this.usersService.updateRefId(
      user._id.toString(),
      student._id.toString(),
    );

    // Generate tokens with the updated user (which now has correct refId)
    const tokens = await this.generateTokens(updatedUser);

    return {
      success: true,
      message: 'Student registered successfully',
      data: {
        user: {
          id: updatedUser._id,
          refId: updatedUser.refId,
          email: updatedUser.email,
          name: registerDto.name,
          role: updatedUser.role,
        },
        ...tokens,
      },
    };
  }

  /**
   * Login user with email/username and password
   */
  async login(loginDto: LoginDto) {
    // Find user by email or username
    const user = await this.usersService.findByIdentifierWithPassword(loginDto.identifier);

    if (!user) {
      throw new UnauthorizedException('Invalid email/username or password');
    }

    // Verify password
    const isPasswordValid = await this.usersService.verifyPassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email/username or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('This account has been deactivated');
    }

    // Update last login
    await this.usersService.updateLastLogin(user._id.toString());

    // Get user role data for response
    const userData: any = {
      id: user._id,
      refId: user.refId,
      email: user.email,
      role: user.role,
    };

    if (user.role === Role.STUDENT) {
      const student = await this.studentsService.findById(user.refId);
      if (student) {
        userData.name = student.name;
      }
    } else if (user.role === Role.LECTURER) {
      // Implement lecturer lookup in Phase 4
      userData.name = user.email;
    } else if (user.role === Role.ADMIN) {
      userData.name = 'Administrator';
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        ...tokens,
      },
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshTokenDto.refresh_token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Check if refresh token is still stored (not revoked)
      const hasToken = await this.usersService.hasRefreshToken(
        payload.sub,
        refreshTokenDto.refresh_token,
      );

      if (!hasToken) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }

      // Get user
      const user = await this.usersService.findById(payload.sub);

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      return {
        success: true,
        message: 'Token refreshed successfully',
        data: tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Logout user by revoking refresh token
   */
  async logout(userId: string, refreshToken: string) {
    await this.usersService.removeRefreshToken(userId, refreshToken);

    return {
      success: true,
      message: 'Logout successful',
    };
  }

  /**
   * Generate JWT access and refresh tokens
   */
  private async generateTokens(user: any) {
    const jwtExpiration = this.configService.get<number>('JWT_EXPIRATION') || 900;
    const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const jwtRefreshExpiration = this.configService.get<number>('JWT_REFRESH_EXPIRATION') || 604800;

    // Create access token payload (without exp - let JWT module handle it)
    const accessPayload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      refId: user.refId,
    };

    // Generate access token with expiresIn option
    const access_token = this.jwtService.sign(accessPayload, {
      expiresIn: jwtExpiration,
    });

    // Generate refresh token with secret and expiration
    const refresh_token = this.jwtService.sign(
      {
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      {
        secret: jwtRefreshSecret,
        expiresIn: jwtRefreshExpiration,
      },
    );

    // Store refresh token in user's refreshTokens array
    await this.usersService.addRefreshToken(user._id.toString(), refresh_token);

    return {
      access_token,
      refresh_token,
      token_type: 'Bearer',
      expires_in: jwtExpiration,
    };
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(userId: string) {
    const user = await this.usersService.findById(userId);

    let roleData = {};

    if (user.role === Role.STUDENT) {
      const student = await this.studentsService.findById(user.refId);
      roleData = {
        name: student?.name || user.email,
        studentId: student?._id,
      };
    } else if (user.role === Role.LECTURER) {
      // Implement in Phase 4
      roleData = { name: user.email };
    } else if (user.role === Role.ADMIN) {
      roleData = { name: 'Administrator' };
    }

    return {
      success: true,
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        ...roleData,
      },
    };
  }

  async forgotPassword(dto: any) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundException(`No account found for ${dto.email}`);
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeSalt = await bcrypt.genSalt(10);
    const codeHash = await bcrypt.hash(code, codeSalt);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await this.passwordResetModel.create({
      email: user.email,
      code: codeHash,
      expiresAt,
      used: false,
    });
    let userName = 'User';
    if (user.role === 'student') {
      const student = await this.studentsService.findByUserId((user._id as any).toString());
      if (student) userName = student.fullName || 'Student';
    }
    await this.mailService.sendPasswordResetCode(user.email, code, userName);
    return {
      success: true,
      message: 'Reset code sent to your email. Check your inbox.',
    };
  }

  async verifyResetCode(dto: any) {
    const resetRequest = await this.passwordResetModel
      .findOne({
        email: dto.email.toLowerCase(),
        used: false,
        expiresAt: { $gt: new Date() },
      })
      .sort({ createdAt: -1 });
    if (!resetRequest) {
      throw new BadRequestException(
        'Reset code expired or not found. Request a new one.',
      );
    }
    const isCodeValid = await bcrypt.compare(dto.code, resetRequest.code);
    if (!isCodeValid) {
      throw new BadRequestException('Incorrect reset code.');
    }
    return {
      success: true,
      message: 'Code verified. You can now reset your password.',
    };
  }

  async resetPassword(dto: any) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    const resetRequest = await this.passwordResetModel
      .findOne({
        email: dto.email.toLowerCase(),
        used: false,
        expiresAt: { $gt: new Date() },
      })
      .sort({ createdAt: -1 });
    if (!resetRequest) {
      throw new BadRequestException(
        'Reset code expired or not found. Request a new one.',
      );
    }
    const isCodeValid = await bcrypt.compare(dto.code, resetRequest.code);
    if (!isCodeValid) {
      throw new BadRequestException('Incorrect reset code.');
    }
    const pwSalt = await bcrypt.genSalt(10);
    const pwHash = await bcrypt.hash(dto.newPassword, pwSalt);
    const userId = (user._id as any).toString();
    await this.usersService.updatePassword(userId, pwHash);
    await (this.passwordResetModel as any).updateOne(
      { _id: resetRequest._id },
      { used: true },
    );
    await this.usersService.clearRefreshTokens(userId);
    return {
      success: true,
      message: 'Password reset successful. Please sign in with your new password.',
    };
  }
}
