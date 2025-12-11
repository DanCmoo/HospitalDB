import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { PacienteEntity } from '../../pacientes/entities/paciente.entity';
import { EmpleadoEntity } from '../../empleados/entities/empleado.entity';

@Entity('personas')
export class PersonaEntity {
  @PrimaryColumn({ type: 'varchar', length: 20, name: 'num_doc' })
  numDoc: string;

  @Column({ type: 'varchar', length: 20, name: 'tipo_doc' })
  tipoDoc: string;

  @Column({ type: 'varchar', length: 50, name: 'nom_pers' })
  nomPers: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  correo: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'tel_pers' })
  telPers: string;

  // Relaciones
  @OneToMany(() => PacienteEntity, (paciente) => paciente.persona)
  pacientes: PacienteEntity[];

  @OneToMany(() => EmpleadoEntity, (empleado) => empleado.persona)
  empleados: EmpleadoEntity[];
}
