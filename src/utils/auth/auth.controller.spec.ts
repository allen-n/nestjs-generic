import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@utils/prisma/prisma.service';
import { UsersService } from '@api/users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BcryptService } from '@utils/auth/bcrypt';
import { ConfigModule } from '@nestjs/config';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        UsersService,
        PrismaService,
        JwtService,
        BcryptService,
      ],
      imports: [ConfigModule],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
