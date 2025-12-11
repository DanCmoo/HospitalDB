import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MedicamentoEntity } from '../../medicamentos/entities/medicamento.entity';
import { AgendaCitaEntity } from '../../agenda-citas/entities/agenda-cita.entity';

@Entity('prescribe')
export class PrescribeEntity {
  @PrimaryColumn({ name: 'cod_med', type: 'int' })
  codMed: number;

  @PrimaryColumn({ name: 'id_cita', type: 'int' })
  idCita: number;

  @PrimaryColumn({ name: 'id_sede', type: 'int' })
  idSede: number;

  @Column({ name: 'dosis', type: 'int' })
  dosis: number;

  @Column({ name: 'frecuencia', type: 'int' })
  frecuencia: number;

  @Column({ name: 'duracion', type: 'date' })
  duracion: Date;

  @Column({ name: 'fecha_emision', type: 'date' })
  fechaEmision: Date;

  @ManyToOne(() => MedicamentoEntity, (medicamento) => medicamento.prescripciones)
  @JoinColumn({ name: 'cod_med' })
  medicamento: MedicamentoEntity;

  @ManyToOne(() => AgendaCitaEntity, (cita) => cita.prescripciones)
  @JoinColumn([{ name: 'id_cita', referencedColumnName: 'idCita' }, { name: 'id_sede', referencedColumnName: 'idSede' }])
  cita: AgendaCitaEntity;
}
