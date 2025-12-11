# Plan de Adaptación: Código Actual → Base de Datos Distribuida Multi-Sede

**Fecha**: Diciembre 2024  
**Situación**: Base de datos distribuida YA está corriendo en nube (vacía)  
**Objetivo**: Adaptar Backend NestJS + Frontend Next.js para consumir la nueva arquitectura

---

## 🎯 SITUACIÓN ACTUAL

### Lo que YA tenemos:
✅ Base de datos distribuida corriendo en nube:
  - `hospital_hub` (Hub Central)
  - `hospital_sede_norte`
  - `hospital_sede_centro`
  - `hospital_sede_sur`
✅ Credenciales de acceso
✅ Bases de datos VACÍAS (sin datos previos)
✅ Estructura completa con triggers, FDWs, vistas

### Lo que hay que hacer:
🔧 Adaptar Backend NestJS
🔧 Adaptar Frontend Next.js
🔧 Configurar conexiones por sede
🔧 Probar funcionalidad básica

### Lo que NO hay que hacer:
❌ Migrar datos (no hay datos)
❌ Crear bases de datos (ya existen)
❌ Testing exhaustivo (desarrollo ágil)
❌ Configurar replicación (ya está con triggers)

---

## 📋 PLAN SIMPLIFICADO - 4 FASES

---

## **FASE 1: CONFIGURACIÓN DE CONEXIONES (2-3 horas)**

### 1.1. Actualizar Configuración de Base de Datos

#### Archivo: `backend/src/config/database.config.ts`

**Estado Actual** (Base única):
```typescript
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'hospitaldb',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: false,
};
```

**Nueva Configuración** (Multi-sede):
```typescript
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// Determinar sede activa según variable de entorno
const SEDE_ACTIVA = process.env.SEDE_ID || 'norte';

// Configuración de bases de datos por sede
const sedesConfig = {
  norte: {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'tu-servidor-nube.com',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: 'hospital_sede_norte',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },
  centro: {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'tu-servidor-nube.com',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: 'hospital_sede_centro',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },
  sur: {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'tu-servidor-nube.com',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: 'hospital_sede_sur',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },
};

// Exportar configuración activa
export const databaseConfig: TypeOrmModuleOptions = sedesConfig[SEDE_ACTIVA];

// Exportar todas las configs para uso opcional
export { sedesConfig, SEDE_ACTIVA };
```

### 1.2. Actualizar Variables de Entorno

#### Archivo: `backend/.env`

```env
# ============================================
# CONFIGURACIÓN BASE DE DATOS MULTI-SEDE
# ============================================

# Sede Activa (cambiar según despliegue)
SEDE_ID=norte
# Opciones: norte, centro, sur

# Credenciales Base de Datos en Nube
DB_HOST=tu-servidor-nube.com
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password_seguro
DB_SSL=true

# Puerto del servidor (diferente por sede para ejecución local simultánea)
PORT=3001
# Recomendado: norte=3001, centro=3002, sur=3003

# Otras configuraciones
NODE_ENV=development
SESSION_SECRET=tu_session_secret_aqui

# API URLs (para CORS)
FRONTEND_URL=http://localhost:3000
```

#### Crear archivos específicos por sede (opcional para desarrollo local):

**`.env.norte`**:
```env
SEDE_ID=norte
PORT=3001
DB_HOST=tu-servidor-nube.com
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_SSL=true
```

**`.env.centro`**:
```env
SEDE_ID=centro
PORT=3002
DB_HOST=tu-servidor-nube.com
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_SSL=true
```

**`.env.sur`**:
```env
SEDE_ID=sur
PORT=3003
DB_HOST=tu-servidor-nube.com
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_SSL=true
```

### 1.3. Actualizar Scripts de Package.json

#### Archivo: `backend/package.json`

Agregar en la sección `scripts`:

```json
{
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",
    
    "// Scripts por Sede": "# Desarrollo local multi-instancia",
    "start:norte": "NODE_ENV=development SEDE_ID=norte PORT=3001 nest start --watch",
    "start:centro": "NODE_ENV=development SEDE_ID=centro PORT=3002 nest start --watch",
    "start:sur": "NODE_ENV=development SEDE_ID=sur PORT=3003 nest start --watch",
    
    "// Producción por Sede": "# Deploy en servidores separados",
    "start:norte:prod": "NODE_ENV=production SEDE_ID=norte PORT=3001 node dist/main",
    "start:centro:prod": "NODE_ENV=production SEDE_ID=centro PORT=3002 node dist/main",
    "start:sur:prod": "NODE_ENV=production SEDE_ID=sur PORT=3003 node dist/main"
  }
}
```

### 1.4. Verificar Compilación

```bash
# Compilar backend
cd backend
npm run build

# Debería compilar sin errores
# Output: Successfully compiled
```

**Checklist Fase 1**:
- [ ] `database.config.ts` actualizado
- [ ] `.env` configurado con credenciales reales
- [ ] Scripts de package.json agregados
- [ ] Backend compila sin errores

---

## **FASE 2: ADAPTACIÓN DE ENTITIES Y MÓDULOS (2-4 horas)**

### 2.1. Verificar Compatibilidad de Entities

**Cambios necesarios en algunas entities**:

#### 2.1.1. Agregar campo `id_sede` donde falte

Verificar que estas entities tengan el campo (la nueva BD lo requiere):

**Archivo: `backend/src/modules/personas/entities/persona.entity.ts`**

Agregar:
```typescript
@Column({ name: 'id_sede_registro', nullable: true, default: 1 })
idSedeRegistro: number;

@Column({ name: 'fecha_creacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
fechaCreacion: Date;

@Column({ name: 'ultima_modificacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
ultimaModificacion: Date;
```

**Archivo: `backend/src/modules/pacientes/entities/paciente.entity.ts`**

Verificar que tenga:
```typescript
@Column({ name: 'id_sede', nullable: false })
idSede: number;
```

**Archivo: `backend/src/modules/empleados/entities/empleado.entity.ts`**

Verificar:
```typescript
@Column({ name: 'id_sede', nullable: false })
idSede: number;
```

#### 2.1.2. Actualizar Activity Log Entity

**Archivo: `backend/src/modules/auth/entities/activity-log.entity.ts`**

Cambiar nombre de tabla:
```typescript
@Entity('Auditoria_Accesos')  // Cambiar de 'activity_logs' a 'Auditoria_Accesos'
export class ActivityLogEntity {
  @PrimaryGeneratedColumn({ name: 'id_auditoria' })
  idLog: number;

  @Column({ name: 'num_doc_usuario' })
  numDocUsuario: string;  // En lugar de idUsuario

  @Column({ length: 100 })
  accion: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;  // En lugar de 'detalles'

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @CreateDateColumn({ name: 'fecha_hora', type: 'timestamp' })
  fechaHora: Date;  // En lugar de fechaAccion
}
```

### 2.2. Crear Servicio de Configuración de Sede

**Nuevo archivo: `backend/src/config/sede.config.ts`**

```typescript
export class SedeConfig {
  static getSedeActiva(): string {
    return process.env.SEDE_ID || 'norte';
  }

  static getIdSede(): number {
    const sedes = {
      norte: 1,
      centro: 2,
      sur: 3,
    };
    return sedes[this.getSedeActiva()];
  }

  static getNombreSede(): string {
    const nombres = {
      norte: 'Sede Norte',
      centro: 'Sede Centro',
      sur: 'Sede Sur',
    };
    return nombres[this.getSedeActiva()];
  }

  static getRedId(): string {
    return `RED_${this.getSedeActiva().toUpperCase()}`;
  }
}
```

### 2.3. Actualizar Servicios para Auto-asignar Sede

#### Ejemplo: `backend/src/modules/pacientes/services/paciente.service.ts`

Agregar en el método `create`:

```typescript
import { SedeConfig } from '@/config/sede.config';

async create(createDto: CreatePacienteDto): Promise<PacienteResponseDto> {
  // Auto-asignar sede actual
  const pacienteData = {
    ...createDto,
    idSede: SedeConfig.getIdSede(),  // <-- NUEVO
  };

  const paciente = await this.pacienteRepository.create(pacienteData);
  return this.mapToResponse(paciente);
}
```

Aplicar el mismo patrón en:
- `EmpleadoService.create()`
- `EquipamientoService.create()`
- `PersonaService.create()` (idSedeRegistro)

### 2.4. Actualizar Activity Log Service

**Archivo: `backend/src/modules/auth/services/activity-log.service.ts`**

Ajustar para usar `num_doc_usuario` en lugar de `idUsuario`:

```typescript
async logActivity(
  numDocUsuario: string,  // <-- Cambio
  accion: string,
  descripcion?: string,
  ipAddress?: string,
): Promise<void> {
  await this.activityLogRepository.createLog({
    numDocUsuario,  // <-- Cambio
    accion,
    descripcion,  // <-- Cambio de 'detalles'
    ipAddress,
  });
}
```

**Checklist Fase 2**:
- [ ] Entities actualizadas con campos `id_sede`
- [ ] ActivityLog ajustado a esquema de BD
- [ ] SedeConfig creado
- [ ] Servicios auto-asignan sede
- [ ] Backend compila sin errores

---

## **FASE 3: CONFIGURACIÓN DE FRONTEND (1-2 horas)**

### 3.1. Actualizar Variables de Entorno

#### Archivo: `frontend/.env.local`

```env
# ============================================
# CONFIGURACIÓN FRONTEND MULTI-SEDE
# ============================================

# Sede Activa (determina a qué backend conectar)
NEXT_PUBLIC_SEDE_ACTIVA=norte
# Opciones: norte, centro, sur

# URLs de Backend por Sede
NEXT_PUBLIC_API_URL_NORTE=http://localhost:3001
NEXT_PUBLIC_API_URL_CENTRO=http://localhost:3002
NEXT_PUBLIC_API_URL_SUR=http://localhost:3003

# URL Activa (según SEDE_ACTIVA)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Producción (si aplica)
# NEXT_PUBLIC_API_URL_NORTE=https://api-norte.hospital.com
# NEXT_PUBLIC_API_URL_CENTRO=https://api-centro.hospital.com
# NEXT_PUBLIC_API_URL_SUR=https://api-sur.hospital.com
```

### 3.2. Agregar Indicador de Sede en Dashboard

#### Archivo: `frontend/app/dashboard/page.tsx`

Agregar badge de sede antes del grid de módulos:

```typescript
function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const sedeActiva = process.env.NEXT_PUBLIC_SEDE_ACTIVA || 'norte';

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        {/* ... nav existente ... */}
      </nav>

      <div className="p-8">
        {/* NUEVO: Badge de Sede Activa */}
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                📍 Conectado a: Sede {sedeActiva.charAt(0).toUpperCase() + sedeActiva.slice(1)}
              </h3>
              <p className="text-sm text-blue-100 mt-1">
                Gestión local con sincronización automática en tiempo real
              </p>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-md">
              <span className="text-xs font-semibold">MULTI-SEDE</span>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Dashboard - Sistema Hospitalario
        </h2>
        
        {/* Grid existente de módulos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ... módulos existentes ... */}
        </div>
      </div>
    </div>
  );
}
```

### 3.3. Crear Scripts de Inicio por Sede

#### Archivo: `frontend/package.json`

Agregar scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    
    "// Desarrollo por Sede": "# Múltiples instancias locales",
    "dev:norte": "NEXT_PUBLIC_SEDE_ACTIVA=norte NEXT_PUBLIC_API_URL=http://localhost:3001 next dev -p 3000",
    "dev:centro": "NEXT_PUBLIC_SEDE_ACTIVA=centro NEXT_PUBLIC_API_URL=http://localhost:3002 next dev -p 3010",
    "dev:sur": "NEXT_PUBLIC_SEDE_ACTIVA=sur NEXT_PUBLIC_API_URL=http://localhost:3003 next dev -p 3020"
  }
}
```

### 3.4. Opcional: Selector de Sede

Si quieres permitir cambiar de sede desde la UI (útil para admins):

**Nuevo archivo: `frontend/components/common/SedeSelector.tsx`**

```typescript
'use client';

import { useState } from 'react';

export function SedeSelector() {
  const [sedeActiva, setSedeActiva] = useState(
    process.env.NEXT_PUBLIC_SEDE_ACTIVA || 'norte'
  );

  const sedes = [
    { id: 'norte', nombre: 'Sede Norte', color: 'blue' },
    { id: 'centro', nombre: 'Sede Centro', color: 'green' },
    { id: 'sur', nombre: 'Sede Sur', color: 'purple' },
  ];

  const cambiarSede = (sedeId: string) => {
    // Recargar con nueva configuración
    const urlBase = window.location.origin;
    const puerto = {
      norte: '3000',
      centro: '3010',
      sur: '3020',
    }[sedeId];
    
    window.location.href = `${urlBase.replace(/:\d+/, `:${puerto}`)}`;
  };

  return (
    <div className="flex gap-2 bg-white p-2 rounded-lg shadow-sm">
      {sedes.map((sede) => (
        <button
          key={sede.id}
          onClick={() => cambiarSede(sede.id)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            sedeActiva === sede.id
              ? `bg-${sede.color}-600 text-white`
              : `bg-gray-100 text-gray-700 hover:bg-gray-200`
          }`}
        >
          {sede.nombre}
        </button>
      ))}
    </div>
  );
}
```

**Checklist Fase 3**:
- [ ] `.env.local` configurado
- [ ] Badge de sede en dashboard
- [ ] Scripts de package.json agregados
- [ ] Frontend compila sin errores

---

## **FASE 4: PRUEBAS RÁPIDAS Y ARRANQUE (1-2 horas)**

### 4.1. Arrancar Backend (Una sede)

```bash
# Terminal 1: Backend Sede Norte
cd backend
npm run start:norte

# Verificar en consola:
# ✓ Nest application successfully started
# ✓ Connected to database: hospital_sede_norte
# ✓ Server running on http://localhost:3001
```

### 4.2. Arrancar Frontend

```bash
# Terminal 2: Frontend
cd frontend
npm run dev:norte

# Verificar en consola:
# ✓ Ready in X ms
# ✓ Local: http://localhost:3000
```

### 4.3. Pruebas Básicas de Funcionalidad

#### Test 1: Registro de Usuario
```
1. Abrir http://localhost:3000/register
2. Registrar un usuario de prueba
3. Verificar que se guarda en hospital_sede_norte
```

**Verificación en BD**:
```sql
-- Conectar a la base
psql -U postgres -h tu-servidor-nube.com -d hospital_sede_norte

-- Ver usuario creado
SELECT * FROM usuarios;
```

#### Test 2: Crear Paciente
```
1. Login con usuario creado
2. Ir a /pacientes
3. Crear un paciente de prueba
4. Verificar que aparece en lista
```

**Verificación en BD**:
```sql
-- Ver paciente
SELECT * FROM Pacientes;

-- Verificar que tiene id_sede = 1 (Norte)
SELECT cod_pac, num_doc, id_sede FROM Pacientes;
```

#### Test 3: Verificar Sincronización con Hub
```sql
-- Conectar al Hub
psql -U postgres -h tu-servidor-nube.com -d hospital_hub

-- Verificar índice global (debe tener el paciente replicado)
SELECT * FROM Indice_Pacientes_Global;

-- Debería mostrar el paciente con id_red_origen = 'RED_NORTE'
```

#### Test 4: Crear Cita
```
1. En frontend, ir a /agenda-citas
2. Crear una cita de prueba
3. Verificar que se guarda
```

#### Test 5: Generar Reporte PDF
```
1. Ir a /reportes
2. Generar reporte de paciente
3. Verificar que descarga PDF
```

### 4.4. Pruebas Multi-Sede (Opcional - Solo si tienes tiempo)

```bash
# Terminal 3: Backend Sede Centro
cd backend
npm run start:centro

# Terminal 4: Frontend Sede Centro
cd frontend
npm run dev:centro

# Abrir http://localhost:3010
# Crear paciente en Sede Centro
# Verificar en BD que tiene id_sede = 2
```

### 4.5. Verificar Vistas Distribuidas

```sql
-- Conectar a Sede Norte
psql -U postgres -h tu-servidor-nube.com -d hospital_sede_norte

-- Ver pacientes de TODA la red (local + remotos)
SELECT * FROM v_pacientes_red;

-- Debería mostrar pacientes de Norte Y Centro (si creaste en ambas)
```

**Checklist Fase 4**:
- [ ] Backend arranca sin errores
- [ ] Frontend arranca sin errores
- [ ] Registro de usuario funciona
- [ ] CRUD de pacientes funciona
- [ ] Paciente se replica al Hub
- [ ] Citas se crean correctamente
- [ ] Reportes PDF se generan
- [ ] Vista distribuida muestra datos de múltiples sedes (opcional)

---

## **PROBLEMAS COMUNES Y SOLUCIONES**

### Error: "Cannot connect to database"
```bash
# Verificar que las credenciales en .env sean correctas
# Verificar que la IP/host del servidor es accesible
ping tu-servidor-nube.com

# Verificar que PostgreSQL acepta conexiones remotas
# El firewall debe permitir puerto 5432
```

### Error: "relation does not exist"
```bash
# Verificar que estás conectado a la base correcta
echo $SEDE_ID  # Debe mostrar: norte, centro o sur

# Verificar que las tablas existen
psql -U postgres -h tu-servidor-nube.com -d hospital_sede_norte -c "\dt"
```

### Error: "SSL connection required"
```bash
# En .env, asegurar:
DB_SSL=true
```

### Error de compilación TypeScript
```bash
# Limpiar y reinstalar
cd backend
rm -rf node_modules dist
npm install
npm run build
```

### Frontend no se conecta al backend
```bash
# Verificar variables de entorno
cat frontend/.env.local

# Verificar que el puerto coincide
# Backend debe estar en 3001 si frontend usa http://localhost:3001
```

---

## 📋 RESUMEN EJECUTIVO

| Fase | Tiempo | Archivos a Modificar |
|------|--------|---------------------|
| **1. Configuración Conexiones** | 2-3h | `database.config.ts`, `.env`, `package.json` |
| **2. Adaptación Entities** | 2-4h | `*.entity.ts`, servicios, `sede.config.ts` |
| **3. Frontend** | 1-2h | `.env.local`, `dashboard/page.tsx`, `package.json` |
| **4. Pruebas** | 1-2h | Testing manual básico |
| **TOTAL** | **6-11 horas** | ~15 archivos |

---

## ✅ CHECKLIST FINAL

### Backend
- [ ] `database.config.ts` con multi-sede
- [ ] `.env` con credenciales reales de nube
- [ ] Entities tienen campo `id_sede` donde se requiere
- [ ] `SedeConfig` creado
- [ ] Servicios auto-asignan sede
- [ ] Scripts npm por sede
- [ ] Compila sin errores
- [ ] Arranca correctamente

### Frontend
- [ ] `.env.local` configurado
- [ ] Badge de sede en dashboard
- [ ] Scripts npm por sede
- [ ] Compila sin errores
- [ ] Arranca correctamente

### Funcionalidad
- [ ] Login/Registro funciona
- [ ] CRUD Pacientes funciona
- [ ] CRUD Citas funciona
- [ ] Reportes PDF funcionan
- [ ] Datos se replican al Hub
- [ ] Vistas distribuidas funcionan

---

## 🚀 COMANDOS PARA ARRANCAR

```bash
# Terminal 1: Backend
cd backend
npm run start:norte

# Terminal 2: Frontend  
cd frontend
npm run dev:norte

# Abrir navegador:
http://localhost:3000
```

---

**Tiempo Total Estimado**: 6-11 horas  
**Sin migración de datos** | **Sin testing exhaustivo** | **Solo adaptación de código**
