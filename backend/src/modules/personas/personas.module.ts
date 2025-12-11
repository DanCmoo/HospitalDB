import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonaEntity } from './entities/persona.entity';
import { PersonaController } from './controllers/persona.controller';
import { PersonaService } from './services/persona.service';
import { PersonaRepository } from './repositories/persona.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PersonaEntity])],
  controllers: [PersonaController],
  providers: [PersonaService, PersonaRepository],
  exports: [PersonaService, PersonaRepository],
})
export class PersonasModule {}
