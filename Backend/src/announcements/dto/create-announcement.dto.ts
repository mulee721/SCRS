import { IsString, IsEnum, IsOptional, MinLength, MaxLength, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'Registration Extended' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @ApiProperty({ example: 'Registration deadline extended to September 20' })
  @IsString()
  @MinLength(10)
  body!: string;

  @ApiProperty({
    example: 'all',
    enum: ['all', 'students', 'lecturers', 'department', 'course'],
  })
  @IsEnum(['all', 'students', 'lecturers', 'department', 'course'])
  audience!: string;

  @ApiProperty({ example: '507f...', required: false })
  @IsOptional()
  @IsString()
  targetDepartmentId?: string;

  @ApiProperty({ example: '507f...', required: false })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiProperty({ example: '2026-12-31', required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}
