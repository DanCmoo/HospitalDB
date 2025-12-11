import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgendaCitaEntity } from './entities/agenda-cita.entity';
import { AgendaCitaRepository } from './repositories/agenda-cita.repository';
import { AgendaCitaService } from './services/agenda-cita.service';
import { AgendaCitaController } from './controllers/agenda-cita.controller';
import { EmpleadosModule } from '../empleados/empleados.module';
import { PacientesModule } from '../pacientes/pacientes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgendaCitaEntity]),
    EmpleadosModule,
    PacientesModule,
  ],
  providers: [AgendaCitaRepository, AgendaCitaService],
  controllers: [AgendaCitaController],
  exports: [AgendaCitaRepository, AgendaCitaService],
})
export class AgendaCitasModule {}
