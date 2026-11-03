import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token (15 minutes expiration)',
  })
  access_token!: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token (7 days expiration)',
  })
  refresh_token!: string;

  @ApiProperty({
    example: 'student',
    description: 'User role',
  })
  role!: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User display name',
  })
  name!: string;

  @ApiProperty({
    example: 'john.doe@students.university.edu',
    description: 'User email',
  })
  email!: string;
}
