import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsTimeZone, Length } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @Length(8, 32)
  password: string;

  @ApiProperty({ required: false })
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  username?: string;

  @ApiProperty({ required: false })
  @IsTimeZone()
  @IsOptional()
  timezone?: string;

  refreshToken?: string;
  organizationId: string;
}
