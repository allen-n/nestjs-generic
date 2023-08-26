import { CreateUserDto } from '@api/users/dto/create-user.dto';
import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExcludeController,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@utils/auth/guards/jwt-auth.guard';
import { RefreshTokenGuard } from '@utils/auth/guards/refresh-token.guard';
import { AuthenticatedPrivateRequest } from '@utils/auth/types';
import {
  SHOW_CONTROLLER_IN_SWAGGER,
  JwtBearer,
  JwtHeader,
  sJwtBearer,
} from '../header';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

const CONTROLLER_NAME = `auth`;
@ApiTags(CONTROLLER_NAME)
@ApiExcludeController(SHOW_CONTROLLER_IN_SWAGGER)
@JwtBearer
@Controller(CONTROLLER_NAME)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  async login(@Request() req: AuthenticatedPrivateRequest) {
    return this.authService.login(req.user);
  }

  @Get('logout')
  @JwtHeader
  @ApiBearerAuth(sJwtBearer)
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req: AuthenticatedPrivateRequest) {
    return this.authService.logout(req.user);
  }

  @Get('refresh')
  @ApiBearerAuth(sJwtBearer)
  @UseGuards(RefreshTokenGuard)
  async refresh(@Request() req: AuthenticatedPrivateRequest) {
    return this.authService.refreshTokens(
      req.user.userId,
      req.user.refreshToken,
    );
  }
}
