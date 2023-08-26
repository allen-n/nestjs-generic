import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrgDto {
  @ApiProperty({
    description:
      'The domain of the organization (i.e. some written unique identifier).',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  domain: string;

  @ApiProperty({
    required: false,
    description: 'The name of the organization.',
  })
  @IsOptional()
  @IsString()
  name?: string;
}
