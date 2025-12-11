import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { EmpleadoService } from '../services/empleado.service';
import {
  CreateEmpleadoDto,
  UpdateEmpleadoDto,
  EmpleadoResponseDto,
} from '../dtos';

@Controller('empleados')
export class EmpleadoController {
  constructor(private readonly empleadoService: EmpleadoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createEmpleadoDto: CreateEmpleadoDto,
  ): Promise<EmpleadoResponseDto> {
    return this.empleadoService.create(createEmpleadoDto);
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('cargo') cargo?: string,
    @Query('departamento') departamento?: string,
  ): Promise<any> {
    if (cargo) {
      return this.empleadoService.findByCargo(cargo);
    }

    if (departamento) {
      return this.empleadoService.findByDepartamento(departamento);
    }

    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;

    if (pageNum && limitNum) {
      return this.empleadoService.findAllPaginated(pageNum, limitNum);
    }

    return this.empleadoService.findAll();
  }

  @Get('count')
  async count(): Promise<{ count: number }> {
    const count = await this.empleadoService.count();
    return { count };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EmpleadoResponseDto> {
    return this.empleadoService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmpleadoDto: UpdateEmpleadoDto,
  ): Promise<EmpleadoResponseDto> {
    return this.empleadoService.update(id, updateEmpleadoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.empleadoService.delete(id);
  }
}
