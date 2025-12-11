import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaEntity } from './entities/auditoria.entity';
import { AuditoriaRepository } from './repositories/auditoria.repository';
import { AuditoriaService } from './services/auditoria.service';
import { AuditoriaController } from './controllers/auditoria.controller';
import { PersonasModule } from '../personas/personas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditoriaEntity]),
    PersonasModule,
  ],
  providers: [AuditoriaRepository, AuditoriaService],
  controllers: [AuditoriaController],
  exports: [AuditoriaRepository, AuditoriaService],
})
export class AuditoriaModule {}
