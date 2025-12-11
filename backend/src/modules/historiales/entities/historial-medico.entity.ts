import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { EmpleadoEntity } from '../../empleados/entities/empleado.entity';
import { PacienteEntity } from '../../pacientes/entities/paciente.entity';

@Entity('emite_hist')
export class HistorialMedicoEntity {
  @PrimaryColumn({ name: 'cod_hist', type: 'int' })
  codHist: number;

  @PrimaryColumn({ name: 'id_sede', type: 'int' })
  idSede: number;

  @Column({ name: 'fecha', type: 'date' })
  fecha: Date;

  @Column({ name: 'hora', type: 'time' })
  hora: string;

  @Column({ name: 'diagnostico', type: 'varchar', length: 80 })
  diagnostico: string;

  @Column({ name: 'nom_dept', type: 'varchar', length: 30, nullable: true })
  nomDept: string;

  @Column({ name: 'id_emp', type: 'int' })
  idEmp: number;

  @Column({ name: 'cod_pac', type: 'int' })
  codPac: number;

  @Column({ name: 'compartido', type: 'boolean', default: false })
  compartido: boolean;

  @Column({ name: 'nivel_acceso', type: 'varchar', length: 20, default: 'Local' })
  nivelAcceso: string;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;

  @ManyToOne(() => EmpleadoEntity)
  @JoinColumn([{ name: 'id_emp', referencedColumnName: 'idEmp' }, { name: 'id_sede', referencedColumnName: 'idSede' }])
  empleado: EmpleadoEntity;

  @ManyToOne(() => PacienteEntity)
  @JoinColumn([{ name: 'cod_pac', referencedColumnName: 'codPac' }, { name: 'id_sede', referencedColumnName: 'idSede' }])
  paciente: PacienteEntity;
}
