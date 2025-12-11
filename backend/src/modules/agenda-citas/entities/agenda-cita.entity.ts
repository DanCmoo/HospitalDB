import { Entity, Column, PrimaryColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { EmpleadoEntity } from '../../empleados/entities/empleado.entity';
import { PacienteEntity } from '../../pacientes/entities/paciente.entity';
import { PrescribeEntity } from '../../prescripciones/entities/prescribe.entity';

export enum EstadoCita {
  PROGRAMADA = 'Programada',
  COMPLETADA = 'Completada',
  CANCELADA = 'Cancelada',
  NO_ASISTIO = 'No Asistió',
}

@Entity('agenda_cita')
export class AgendaCitaEntity {
  @PrimaryColumn({ name: 'id_cita', type: 'int' })
  idCita: number;

  @Column({ name: 'fecha', type: 'date' })
  fecha: Date;

  @Column({ name: 'hora', type: 'time' })
  hora: string;

  @Column({ name: 'tipo_servicio', type: 'varchar', length: 30 })
  tipoServicio: string;

  @Column({ name: 'estado', type: 'varchar', length: 15 })
  estado: string;

  @Column({ name: 'id_sede', type: 'int' })
  idSede: number;

  @Column({ name: 'nom_dept', type: 'varchar', length: 30, nullable: true })
  nomDept: string;

  @Column({ name: 'id_emp', type: 'int' })
  idEmp: number;

  @Column({ name: 'cod_pac', type: 'int' })
  codPac: number;

  @ManyToOne(() => EmpleadoEntity)
  @JoinColumn({ name: 'id_emp' })
  empleado: EmpleadoEntity;

  @ManyToOne(() => PacienteEntity)
  @JoinColumn({ name: 'cod_pac' })
  paciente: PacienteEntity;

  @OneToMany(() => PrescribeEntity, (prescribe) => prescribe.cita)
  prescripciones: PrescribeEntity[];
}
