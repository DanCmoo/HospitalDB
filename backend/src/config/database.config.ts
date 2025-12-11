import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const SEDE_ACTIVA = this.configService.get<string>('SEDE_ID', 'norte');
    const DB_PASSWORD = this.configService.get<string>('DB_PASSWORD', '');
    
    if (!DB_PASSWORD) {
      throw new Error('DB_PASSWORD no está definida en el archivo .env');
    }

    const sedesConfig: Record<string, Partial<TypeOrmModuleOptions>> = {
      norte: { database: 'hospital_sede_norte' },
      centro: { database: 'hospital_sede_centro' },
      sur: { database: 'hospital_sede_sur' },
    };

    const sedeConfig = sedesConfig[SEDE_ACTIVA];
    if (!sedeConfig) {
      throw new Error(`Configuración de sede inválida: ${SEDE_ACTIVA}. Use: norte, centro, o sur`);
    }

    console.log(`[DatabaseConfig] Conectando a sede: ${SEDE_ACTIVA.toUpperCase()}`);
    console.log(`[DatabaseConfig] Base de datos: ${sedeConfig.database}`);
    console.log(`[DatabaseConfig] Password configurado: ${DB_PASSWORD.length > 0 ? 'SI' : 'NO'}`);

    return {
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5432),
      username: this.configService.get<string>('DB_USERNAME', 'postgres'),
      password: DB_PASSWORD,
      database: sedeConfig.database,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: false,
      logging: this.configService.get<string>('NODE_ENV') === 'development',
      ssl: this.configService.get<string>('DB_SSL') === 'true'
        ? {
            rejectUnauthorized: false,
          }
        : false,
      extra: {
        max: 20,
        min: 5,
        connectionTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
      },
    } as TypeOrmModuleOptions;
  }
}
