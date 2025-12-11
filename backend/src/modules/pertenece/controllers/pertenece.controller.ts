import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
  UsePipes,
  ParseIntPipe,
} from '@nestjs/common';
import { PerteneceService } from '../services/pertenece.service';
import { CreatePerteneceDto, PerteneceResponseDto } from '../dtos';

@Controller('pertenece')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class PerteneceController {
  constructor(private readonly perteneceService: PerteneceService) {}

  @Get()
  async findAll(
    @Query('nomDept') nomDept?: string,
    @Query('codEq') codEq?: string,
  ): Promise<PerteneceResponseDto[]> {
    if (nomDept) {
      return this.perteneceService.findByDepartamento(nomDept);
    }
    if (codEq) {
      return this.perteneceService.findByEquipamiento(parseInt(codEq));
    }
    return this.perteneceService.findAll();
  }

  @Get('departamento/:nomDept/count')
  async getEquipamientoCount(@Param('nomDept') nomDept: string): Promise<{ count: number }> {
    const count = await this.perteneceService.getEquipamientoCount(nomDept);
    return { count };
  }

  @Get('equipamiento/:codEq/count')
  async getDepartamentosCount(@Param('codEq', ParseIntPipe) codEq: number): Promise<{ count: number }> {
    const count = await this.perteneceService.getDepartamentosCount(codEq);
    return { count };
  }

  @Get(':nomDept/:codEq')
  async findById(
    @Param('nomDept') nomDept: string,
    @Param('codEq', ParseIntPipe) codEq: number,
  ): Promise<PerteneceResponseDto> {
    return this.perteneceService.findById(nomDept, codEq);
  }

  @Post()
  async create(@Body() createDto: CreatePerteneceDto): Promise<PerteneceResponseDto> {
    return this.perteneceService.create(createDto);
  }

  @Delete(':nomDept/:codEq')
  async delete(
    @Param('nomDept') nomDept: string,
    @Param('codEq', ParseIntPipe) codEq: number,
  ): Promise<{ message: string }> {
    await this.perteneceService.delete(nomDept, codEq);
    return { message: 'Relación eliminada exitosamente' };
  }
}
