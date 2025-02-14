import { IsInt, IsString } from 'class-validator';
import { Transform, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

export class ConfigValidationDto {
  @Transform(({ value }) => Number(value)) // Converts value to a number
  @IsInt()
  PORT: number;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRATION_TIME: string;

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
