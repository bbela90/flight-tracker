import { IsNumber, IsString } from 'class-validator';
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

export class JwtPayloadDto {
  @IsString()
  username: string;

  @IsString()
  sub: string;

  @IsNumber()
  iat: number;

  @IsNumber()
  exp: number;
}

export class VerifiedUserDataDto {
  @IsString()
  username: string;

  @IsString()
  id: string;
}
