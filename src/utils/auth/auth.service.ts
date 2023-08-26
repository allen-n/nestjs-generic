import { CreateUserDto } from '@api/users/dto/create-user.dto';
import { UsersService } from '@api/users/users.service';
import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { BcryptService } from '@utils/auth/bcrypt';
import { CreateApiKeySuccessDto as CreateApiKeyResultDto } from '@utils/auth/dto/create-api-key-success.dto';
import { CreateApiKeyDto } from '@utils/auth/dto/create-api-key.dto';
import { EnvKeys } from '@utils/env';
import { PrismaService } from '@utils/prisma/prisma.service';
import { randomBytes } from 'crypto';
import { validatedJwtUserInfo } from './types';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly bcryptService: BcryptService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async signup(data: CreateUserDto) {
    const user = await this.usersService.create(data);

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    const updatedUser = await this.usersService.update(user.id, {
      refreshToken: await this.bcryptService.hash(tokens.refreshToken),
    });
    this.logger.log(`Created user with email: ${user.email}`);
    return { user: updatedUser, tokens: tokens };
  }

  async validateUser(
    email: string,
    plaintextPass: string,
  ): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException(
        `Error: No user found with email ${email}`,
      );
    }
    const validPassword = await this.bcryptService.compare(
      plaintextPass,
      user.passwordHash,
    );
    if (!validPassword) {
      return null;
    }

    delete user.passwordHash; // Remove the hashed password
    return user;
  }

  /**
   * logs the given user in and returns a JWT token for them
   * @param user
   * @returns
   */
  async login(user: validatedJwtUserInfo) {
    const tokens = await this.getTokens(user.userId, user.email);
    return {
      username: user.email,
      ...tokens,
    };
  }

  async logout(user: validatedJwtUserInfo) {
    await this.usersService.update(user.userId, { refreshToken: null });
    return { message: 'Logged out successfully' };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.bcryptService.hash(refreshToken);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getTokens(
    userId: string,
    email: string,
  ): Promise<{ refreshToken: string; accessToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username: email,
        },
        {
          expiresIn: '15m',
          secret: this.configService.getOrThrow(EnvKeys.JWT_ACCESS_SECRET),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username: email,
        },
        {
          secret: this.configService.getOrThrow(EnvKeys.JWT_REFRESH_SECRET),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findUser(userId);
    if (!user) {
      throw new ForbiddenException('Access Denied: User not found');
    }
    if (!user.refreshToken) {
      throw new ForbiddenException(
        'Access Denied: User does not have a refresh token',
      );
    }

    const refreshTokenMatches = await this.bcryptService.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!refreshTokenMatches) {
      throw new ForbiddenException('Access Denied: Bad refresh token');
    }
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async createKey(
    createApiKeyDto: CreateApiKeyDto,
  ): Promise<CreateApiKeyResultDto> {
    const buffer = randomBytes(32);
    const keyHexString = `sk-${buffer.toString('hex')}`;
    const existingKeys = await this.findKeyByOwner(createApiKeyDto.userId);
    const result = await this.prismaService.apiKey.create({
      data: {
        user: { connect: { id: createApiKeyDto.userId } },
        organization: { connect: { id: createApiKeyDto.organizationId } },
        key: keyHexString,
        name: `Personal Key - ${existingKeys.length + 1}`,
      },
      include: {
        user: true,
      },
    });
    if (!result) {
      return {
        apiKey: null,
        success: false,
        message: 'API key creation failed. Please try again.',
        ownerEmail: result.user.email,
      };
    }
    return {
      apiKey: result.key,
      success: true,
      message:
        "API key created successfully. Please copy the key in the `apiKey` field and store it in a safe place, as you won't be able to retrieve it again. ",
      ownerEmail: result.user.email,
    };
  }

  async getApiKey(key: string, includes?: Prisma.ApiKeyInclude) {
    const input: Prisma.ApiKeyWhereUniqueInput = { key: key };
    if (includes) {
      return this.prismaService.apiKey.findUnique({
        where: input,
        include: includes,
      });
    }
    return this.prismaService.apiKey.findUnique({
      where: { key: key },
    });
  }

  /**
   * Get the key, along with the user and organization metadata
   * @param key The api key's value
   * @returns
   */
  async getKeyWithMetadata(key: string) {
    return this.getApiKey(key, { organization: true, user: true });
  }

  async isKeyValid(key: string): Promise<boolean> {
    const result = await this.getApiKey(key);
    return !!result;
  }

  async findKeyByOwner(ownerId: string) {
    return this.prismaService.apiKey.findMany({
      where: { userId: ownerId },
    });
  }

  async deleteKey(key: string, ownerId: string, orgId: string) {
    const result = await this.prismaService.apiKey.delete({
      where: { key: key, userId: ownerId, organizationId: orgId },
    });
    return result;
  }
}
