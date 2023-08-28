import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateApiKeyResponseDto } from '@utils/api-key/dto/create-api-key-success.dto';
import { CreateApiKeyDto } from '@utils/api-key/dto/create-api-key.dto';
import { randomBytesAsync } from '@utils/crypto';
import { PrismaService } from '@utils/prisma/prisma.service';

@Injectable()
export class ApiKeyService {
  constructor(private readonly prismaService: PrismaService) {}

  async createKey(
    createApiKeyDto: CreateApiKeyDto,
  ): Promise<CreateApiKeyResponseDto> {
    const buffer = await randomBytesAsync(32);
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
