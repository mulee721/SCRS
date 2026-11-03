import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRegistrationDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Course ID',
  })
  @IsString()
  courseId!: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439012',
    description: 'Semester ID',
  })
  @IsString()
  semesterId!: string;
}

export class ApproveRegistrationDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439013',
    description: 'Registration ID to approve',
  })
  @IsString()
  registrationId!: string;
}
