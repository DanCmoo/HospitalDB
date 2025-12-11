import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { EmpleadoEntity } from '../../empleados/entities/empleado.entity';
import { DepartamentoEntity } from '../../departamentos/entities/departamento.entity';

@Entity('equipamiento')
export class EquipamientoEntity {
  @PrimaryColumn({ name: 'cod_eq', type: 'int' })
  codEq: number;

  @Column({ name: 'nom_eq', type: 'varchar', length: 50 })
  nomEq: string;

  @Column({ name: 'estado', type: 'varchar', length: 15 })
  estado: string; // 'Operativo', 'En Mantenimiento', 'Fuera de Servicio'

  @Column({ name: 'fecha_mant', type: 'date', nullable: true })
  fechaMant: Date;

  @Column({ name: 'id_emp', type: 'int' })
  idEmp: number;

  @ManyToOne(() => EmpleadoEntity, (empleado) => empleado.equipamientos)
  @JoinColumn({ name: 'id_emp' })
  empleado: EmpleadoEntity;

  @ManyToMany(() => DepartamentoEntity, (departamento) => departamento.equipamientos)
  @JoinTable({
    name: 'pertenece',
    joinColumn: { name: 'cod_eq', referencedColumnName: 'codEq' },
    inverseJoinColumn: { name: 'nom_dept', referencedColumnName: 'nomDept' },
  })
  departamentos: DepartamentoEntity[];
}
