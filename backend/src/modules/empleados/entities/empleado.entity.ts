import { Entity, Column, PrimaryColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { PersonaEntity } from '../../personas/entities/persona.entity';
import { EquipamientoEntity } from '../../equipamiento/entities/equipamiento.entity';

@Entity('empleados')
export class EmpleadoEntity {
  @PrimaryColumn({ name: 'id_emp' })
  idEmp: number;

  @Column({ type: 'varchar', length: 20, name: 'num_doc' })
  numDoc: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'hash_contrato' })
  hashContrato: string;

  @Column({ name: 'id_sede' })
  idSede: number;

  @Column({ type: 'varchar', length: 30, name: 'nom_dept' })
  nomDept: string;

  @Column({ type: 'varchar', length: 30 })
  cargo: string;

  @ManyToOne(() => PersonaEntity, (persona) => persona.empleados)
  @JoinColumn({ name: 'num_doc' })
  persona: PersonaEntity;

  @OneToMany(() => EquipamientoEntity, (equipamiento) => equipamiento.empleado)
  equipamientos: EquipamientoEntity[];
}
