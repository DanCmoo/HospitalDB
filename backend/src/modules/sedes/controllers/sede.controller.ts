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
import { SedeService } from '../services/sede.service';
import { CreateSedeDto, UpdateSedeDto, SedeResponseDto } from '../dtos';
import { AuthGuard, RolesGuard } from '../../auth/guards';
import { Roles } from '../../auth/decorators';

@Controller('sedes')
@UseGuards(AuthGuard, RolesGuard)
export class SedeController {
  constructor(private readonly sedeService: SedeService) {}

  @Post()
  @Roles('administrador')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSedeDto: CreateSedeDto): Promise<SedeResponseDto> {
    return this.sedeService.create(createSedeDto);
  }

  @Get()
  @Roles('administrador', 'medico', 'enfermero', 'personal_administrativo')
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('ciudad') ciudad?: string,
  ): Promise<SedeResponseDto[] | { data: SedeResponseDto[]; total: number; page: number; limit: number }> {
    if (ciudad) {
      return this.sedeService.findByCiudad(ciudad);
    }

    if (page && limit) {
      return this.sedeService.findWithPagination(page, limit);
    }

    return this.sedeService.findAll();
  }

  @Get('search')
  @Roles('administrador', 'medico', 'enfermero', 'personal_administrativo')
  async search(@Query('term') term: string): Promise<SedeResponseDto[]> {
    return this.sedeService.search(term);
  }

  @Get('count')
  @Roles('administrador', 'medico', 'enfermero', 'personal_administrativo')
  async count(): Promise<{ count: number }> {
    const count = await this.sedeService.count();
    return { count };
  }

  @Get('next-id')
  @Roles('administrador', 'medico', 'enfermero', 'personal_administrativo')
  async getNextId(): Promise<{ nextId: number }> {
    const nextId = await this.sedeService.getNextId();
    return { nextId };
  }

  @Get(':id')
  @Roles('administrador', 'medico', 'enfermero', 'personal_administrativo')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<SedeResponseDto> {
    return this.sedeService.findById(id);
  }

  @Put(':id')
  @Roles('administrador')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSedeDto: UpdateSedeDto,
  ): Promise<SedeResponseDto> {
    return this.sedeService.update(id, updateSedeDto);
  }

  @Delete(':id')
  @Roles('administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.sedeService.delete(id);
  }
}
