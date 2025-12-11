import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerteneceEntity } from './entities/pertenece.entity';
import { PerteneceRepository } from './repositories/pertenece.repository';
import { PerteneceService } from './services/pertenece.service';
import { PerteneceController } from './controllers/pertenece.controller';
import { DepartamentosModule } from '../departamentos/departamentos.module';
import { EquipamientoModule } from '../equipamiento/equipamiento.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PerteneceEntity]),
    DepartamentosModule,
    EquipamientoModule,
  ],
  controllers: [PerteneceController],
  providers: [PerteneceRepository, PerteneceService],
  exports: [PerteneceService],
})
export class PerteneceModule {}
