import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
export class CreateApiKeyDto {
  @ApiProperty()
  @IsString()
  @Length(20, 26)
  userId: string;

  @ApiProperty()
  @IsString()
  @Length(20, 26)
  organizationId: string;
}
