import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({
    example: 'CS',
    description: 'Department code (unique, uppercase)',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(10)
  code!: string;

  @ApiProperty({
    example: 'Computer Science',
    description: 'Department name',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    example: 'Study of computer science and programming',
    description: 'Department description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '+251911234567',
    description: 'Department phone number',
    required: false,
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    example: 'Building A, Floor 3',
    description: 'Office location',
    required: false,
  })
  @IsOptional()
  @IsString()
  officeLocation?: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Head lecturer ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  headId?: string;
}
