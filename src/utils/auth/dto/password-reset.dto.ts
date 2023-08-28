import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class PasswordResetDto {
  @ApiProperty({ required: true })
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  username?: string;
}

export class CheckPasswordResetDto {
  @ApiProperty({ required: true })
  @IsEmail()
  email: string;

  @ApiProperty({ required: true })
  @IsString()
  resetToken: string;
}

export class PasswordResetResponseDto {
  @ApiProperty()
  message: string;
  @ApiProperty()
  valid: boolean;
}
