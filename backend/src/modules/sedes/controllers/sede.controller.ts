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
} from '@nestjs/common';
import { SedeService } from '../services/sede.service';
import { CreateSedeDto, UpdateSedeDto, SedeResponseDto } from '../dtos';

@Controller('sedes')
export class SedeController {
  constructor(private readonly sedeService: SedeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSedeDto: CreateSedeDto): Promise<SedeResponseDto> {
    return this.sedeService.create(createSedeDto);
  }

  @Get()
  async findAll(
    @Query('page', ParseIntPipe) page?: number,
    @Query('limit', ParseIntPipe) limit?: number,
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
  async search(@Query('term') term: string): Promise<SedeResponseDto[]> {
    return this.sedeService.search(term);
  }

  @Get('count')
  async count(): Promise<{ count: number }> {
    const count = await this.sedeService.count();
    return { count };
  }

  @Get('next-id')
  async getNextId(): Promise<{ nextId: number }> {
    const nextId = await this.sedeService.getNextId();
    return { nextId };
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<SedeResponseDto> {
    return this.sedeService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSedeDto: UpdateSedeDto,
  ): Promise<SedeResponseDto> {
    return this.sedeService.update(id, updateSedeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.sedeService.delete(id);
  }
}
