import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UsuarioEntity } from '../entities/usuario.entity';

@Injectable()
export class UsuarioRepository extends Repository<UsuarioEntity> {
  constructor(private dataSource: DataSource) {
    super(UsuarioEntity, dataSource.createEntityManager());
  }

  async findAll(): Promise<UsuarioEntity[]> {
    return this.find({
      relations: ['persona'],
      select: ['idUsuario', 'numDoc', 'username', 'rol', 'activo', 'fechaCreacion', 'fechaActualizacion'],
    });
  }

  async findById(id: number): Promise<UsuarioEntity | null> {
    return this.findOne({
      where: { idUsuario: id },
      relations: ['persona'],
    });
  }

  async findByUsername(username: string): Promise<UsuarioEntity | null> {
    return this.findOne({
      where: { username },
      relations: ['persona'],
    });
  }

  async findByNumDoc(numDoc: string): Promise<UsuarioEntity | null> {
    return this.findOne({
      where: { numDoc },
      relations: ['persona'],
    });
  }

  async findByRol(rol: string): Promise<UsuarioEntity[]> {
    return this.find({
      where: { rol: rol as any },
      relations: ['persona'],
      select: ['idUsuario', 'numDoc', 'username', 'rol', 'activo', 'fechaCreacion'],
    });
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

  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.count({ where: { username } });
    return count > 0;
  }

  async existsByNumDoc(numDoc: string): Promise<boolean> {
    const count = await this.count({ where: { numDoc } });
    return count > 0;
  }

  async getActiveUsers(): Promise<UsuarioEntity[]> {
    return this.find({
      where: { activo: true },
      relations: ['persona'],
      select: ['idUsuario', 'username', 'rol', 'numDoc'],
    });
  }
}
