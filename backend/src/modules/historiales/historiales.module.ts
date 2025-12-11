import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialMedicoEntity } from './entities/historial-medico.entity';
import { HistorialMedicoRepository } from './repositories/historial-medico.repository';
import { HistorialMedicoService } from './services/historial-medico.service';
import { HistorialMedicoController } from './controllers/historial-medico.controller';
import { EmpleadosModule } from '../empleados/empleados.module';
import { PacientesModule } from '../pacientes/pacientes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HistorialMedicoEntity]),
    EmpleadosModule,
    PacientesModule,
  ],
  providers: [HistorialMedicoRepository, HistorialMedicoService],
  controllers: [HistorialMedicoController],
  exports: [HistorialMedicoRepository, HistorialMedicoService],
})
export class HistorialesModule {}
