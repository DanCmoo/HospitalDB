import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  check() {
    const uptime = process.uptime();
    const timestamp = new Date().toISOString();

    return {
      status: 'ok',
      message: 'Hospital Management System is running',
      timestamp,
      uptime: `${Math.floor(uptime)}s`,
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    };
  }

  async checkDatabase() {
    try {
      await this.connection.query('SELECT 1');

      return {
        status: 'ok',
        message: 'Database connection is healthy',
        database: process.env.DB_DATABASE || 'hospital_db',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return {
        status: 'error',
        message: 'Database connection failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
