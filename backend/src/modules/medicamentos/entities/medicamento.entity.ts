import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { PrescribeEntity } from '../../prescripciones/entities/prescribe.entity';

@Entity('medicamentos')
export class MedicamentoEntity {
  @PrimaryColumn({ name: 'cod_med', type: 'int' })
  codMed: number;

  @Column({ name: 'nom_med', type: 'varchar', length: 30 })
  nomMed: string;

  @Column({ name: 'stock', type: 'int' })
  stock: number;

  @Column({ name: 'proveedor', type: 'varchar', length: 30, nullable: true })
  proveedor: string;

  @Column({ name: 'descripcion', type: 'varchar', length: 40, nullable: true })
  descripcion: string;

  @Column({ name: 'id_sede', type: 'int' })
  idSede: number;

  @OneToMany(() => PrescribeEntity, (prescribe) => prescribe.medicamento)
  prescripciones: PrescribeEntity[];
}
