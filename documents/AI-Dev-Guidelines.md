# Guía Completa de Arquitectura: NestJS Backend + Next.js Frontend + AWS

## 📋 Tabla de Contenidos
1. [Visión General](#visión-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Arquitectura Backend - NestJS](#arquitectura-backend---nestjs)
4. [Arquitectura Frontend - Next.js](#arquitectura-frontend---nextjs)
5. [Base de Datos en AWS](#base-de-datos-en-aws)
6. [Estándares de Codificación](#estándares-de-codificación)
7. [Convenciones de Nombres](#convenciones-de-nombres)
8. [Patrones de Desarrollo](#patrones-de-desarrollo)

---

## Visión General

### Objetivo del Proyecto
Sistema integral de gestión hospitalaria que incluye:
- Gestión de pacientes, empleados y sedes
- Agenda de citas médicas
- Historiales clínicos
- Prescripciones y medicamentos
- Equipamiento hospitalario
- Auditoría de accesos

### Stack Tecnológico
- **Backend**: NestJS (Node.js + TypeScript)
- **Frontend**: Next.js (React + TypeScript)
- **Base de Datos**: PostgreSQL en AWS RDS
- **Infraestructura**: AWS (RDS, EC2 o Lambda, S3 para logs)
- **Autenticación**: JWT con roles (administrador, médico, enfermero, personal_administrativo)

### Contexto de Base de Datos
- **Base**: PostgreSQL
- **Entidades principales**: Personas, Pacientes, Empleados, Sedes_Hospitalarias, Departamentos
- **Relaciones complejas**: Múltiples vistas preestablecidas
- **Roles**: 4 roles de usuario con diferentes permisos

---

## Estructura del Proyecto

### Directorio Raíz

```
hospital-system/
├── backend/                          # NestJS Application
│   ├── src/
│   │   ├── modules/
│   │   │   ├── personas/
│   │   │   ├── pacientes/
│   │   │   ├── empleados/
│   │   │   ├── sedes/
│   │   │   ├── departamentos/
│   │   │   ├── equipamiento/
│   │   │   ├── agenda-citas/
│   │   │   ├── medicamentos/
│   │   │   ├── prescripciones/
│   │   │   ├── historiales/
│   │   │   └── auditoria/
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   ├── filters/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── pipes/
│   │   │   └── utils/
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   ├── config/
│   │   │   ├── database.config.ts
│   │   │   ├── auth.config.ts
│   │   │   └── aws.config.ts
│   │   └── app.module.ts
│   ├── test/
│   ├── .env.example
│   ├── docker-compose.yml
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                         # Next.js Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   ├── dashboard/
│   │   │   ├── pacientes/
│   │   │   ├── citas/
│   │   │   ├── medicamentos/
│   │   │   ├── historiales/
│   │   │   ├── usuarios/
│   │   │   ├── equipamiento/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── forms/
│   │   │   └── tables/
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   ├── api/
│   │   │   ├── auth/
│   │   │   └── utils/
│   │   ├── styles/
│   │   └── types/
│   ├── public/
│   ├── .env.local.example
│   ├── next.config.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── docs/
├── .gitignore
└── README.md
```

---

## Arquitectura Backend - NestJS

### Principio Fundamental: N-Capas

El backend debe implementar la arquitectura de 4 capas para cada módulo:

```
Controller → Service → Repository → Entity (Database)
```

### 1. Capa Entidad (Entity Layer)

**Ubicación**: `src/modules/{feature}/entities/`

**Reglas**:
- Una clase TypeORM por tabla de base de datos
- Usar decoradores TypeORM: `@Entity()`, `@Column()`, `@PrimaryColumn()`, `@OneToMany()`, `@ManyToOne()`, `@ManyToMany()`
- Las propiedades deben coincidir exactamente con los nombres de columnas de PostgreSQL (en camelCase)
- Incluir todas las relaciones necesarias con sus `@JoinColumn()` cuando sea necesario
- NO incluir lógica de negocio
- NUNCA exponer entidades directamente en las respuestas del API (usar DTOs)

**Ejemplo**:
```typescript
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('Personas')
export class PersonaEntity {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  numDoc: string;

  @Column({ type: 'varchar', length: 20 })
  tipoDoc: string;

  @Column({ type: 'varchar', length: 50 })
  nomPers: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  correo: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telPers: string;
}
```

### 2. Capa Repositorio (Repository Layer)

**Ubicación**: `src/modules/{feature}/repositories/`

**Responsabilidades**:
- Encapsular la lógica de acceso a datos
- Métodos CRUD básicos: `create()`, `findOne()`, `findAll()`, `update()`, `delete()`
- Métodos especializados para consultas complejas
- Manejo de transacciones cuando sea necesario

**Reglas**:
- Extender `Repository<Entity>` de TypeORM
- Inyectar con `@InjectRepository()`
- NO incluir lógica de negocio compleja
- Devolver entidades TypeORM (no DTOs)
- Usar QueryBuilder para consultas complejas

**Ejemplo**:
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonaEntity } from '../entities/persona.entity';

@Injectable()
export class PersonaRepository {
  constructor(
    @InjectRepository(PersonaEntity)
    private readonly repository: Repository<PersonaEntity>,
  ) {}

  async findByNumDoc(numDoc: string): Promise<PersonaEntity | null> {
    return this.repository.findOne({ where: { numDoc } });
  }

  async findAll(): Promise<PersonaEntity[]> {
    return this.repository.find();
  }

  async create(data: Partial<PersonaEntity>): Promise<PersonaEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(numDoc: string, data: Partial<PersonaEntity>): Promise<PersonaEntity> {
    await this.repository.update(numDoc, data);
    return this.findByNumDoc(numDoc);
  }

  async delete(numDoc: string): Promise<boolean> {
    const result = await this.repository.delete(numDoc);
    return result.affected > 0;
  }
}
```

### 3. Capa Servicio (Service Layer)

**Ubicación**: `src/modules/{feature}/services/`

**Responsabilidades**:
- Contiene TODA la lógica de negocio
- Validaciones y reglas de negocio
- Coordinar entre múltiples repositorios si es necesario
- Manejo de excepciones personalizadas
- Transformación de datos antes de devolver

**Reglas**:
- Una clase servicio por módulo (o dos si hay subdominio claro)
- Inyectar los repositorios necesarios
- Métodos públicos que coincidan con operaciones principales: `create()`, `update()`, `delete()`, `findById()`, `findAll()`, `findBySpecificCriteria()`
- Lanzar excepciones apropiadas (`BadRequestException`, `NotFoundException`, `ConflictException`)
- NO acceder directamente a la base de datos, usar repositorios
- Transformar entidades a DTOs antes de retornar

**Ejemplo**:
```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PersonaRepository } from '../repositories/persona.repository';
import { CreatePersonaDto, UpdatePersonaDto, PersonaResponseDto } from '../dtos';
import { PersonaEntity } from '../entities/persona.entity';

@Injectable()
export class PersonaService {
  constructor(private readonly personaRepository: PersonaRepository) {}

  async create(createPersonaDto: CreatePersonaDto): Promise<PersonaResponseDto> {
    // Validación de negocio
    const existing = await this.personaRepository.findByNumDoc(createPersonaDto.numDoc);
    if (existing) {
      throw new ConflictException(`Persona con documento ${createPersonaDto.numDoc} ya existe`);
    }

    const entity = await this.personaRepository.create(createPersonaDto);
    return this.mapEntityToDto(entity);
  }

  async findById(numDoc: string): Promise<PersonaResponseDto> {
    const entity = await this.personaRepository.findByNumDoc(numDoc);
    if (!entity) {
      throw new NotFoundException(`Persona con documento ${numDoc} no encontrada`);
    }
    return this.mapEntityToDto(entity);
  }

  async findAll(): Promise<PersonaResponseDto[]> {
    const entities = await this.personaRepository.findAll();
    return entities.map(entity => this.mapEntityToDto(entity));
  }

  async update(numDoc: string, updatePersonaDto: UpdatePersonaDto): Promise<PersonaResponseDto> {
    const existing = await this.personaRepository.findByNumDoc(numDoc);
    if (!existing) {
      throw new NotFoundException(`Persona con documento ${numDoc} no encontrada`);
    }

    const updated = await this.personaRepository.update(numDoc, updatePersonaDto);
    return this.mapEntityToDto(updated);
  }

  async delete(numDoc: string): Promise<void> {
    const existing = await this.personaRepository.findByNumDoc(numDoc);
    if (!existing) {
      throw new NotFoundException(`Persona con documento ${numDoc} no encontrada`);
    }
    await this.personaRepository.delete(numDoc);
  }

  private mapEntityToDto(entity: PersonaEntity): PersonaResponseDto {
    return {
      numDoc: entity.numDoc,
      tipoDoc: entity.tipoDoc,
      nomPers: entity.nomPers,
      correo: entity.correo,
      telPers: entity.telPers,
    };
  }
}
```

### 4. Capa Controlador (Controller Layer)

**Ubicación**: `src/modules/{feature}/controllers/`

**Responsabilidades**:
- Recibir y validar requests HTTP
- Llamar al servicio apropiado
- Formatear y enviar respuestas
- Documentar endpoints con Swagger/OpenAPI

**Reglas**:
- Usar decoradores HTTP: `@Get()`, `@Post()`, `@Put()`, `@Patch()`, `@Delete()`
- Validar DTOs con `ValidationPipe`
- NO incluir lógica de negocio
- Usar guardias de autenticación y autorización
- Documentar cada endpoint con comentarios de Swagger
- Capturar excepciones usando Exception Filters globales

**Ejemplo**:
```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  UseFilters,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PersonaService } from '../services/persona.service';
import { CreatePersonaDto, UpdatePersonaDto, PersonaResponseDto } from '../dtos';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { HttpExceptionFilter } from '../../../common/filters/http-exception.filter';

@Controller('personas')
@UseFilters(HttpExceptionFilter)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PersonaController {
  constructor(private readonly personaService: PersonaService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear una nueva persona' })
  @ApiResponse({ status: 201, description: 'Persona creada exitosamente', type: PersonaResponseDto })
  async create(@Body() createPersonaDto: CreatePersonaDto): Promise<PersonaResponseDto> {
    return this.personaService.create(createPersonaDto);
  }

  @Get(':numDoc')
  @ApiOperation({ summary: 'Obtener una persona por número de documento' })
  @ApiResponse({ status: 200, type: PersonaResponseDto })
  async findById(@Param('numDoc') numDoc: string): Promise<PersonaResponseDto> {
    return this.personaService.findById(numDoc);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las personas' })
  @ApiResponse({ status: 200, type: [PersonaResponseDto] })
  async findAll(): Promise<PersonaResponseDto[]> {
    return this.personaService.findAll();
  }

  @Put(':numDoc')
  @ApiOperation({ summary: 'Actualizar una persona' })
  @ApiResponse({ status: 200, type: PersonaResponseDto })
  async update(
    @Param('numDoc') numDoc: string,
    @Body() updatePersonaDto: UpdatePersonaDto,
  ): Promise<PersonaResponseDto> {
    return this.personaService.update(numDoc, updatePersonaDto);
  }

  @Delete(':numDoc')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar una persona' })
  async delete(@Param('numDoc') numDoc: string): Promise<void> {
    return this.personaService.delete(numDoc);
  }
}
```

### DTOs (Data Transfer Objects)

**Ubicación**: `src/modules/{feature}/dtos/`

**Reglas**:
- Separar en `create-{entity}.dto.ts`, `update-{entity}.dto.ts`, `{entity}-response.dto.ts`
- Usar `class-validator` para decoradores de validación
- NUNCA exponer campos sensibles en response DTOs
- Los DTOs son la interfaz pública de cada módulo

**Ejemplo**:
```typescript
import { IsString, IsEmail, IsOptional, Length } from 'class-validator';

export class CreatePersonaDto {
  @IsString()
  @Length(5, 20)
  numDoc: string;

  @IsString()
  @Length(3, 20)
  tipoDoc: string;

  @IsString()
  @Length(3, 50)
  nomPers: string;

  @IsEmail()
  @IsOptional()
  correo?: string;

  @IsString()
  @IsOptional()
  @Length(7, 20)
  telPers?: string;
}

export class PersonaResponseDto {
  numDoc: string;
  tipoDoc: string;
  nomPers: string;
  correo: string;
  telPers: string;
}
```

### Estructura del Módulo

**Ubicación**: `src/modules/{feature}/{feature}.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonaController } from './controllers/persona.controller';
import { PersonaService } from './services/persona.service';
import { PersonaRepository } from './repositories/persona.repository';
import { PersonaEntity } from './entities/persona.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PersonaEntity])],
  controllers: [PersonaController],
  providers: [PersonaService, PersonaRepository],
  exports: [PersonaService],
})
export class PersonasModule {}
```

### Guardias y Autenticación

**Ubicación**: `src/common/guards/`

**Reglas**:
- Implementar `JwtAuthGuard` para validar tokens JWT
- Implementar `RolesGuard` para verificar roles de usuario
- Los roles disponibles: `administrador`, `médico`, `enfermero`, `personal_administrativo`

**Ejemplo - Decorator de Roles**:
```typescript
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

**Uso en controladores**:
```typescript
@Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('administrador', 'médico')
async create(@Body() dto: CreatePacienteDto) {
  // Solo administrador y médico pueden crear pacientes
}
```

---

## Arquitectura Frontend - Next.js

### Estructura General

El frontend debe seguir App Router de Next.js 13+

### 1. Carpeta `app/`

**Organización por features**:
```
app/
├── (auth)/
│   ├── login/
│   ├── layout.tsx
│   └── page.tsx
├── dashboard/
│   ├── page.tsx
│   └── layout.tsx
├── pacientes/
│   ├── page.tsx
│   ├── [id]/
│   │   ├── page.tsx
│   │   └── edit/
│   │       └── page.tsx
│   ├── new/
│   │   └── page.tsx
│   └── layout.tsx
├── citas/
├── medicamentos/
├── historiales/
├── usuarios/
├── equipamiento/
├── layout.tsx
└── page.tsx (home)
```

### 2. Capa de Servicios/API (`lib/api/`)

**Responsabilidades**:
- Centralizar llamadas HTTP al backend
- Manejo de errores y reintentos
- Configuración de headers y autenticación
- Interceptación de requests/responses

**Ejemplo**:
```typescript
// lib/api/client.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    this.client = axios.create({ baseURL: this.baseURL });
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Redirigir a login
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.client.get<T>(url);
    return response.data;
  }

  async post<T>(url: string, data: unknown): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data: unknown): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete(url: string): Promise<void> {
    await this.client.delete(url);
  }
}

export const apiClient = new ApiClient();
```

**Servicios específicos**:
```typescript
// lib/api/personas.ts
import { apiClient } from './client';
import { PersonaResponseDto } from './dtos';

export const personasApi = {
  getAll: () => apiClient.get<PersonaResponseDto[]>('/personas'),
  getById: (numDoc: string) => apiClient.get<PersonaResponseDto>(`/personas/${numDoc}`),
  create: (data: unknown) => apiClient.post<PersonaResponseDto>('/personas', data),
  update: (numDoc: string, data: unknown) => apiClient.put<PersonaResponseDto>(`/personas/${numDoc}`, data),
  delete: (numDoc: string) => apiClient.delete(`/personas/${numDoc}`),
};
```

### 3. Hooks Personalizados (`hooks/`)

**Ejemplo - useApi Hook**:
```typescript
import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';

interface UseApiOptions {
  autoFetch?: boolean;
}

export function useApi<T>(
  apiFn: () => Promise<T>,
  options: UseApiOptions = { autoFetch: true }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFn();
      setData(result);
    } catch (err) {
      setError(err as AxiosError);
    } finally {
      setLoading(false);
    }
  }, [apiFn]);

  useEffect(() => {
    if (options.autoFetch) {
      fetch();
    }
  }, []);

  return { data, loading, error, refetch: fetch };
}
```

### 4. Componentes (`components/`)

**Estructura**:
```
components/
├── common/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Modal.tsx
├── forms/
│   ├── PersonaForm.tsx
│   ├── PacienteForm.tsx
│   └── CitaForm.tsx
└── tables/
    ├── PersonasTable.tsx
    ├── PacientesTable.tsx
    └── CitasTable.tsx
```

**Reglas**:
- Componentes funcionales con hooks
- Props bien tipados
- Componentes reutilizables en `common/`
- Componentes específicos del dominio en carpetas por feature
- Usar Tailwind CSS para estilos

### 5. Tipos (`types/`)

```typescript
// types/persona.ts
export interface Persona {
  numDoc: string;
  tipoDoc: string;
  nomPers: string;
  correo: string;
  telPers: string;
}

export interface Paciente extends Persona {
  codPac: number;
  fechaNac: string;
  genero: string;
  drPac: string;
}
```

---

## Base de Datos en AWS

### Configuración RDS PostgreSQL

**Variables de entorno** (`.env`):
```
DATABASE_HOST=your-rds-endpoint.amazonaws.com
DATABASE_PORT=5432
DATABASE_NAME=hospital_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your_secure_password
DATABASE_SSL=true
```

**Conexión en NestJS**:
```typescript
// config/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: process.env.NODE_ENV !== 'production',
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  logging: process.env.NODE_ENV !== 'production',
  extra: {
    max: 20,
    min: 5,
    connectionTimeoutMillis: 30000,
  },
});
```

### Migraciones

**Ubicación**: `src/database/migrations/`

**Reglas**:
- Usar TypeORM CLI para generar migraciones
- Un archivo de migración por cambio de esquema
- Nombrar: `{timestamp}-{description}.ts`
- Siempre incluir `down()` para revertir cambios

```bash
npm run typeorm migration:generate -- src/database/migrations/InitialSchema
npm run typeorm migration:run
npm run typeorm migration:revert
```

### Seeds (Datos Iniciales)

**Ubicación**: `src/database/seeds/`

```typescript
// src/database/seeds/personas.seed.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonaEntity } from '../../modules/personas/entities/persona.entity';

@Injectable()
export class PersonasSeeder {
  constructor(
    @InjectRepository(PersonaEntity)
    private personaRepository: Repository<PersonaEntity>,
  ) {}

  async seed() {
    const existingCount = await this.personaRepository.count();
    if (existingCount > 0) return;

    const personas = [
      { numDoc: '1234567890', tipoDoc: 'CC', nomPers: 'Juan Pérez', correo: 'juan@hospital.com', telPers: '3001234567' },
      // más registros...
    ];

    for (const persona of personas) {
      await this.personaRepository.save(persona);
    }
  }
}
```

---

## Estándares de Codificación

### TypeScript

1. **Tipos explícitos**: SIEMPRE especificar tipos, no usar `any`
   ```typescript
   // ❌ Evitar
   const data: any = await service.findAll();

   // ✅ Correcto
   const data: PersonaResponseDto[] = await service.findAll();
   ```

2. **Interfaces para objetos complejos**
   ```typescript
   interface ApiResponse<T> {
     status: 'success' | 'error';
     data?: T;
     message?: string;
     timestamp: Date;
   }
   ```

3. **Null checking**
   ```typescript
   // ✅ Usar operador de coalescencia nula
   const timeout = config.timeout ?? 30000;
   ```

### NestJS Específico

1. **Inyección de dependencias**
   ```typescript
   // ✅ Correcto
   constructor(
     private readonly service: PersonaService,
     private readonly logger: Logger,
   ) {}

   // ❌ No usar new
   this.service = new PersonaService();
   ```

2. **Excepciones HTTP estándar**
   ```typescript
   // ✅ Usar excepciones NestJS
   throw new NotFoundException(`Recurso no encontrado: ${id}`);
   throw new BadRequestException('Dato inválido');
   throw new ConflictException('Recurso ya existe');
   throw new UnauthorizedException('No autorizado');
   ```

3. **Decoradores de módulos**
   ```typescript
   @Module({
     imports: [TypeOrmModule.forFeature([Entity1, Entity2])],
     controllers: [Controller1],
     providers: [Service1, Repository1],
     exports: [Service1], // Para ser usado por otros módulos
   })
   export class FeatureModule {}
   ```

### Validación

**class-validator + class-transformer**:
```typescript
import { IsString, IsEmail, IsOptional, ValidateNested, Type } from 'class-validator';

export class CreatePersonaDto {
  @IsString()
  @Length(5, 20)
  numDoc: string;

  @IsEmail()
  correo: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}
```

---

## Convenciones de Nombres

### Backend NestJS

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Carpetas | kebab-case | `personas`, `agenda-citas` |
| Archivos | kebab-case.ts | `persona.entity.ts`, `create-persona.dto.ts` |
| Clases | PascalCase | `PersonaService`, `PersonaRepository` |
| Interfaces | I + PascalCase o PascalCase | `IPersonaRepository` o `PersonaRepository` |
| Enums | PascalCase | `PersonStatusEnum`, `UserRoleEnum` |
| Métodos | camelCase | `findById()`, `createPaciente()` |
| Constantes | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_TIMEOUT` |
| Variables | camelCase | `personaData`, `isActive` |

### Base de Datos (PostgreSQL)

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Tablas | PascalCase o snake_case | `Personas` o `personas` |
| Columnas | snake_case o camelCase | `num_doc` o `numDoc` |
| FK | tabla_id o tablaId | `persona_id`, `personaId` |
| Índices | idx_tabla_columna | `idx_personas_num_doc` |
| Vistas | Vista_Descripcion | `Vista_Pacientes_Completa` |

### Frontend Next.js

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Carpetas | kebab-case | `dashboard`, `my-profile` |
| Componentes | PascalCase.tsx | `PersonaForm.tsx`, `CitaTable.tsx` |
| Hooks | useNameFunction | `useApi()`, `usePersonas()` |
| Utilidades | camelCase | `formatDate()`, `validateEmail()` |
| Constantes | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_FILE_SIZE` |
| Tipos | PascalCase | `PersonaType`, `CitaStatus` |

---

## Patrones de Desarrollo

### 1. Patrón Repository

**Propósito**: Abstrae la lógica de acceso a datos

```typescript
// Repository
async findByNumDoc(numDoc: string): Promise<PersonaEntity> {
  return this.repository.findOne({ where: { numDoc } });
}

// Service
async getPersona(numDoc: string): Promise<PersonaResponseDto> {
  const entity = await this.repository.findByNumDoc(numDoc);
  return this.mapToDto(entity);
}

// Controller
@Get(':numDoc')
async findPersona(@Param('numDoc') numDoc: string) {
  return this.service.getPersona(numDoc);
}
```

### 2. Patrón DTO

**Propósito**: Separar modelos internos de la API pública

```typescript
// Entity (Interno)
@Entity()
class User {
  @Column()
  password: string; // NUNCA exponer
}

// Response DTO (Público)
class UserResponseDto {
  name: string;
  email: string;
  // password NO incluida
}
```

### 3. Patrón Guard + Decorator

**Propósito**: Implementar autenticación y autorización

```typescript
// Decorador personalizado
@UseGuards(JwtAuthGuard)
@Roles('administrador')
@Post()
createEntity() {}

// Guía fluye: Decorador → Guard → Controller
```

### 4. Patrón Exception Filter

**Propósito**: Manejo centralizado de errores

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response.status(status).json({
      statusCode: status,
      message: exceptionResponse,
      timestamp: new Date(),
    });
  }
}
```

### 5. Patrón de Paginación

```typescript
// DTO
export class PaginationQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sort?: string = 'id:asc';
}

// Service
async findAll(query: PaginationQueryDto) {
  const skip = (query.page - 1) * query.limit;
  const [data, total] = await this.repository.findAndCount({
    skip,
    take: query.limit,
  });

  return {
    data,
    pagination: {
      total,
      page: query.page,
      limit: query.limit,
      pages: Math.ceil(total / query.limit),
    },
  };
}
```

### 6. Transacciones en Servicios

```typescript
async transferirEquipamiento(
  codEq: number,
  fromDept: string,
  toDept: string,
) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    await queryRunner.manager.update(
      Equipamiento,
      { codEq },
      { nomDept: toDept }
    );
    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw new BadRequestException('Error en transferencia');
  } finally {
    await queryRunner.release();
  }
}
```

### 7. Logging Estructurado

```typescript
import { Logger } from '@nestjs/common';

export class PersonaService {
  private logger = new Logger(PersonaService.name);

  async create(dto: CreatePersonaDto) {
    this.logger.log(`Creating persona with numDoc: ${dto.numDoc}`);
    
    try {
      const result = await this.repository.create(dto);
      this.logger.debug(`Persona created successfully: ${result.numDoc}`);
      return result;
    } catch (error) {
      this.logger.error(`Error creating persona: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

---

## Directivas Clave para Agentes IA

### ✅ DEBE HACER

1. **Respetar la arquitectura N-capas**: Entity → Repository → Service → Controller
2. **Usar DTOs para todas las respuestas públicas**: Nunca exponer entidades TypeORM
3. **Validar con class-validator**: Todas las entradas deben validarse
4. **Usar guardias en controladores**: Implementar autenticación y roles
5. **Documentar con Swagger/OpenAPI**: Todos los endpoints documentados
6. **Mantener servicios sin lógica de acceso a datos**: Solo usar repositorios
7. **Usar tipos explícitos**: Nunca usar `any`
8. **Implementar manejo de errores**: Usar excepciones HTTP apropiadas
9. **Separar concerns**: Cada capa tiene una responsabilidad única
10. **Documentar cambios**: Migraciones para cambios de esquema

### ❌ NO DEBE HACER

1. **NO acceder directamente a la BD desde controllers**: Usar servicios
2. **NO mezclar lógica de negocio en repositorios**: Solo acceso a datos
3. **NO exponer entidades en respuestas HTTP**: Usar DTOs
4. **NO usar `any` en TypeScript**: Especificar tipos siempre
5. **NO duplicar código**: Extraer a utilidades o servicios comunes
6. **NO ignorar validación**: Validar todas las entradas
7. **NO hardcodear valores**: Usar variables de entorno
8. **NO hacer cambios de esquema sin migraciones**: Documentar cambios
9. **NO mezclar autenticación y lógica de negocio**: Usar guards
10. **NO crear componentes gigantes en frontend**: Descomponer en subcomponentes

---

## Flujo de Desarrollo Típico

### Creación de nuevo módulo (ej: Pacientes)

1. **Crear Entity** (`pacientes/entities/paciente.entity.ts`)
   - Mapear tabla `Pacientes` a clase TypeORM
   - Definir relaciones con `Personas`

2. **Crear Repository** (`pacientes/repositories/paciente.repository.ts`)
   - Métodos CRUD básicos
   - Consultas especializadas si es necesario

3. **Crear DTOs** (`pacientes/dtos/`)
   - `create-paciente.dto.ts`
   - `update-paciente.dto.ts`
   - `paciente-response.dto.ts`

4. **Crear Service** (`pacientes/services/paciente.service.ts`)
   - Lógica de negocio
   - Transformación Entity → DTO
   - Validaciones

5. **Crear Controller** (`pacientes/controllers/paciente.controller.ts`)
   - Endpoints REST
   - Swagger documentation
   - Guards de autenticación

6. **Crear Module** (`pacientes/pacientes.module.ts`)
   - Registrar Entity
   - Importar dependencias
   - Exportar servicios

7. **Registrar en AppModule**
   - Importar PacientesModule

8. **Frontend - Crear servicios API** (`lib/api/pacientes.ts`)
   - Funciones para cada endpoint

9. **Frontend - Crear componentes**
   - Forms, Tables, Pages

10. **Testing**
    - Unit tests para servicios
    - Integration tests para endpoints

---

## Referencias de Bases de Datos

### Entidades Principales

- **Personas**: Base para pacientes y empleados (num_doc: PK)
- **Pacientes**: Hereda de Personas (cod_pac: PK)
- **Empleados**: Hereda de Personas (id_emp: PK)
- **Sedes_Hospitalarias**: Ubicaciones (id_sede: PK)
- **Departamentos**: Agrupación de empleados (nom_dept: PK)
- **Agenda_Cita**: Citas médicas (id_cita: PK)
- **Emite_Hist**: Historiales clínicos (cod_hist: PK)
- **Medicamentos**: Catálogo (cod_med: PK)
- **Prescribe**: Relación Cita-Medicamento (cod_med + id_cita: PK)
- **Equipamiento**: Recursos hospitalarios (cod_eq: PK)

### Roles de Usuario

1. **administrador**: Acceso total
2. **medico**: CRUD en Pacientes, Citas, Historiales, Prescripciones
3. **enfermero**: Lectura en Pacientes, Citas, Historiales
4. **personal_administrativo**: CRUD en Personas, Sedes, Departamentos

---

## Comandos Útiles

### Backend
```bash
# Iniciar desarrollo
npm run start:dev

# Generar migración
npm run typeorm migration:generate -- src/database/migrations/DescriptionName

# Ejecutar migraciones
npm run typeorm migration:run

# Tests
npm run test
npm run test:e2e

# Lint
npm run lint
npm run lint:fix
```

### Frontend
```bash
# Iniciar desarrollo
npm run dev

# Build
npm run build

# Lint
npm run lint

# Type check
npm run type-check
```

---

## Checklist de Validación

Antes de hacer commit:

- [ ] Tipos TypeScript correctos (no `any`)
- [ ] Validación con class-validator
- [ ] Guardias de autenticación/autorización
- [ ] DTOs para respuestas públicas
- [ ] Manejo de errores apropiado
- [ ] Documentación Swagger
- [ ] Tests unitarios básicos
- [ ] Variables de entorno configuradas
- [ ] Sin lógica de negocio en controllers/repositories
- [ ] Nombres de archivos y variables según convención

---

**Última actualización**: Diciembre 2025
**Versión**: 1.0
