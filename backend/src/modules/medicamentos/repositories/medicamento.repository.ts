import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicamentoEntity } from '../entities/medicamento.entity';

@Injectable()
export class MedicamentoRepository {
  constructor(
    @InjectRepository(MedicamentoEntity)
    private readonly repository: Repository<MedicamentoEntity>,
  ) {}

  async findAll(): Promise<MedicamentoEntity[]> {
    return this.repository.find({
      order: { codMed: 'ASC' },
    });
  }

  async findByCodigo(codMed: number): Promise<MedicamentoEntity | null> {
    return this.repository.findOne({
      where: { codMed },
    });
  }

  async findByNombre(nomMed: string): Promise<MedicamentoEntity | null> {
    return this.repository.findOne({
      where: { nomMed },
    });
  }

  async findByProveedor(proveedor: string): Promise<MedicamentoEntity[]> {
    return this.repository.find({
      where: { proveedor },
      order: { nomMed: 'ASC' },
    });
  }

  async findByStockBajo(minimo: number): Promise<MedicamentoEntity[]> {
    return this.repository
      .createQueryBuilder('medicamento')
      .where('medicamento.stock <= :minimo', { minimo })
      .orderBy('medicamento.stock', 'ASC')
      .getMany();
  }

  async search(searchTerm: string): Promise<MedicamentoEntity[]> {
    return this.repository
      .createQueryBuilder('medicamento')
      .where('LOWER(medicamento.nomMed) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${searchTerm}%`,
      })
      .orWhere('LOWER(medicamento.proveedor) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${searchTerm}%`,
      })
      .orWhere('LOWER(medicamento.descripcion) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${searchTerm}%`,
      })
      .orderBy('medicamento.nomMed', 'ASC')
      .getMany();
  }

  async create(data: Partial<MedicamentoEntity>): Promise<MedicamentoEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(codMed: number, data: Partial<MedicamentoEntity>): Promise<MedicamentoEntity> {
    await this.repository.update(codMed, data);
    return this.findByCodigo(codMed);
  }

  async delete(codMed: number): Promise<void> {
    await this.repository.delete(codMed);
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async getNextCodigo(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('medicamento')
      .select('MAX(medicamento.codMed)', 'max')
      .getRawOne();

    return (result?.max || 0) + 1;
  }

  async findWithPagination(
    page: number,
    limit: number,
  ): Promise<[MedicamentoEntity[], number]> {
    return this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { nomMed: 'ASC' },
    });
  }

  async updateStock(codMed: number, cantidad: number): Promise<MedicamentoEntity> {
    const medicamento = await this.findByCodigo(codMed);
    if (!medicamento) {
      throw new Error(`Medicamento con código ${codMed} no encontrado`);
    }

    const newStock = medicamento.stock + cantidad;
    if (newStock < 0) {
      throw new Error(`Stock insuficiente. Stock actual: ${medicamento.stock}, Cantidad solicitada: ${Math.abs(cantidad)}`);
    }

    return this.update(codMed, { stock: newStock });
  }
}
