import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyCodeDto {
  @ApiProperty({ example: 'student@university.edu' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '483921' })
  @IsString()
  @Length(6, 6)
  code!: string;
}
