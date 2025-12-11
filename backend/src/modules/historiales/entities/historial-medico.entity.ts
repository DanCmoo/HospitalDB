import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EmpleadoEntity } from '../../empleados/entities/empleado.entity';
import { PacienteEntity } from '../../pacientes/entities/paciente.entity';

@Entity('emite_hist')
export class HistorialMedicoEntity {
  @PrimaryColumn({ name: 'cod_hist', type: 'int' })
  codHist: number;

  @Column({ name: 'fecha', type: 'date' })
  fecha: Date;

  @Column({ name: 'hora', type: 'time' })
  hora: string;

  @Column({ name: 'diagnostico', type: 'varchar', length: 80 })
  diagnostico: string;

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
}
