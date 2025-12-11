import { Entity, Column, PrimaryColumn, ManyToOne, ManyToMany, JoinColumn } from 'typeorm';
import { SedeEntity } from '../../sedes/entities/sede.entity';
import { EquipamientoEntity } from '../../equipamiento/entities/equipamiento.entity';

@Entity('Departamentos')
export class DepartamentoEntity {
  @PrimaryColumn({ type: 'varchar', length: 30 })
  nomDept: string;

  @Column({ type: 'int' })
  idSede: number;

  @ManyToOne(() => SedeEntity, (sede) => sede.departamentos)
  @JoinColumn({ name: 'idSede' })
  sede: SedeEntity;

  @ManyToMany(() => EquipamientoEntity, (equipamiento) => equipamiento.departamentos)
  equipamientos: EquipamientoEntity[];
}
