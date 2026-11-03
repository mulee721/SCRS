import { IsString, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSemesterDto {
  @ApiProperty({
    example: 'Fall 2026',
    description: 'Semester name',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: '2026-09-01',
    description: 'Semester start date (YYYY-MM-DD)',
  })
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    example: '2026-12-20',
    description: 'Semester end date (YYYY-MM-DD)',
  })
  @IsDateString()
  endDate!: string;

  @ApiProperty({
    example: '2026-09-01',
    description: 'Registration open date (YYYY-MM-DD)',
  })
  @IsDateString()
  registrationOpenDate!: string;

  @ApiProperty({
    example: '2026-09-15',
    description: 'Registration close date (YYYY-MM-DD)',
  })
  @IsDateString()
  registrationCloseDate!: string;

  @ApiProperty({
    example: 'upcoming',
    enum: ['upcoming', 'active', 'closed'],
    description: 'Semester status',
    required: false,
  })
  @IsOptional()
  @IsEnum(['upcoming', 'active', 'closed'])
  status?: string;
}

export class ChangeSemesterStatusDto {
  @ApiProperty({
    example: 'active',
    enum: ['upcoming', 'active', 'closed'],
    description: 'New status',
  })
  @IsEnum(['upcoming', 'active', 'closed'])
  status!: string;
}
