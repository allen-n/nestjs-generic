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
import { User } from '@prisma/client';
import { BcryptService } from '@utils/auth/bcrypt';
import { EnvironmentVariables } from '@utils/config/config';
import { randomBytesAsync } from '@utils/crypto';
import { randomBytes } from 'crypto';
import { validatedJwtUserInfo } from './types';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly bcryptService: BcryptService,
    private readonly configService: ConfigService<EnvironmentVariables>,
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
  async login(user: User) {
    const tokens = await this.getTokens(user.id, user.email);
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
          secret: this.configService.get('JWT_ACCESS_SECRET', { infer: true }),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username: email,
        },
        {
          secret: this.configService.get('JWT_REFRESH_SECRET', { infer: true }),
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

  async sendPasswordResetEmail(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new ForbiddenException('Access Denied: User not found');
    }
    const buffer = await randomBytesAsync(20);
    const token = buffer.toString('hex');
    await this.usersService.deleteAllPAsswordResetsByUserId(user.id);

    const reset = await this.usersService.createPasswordReset(user.id, token);
    this.logger.log(
      `Sending password reset email to ${email} with magic id ${reset.token}`,
    );

    // Note: You can use the EmailService to send emails here if desired, though the url will depend on your frontend implementation
    return { message: `Password reset email sent to ${email}` };
  }

  async checkPasswordResetToken(email: string, token: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new ForbiddenException('Access Denied: User not found');
    }
    const reset = await this.usersService.findPasswordReset(user.id, token);
    if (!reset) {
      throw new ForbiddenException(
        'Access Denied: Email mismatch with reset token',
      );
    }
    // There is a valid password reset token, so delete it
    await this.usersService.deleteAllPAsswordResetsByUserId(user.id);
    const isOutdated =
      new Date().getTime() - reset.createdAt.getTime() > 600000; // 10 minutes in milliseconds
    if (isOutdated) {
      throw new ForbiddenException(
        'Access Denied: Password reset token expired. Reset code deleted, please start over.',
      );
    }
    const tokens = await this.getTokens(user.id, user.email);
    return {
      email: user.email,
      message: 'Password reset token is valid',
      tokens: tokens,
    };
  }
}
