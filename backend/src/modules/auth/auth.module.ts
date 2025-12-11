import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioEntity } from './entities/usuario.entity';
import { ActivityLogEntity } from './entities/activity-log.entity';
import { UsuarioRepository } from './repositories/usuario.repository';
import { ActivityLogRepository } from './repositories/activity-log.repository';
import { AuthService } from './services/auth.service';
import { ActivityLogService } from './services/activity-log.service';
import { AuthController } from './controllers/auth.controller';
import { PersonasModule } from '../personas/personas.module';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    // Registrar entidades en la conexión de autenticación (HUB)
    TypeOrmModule.forFeature([UsuarioEntity, ActivityLogEntity], 'authConnection'),
    PersonasModule,
  ],
  controllers: [AuthController],
  providers: [
    UsuarioRepository,
    ActivityLogRepository,
    AuthService,
    ActivityLogService,
    AuthGuard,
    RolesGuard,
  ],
  exports: [AuthService, ActivityLogService, AuthGuard, RolesGuard],
})
export class AuthModule {}
