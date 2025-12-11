import { Entity, Column, PrimaryColumn, ManyToOne, ManyToMany, JoinColumn } from 'typeorm';
import { SedeEntity } from '../../sedes/entities/sede.entity';
import { EquipamientoEntity } from '../../equipamiento/entities/equipamiento.entity';

@Entity('departamentos')
export class DepartamentoEntity {
  @PrimaryColumn({ type: 'varchar', length: 30, name: 'nom_dept' })
  nomDept: string;

  @PrimaryColumn({ type: 'int', name: 'id_sede' })
  idSede: number;

  @ManyToOne(() => SedeEntity, (sede) => sede.departamentos)
  @JoinColumn({ name: 'id_sede' })
  sede: SedeEntity;

  @ManyToMany(() => EquipamientoEntity, (equipamiento) => equipamiento.departamentos)
  equipamientos: EquipamientoEntity[];
}
