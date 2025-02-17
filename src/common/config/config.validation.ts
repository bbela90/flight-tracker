import { IsInt, IsString, Matches, MinLength } from 'class-validator';
import { Transform, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

export class ConfigValidationDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  PORT: number;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRATION_TIME: string;

  @IsString()
  @MinLength(5, { message: 'Username must be at least 8 characters long' })
  USER_NAME: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/\d/, { message: 'Password must contain at least one number' })
  @Matches(/[a-zA-Z]/, { message: 'Password must contain at least one letter' })
  PASSWORD: string;

  @IsString()
  DB_HOST_URL: string;

  @IsString()
  DB_NAME: string;

  @IsString()
  DB_FLIGHTS: string;
}

export function validateConfig(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(ConfigValidationDto, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
