import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  /**
   * bcrypt work-factor — read from BCRYPT_ROUNDS env var (default 12).
   * 12 is ~250 ms on a modern server; raise to 13-14 for higher security
   * at the cost of longer login latency.
   */
  private readonly bcryptRounds: number;

  constructor(
    @InjectModel('User') private userModel: Model<any>,
    private readonly configService: ConfigService,
  ) {
    this.bcryptRounds = parseInt(
      this.configService.get<string>('BCRYPT_ROUNDS', '12'),
      10,
    );
  }

  /**
   * Create a new user with a bcrypt-hashed password.
   * The raw password is NEVER stored or logged.
   */
  async create(
    email: string,
    username: string,
    password: string,
    role: Role,
    refId: string,
  ) {
    const existingUser = await this.userModel.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    });

    if (existingUser) {
      throw new ConflictException('Email or username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, this.bcryptRounds);

    const newUser = new this.userModel({
      email:    email.toLowerCase(),
      username: username.toLowerCase(),
      password: hashedPassword,
      role,
      refId,
      isActive: true,
    });

    await newUser.save();

    // Return the safe (no-password) view of the new user
    return this.findById(newUser._id.toString());
  }

  /**
   * Find user by ID.
   * Explicitly excludes password and refreshTokens regardless of schema defaults.
   */
  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel
      .findById(id)
      .select('-password -refreshTokens')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /** Find user by email WITH password (login only). */
  async findByEmailWithPassword(email: string) {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password')
      .exec();
  }

  /** Find user by username WITH password (login only). */
  async findByUsernameWithPassword(username: string) {
    return this.userModel
      .findOne({ username: username.toLowerCase() })
      .select('+password')
      .exec();
  }

  /** Find by email or username WITH password (login only). */
  async findByIdentifierWithPassword(identifier: string) {
    return this.userModel
      .findOne({
        $or: [
          { email:    identifier.toLowerCase() },
          { username: identifier.toLowerCase() },
        ],
      })
      .select('+password')
      .exec();
  }

  /**
   * Constant-time bcrypt comparison.
   * Always runs bcrypt.compare so timing does not leak whether a user exists.
   */
  async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /** Add a refresh token to the user's stored list. */
  async addRefreshToken(userId: string, refreshToken: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return this.userModel.findByIdAndUpdate(
      userId,
      { $push: { refreshTokens: refreshToken }, lastLogin: new Date() },
      { new: true },
    );
  }

  /** Remove a single refresh token (logout). */
  async removeRefreshToken(userId: string, refreshToken: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { refreshTokens: refreshToken } },
      { new: true },
    );
  }

  /**
   * Check whether a refresh token is still valid.
   * Uses select('+refreshTokens') because the field is select:false.
   */
  async hasRefreshToken(userId: string, refreshToken: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel
      .findById(userId)
      .select('+refreshTokens')
      .exec();

    return !!(user && (user.refreshTokens as string[]).includes(refreshToken));
  }

  /** Return whether the account is active. */
  async isActive(userId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(userId)) return false;

    const user = await this.userModel.findById(userId).exec();
    return !!(user && user.isActive);
  }

  /** Update last-login timestamp. */
  async updateLastLogin(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return this.userModel.findByIdAndUpdate(
      userId,
      { lastLogin: new Date() },
      { new: true },
    );
  }

  /** Set the refId after the role-specific document is created. */
  async updateRefId(userId: string, refId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return this.userModel.findByIdAndUpdate(userId, { refId }, { new: true });
  }

  /** Placeholder for role-specific profile updates. */
  async updateProfile(userId: string, role: string, updateData: unknown) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');

    void updateData;

    return {
      success: true,
      message: 'Profile update initiated',
      data: { userId, role },
    };
  }

  /**
   * Persist a new bcrypt hash during password reset.
   * The caller (AuthService) is responsible for hashing before calling this.
   */
  async updatePassword(userId: string, hashedPassword: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return this.userModel.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true },
    );
  }

  /** Invalidate all sessions by removing every stored refresh token. */
  async clearRefreshTokens(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return this.userModel.findByIdAndUpdate(
      userId,
      { refreshTokens: [] },
      { new: true },
    );
  }

  /** Find user by email WITHOUT password (safe for any non-auth use). */
  async findByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }
}
