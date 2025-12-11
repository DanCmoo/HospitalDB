import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PersonaEntity } from '../../personas/entities/persona.entity';

@Entity('usuarios')
export class UsuarioEntity {
  @PrimaryGeneratedColumn({ name: 'id_usuario' })
  idUsuario: number;

  @Column({ name: 'num_doc', type: 'varchar', length: 20, unique: true })
  numDoc: string;

  @Column({ name: 'username', type: 'varchar', length: 50, unique: true })
  username: string;

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

  @ManyToOne(() => PersonaEntity)
  @JoinColumn({ name: 'num_doc' })
  persona: PersonaEntity;
}
