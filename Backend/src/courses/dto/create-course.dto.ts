import { IsString, IsNumber, IsOptional, Min, Max, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class SlotDto {
  @ApiProperty({
    example: 'Mon',
    enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  })
  @IsString()
  day!: string;

  @ApiProperty({
    example: 8,
    description: 'Start time (0-23)',
  })
  @IsNumber()
  @Min(0)
  @Max(23)
  startTime!: number;

  @ApiProperty({
    example: 10,
    description: 'End time (0-23)',
  })
  @IsNumber()
  @Min(0)
  @Max(23)
  endTime!: number;

  @ApiProperty({
    example: 'B-201',
  })
  @IsString()
  room!: string;
}

export class CreateCourseDto {
  @ApiProperty({
    example: 'CS201',
    description: 'Course code (unique)',
  })
  @IsString()
  code!: string;

  @ApiProperty({
    example: 'Data Structures & Algorithms',
  })
  @IsString()
  title!: string;

  @ApiProperty({
    example: 'Study of arrays, trees, graphs and algorithms',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 4,
    description: 'Credit hours (1-4)',
  })
  @IsNumber()
  @Min(1)
  @Max(4)
  credits!: number;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Department ID',
  })
  @IsString()
  departmentId!: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439012',
    description: 'Semester ID',
  })
  @IsString()
  semesterId!: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439013',
    description: 'Lecturer ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  lecturerId?: string;

  @ApiProperty({
    example: 60,
    description: 'Course capacity',
  })
  @IsNumber()
  @Min(1)
  capacity!: number;

  @ApiProperty({
    type: [SlotDto],
    description: 'Time slots (day, start/end time, room)',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlotDto)
  slots?: SlotDto[];

  @ApiProperty({
    example: ['507f1f77bcf86cd799439001'],
    description: 'Prerequisite course IDs',
    required: false,
  })
  @IsOptional()
  @IsArray()
  prerequisites?: string[];
}
