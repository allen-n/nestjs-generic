import { Module } from '@nestjs/common';
import { OrgService } from './org.service';
import { PrismaService } from '@utils/prisma/prisma.service';

@Module({
  exports: [OrgService],
  providers: [OrgService, PrismaService],
})
export class OrgModule {}
