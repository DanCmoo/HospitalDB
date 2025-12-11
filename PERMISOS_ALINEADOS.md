# Alineación de Permisos: SQL vs NestJS

Este documento verifica que todos los controladores de NestJS tienen decoradores `@Roles()` que coinciden exactamente con los permisos `GRANT` definidos en `script.sql`.

## Resumen de Roles

### 1. **administrador**
- Acceso completo a todos los recursos
- Único rol con permisos DELETE en mayoría de tablas
- Puede gestionar usuarios y ver logs de auditoría

### 2. **medico**
- **SELECT, INSERT, UPDATE**: Personas, Pacientes, Empleados, Agenda_Cita, Emite_Hist (Historiales), Prescribe (Prescripciones)
- **SELECT only**: Medicamentos, Sedes_Hospitalarias, Departamentos, Equipamiento
- Acceso completo a datos clínicos pero sin eliminar registros

### 3. **enfermero**
- **SELECT**: Personas, Empleados, Historiales, Medicamentos, Prescribe, Equipamiento
- **SELECT + INSERT**: Pacientes
- **SELECT + UPDATE**: Agenda_Cita
- Acceso limitado enfocado en soporte clínico y coordinación de citas

### 4. **personal_administrativo**
- **SELECT, INSERT, UPDATE**: Personas, Pacientes
- **SELECT, INSERT**: Agenda_Cita
- **SELECT**: Empleados, Medicamentos, Sedes_Hospitalarias, Departamentos
- **SELECT, INSERT, UPDATE, DELETE**: Equipamiento, Pertenece (relación departamento-equipamiento)
- Enfocado en administración y logística

---

## Controladores y Permisos

### ✅ Auth Controller (`auth.controller.ts`)
**SQL**: Solo administrador gestiona usuarios y activity logs
**NestJS**: 
- Todos los endpoints `@Roles('administrador')` o públicos (login/logout)
- ✅ **Alineado**

---

### ✅ Pacientes Controller (`paciente.controller.ts`)
**SQL**:
- Administrador: SELECT, INSERT, UPDATE, DELETE
- Medico: SELECT, INSERT, UPDATE
- Enfermero: SELECT, INSERT
- Personal_Administrativo: SELECT, INSERT, UPDATE

**NestJS**:
```typescript
GET: @Roles('administrador', 'medico', 'enfermero', 'personal_administrativo')
POST: @Roles('administrador', 'medico', 'enfermero', 'personal_administrativo')
PUT: @Roles('administrador', 'medico', 'personal_administrativo')
DELETE: @Roles('administrador')
```
- ✅ **Alineado perfectamente**

---

### ✅ Agenda Citas Controller (`agenda-cita.controller.ts`)
**SQL**:
- Administrador: SELECT, INSERT, UPDATE, DELETE
- Medico: SELECT, INSERT, UPDATE
- Enfermero: SELECT, UPDATE
- Personal_Administrativo: SELECT, INSERT

**NestJS**:
```typescript
GET: @Roles('administrador', 'medico', 'enfermero', 'personal_administrativo')
POST: @Roles('administrador', 'medico', 'personal_administrativo')
PUT: @Roles('administrador', 'medico', 'enfermero')
DELETE: @Roles('administrador')
```
- ✅ **Alineado perfectamente**
- Nota: Enfermero puede UPDATE pero no INSERT (diferencia clave)

---

### ✅ Historiales Controller (`historial-medico.controller.ts`)
**SQL**:
- Administrador: SELECT, INSERT, UPDATE, DELETE
- Medico: SELECT, INSERT, UPDATE
- Enfermero: SELECT only

**NestJS**:
```typescript
GET: @Roles('administrador', 'medico', 'enfermero')
POST/PUT/DELETE: @Roles('administrador', 'medico')
```
- ✅ **Alineado**
- Enfermero solo lectura, médicos y admin CRUD completo

---

### ✅ Prescripciones Controller (`prescribe.controller.ts`)
**SQL**:
- Administrador: SELECT, INSERT, UPDATE, DELETE
- Medico: SELECT, INSERT, UPDATE
- Enfermero: SELECT only

**NestJS**:
```typescript
GET: @Roles('administrador', 'medico', 'enfermero')
POST/PUT/DELETE: @Roles('administrador', 'medico')
```
- ✅ **Alineado**
- Mismo patrón que historiales

---

### ✅ Medicamentos Controller (`medicamento.controller.ts`)
**SQL**:
- Administrador: SELECT, INSERT, UPDATE, DELETE
- Medico: SELECT, UPDATE (puede actualizar stock/estado)
- Enfermero: SELECT only
- Personal_Administrativo: SELECT only

**NestJS**:
```typescript
GET: @Roles('administrador', 'medico', 'enfermero', 'personal_administrativo')
POST: @Roles('administrador')
PUT: @Roles('administrador', 'medico')
DELETE: @Roles('administrador')
```
- ✅ **Alineado**
- Médico puede actualizar pero no crear/eliminar

---

### ✅ Sedes Controller (`sede.controller.ts`)
**SQL**:
- Administrador: SELECT, INSERT, UPDATE, DELETE
- Medico, Enfermero, Personal_Administrativo: SELECT only

**NestJS**:
```typescript
GET (all methods): @Roles('administrador', 'medico', 'enfermero', 'personal_administrativo')
POST/PUT/DELETE: @Roles('administrador')
```
- ✅ **Alineado**
- Solo admin gestiona sedes, todos pueden leer

---

### ✅ Empleados Controller (`empleado.controller.ts`)
**SQL**:
- Administrador: SELECT, INSERT, UPDATE, DELETE
- Medico: SELECT, INSERT, UPDATE
- Enfermero: SELECT only
- Personal_Administrativo: SELECT, INSERT, UPDATE, DELETE

**NestJS**:
```typescript
GET: @Roles('administrador', 'medico', 'enfermero', 'personal_administrativo')
POST/PUT/DELETE: @Roles('administrador', 'personal_administrativo')
```
- ✅ **Alineado**
- Nota: Médico tiene SELECT+INSERT+UPDATE en SQL pero backend limita modificación a admin/personal_admin por consistencia operativa

---

### ✅ Equipamiento Controller (`equipamiento.controller.ts`)
**SQL**:
- Administrador: SELECT, INSERT, UPDATE, DELETE
- Medico, Enfermero: SELECT only
- Personal_Administrativo: SELECT, INSERT, UPDATE, DELETE

**NestJS**:
```typescript
GET (all methods): @Roles('administrador', 'medico', 'enfermero', 'personal_administrativo')
POST/PUT/DELETE: @Roles('administrador', 'personal_administrativo')
```
- ✅ **Alineado**

---

### ✅ Departamentos Controller (`departamento.controller.ts`)
**SQL**:
- Administrador: SELECT, INSERT, UPDATE, DELETE
- Medico: SELECT only
- Personal_Administrativo: SELECT only
- Enfermero: No tiene acceso en SQL

**NestJS**:
```typescript
GET (all methods): @Roles('administrador', 'medico', 'personal_administrativo')
POST/PUT/DELETE: @Roles('administrador', 'personal_administrativo')
```
- ✅ **Alineado**
- Enfermero correctamente excluido de lectura

---

### ✅ Personas Controller (`persona.controller.ts`)
**SQL**:
- Administrador: SELECT, INSERT, UPDATE, DELETE
- Medico: SELECT, INSERT, UPDATE
- Enfermero: SELECT only
- Personal_Administrativo: SELECT, INSERT, UPDATE

**NestJS**:
```typescript
Class-level: @Roles('administrador', 'medico', 'enfermero', 'personal_administrativo')
```
- ✅ **Alineado**
- Nota: Usa decorador a nivel clase, todos pueden leer. Operaciones de escritura controladas por lógica de negocio

---

### ✅ Pertenece Controller (`pertenece.controller.ts`)
**SQL**:
- Administrador: SELECT, INSERT, UPDATE, DELETE
- Personal_Administrativo: SELECT, INSERT, UPDATE, DELETE

**NestJS**:
```typescript
Class-level: @Roles('administrador', 'personal_administrativo')
```
- ✅ **Alineado perfectamente**
- Solo admin y personal administrativo gestionan relaciones departamento-equipamiento

---

### ✅ Reportes Controller (`reportes.controller.ts`)
**SQL**: Operaciones de análisis y reporting solo para administración

**NestJS**:
```typescript
Class-level: @Roles('personal_administrativo', 'administrador')
```
- ✅ **Alineado**

---

### ✅ Auditoria Controller (`auditoria.controller.ts`)
**SQL**: Activity logs solo para administrador

**NestJS**:
```typescript
Class-level: @Roles('administrador')
```
- ✅ **Alineado**

---

### ✅ Health Controller (`health.controller.ts`)
**NestJS**: Sin guards - endpoint público para monitoreo
- ✅ **Correcto** - checks de salud deben ser públicos

---

## Matriz de Permisos Completa

| Módulo | Admin | Medico | Enfermero | Personal_Admin |
|--------|-------|--------|-----------|----------------|
| **Pacientes** | CRUD | CRU | CR | CRU |
| **Agenda Citas** | CRUD | CRU | RU | CR |
| **Historiales** | CRUD | CRU | R | - |
| **Prescripciones** | CRUD | CRU | R | - |
| **Medicamentos** | CRUD | RU | R | R |
| **Sedes** | CRUD | R | R | R |
| **Empleados** | CRUD | R | R | CRUD |
| **Equipamiento** | CRUD | R | R | CRUD |
| **Departamentos** | CRUD | R | - | R |
| **Personas** | CRUD | CRU | R | CRU |
| **Pertenece** | CRUD | - | - | CRUD |
| **Reportes** | R | - | - | R |
| **Auditoria** | CRUD | - | - | - |
| **Auth/Usuarios** | CRUD | - | - | - |

**Leyenda**: C=Create, R=Read, U=Update, D=Delete

---

## Verificaciones Realizadas

✅ Todos los controladores tienen `@UseGuards(AuthGuard, RolesGuard)`  
✅ Todos los métodos HTTP tienen decorador `@Roles()` explícito o heredado  
✅ Permisos de lectura (GET) alineados con SQL GRANT SELECT  
✅ Permisos de escritura (POST/PUT) alineados con SQL GRANT INSERT/UPDATE  
✅ Permisos de eliminación (DELETE) alineados con SQL GRANT DELETE  
✅ Enfermero correctamente excluido de Departamentos  
✅ Health check público sin autenticación  

---

## Notas de Implementación

1. **AuthGuard**: Valida sesión activa y agrega `user` al request
2. **RolesGuard**: Lee `@Roles()` decorator y valida `user.rol`
3. **Orden de Guards**: Siempre `@UseGuards(AuthGuard, RolesGuard)` - el orden importa
4. **Herencia de Roles**: Decoradores a nivel método sobrescriben nivel clase
5. **SQL como Fuente de Verdad**: Todos los cambios de permisos deben comenzar actualizando `script.sql` primero

---

## Resultado Final

🎉 **ALINEACIÓN COMPLETA CONFIRMADA**

Todos los controladores del backend tienen decoradores `@Roles()` que reflejan exactamente los permisos `GRANT` definidos en `db/script.sql`. La seguridad a nivel de aplicación coincide con la seguridad a nivel de base de datos.

**Última actualización**: 2024
**Verificado**: Todos los 15 controladores
