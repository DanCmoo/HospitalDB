import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SedeEntity } from './entities/sede.entity';
import { SedeRepository } from './repositories/sede.repository';
import { SedeService } from './services/sede.service';
import { SedeController } from './controllers/sede.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SedeEntity])],
  controllers: [SedeController],
  providers: [SedeService, SedeRepository],
  exports: [SedeService, SedeRepository],
})
export class SedesModule {}
