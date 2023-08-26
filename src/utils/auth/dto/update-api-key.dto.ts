import { PartialType } from '@nestjs/swagger';
import { CreateApiKeyDto } from './create-api-key.dto';
// import { ApiProperty } from '@nestjs/swagger';

export class UpdateApiKeyDto extends PartialType(CreateApiKeyDto) {}
