import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicamentoEntity } from './entities/medicamento.entity';
import { MedicamentoRepository } from './repositories/medicamento.repository';
import { MedicamentoService } from './services/medicamento.service';
import { MedicamentoController } from './controllers/medicamento.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MedicamentoEntity])],
  controllers: [MedicamentoController],
  providers: [MedicamentoService, MedicamentoRepository],
  exports: [MedicamentoService, MedicamentoRepository],
})
export class MedicamentosModule {}
