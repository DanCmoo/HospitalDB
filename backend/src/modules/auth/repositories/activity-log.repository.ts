import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ActivityLogEntity } from '../entities/activity-log.entity';
import { SedeConfig } from '../../../config/sede.config';

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
    const idSede = SedeConfig.getIdSede();
    const log = this.create({
      ...data,
      idSede,
    });
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
