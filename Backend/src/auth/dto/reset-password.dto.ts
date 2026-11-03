import { IsEmail, IsString, Length, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\[\]{};:'",.<>/?\\|`~]).+$/;

const PASSWORD_MESSAGE =
  'Password must be 8–50 characters and include an uppercase letter, ' +
  'a lowercase letter, a number, and a special character.';

export class ResetPasswordDto {
  @ApiProperty({ example: 'student@university.edu' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '483921',
    description: '6-digit reset code sent to email',
  })
  @IsString()
  @Length(6, 6)
  code!: string;

  @ApiProperty({
    example: 'NewSecure@123',
    description: PASSWORD_MESSAGE,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  newPassword!: string;
}
