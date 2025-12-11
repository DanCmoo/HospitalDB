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
  UseGuards,
} from '@nestjs/common';
import { EmpleadoService } from '../services/empleado.service';
import {
  CreateEmpleadoDto,
  UpdateEmpleadoDto,
  EmpleadoResponseDto,
} from '../dtos';
import { AuthGuard, RolesGuard } from '../../auth/guards';
import { Roles } from '../../auth/decorators';

@Controller('empleados')
@UseGuards(AuthGuard, RolesGuard)
export class EmpleadoController {
  constructor(private readonly empleadoService: EmpleadoService) {}

  @Post()
  @Roles('administrador', 'personal_administrativo')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createEmpleadoDto: CreateEmpleadoDto,
  ): Promise<EmpleadoResponseDto> {
    return this.empleadoService.create(createEmpleadoDto);
  }

  @Get()
  @Roles('administrador', 'medico', 'enfermero', 'personal_administrativo')
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
  @Roles('administrador', 'medico', 'enfermero', 'personal_administrativo')
  async count(): Promise<{ count: number }> {
    const count = await this.empleadoService.count();
    return { count };
  }

  @Get(':id')
  @Roles('administrador', 'medico', 'enfermero', 'personal_administrativo')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EmpleadoResponseDto> {
    return this.empleadoService.findById(id);
  }

  @Put(':id')
  @Roles('administrador', 'personal_administrativo')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmpleadoDto: UpdateEmpleadoDto,
  ): Promise<EmpleadoResponseDto> {
    return this.empleadoService.update(id, updateEmpleadoDto);
  }

  @Delete(':id')
  @Roles('administrador', 'personal_administrativo')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.empleadoService.delete(id);
  }
}
