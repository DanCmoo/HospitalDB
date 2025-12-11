import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { DepartamentoEntity } from '../../departamentos/entities/departamento.entity';

@Entity('sedes_hospitalarias')
export class SedeEntity {
  @PrimaryColumn({ type: 'int', name: 'id_sede' })
  idSede: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;

  @Column({ type: 'varchar', length: 50 })
  direccion: string;

  @Column({ type: 'varchar', length: 30, name: 'nom_sede' })
  nomSede: string;

  @Column({ type: 'varchar', length: 20 })
  ciudad: string;

  @OneToMany(() => DepartamentoEntity, (departamento) => departamento.sede)
  departamentos: DepartamentoEntity[];
}
