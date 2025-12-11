import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PersonaEntity } from '../../personas/entities/persona.entity';

@Entity('pacientes')
export class PacienteEntity {
  @PrimaryColumn({ name: 'cod_pac' })
  codPac: number;

  @PrimaryColumn({ name: 'id_sede', type: 'int' })
  idSede: number;

  @Column({ type: 'varchar', length: 20, name: 'num_doc' })
  numDoc: string;

  @Column({ type: 'varchar', length: 80, nullable: true, name: 'dr_pac' })
  drPac: string;

  @Column({ type: 'date', name: 'fecha_nac' })
  fechaNac: Date;

  @Column({ type: 'varchar', length: 20 })
  genero: string;

  @Column({ type: 'varchar', length: 20, name: 'estado_paciente', default: 'Activo' })
  estadoPaciente: string;

  @CreateDateColumn({ name: 'fecha_registro', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaRegistro: Date;

  @UpdateDateColumn({ name: 'ultima_modificacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  ultimaModificacion: Date;

  @ManyToOne(() => PersonaEntity, (persona) => persona.pacientes)
  @JoinColumn({ name: 'num_doc' })
  persona: PersonaEntity;
}
