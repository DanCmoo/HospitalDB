import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { DepartamentoService } from '../services/departamento.service';
import { CreateDepartamentoDto, UpdateDepartamentoDto, DepartamentoResponseDto } from '../dtos';
import { AuthGuard, RolesGuard } from '../../auth/guards';
import { Roles } from '../../auth/decorators';

@Controller('departamentos')
@UseGuards(AuthGuard, RolesGuard)
export class DepartamentoController {
  constructor(private readonly departamentoService: DepartamentoService) {}

  @Post()
  @Roles('administrador', 'personal_administrativo')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDepartamentoDto: CreateDepartamentoDto): Promise<DepartamentoResponseDto> {
    return this.departamentoService.create(createDepartamentoDto);
  }

  @Get()
  @Roles('administrador', 'medico', 'personal_administrativo')
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('idSede', new ParseIntPipe({ optional: true })) idSede?: number,
  ): Promise<DepartamentoResponseDto[] | { data: DepartamentoResponseDto[]; total: number; page: number; limit: number }> {
    if (idSede) {
      return this.departamentoService.findBySede(idSede);
    }

    if (page && limit) {
      return this.departamentoService.findWithPagination(page, limit);
    }

    return this.departamentoService.findAll();
  }

  @Get('search')
  @Roles('administrador', 'medico', 'personal_administrativo')
  async search(@Query('term') term: string): Promise<DepartamentoResponseDto[]> {
    return this.departamentoService.search(term);
  }

  @Get('count')
  @Roles('administrador', 'medico', 'personal_administrativo')
  async count(@Query('idSede', new ParseIntPipe({ optional: true })) idSede?: number): Promise<{ count: number }> {
    const count = idSede
      ? await this.departamentoService.countBySede(idSede)
      : await this.departamentoService.count();
    return { count };
  }

  @Get(':nombre')
  @Roles('administrador', 'medico', 'personal_administrativo')
  async findByNombre(@Param('nombre') nombre: string): Promise<DepartamentoResponseDto> {
    return this.departamentoService.findByNombre(nombre);
  }

  @Put(':nombre')
  @Roles('administrador', 'personal_administrativo')
  async update(
    @Param('nombre') nombre: string,
    @Body() updateDepartamentoDto: UpdateDepartamentoDto,
  ): Promise<DepartamentoResponseDto> {
    return this.departamentoService.update(nombre, updateDepartamentoDto);
  }

  @Delete(':nombre')
  @Roles('administrador', 'personal_administrativo')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('nombre') nombre: string): Promise<void> {
    return this.departamentoService.delete(nombre);
  }
}
