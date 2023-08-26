import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@utils/prisma/prisma.service';
import { UsersService } from '@api/users/users.service';
import { AuthService } from './auth.service';
import { BcryptService } from '@utils/auth/bcrypt';
import { ConfigModule } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        PrismaService,
        JwtService,
        BcryptService,
      ],
      imports: [ConfigModule],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
