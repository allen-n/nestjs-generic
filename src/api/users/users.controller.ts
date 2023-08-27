import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiExcludeController, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

import { ApiKeyService } from '@utils/api-key/api-key.service';
import { JwtAuthGuard } from '@utils/auth/guards/jwt-auth.guard';
import { JwtAuthenticatedRequest } from '@utils/auth/types';
import { JwtBearer, SHOW_CONTROLLER_IN_SWAGGER } from '@utils/header';

const CONTROLLER_NAME = `user`;
@ApiTags(CONTROLLER_NAME)
@JwtBearer
@ApiExcludeController(SHOW_CONTROLLER_IN_SWAGGER)
@UseGuards(JwtAuthGuard)
@Controller(CONTROLLER_NAME)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly apiKeyService: ApiKeyService,
  ) {}

  @Get()
  async findOne(@Request() req: JwtAuthenticatedRequest) {
    const user = await this.usersService.findOne(req.user.userId);
    if (!user) {
      throw new HttpException(`Error: No user found `, HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Patch()
  update(
    @Request() req: JwtAuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (!req.user.userId) {
      throw new HttpException(`Error: No user found `, HttpStatus.NOT_FOUND);
    }
    return this.usersService.update(req.user.userId, updateUserDto);
  }

  @Delete()
  remove(@Request() req: JwtAuthenticatedRequest) {
    if (!req.user.userId) {
      throw new HttpException(`Error: No user found `, HttpStatus.NOT_FOUND);
    }
    return this.usersService.remove(req.user.userId);
  }

  @Get('api-keys')
  async getApiKeys(@Request() req: JwtAuthenticatedRequest) {
    return this.apiKeyService.findKeyByOwner(req.user.userId);
  }

  @Post('api-key')
  async createApiKey(@Request() req: JwtAuthenticatedRequest) {
    const user = await this.usersService.findOne(req.user.userId);
    if (!user) {
      throw new HttpException(`Error: No user found `, HttpStatus.NOT_FOUND);
    }
    return this.apiKeyService.createKey({
      userId: user.id,
      organizationId: user.organizationId,
    });
  }

  @Delete('api-key/:id')
  async deleteApiKey(
    @Param('id') id: string,
    @Request() req: JwtAuthenticatedRequest,
  ) {
    const user = await this.usersService.findOne(req.user.userId);
    if (!user) {
      throw new HttpException(`Error: No user found `, HttpStatus.NOT_FOUND);
    }
    return this.apiKeyService.deleteKey(id, user.id, user.organizationId);
  }
}
