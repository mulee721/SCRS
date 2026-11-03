import { plainToClass } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync, IsOptional } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV!: Environment;

  @IsNumber()
  PORT!: number;

  @IsOptional()
  @IsString()
  MONGODB_URI?: string;

  @IsOptional()
  @IsString()
  MONGODB_HOST?: string;

  @IsOptional()
  @IsNumber()
  MONGODB_PORT?: number;

  @IsOptional()
  @IsString()
  MONGODB_DB?: string;

  @IsString()
  JWT_SECRET!: string;

  @IsNumber()
  JWT_EXPIRATION!: number;

  @IsString()
  JWT_REFRESH_SECRET!: string;

  @IsNumber()
  JWT_REFRESH_EXPIRATION!: number;

  @IsString()
  CORS_ORIGIN!: string;

  @IsOptional()
  @IsString()
  MAIL_SERVICE?: string;

  @IsOptional()
  @IsString()
  MAIL_USER?: string;

  @IsOptional()
  @IsString()
  MAIL_PASSWORD?: string;

  @IsNumber()
  CREDIT_LIMIT!: number;

  @IsString()
  REQUIRE_APPROVAL!: string;

  @IsString()
  UNIVERSITY_NAME!: string;

  @IsOptional()
  @IsString()
  LOG_LEVEL?: string;

  /** bcrypt work-factor (default 12). Must be between 10 and 15. */
  @IsOptional()
  @IsNumber()
  BCRYPT_ROUNDS?: number;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (
    !validatedConfig.MONGODB_URI &&
    (!validatedConfig.MONGODB_HOST || !validatedConfig.MONGODB_PORT || !validatedConfig.MONGODB_DB)
  ) {
    throw new Error('Configure MONGODB_URI or all of MONGODB_HOST, MONGODB_PORT, and MONGODB_DB');
  }

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
