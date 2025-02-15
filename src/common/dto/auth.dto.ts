import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDetailsDto {
  @ApiProperty({
    description: 'User’s username',
    type: 'string',
    example: 'johndoe',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'User’s password',
    type: 'string',
    example: 'SecureP@ss123',
  })
  @IsString()
  password: string;
}

export class TokenDto {
  @ApiProperty({
    description: 'Access token for authentication',
  })
  token: string;
}
