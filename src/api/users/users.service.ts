import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@utils/prisma/prisma.service';

import { BcryptService } from '@utils/auth/bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly bcryptService: BcryptService,
  ) {}

  async create(data: CreateUserDto) {
    // For now, create a personal org for each user
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new HttpException(
        `Error: A user with email ${data.email} already exists`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const passwordHash = await this.bcryptService.hash(data.password);
    const refreshTokenHash = !!data.refreshToken
      ? await this.bcryptService.hash(data.refreshToken)
      : null;
    const readableName = data.name || data.username || data.email;
    return this.prismaService.user.create({
      data: {
        email: data.email,
        passwordHash: passwordHash,
        username: data.username,
        name: data.name,
        timezone: data.timezone,
        refreshToken: refreshTokenHash,
        organization: {
          create: {
            name: `${readableName}'s Personal Organization`,
            domain: `${readableName}.personal`,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prismaService.user.findUnique({
      where: { id: id },
    });
  }

  async findUser(id: string) {
    return this.prismaService.user.findUnique({
      where: { id: id },
    });
  }

  async findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email: email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const passwordHash = updateUserDto.password
      ? await this.bcryptService.hash(updateUserDto.password)
      : null;

    delete updateUserDto.password;
    const data: Prisma.UserUpdateInput = {
      ...updateUserDto,
    };
    if (passwordHash) {
      data.passwordHash = passwordHash;
    }
    return this.prismaService.user.update({
      where: { id: id },
      data: data,
    });
  }

  async remove(id: string) {
    return this.prismaService.user.delete({ where: { id: id } });
  }

  async deleteAllPAsswordResetsByUserId(userId: string) {
    return this.prismaService.passwordReset.deleteMany({
      where: { userId: userId },
    });
  }

  async createPasswordReset(userId: string, token: string) {
    return this.prismaService.passwordReset.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        token: token,
      },
    });
  }

  async findPasswordReset(userId: string, token: string) {
    return this.prismaService.passwordReset.findUnique({
      where: { token: token, userId: userId },
    });
  }

  async deletePasswordResetsOlderThan(date: Date) {
    return this.prismaService.passwordReset.deleteMany({
      where: {
        createdAt: {
          lt: date,
        },
      },
    });
  }

  async deletePasswordReset(id: string) {
    return this.prismaService.passwordReset.delete({
      where: { id: id },
    });
  }
}
