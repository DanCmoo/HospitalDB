import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PersonaEntity } from '../../personas/entities/persona.entity';

@Entity('pacientes')
export class PacienteEntity {
  @PrimaryColumn({ name: 'cod_pac' })
  codPac: number;

  @Column({ type: 'varchar', length: 20, name: 'num_doc' })
  numDoc: string;

  @Column({ type: 'varchar', length: 80, nullable: true, name: 'dr_pac' })
  drPac: string;

  @Column({ type: 'date', name: 'fecha_nac' })
  fechaNac: Date;

  @Column({ type: 'varchar', length: 20 })
  genero: string;

  @ManyToOne(() => PersonaEntity, (persona) => persona.pacientes)
  @JoinColumn({ name: 'num_doc' })
  persona: PersonaEntity;
}
