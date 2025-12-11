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
} from '@nestjs/common';
import { PersonaService } from '../services/persona.service';
import {
  CreatePersonaDto,
  UpdatePersonaDto,
  PersonaResponseDto,
} from '../dtos';

@Controller('personas')
export class PersonaController {
  constructor(private readonly personaService: PersonaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createPersonaDto: CreatePersonaDto,
  ): Promise<PersonaResponseDto> {
    return this.personaService.create(createPersonaDto);
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;

    if (pageNum && limitNum) {
      return this.personaService.findAllPaginated(pageNum, limitNum);
    }

    return this.personaService.findAll();
  }

  @Get('search')
  async search(@Query('nombre') nombre: string): Promise<PersonaResponseDto[]> {
    return this.personaService.searchByName(nombre);
  }

  @Get('count')
  async count(): Promise<{ count: number }> {
    const count = await this.personaService.count();
    return { count };
  }

  @Get(':numDoc')
  async findOne(@Param('numDoc') numDoc: string): Promise<PersonaResponseDto> {
    return this.personaService.findByNumDoc(numDoc);
  }

  @Put(':numDoc')
  async update(
    @Param('numDoc') numDoc: string,
    @Body() updatePersonaDto: UpdatePersonaDto,
  ): Promise<PersonaResponseDto> {
    return this.personaService.update(numDoc, updatePersonaDto);
  }

  @Delete(':numDoc')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('numDoc') numDoc: string): Promise<void> {
    return this.personaService.delete(numDoc);
  }
}
