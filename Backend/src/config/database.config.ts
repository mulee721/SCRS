import { ConfigService } from '@nestjs/config';
import { MongooseModuleFactoryOptions } from '@nestjs/mongoose';

export async function mongooseConfig(
  configService: ConfigService,
): Promise<MongooseModuleFactoryOptions> {
  const mongoUri = configService.get<string>('MONGODB_URI');

  if (!mongoUri) {
    // Fallback to host/port/db configuration
    const host = configService.get<string>('MONGODB_HOST') || 'localhost';
    const port = configService.get<number>('MONGODB_PORT') || 27017;
    const db = configService.get<string>('MONGODB_DB') || 'scrs';

    return {
      uri: `mongodb://${host}:${port}/${db}`,
      retryAttempts: 5,
      retryDelay: 5000,
    };
  }

  return {
    uri: mongoUri,
    retryAttempts: 5,
    retryDelay: 5000,
  };
}
