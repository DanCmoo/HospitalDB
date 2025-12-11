import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsuarioRepository } from '../repositories/usuario.repository';
import { CreateUsuarioDto, UpdateUsuarioDto, UsuarioResponseDto, LoginDto } from '../dtos';
import { UsuarioEntity } from '../entities/usuario.entity';
import { ActivityLogService } from './activity-log.service';
import { PersonaRepository } from '../../personas/repositories/persona.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly activityLogService: ActivityLogService,
    private readonly personaRepository: PersonaRepository,
  ) {}

  async register(createDto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    // Verificar si el username ya existe
    const existsUsername = await this.usuarioRepository.existsByUsername(createDto.username);
    if (existsUsername) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

    // Verificar si el documento ya tiene usuario
    const existsNumDoc = await this.usuarioRepository.existsByNumDoc(createDto.numDoc);
    if (existsNumDoc) {
      throw new ConflictException('Ya existe un usuario con este documento');
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(createDto.password, salt);

    // Crear usuario
    const usuario = await this.usuarioRepository.createUsuario({
      numDoc: createDto.numDoc,
      username: createDto.username,
      passwordHash,
      rol: createDto.rol || 'personal_administrativo',
      activo: createDto.activo !== undefined ? createDto.activo : true,
    });

    const created = await this.usuarioRepository.findById(usuario.idUsuario);
    return this.mapToResponse(created!);
  }

  async login(loginDto: LoginDto, ipAddress?: string): Promise<any> {
    // Buscar persona por correo
    const persona = await this.personaRepository.findByEmail(loginDto.username);
    if (!persona) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña (sin hash)
    if (persona.contrasena !== loginDto.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Retornar datos de la persona
    return {
      numDoc: persona.numDoc,
      nomPers: persona.nomPers,
      correo: persona.correo,
      rol: 'usuario', // Rol por defecto
      idSede: persona.idSedeRegistro,
    };
  }

  async validateUser(username: string): Promise<UsuarioResponseDto | null> {
    const usuario = await this.usuarioRepository.findByUsername(username);
    if (!usuario || !usuario.activo) {
      return null;
    }
    return this.mapToResponse(usuario);
  }

  async findAll(): Promise<UsuarioResponseDto[]> {
    const usuarios = await this.usuarioRepository.findAll();
    return usuarios.map(this.mapToResponse);
  }

  async findById(id: number): Promise<UsuarioResponseDto> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return this.mapToResponse(usuario);
  }

  async findByRol(rol: string): Promise<UsuarioResponseDto[]> {
    const usuarios = await this.usuarioRepository.findByRol(rol);
    return usuarios.map(this.mapToResponse);
  }

  async update(id: number, updateDto: UpdateUsuarioDto, adminId?: number): Promise<UsuarioResponseDto> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const updateData: Partial<UsuarioEntity> = {};
    const changes: string[] = [];

    if (updateDto.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(updateDto.password, salt);
      changes.push('contraseña actualizada');
    }

    if (updateDto.rol && updateDto.rol !== usuario.rol) {
      updateData.rol = updateDto.rol;
      changes.push(`rol cambiado de ${usuario.rol} a ${updateDto.rol}`);
    }

    if (updateDto.activo !== undefined && updateDto.activo !== usuario.activo) {
      updateData.activo = updateDto.activo;
      changes.push(`usuario ${updateDto.activo ? 'activado' : 'desactivado'}`);
    }

    await this.usuarioRepository.updateUsuario(id, updateData);
    
    // Registrar cambios
    if (changes.length > 0 && adminId) {
      await this.activityLogService.logActivity(
        adminId,
        'update_usuario',
        `Usuario ${usuario.username} modificado: ${changes.join(', ')}`,
      );
    }

    const updated = await this.usuarioRepository.findById(id);
    return this.mapToResponse(updated!);
  }

  async delete(id: number, adminId?: number): Promise<void> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    
    await this.usuarioRepository.deleteUsuario(id);
    
    // Registrar eliminación
    if (adminId) {
      await this.activityLogService.logActivity(
        adminId,
        'delete_usuario',
        `Usuario ${usuario.username} eliminado`,
      );
    }
  }

  async changePassword(id: number, oldPassword: string, newPassword: string): Promise<void> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar contraseña antigua
    const isPasswordValid = await bcrypt.compare(oldPassword, usuario.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    // Hash nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await this.usuarioRepository.updateUsuario(id, { passwordHash });
    
    // Registrar cambio de contraseña
    await this.activityLogService.logActivity(
      id,
      'change_password',
      'Contraseña actualizada por el usuario',
    );
  }

  async resetPassword(id: number, newPassword: string, adminId: number): Promise<void> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Hash nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await this.usuarioRepository.updateUsuario(id, { passwordHash });
    
    // Registrar reset de contraseña por admin
    await this.activityLogService.logActivity(
      adminId,
      'reset_password',
      `Contraseña del usuario ${usuario.username} restablecida por administrador`,
    );
  }

  private mapToResponse(usuario: UsuarioEntity): UsuarioResponseDto {
    return {
      idUsuario: usuario.idUsuario,
      numDoc: usuario.numDoc,
      username: usuario.username,
      rol: usuario.rol,
      activo: usuario.activo,
      fechaCreacion: usuario.fechaCreacion,
      fechaActualizacion: usuario.fechaActualizacion,
      persona: usuario.persona
        ? {
            numDoc: usuario.persona.numDoc,
            tipoDoc: usuario.persona.tipoDoc,
            nomPers: usuario.persona.nomPers,
            correo: usuario.persona.correo,
            telPers: usuario.persona.telPers,
          }
        : undefined,
    };
  }
}
