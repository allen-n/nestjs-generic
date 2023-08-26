import { CreateOrgDto } from '@api/org/dto/create-org.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateOrgDto extends PartialType(CreateOrgDto) {}
