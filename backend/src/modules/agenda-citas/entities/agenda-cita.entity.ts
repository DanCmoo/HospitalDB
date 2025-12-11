import { Entity, Column, PrimaryColumn, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
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

  @PrimaryColumn({ name: 'id_sede', type: 'int' })
  idSede: number;

  @Column({ name: 'fecha', type: 'date' })
  fecha: Date;

  @Column({ name: 'hora', type: 'time' })
  hora: string;

  @Column({ name: 'tipo_servicio', type: 'varchar', length: 30 })
  tipoServicio: string;

  @Column({ name: 'estado', type: 'varchar', length: 15 })
  estado: string;

  @Column({ name: 'nom_dept', type: 'varchar', length: 30, nullable: true })
  nomDept: string;

  @Column({ name: 'id_emp', type: 'int' })
  idEmp: number;

  @Column({ name: 'cod_pac', type: 'int' })
  codPac: number;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'ultima_modificacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  ultimaModificacion: Date;

  @ManyToOne(() => EmpleadoEntity)
  @JoinColumn([{ name: 'id_emp', referencedColumnName: 'idEmp' }, { name: 'id_sede', referencedColumnName: 'idSede' }])
  empleado: EmpleadoEntity;

  @ManyToOne(() => PacienteEntity)
  @JoinColumn([{ name: 'cod_pac', referencedColumnName: 'codPac' }, { name: 'id_sede', referencedColumnName: 'idSede' }])
  paciente: PacienteEntity;

  @OneToMany(() => PrescribeEntity, (prescribe) => prescribe.cita)
  prescripciones: PrescribeEntity[];
}
