import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { DepartamentoEntity } from '../../departamentos/entities/departamento.entity';

@Entity('Sedes_Hospitalarias')
export class SedeEntity {
  @PrimaryColumn({ type: 'int' })
  idSede: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;

  @Column({ type: 'varchar', length: 50 })
  direccion: string;

  @Column({ type: 'varchar', length: 30 })
  nomSede: string;

  @Column({ type: 'varchar', length: 20 })
  ciudad: string;

  @OneToMany(() => DepartamentoEntity, (departamento) => departamento.sede)
  departamentos: DepartamentoEntity[];
}
