import { ApiProperty } from '@nestjs/swagger';

export class CreateApiKeyResponseDto {
  @ApiProperty()
  apiKey: string;
  @ApiProperty()
  success: boolean;
  @ApiProperty()
  message: string;
  @ApiProperty()
  ownerEmail: string;
}
