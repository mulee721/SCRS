import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Password complexity rule — must contain:
 *   • At least one uppercase letter
 *   • At least one lowercase letter
 *   • At least one digit
 *   • At least one special character  (!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`)
 */
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\[\]{};:'",.<>/?\\|`~]).+$/;

const PASSWORD_MESSAGE =
  'Password must be 8–50 characters and include an uppercase letter, ' +
  'a lowercase letter, a number, and a special character.';

export class RegisterDto {
  @ApiProperty({
    example: 'john.doe@students.university.edu',
    description: 'Student email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the student',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    example: 'Secure@Pass1',
    description: PASSWORD_MESSAGE,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password!: string;

  @ApiProperty({
    example: '+251911234567',
    description: 'Phone number',
  })
  @IsString()
  phone!: string;

  @ApiProperty({
    example: '6379af8c9d1e2b4a3c5f7e9d',
    description: 'Department ID (MongoDB ObjectId)',
  })
  @IsString()
  departmentId!: string;

  @ApiProperty({
    example: 1,
    description: 'Academic year (1–4)',
    minimum: 1,
    maximum: 4,
  })
  @IsNumber()
  @Min(1)
  @Max(4)
  academicYear!: number;
}
