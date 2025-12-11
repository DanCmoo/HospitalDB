import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PersonaEntity } from '../../personas/entities/persona.entity';

@Entity('auditoria_accesos')
export class AuditoriaEntity {
  @PrimaryColumn({ name: 'id_evento', type: 'int' })
  idEvento: number;

  @Column({ name: 'num_doc', type: 'varchar', length: 20 })
  numDoc: string;

  @Column({ name: 'accion', type: 'varchar', length: 20 })
  accion: string;

  @Column({ name: 'fecha_evento', type: 'date' })
  fechaEvento: Date;

  @Column({ name: 'tabla_afectada', type: 'varchar', length: 30, nullable: true })
  tablaAfectada: string;

  @Column({ name: 'ip_origen', type: 'varchar', length: 20, nullable: true })
  ipOrigen: string;

  @ManyToOne(() => PersonaEntity)
  @JoinColumn({ name: 'num_doc' })
  persona: PersonaEntity;
}
