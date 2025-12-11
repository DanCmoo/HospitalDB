import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PersonaEntity } from '../../personas/entities/persona.entity';

@Entity('usuarios')
export class UsuarioEntity {
  @PrimaryGeneratedColumn({ name: 'id_usuario' })
  idUsuario: number;

  @Column({ name: 'num_doc', type: 'varchar', length: 20, unique: true })
  numDoc: string;

  @Column({ name: 'correo', type: 'varchar', length: 60, unique: true })
  correo: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ 
    name: 'rol', 
    type: 'varchar', 
    length: 30,
    default: 'personal_administrativo'
  })
  rol: 'administrador' | 'medico' | 'enfermero' | 'personal_administrativo';

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  @Column({ name: 'ultimo_acceso', type: 'timestamp', nullable: true })
  ultimoAcceso: Date;

  // Nota: La relación con PersonaEntity no se define aquí porque PersonaEntity
  // está en una base de datos diferente (hospital_sede_*) y UsuarioEntity está
  // en hospital_hub. La relación se hace manualmente via num_doc cuando sea necesario.
}
