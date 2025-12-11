import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipamientoEntity } from './entities/equipamiento.entity';
import { EquipamientoRepository } from './repositories/equipamiento.repository';
import { EquipamientoService } from './services/equipamiento.service';
import { EquipamientoController } from './controllers/equipamiento.controller';
import { EmpleadosModule } from '../empleados/empleados.module';
import { DepartamentosModule } from '../departamentos/departamentos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EquipamientoEntity]),
    EmpleadosModule,
    DepartamentosModule,
  ],
  controllers: [EquipamientoController],
  providers: [EquipamientoService, EquipamientoRepository],
  exports: [EquipamientoService, EquipamientoRepository],
})
export class EquipamientoModule {}
