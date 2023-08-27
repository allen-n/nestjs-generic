import { Module } from '@nestjs/common';
import { ApiKeyService } from '@utils/api-key/api-key.service';
import { BcryptService } from '@utils/auth/bcrypt';
import { PrismaService } from '@utils/prisma/prisma.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  exports: [UsersService],
  controllers: [UsersController],

  providers: [UsersService, PrismaService, BcryptService, ApiKeyService],
})
export class UsersModule {}
