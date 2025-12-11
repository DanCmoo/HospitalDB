import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartamentoEntity } from './entities/departamento.entity';
import { DepartamentoRepository } from './repositories/departamento.repository';
import { DepartamentoService } from './services/departamento.service';
import { DepartamentoController } from './controllers/departamento.controller';
import { SedesModule } from '../sedes/sedes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DepartamentoEntity]),
    SedesModule,
  ],
  controllers: [DepartamentoController],
  providers: [DepartamentoService, DepartamentoRepository],
  exports: [DepartamentoService, DepartamentoRepository],
})
export class DepartamentosModule {}
