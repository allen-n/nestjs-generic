import { Module } from '@nestjs/common';
import { AuthModule } from '@utils/auth/auth.module';
import { BcryptService } from '@utils/auth/bcrypt';
import { PrismaService } from '@utils/prisma/prisma.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  exports: [UsersService],
  controllers: [UsersController],
  imports: [AuthModule],
  providers: [UsersService, PrismaService, BcryptService],
})
export class UsersModule {}
