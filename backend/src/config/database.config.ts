import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const isProduction = process.env.NODE_ENV === 'production';
    const isAwsRds = process.env.DB_HOST?.includes('rds.amazonaws.com');

    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE || 'hospital_db',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      // SSL configuration for AWS RDS
      ssl: isAwsRds
        ? {
            rejectUnauthorized: false,
          }
        : false,
      extra: {
        // Connection pool settings
        max: 20,
        min: 5,
        connectionTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
      },
    };
  }
}
