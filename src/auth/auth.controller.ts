import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDetailsDto, TokenDto } from '../common/dto/auth.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a token for a user',
    operationId: 'createToken',
  })
  @ApiBody({
    description: 'User credentials',
    required: true,
    type: LoginDetailsDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Successful operation',
    type: TokenDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid payload' })
  @ApiResponse({ status: 500, description: 'Something went wrong' })
  login(@Body() loginData: LoginDetailsDto): TokenDto {
    return this.authService.login(loginData);
  }
}
