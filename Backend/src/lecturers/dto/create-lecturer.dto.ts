import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\[\]{};:'",.<>/?\\|`~]).+$/;

const PASSWORD_MESSAGE =
  'Password must be 8–50 characters and include an uppercase letter, ' +
  'a lowercase letter, a number, and a special character.';

export class CreateLecturerDto {
  @ApiProperty({ example: 'Dr. Abebe Mekonnen' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'abebe@university.edu' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+251911234567' })
  @IsString()
  phone!: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Department ID',
  })
  @IsString()
  departmentId!: string;

  @ApiProperty({ example: 'Associate Professor' })
  @IsString()
  title!: string;

  @ApiProperty({
    example: 'SecurePass@123',
    description: PASSWORD_MESSAGE,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password!: string;

  @ApiProperty({ example: 'PhD in Computer Science', required: false })
  @IsOptional()
  @IsString()
  qualification?: string;

  @ApiProperty({ example: 'Building A, Room 301', required: false })
  @IsOptional()
  @IsString()
  officeLocation?: string;
}
