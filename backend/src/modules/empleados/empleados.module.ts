import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpleadoEntity } from './entities/empleado.entity';
import { EmpleadoController } from './controllers/empleado.controller';
import { EmpleadoService } from './services/empleado.service';
import { EmpleadoRepository } from './repositories/empleado.repository';
import { PersonasModule } from '../personas/personas.module';

@Module({
  imports: [TypeOrmModule.forFeature([EmpleadoEntity]), PersonasModule],
  controllers: [EmpleadoController],
  providers: [EmpleadoService, EmpleadoRepository],
  exports: [EmpleadoService, EmpleadoRepository],
})
export class EmpleadosModule {}
