import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UsuarioEntity } from './usuario.entity';

@Entity('activity_logs')
export class ActivityLogEntity {
  @PrimaryGeneratedColumn({ name: 'id_log' })
  idLog: number;

  @Column({ name: 'id_usuario' })
  idUsuario: number;

  @Column({ length: 50 })
  accion: string;

  @Column({ type: 'text', nullable: true })
  detalles: string;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @CreateDateColumn({ name: 'fecha_accion', type: 'timestamp' })
  fechaAccion: Date;

  // Nota: No se define relación ManyToOne con UsuarioEntity porque están en diferentes bases de datos
  // La relación se hace manualmente via id_usuario cuando sea necesario
}
