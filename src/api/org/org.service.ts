import { Injectable } from '@nestjs/common';
import { CreateOrgDto } from './dto/create-org.dto';
import { UpdateOrgDto } from './dto/update-org.dto';
import { PrismaService } from '@utils/prisma/prisma.service';
import { Organization } from '@prisma/client';

@Injectable()
export class OrgService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createOrgDto: CreateOrgDto): Promise<Organization> {
    return this.prismaService.organization.create({
      data: { domain: createOrgDto.domain, name: createOrgDto.name },
    });
  }

  findOne(id: string) {
    return this.prismaService.organization.findUnique({ where: { id: id } });
  }

  update(id: string, updateOrgDto: UpdateOrgDto) {
    return this.prismaService.organization.update({
      where: { id: id },
      data: { domain: updateOrgDto.domain, name: updateOrgDto.name },
    });
  }

  remove(id: string) {
    return this.prismaService.organization.delete({ where: { id: id } });
  }
}
