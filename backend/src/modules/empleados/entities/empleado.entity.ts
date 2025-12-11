import { Entity, Column, PrimaryColumn, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { PersonaEntity } from '../../personas/entities/persona.entity';
import { EquipamientoEntity } from '../../equipamiento/entities/equipamiento.entity';

@Entity('empleados')
export class EmpleadoEntity {
  @PrimaryColumn({ name: 'id_emp' })
  idEmp: number;

  @PrimaryColumn({ name: 'id_sede' })
  idSede: number;

  @Column({ type: 'varchar', length: 20, name: 'num_doc' })
  numDoc: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'hash_contrato' })
  hashContrato: string;

  @Column({ type: 'varchar', length: 30, name: 'nom_dept' })
  nomDept: string;

  @Column({ type: 'varchar', length: 30 })
  cargo: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'fecha_contratacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaContratacion: Date;

  @ManyToOne(() => PersonaEntity, (persona) => persona.empleados)
  @JoinColumn({ name: 'num_doc' })
  persona: PersonaEntity;

  @OneToMany(() => EquipamientoEntity, (equipamiento) => equipamiento.empleado)
  equipamientos: EquipamientoEntity[];
}
