import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { MedicamentoService } from '../services/medicamento.service';
import { CreateMedicamentoDto, UpdateMedicamentoDto, MedicamentoResponseDto, UpdateStockDto } from '../dtos';
import { AuthGuard, RolesGuard } from '../../auth/guards';
import { Roles } from '../../auth/decorators';

@Controller('medicamentos')
@UseGuards(AuthGuard, RolesGuard)
export class MedicamentoController {
  constructor(private readonly medicamentoService: MedicamentoService) {}

  @Post()
  @Roles('administrador')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createMedicamentoDto: CreateMedicamentoDto,
  ): Promise<MedicamentoResponseDto> {
    return this.medicamentoService.create(createMedicamentoDto);
  }

  @Get()
  @Roles('administrador', 'medico', 'enfermero', 'personal_administrativo')
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('proveedor') proveedor?: string,
    @Query('stockBajo', new ParseIntPipe({ optional: true })) stockBajo?: number,
  ): Promise<
    | MedicamentoResponseDto[]
    | { data: MedicamentoResponseDto[]; total: number; page: number; limit: number }
  > {
    if (proveedor) {
      return this.medicamentoService.findByProveedor(proveedor);
    }

    if (stockBajo !== undefined) {
      return this.medicamentoService.findByStockBajo(stockBajo);
    }

    if (page && limit) {
      return this.medicamentoService.findWithPagination(page, limit);
    }

    return this.medicamentoService.findAll();
  }

  @Get('search')
  async search(@Query('term') term: string): Promise<MedicamentoResponseDto[]> {
    return this.medicamentoService.search(term);
  }

  @Get('count')
  async count(): Promise<{ count: number }> {
    const count = await this.medicamentoService.count();
    return { count };
  }

  @Get('next-codigo')
  async getNextCodigo(): Promise<{ nextCodigo: number }> {
    const nextCodigo = await this.medicamentoService.getNextCodigo();
    return { nextCodigo };
  }

  @Get('stock-bajo')
  async getStockBajo(@Query('minimo', ParseIntPipe) minimo: number = 10): Promise<MedicamentoResponseDto[]> {
    return this.medicamentoService.findByStockBajo(minimo);
  }

  @Get(':codigo')
  async findByCodigo(
    @Param('codigo', ParseIntPipe) codigo: number,
  ): Promise<MedicamentoResponseDto> {
    return this.medicamentoService.findByCodigo(codigo);
  }

  @Put(':codigo')
  @Roles('administrador', 'medico')
  async update(
    @Param('codigo', ParseIntPipe) codigo: number,
    @Body() updateMedicamentoDto: UpdateMedicamentoDto,
  ): Promise<MedicamentoResponseDto> {
    return this.medicamentoService.update(codigo, updateMedicamentoDto);
  }

  @Patch(':codigo/stock')
  async updateStock(
    @Param('codigo', ParseIntPipe) codigo: number,
    @Body() updateStockDto: UpdateStockDto,
  ): Promise<MedicamentoResponseDto> {
    return this.medicamentoService.updateStock(codigo, updateStockDto);
  }

  @Delete(':codigo')
  @Roles('administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('codigo', ParseIntPipe) codigo: number): Promise<void> {
    return this.medicamentoService.delete(codigo);
  }
}
