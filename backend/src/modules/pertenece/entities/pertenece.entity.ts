import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { DepartamentoEntity } from '../../departamentos/entities/departamento.entity';
import { EquipamientoEntity } from '../../equipamiento/entities/equipamiento.entity';

@Entity('pertenece')
export class PerteneceEntity {
  @PrimaryColumn({ name: 'nom_dept', type: 'varchar', length: 30 })
  nomDept: string;

  @PrimaryColumn({ name: 'cod_eq', type: 'int' })
  codEq: number;

  @ManyToOne(() => DepartamentoEntity)
  @JoinColumn({ name: 'nom_dept' })
  departamento: DepartamentoEntity;

  @ManyToOne(() => EquipamientoEntity)
  @JoinColumn({ name: 'cod_eq' })
  equipamiento: EquipamientoEntity;
}
