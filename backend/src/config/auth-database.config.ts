import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * Configuración de conexión a la base de datos centralizada de autenticación (HUB)
 * Esta conexión se usa exclusivamente para validar usuarios y roles
 */
@Injectable()
export class AuthDatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const DB_PASSWORD = this.configService.get<string>('DB_PASSWORD', '');
    const AUTH_DB_NAME = this.configService.get<string>('AUTH_DB_NAME', 'hospital_hub');
    
    if (!DB_PASSWORD) {
      throw new Error('DB_PASSWORD no está definida en el archivo .env');
    }

    console.log(`[AuthDatabaseConfig] Conectando a base de datos de autenticación: ${AUTH_DB_NAME}`);

    return {
      type: 'postgres',
      host: this.configService.get<string>('AUTH_DB_HOST') || this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('AUTH_DB_PORT') || this.configService.get<number>('DB_PORT', 5432),
      username: this.configService.get<string>('AUTH_DB_USERNAME') || this.configService.get<string>('DB_USERNAME', 'postgres'),
      password: this.configService.get<string>('AUTH_DB_PASSWORD') || DB_PASSWORD,
      database: AUTH_DB_NAME,
      entities: [__dirname + '/../modules/auth/entities/*.entity{.ts,.js}'],
      synchronize: false,
      logging: this.configService.get<string>('NODE_ENV') === 'development',
      ssl: this.configService.get<string>('DB_SSL') === 'true'
        ? {
            rejectUnauthorized: false,
          }
        : false,
      extra: {
        max: 10,
        min: 2,
        connectionTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
      },
    } as TypeOrmModuleOptions;
  }
}
