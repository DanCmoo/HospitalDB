# Fase 7 - Agenda de Citas y Prescripciones - COMPLETADA ✅

## Resumen de Implementación

Esta fase implementó el sistema de gestión de citas médicas y prescripciones, integrando pacientes, empleados (médicos) y medicamentos en el flujo clínico del hospital.

---

## Backend Implementado

### 1. Módulo Agenda de Citas

#### Entidad: `AgendaCitaEntity`
- **Tabla**: `agenda_cita`
- **Campos**:
  - `idCita` (PK): ID único de la cita
  - `fecha`: Fecha de la cita
  - `hora`: Hora de la cita
  - `tipoServicio`: Tipo de servicio médico
  - `estado`: Estado de la cita (enum)
  - `idSede`: ID de la sede
  - `nomDept`: Departamento (opcional)
  - `idEmp`: ID del empleado (médico)
  - `codPac`: Código del paciente

- **Enum EstadoCita**:
  - `Programada`
  - `Completada`
  - `Cancelada`
  - `No Asistió`

- **Relaciones**:
  - `@ManyToOne` con `EmpleadoEntity`
  - `@ManyToOne` con `PacienteEntity`
  - `@OneToMany` con `PrescribeEntity`

#### Repository: `AgendaCitaRepository`
- `findAll()`: Obtener todas las citas con relaciones
- `findById(idCita)`: Buscar cita por ID con prescripciones
- `findByEstado(estado)`: Filtrar por estado
- `findByEmpleado(idEmp)`: Citas de un empleado
- `findByPaciente(codPac)`: Citas de un paciente
- `findByFecha(fecha)`: Citas en una fecha
- `findByFechaRango(fechaInicio, fechaFin)`: Citas en rango de fechas (usando `Between`)
- `findBySede(idSede)`: Citas por sede
- `findByEmpleadoAndFecha(idEmp, fecha)`: Para validación de conflictos
- `create()`, `update()`, `delete()`, `count()`, `getNextId()`, `findWithPagination()`

#### Service: `AgendaCitaService`
- CRUD completo con validaciones
- **Validación de conflictos**: Previene doble reserva del mismo médico en la misma fecha/hora
- Filtrado por múltiples criterios
- Mapeo a DTOs de respuesta con relaciones anidadas

#### Controller: `AgendaCitaController`
- `GET /agenda-citas`: Lista todas las citas
- `GET /agenda-citas?estado=X`: Filtrar por estado
- `GET /agenda-citas?idEmp=X`: Filtrar por empleado
- `GET /agenda-citas?codPac=X`: Filtrar por paciente
- `GET /agenda-citas?fecha=X`: Filtrar por fecha
- `GET /agenda-citas?fechaInicio=X&fechaFin=Y`: Rango de fechas
- `GET /agenda-citas?idSede=X`: Filtrar por sede
- `GET /agenda-citas/:id`: Obtener cita por ID
- `POST /agenda-citas`: Crear nueva cita (con validación de conflictos)
- `PUT /agenda-citas/:id`: Actualizar cita
- `DELETE /agenda-citas/:id`: Eliminar cita
- `GET /agenda-citas/estadisticas/total`: Contar citas

#### DTOs:
- `CreateAgendaCitaDto`: Validación con `class-validator`, enum para estado
- `UpdateAgendaCitaDto`: Campos opcionales para actualización
- `AgendaCitaResponseDto`: Respuesta con empleado, paciente y prescripciones anidadas

---

### 2. Módulo Prescripciones

#### Entidad: `PrescribeEntity`
- **Tabla**: `prescribe` (tabla de unión con datos adicionales)
- **Composite Primary Key**:
  - `codMed` (@PrimaryColumn): ID del medicamento
  - `idCita` (@PrimaryColumn): ID de la cita

- **Campos**:
  - `dosis`: Cantidad de medicamento (mínimo 1)
  - `frecuencia`: Frecuencia en horas (mínimo 1)
  - `duracion`: Fecha de duración del tratamiento
  - `fechaEmision`: Fecha de emisión de la prescripción

- **Relaciones**:
  - `@ManyToOne` con `MedicamentoEntity`
  - `@ManyToOne` con `AgendaCitaEntity`

#### Repository: `PrescribeRepository`
- `findAll()`: Todas las prescripciones con relaciones
- `findByCita(idCita)`: Prescripciones de una cita específica
- `findByMedicamento(codMed)`: Prescripciones de un medicamento
- `findOne(codMed, idCita)`: Buscar por clave compuesta
- `create()`: Crear prescripción
- `update(codMed, idCita, data)`: Actualizar usando clave compuesta
- `delete(codMed, idCita)`: Eliminar usando clave compuesta
- `count()`: Contar prescripciones

#### Service: `PrescribeService`
- CRUD completo con manejo de claves compuestas
- Validación de existencia antes de actualizar/eliminar
- Mapeo a DTOs con relaciones a medicamento y cita

#### Controller: `PrescribeController`
- `GET /prescripciones`: Lista todas las prescripciones
- `GET /prescripciones?idCita=X`: Filtrar por cita
- `GET /prescripciones?codMed=X`: Filtrar por medicamento
- `GET /prescripciones/:codMed/:idCita`: Obtener prescripción específica
- `POST /prescripciones`: Crear prescripción
- `PUT /prescripciones/:codMed/:idCita`: Actualizar prescripción
- `DELETE /prescripciones/:codMed/:idCita`: Eliminar prescripción
- `GET /prescripciones/estadisticas/total`: Contar prescripciones

#### DTOs:
- `CreatePrescribeDto`: Validación con `@Min(1)` para dosis y frecuencia
- `UpdatePrescribeDto`: Campos opcionales
- `PrescribeResponseDto`: Respuesta con medicamento y datos de cita/paciente

---

## Frontend Implementado

### 1. Página Agenda de Citas (`/agenda-citas`)

**Características**:
- ✅ Tabla con columnas: ID, Fecha, Hora, Servicio, Estado, Empleado, Paciente, Acciones
- ✅ Búsqueda por servicio, empleado o paciente
- ✅ Filtros:
  - Por estado (Programada, Completada, Cancelada, No Asistió)
  - Por fecha
- ✅ Badges de estado con colores:
  - 🔵 Programada: azul
  - 🟢 Completada: verde
  - 🔴 Cancelada: rojo
  - 🟡 No Asistió: amarillo
- ✅ Modal de creación/edición con:
  - Selector de fecha y hora
  - Selector de tipo de servicio
  - Dropdown de estado
  - Selector de sede (solo creación)
  - Campo opcional de departamento
  - Selector de empleado (solo creación)
  - Selector de paciente (solo creación)
- ✅ Validación de conflictos en backend
- ✅ CRUD completo

### 2. Página Prescripciones (`/prescripciones`)

**Características**:
- ✅ Tabla con columnas: Medicamento (con stock), Cita, Paciente, Dosis, Frecuencia, Duración, Fecha Emisión, Acciones
- ✅ Búsqueda por medicamento o paciente
- ✅ Filtro por cita específica
- ✅ Modal de creación/edición con:
  - Selector de medicamento (muestra stock disponible)
  - Selector de cita (muestra fecha, paciente y tipo de servicio)
  - Input de dosis (mínimo 1)
  - Input de frecuencia en horas (mínimo 1)
  - Selector de fecha de duración
  - Selector de fecha de emisión
- ✅ Clave compuesta en operaciones (codMed + idCita)
- ✅ CRUD completo

### 3. API Services

**`lib/api/agenda-citas.ts`**:
- `getAll(params)`: Con soporte para múltiples filtros
- `getById(id)`
- `create(data)`
- `update(id, data)`
- `delete(id)`
- `getCount()`

**`lib/api/prescripciones.ts`**:
- `getAll(params)`: Con filtros por cita y medicamento
- `getOne(codMed, idCita)`: Manejo de clave compuesta
- `create(data)`
- `update(codMed, idCita, data)`: Manejo de clave compuesta
- `delete(codMed, idCita)`: Manejo de clave compuesta
- `getCount()`

### 4. Types

**`lib/types/agenda-cita.ts`**:
- Enum `EstadoCita`
- Interface `AgendaCita`
- DTOs: `CreateAgendaCitaDto`, `UpdateAgendaCitaDto`

**`lib/types/prescribe.ts`**:
- Interface `Prescribe`
- DTOs: `CreatePrescribeDto`, `UpdatePrescribeDto`

---

## Integración con AppModule

Ambos módulos fueron registrados en `app.module.ts`:

```typescript
import { AgendaCitasModule } from './modules/agenda-citas/agenda-citas.module';
import { PrescripcionesModule } from './modules/prescripciones/prescripciones.module';

@Module({
  imports: [
    // ... otros módulos
    AgendaCitasModule,
    PrescripcionesModule,
  ],
})
```

---

## Características Técnicas Destacadas

### 1. Validación de Conflictos de Citas
El servicio `AgendaCitaService` valida que un médico no tenga dos citas en el mismo horario:

```typescript
const conflictos = await this.agendaCitaRepository.findByEmpleadoAndFecha(dto.idEmp, dto.fecha);
const tieneConflicto = conflictos.some((cita) => cita.hora === dto.hora && cita.estado !== 'Cancelada');
if (tieneConflicto) {
  throw new BadRequestException(`El empleado ya tiene una cita programada...`);
}
```

### 2. Composite Primary Key en Prescripciones
Uso de dos `@PrimaryColumn` para implementar clave compuesta:

```typescript
@Entity('prescribe')
export class PrescribeEntity {
  @PrimaryColumn({ name: 'cod_med' })
  codMed: number;

  @PrimaryColumn({ name: 'id_cita' })
  idCita: number;
  // ...
}
```

Todas las operaciones de repositorio manejan la clave compuesta:

```typescript
async update(codMed: number, idCita: number, data: Partial<PrescribeEntity>) {
  await this.repository.update({ codMed, idCita }, data);
  return this.findOne(codMed, idCita);
}
```

### 3. Consultas de Rango de Fechas
Uso de `Between` de TypeORM para filtrar citas por rango:

```typescript
return this.repository.find({
  where: {
    fecha: Between(fechaInicio, fechaFin),
  },
  // ...
});
```

### 4. Relaciones Anidadas
Los repositorios cargan relaciones profundas para obtener datos completos:

```typescript
relations: ['empleado', 'empleado.persona', 'paciente', 'paciente.persona', 'prescripciones', 'prescripciones.medicamento']
```

---

## Archivos Creados

### Backend - Agenda de Citas (10 archivos)
1. `entities/agenda-cita.entity.ts` - Entidad con enum EstadoCita
2. `repositories/agenda-cita.repository.ts` - Repositorio con queries especializadas
3. `dtos/create-agenda-cita.dto.ts` - DTO de creación
4. `dtos/update-agenda-cita.dto.ts` - DTO de actualización
5. `dtos/agenda-cita-response.dto.ts` - DTO de respuesta
6. `dtos/index.ts` - Barrel export
7. `services/agenda-cita.service.ts` - Servicio con lógica de negocio
8. `controllers/agenda-cita.controller.ts` - Controlador REST
9. `agenda-citas.module.ts` - Módulo NestJS

### Backend - Prescripciones (9 archivos)
1. `entities/prescribe.entity.ts` - Entidad con composite PK
2. `repositories/prescribe.repository.ts` - Repositorio con manejo de clave compuesta
3. `dtos/create-prescribe.dto.ts` - DTO de creación
4. `dtos/update-prescribe.dto.ts` - DTO de actualización
5. `dtos/prescribe-response.dto.ts` - DTO de respuesta
6. `dtos/index.ts` - Barrel export
7. `services/prescribe.service.ts` - Servicio
8. `controllers/prescribe.controller.ts` - Controlador REST
9. `prescripciones.module.ts` - Módulo NestJS

### Frontend (6 archivos)
1. `lib/types/agenda-cita.ts` - Tipos TypeScript
2. `lib/types/prescribe.ts` - Tipos TypeScript
3. `lib/api/agenda-citas.ts` - Cliente API
4. `lib/api/prescripciones.ts` - Cliente API
5. `app/agenda-citas/page.tsx` - Página de citas
6. `app/prescripciones/page.tsx` - Página de prescripciones

### Modificaciones
1. `backend/src/app.module.ts` - Registro de módulos
2. `backend/src/modules/agenda-citas/repositories/agenda-cita.repository.ts` - Agregado método `findByEmpleadoAndFecha`

---

## Próximos Pasos

La Fase 7 está **100% completada**. El sistema ahora tiene:

✅ Sistema de gestión de citas médicas con prevención de conflictos
✅ Sistema de prescripciones vinculando citas con medicamentos
✅ Frontend completo con filtros, búsqueda y gestión visual
✅ Validaciones robustas en backend
✅ Manejo de claves compuestas
✅ Integración completa entre pacientes, empleados y medicamentos

**Estado**: La Fase 7 implementó exitosamente el flujo clínico central del sistema hospitalario, permitiendo agendar citas, asignar médicos a pacientes, y gestionar prescripciones médicas con control de inventario de medicamentos.
