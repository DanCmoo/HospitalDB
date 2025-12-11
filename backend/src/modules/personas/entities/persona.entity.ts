import { Entity, Column, PrimaryColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
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

  @Column({ type: 'varchar', length: 60, nullable: true, unique: true })
  correo: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  contrasena: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'tel_pers' })
  telPers: string;

  @Column({ name: 'id_sede_registro', type: 'int', nullable: false })
  idSedeRegistro: number;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'ultima_modificacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  ultimaModificacion: Date;

  // Relaciones
  @OneToMany(() => PacienteEntity, (paciente) => paciente.persona)
  pacientes: PacienteEntity[];

  @OneToMany(() => EmpleadoEntity, (empleado) => empleado.persona)
  empleados: EmpleadoEntity[];
}
