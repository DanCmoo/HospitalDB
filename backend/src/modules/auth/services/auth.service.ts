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
    // Verificar que la persona existe
    const persona = await this.personaRepository.findByNumDoc(createDto.numDoc);
    if (!persona) {
      throw new NotFoundException('La persona con este documento no existe');
    }

    // Verificar que la persona tenga correo
    if (!persona.correo) {
      throw new ConflictException('La persona debe tener un correo registrado');
    }

    // Verificar si el correo ya tiene usuario
    const existsEmail = await this.usuarioRepository.existsByEmail(persona.correo);
    if (existsEmail) {
      throw new ConflictException('Ya existe un usuario con este correo');
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
      correo: persona.correo,
      passwordHash,
      rol: createDto.rol || 'personal_administrativo',
      activo: createDto.activo !== undefined ? createDto.activo : true,
    });

    const created = await this.usuarioRepository.findById(usuario.idUsuario);
    return await this.mapToResponse(created!);
  }

  async login(loginDto: LoginDto, ipAddress?: string): Promise<any> {
    // Buscar usuario por correo
    const usuario = await this.usuarioRepository.findByEmail(loginDto.email);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(loginDto.password, usuario.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Actualizar último acceso
    await this.usuarioRepository.updateLastAccess(usuario.idUsuario);

    // Registrar actividad
    await this.activityLogService.logActivity(
      usuario.idUsuario,
      'login',
      JSON.stringify({ ipAddress }),
      ipAddress
    );

    // Obtener datos de la persona desde la sede
    const persona = await this.personaRepository.findByNumDoc(usuario.numDoc);

    // Retornar datos del usuario con persona
    return {
      idUsuario: usuario.idUsuario,
      numDoc: usuario.numDoc,
      correo: usuario.correo,
      rol: usuario.rol,
      nomPers: persona?.nomPers,
      idSede: persona?.idSedeRegistro,
    };
  }

  async validateUser(correo: string): Promise<UsuarioResponseDto | null> {
    const usuario = await this.usuarioRepository.findByEmail(correo);
    if (!usuario || !usuario.activo) {
      return null;
    }
    return await this.mapToResponse(usuario);
  }

  async findAll(): Promise<UsuarioResponseDto[]> {
    const usuarios = await this.usuarioRepository.findAll();
    return await Promise.all(usuarios.map(u => this.mapToResponse(u)));
  }

  async findById(id: number): Promise<UsuarioResponseDto> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return await this.mapToResponse(usuario);
  }

  async findByRol(rol: string): Promise<UsuarioResponseDto[]> {
    const usuarios = await this.usuarioRepository.findByRol(rol);
    return await Promise.all(usuarios.map(u => this.mapToResponse(u)));
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
        `Usuario ${usuario.correo} modificado: ${changes.join(', ')}`,
      );
    }

    const updated = await this.usuarioRepository.findById(id);
    return await this.mapToResponse(updated!);
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
        `Usuario ${usuario.correo} eliminado`,
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
      `Contraseña del usuario ${usuario.correo} restablecida por administrador`,
    );
  }

  private async mapToResponse(usuario: UsuarioEntity): Promise<UsuarioResponseDto> {
    // Obtener persona desde la base de datos de sede
    const persona = await this.personaRepository.findByNumDoc(usuario.numDoc);

    return {
      idUsuario: usuario.idUsuario,
      numDoc: usuario.numDoc,
      correo: usuario.correo,
      rol: usuario.rol,
      activo: usuario.activo,
      fechaCreacion: usuario.fechaCreacion,
      fechaActualizacion: usuario.fechaActualizacion,
      ultimoAcceso: usuario.ultimoAcceso,
      persona: persona
        ? {
            numDoc: persona.numDoc,
            tipoDoc: persona.tipoDoc,
            nomPers: persona.nomPers,
            correo: persona.correo,
            telPers: persona.telPers,
          }
        : undefined,
    };
  }
}
