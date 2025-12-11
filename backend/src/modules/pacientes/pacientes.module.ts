import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacienteEntity } from './entities/paciente.entity';
import { PacienteRepository } from './repositories/paciente.repository';
import { PacienteService } from './services/paciente.service';
import { PacienteController } from './controllers/paciente.controller';
import { PersonasModule } from '../personas/personas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PacienteEntity]),
    PersonasModule,
  ],
  controllers: [PacienteController],
  providers: [PacienteService, PacienteRepository],
  exports: [PacienteService, PacienteRepository],
})
export class PacientesModule {}
