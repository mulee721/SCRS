import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGradeDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Registration ID',
  })
  @IsString()
  registrationId!: string;

  @ApiProperty({
    example: 85,
    description: 'Score (0-100)',
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  score!: number;

  @ApiProperty({
    example: 'Good understanding of concepts',
    description: 'Feedback (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  feedback?: string;
}
