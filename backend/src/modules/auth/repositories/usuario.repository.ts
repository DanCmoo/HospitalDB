import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UsuarioEntity } from '../entities/usuario.entity';

@Injectable()
export class UsuarioRepository extends Repository<UsuarioEntity> {
  constructor(@InjectDataSource('authConnection') private dataSource: DataSource) {
    super(UsuarioEntity, dataSource.createEntityManager());
  }

  async findAll(): Promise<UsuarioEntity[]> {
    return this.find({
      select: ['idUsuario', 'numDoc', 'correo', 'rol', 'activo', 'fechaCreacion', 'fechaActualizacion'],
    });
  }

  async findById(id: number): Promise<UsuarioEntity | null> {
    return this.findOne({
      where: { idUsuario: id },
    });
  }

  async findByEmail(correo: string): Promise<UsuarioEntity | null> {
    return this.findOne({
      where: { correo },
    });
  }

  async findByNumDoc(numDoc: string): Promise<UsuarioEntity | null> {
    return this.findOne({
      where: { numDoc },
    });
  }

  async findByRol(rol: string): Promise<UsuarioEntity[]> {
    return this.find({
      where: { rol: rol as any },
      select: ['idUsuario', 'numDoc', 'correo', 'rol', 'activo', 'fechaCreacion'],
    });
  }

  async updateLastAccess(id: number): Promise<void> {
    await this.update(id, { ultimoAcceso: new Date() });
  }

  async createUsuario(usuario: Partial<UsuarioEntity>): Promise<UsuarioEntity> {
    const newUsuario = this.create(usuario);
    return this.save(newUsuario);
  }

  async updateUsuario(id: number, usuario: Partial<UsuarioEntity>): Promise<void> {
    await this.update(id, usuario);
  }

  async deleteUsuario(id: number): Promise<void> {
    await this.delete(id);
  }

  async existsByEmail(correo: string): Promise<boolean> {
    const count = await this.count({ where: { correo } });
    return count > 0;
  }

  async existsByNumDoc(numDoc: string): Promise<boolean> {
    const count = await this.count({ where: { numDoc } });
    return count > 0;
  }

  async getActiveUsers(): Promise<UsuarioEntity[]> {
    return this.find({
      where: { activo: true },
      select: ['idUsuario', 'correo', 'rol', 'numDoc'],
    });
  }
}
