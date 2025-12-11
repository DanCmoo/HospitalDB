import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ActivityLogEntity } from '../entities/activity-log.entity';

@Injectable()
export class ActivityLogRepository extends Repository<ActivityLogEntity> {
  constructor(private dataSource: DataSource) {
    super(ActivityLogEntity, dataSource.createEntityManager());
  }

  async createLog(data: {
    idUsuario: number;
    accion: string;
    detalles?: string;
    ipAddress?: string;
  }): Promise<ActivityLogEntity> {
    const log = this.create(data);
    return await this.save(log);
  }

  async findByUsuario(idUsuario: number, limit: number = 50): Promise<ActivityLogEntity[]> {
    return await this.find({
      where: { idUsuario },
      order: { fechaAccion: 'DESC' },
      take: limit,
    });
  }

  async findAll(limit: number = 100): Promise<ActivityLogEntity[]> {
    return await this.find({
      relations: ['usuario', 'usuario.persona'],
      order: { fechaAccion: 'DESC' },
      take: limit,
    });
  }
}
