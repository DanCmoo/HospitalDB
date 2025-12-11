import { Injectable } from '@nestjs/common';
import { ActivityLogRepository } from '../repositories/activity-log.repository';
import { ActivityLogResponseDto } from '../dtos';

@Injectable()
export class ActivityLogService {
  constructor(private readonly activityLogRepository: ActivityLogRepository) {}

  async logActivity(
    idUsuario: number,
    accion: string,
    detalles?: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.activityLogRepository.createLog({
      idUsuario,
      accion,
      detalles,
      ipAddress,
    });
  }

  async getUserActivityHistory(idUsuario: number, limit: number = 50): Promise<ActivityLogResponseDto[]> {
    const logs = await this.activityLogRepository.findByUsuario(idUsuario, limit);
    return logs.map(this.mapToResponse);
  }

  async getAllActivity(limit: number = 100): Promise<ActivityLogResponseDto[]> {
    const logs = await this.activityLogRepository.findAll(limit);
    return logs.map(this.mapToResponse);
  }

  private mapToResponse(log: any): ActivityLogResponseDto {
    return {
      idLog: log.idLog,
      idUsuario: log.idUsuario,
      accion: log.accion,
      detalles: log.detalles,
      ipAddress: log.ipAddress,
      fechaAccion: log.fechaAccion,
      usuario: log.usuario
        ? {
            username: log.usuario.username,
            rol: log.usuario.rol,
            persona: log.usuario.persona
              ? {
                  nomPers: log.usuario.persona.nomPers,
                }
              : undefined,
          }
        : undefined,
    };
  }
}
