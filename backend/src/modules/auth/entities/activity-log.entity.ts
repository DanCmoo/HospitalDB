import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UsuarioEntity } from './usuario.entity';

@Entity('activity_logs')
export class ActivityLogEntity {
  @PrimaryGeneratedColumn()
  idLog: number;

  @Column({ name: 'id_usuario' })
  idUsuario: number;

  @Column({ name: 'id_sede', type: 'int' })
  idSede: number;

  @Column({ length: 100 })
  accion: string;

  @Column({ type: 'text', nullable: true })
  detalles: string;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @CreateDateColumn({ name: 'fecha_accion', type: 'timestamp' })
  fechaAccion: Date;

  @ManyToOne(() => UsuarioEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: UsuarioEntity;
}
