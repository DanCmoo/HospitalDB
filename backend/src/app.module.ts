import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './config/database.config';
import { SecurityHeadersMiddleware } from './common/middleware/security-headers.middleware';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { HealthModule } from './modules/health/health.module';
import { PersonasModule } from './modules/personas/personas.module';
import { EmpleadosModule } from './modules/empleados/empleados.module';
import { SedesModule } from './modules/sedes/sedes.module';
import { DepartamentosModule } from './modules/departamentos/departamentos.module';
import { PacientesModule } from './modules/pacientes/pacientes.module';
import { EquipamientoModule } from './modules/equipamiento/equipamiento.module';
import { MedicamentosModule } from './modules/medicamentos/medicamentos.module';
import { AgendaCitasModule } from './modules/agenda-citas/agenda-citas.module';
import { PrescripcionesModule } from './modules/prescripciones/prescripciones.module';
import { HistorialesModule } from './modules/historiales/historiales.module';
import { AuditoriaModule } from './modules/auditoria/auditoria.module';
import { PerteneceModule } from './modules/pertenece/pertenece.module';
import { AuthModule } from './modules/auth/auth.module';
import { ReportesModule } from './modules/reportes/reportes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      ignoreEnvFile: false,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfig,
      inject: [DatabaseConfig],
    }),
    AuthModule,
    HealthModule,
    PersonasModule,
    EmpleadosModule,
    SedesModule,
    DepartamentosModule,
    PacientesModule,
    EquipamientoModule,
    MedicamentosModule,
    AgendaCitasModule,
    PrescripcionesModule,
    HistorialesModule,
    AuditoriaModule,
    PerteneceModule,
    ReportesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityHeadersMiddleware, RequestLoggerMiddleware).forRoutes('*');
  }
}
