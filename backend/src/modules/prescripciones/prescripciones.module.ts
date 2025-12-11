import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrescribeEntity } from './entities/prescribe.entity';
import { PrescribeRepository } from './repositories/prescribe.repository';
import { PrescribeService } from './services/prescribe.service';
import { PrescribeController } from './controllers/prescribe.controller';
import { MedicamentosModule } from '../medicamentos/medicamentos.module';
import { AgendaCitasModule } from '../agenda-citas/agenda-citas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PrescribeEntity]),
    MedicamentosModule,
    AgendaCitasModule,
  ],
  providers: [PrescribeRepository, PrescribeService],
  controllers: [PrescribeController],
  exports: [PrescribeRepository, PrescribeService],
})
export class PrescripcionesModule {}
