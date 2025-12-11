# Hospital Management System

Sistema integral de gestión hospitalaria distribuido desarrollado con NestJS, Next.js y PostgreSQL.

## 🏗️ Estructura del Proyecto

```
hospital-system/
├── backend/          # API NestJS
├── frontend/         # Aplicación Next.js
├── db/              # Scripts de base de datos distribuida
│   ├── script.sql                 # Script principal (1 hub + 3 sedes)
│   ├── ejecutar_todo.sql          # Instalación completa
│   ├── verificacion_final.sql     # Verificación post-instalación
│   ├── README_INSTALACION.md      # Guía completa
│   ├── LEEME.md                   # Resumen ejecutivo
│   └── ARQUITECTURA.txt           # Diagrama visual
└── documents/       # Documentación
    ├── AI-Dev-Guidelines.md       # Guía de desarrollo
    ├── Schema + Users.sql          # Esquema original
    └── BASIC QUERIES.sql           # Consultas básicas
```

## 🎯 Sistema Multi-Red Hospitalaria

Este proyecto implementa una arquitectura distribuida con:
- **1 Hub Central**: Base de datos maestra que consolida información y gestiona autenticación
- **3 Sedes Hospitalarias**: Norte, Centro y Sur
- **Autenticación Centralizada**: Email-based con bcrypt en AWS RDS
- **Replicación automática**: Datos críticos se sincronizan en tiempo real
- **Foreign Data Wrappers**: Consultas distribuidas entre bases
- **4 Roles de usuario**: Administrador, Médico, Enfermero, Personal Administrativo

### Instalación de Bases de Datos

```bash
cd db
psql -U postgres -f ejecutar_todo.sql
```

Esto creará automáticamente:
- `hospital_hub` (Hub Central)
- `hospital_sede_norte`
- `hospital_sede_centro`
- `hospital_sede_sur`

📖 **Documentación detallada**: Ver [db/LEEME.md](db/LEEME.md)

## 🚀 Inicio Rápido

### 1. Base de Datos (Primero)

```bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno
npm run start:dev
```

El backend estará disponible en `http://localhost:3000`

### 3. Frontend (Next.js)

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

El frontend estará disponible en `http://localhost:3001`

## 📦 Tecnologías

### Backend
- NestJS
- TypeORM
- PostgreSQL
- TypeScript

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS

## 📝 Configuración

### Base de Datos Multi-Red

El sistema utiliza una arquitectura distribuida. Para instalación completa:

```bash
cd db
psql -U postgres -f ejecutar_todo.sql
```

Esto creará 4 bases de datos con datos de ejemplo. Ver [db/README_INSTALACION.md](db/README_INSTALACION.md) para más detalles.

**Usuarios creados automáticamente:**
- `admin@hospital.com` / `admin123` (Administrador)
- `medico@hospital.com` / `medico123` (Médico)
- `enfermero@hospital.com` / `enfermero123` (Enfermero)
- `admin_staff@hospital.com` / `staff123` (Personal Administrativo)

**Nota:** El sistema usa autenticación email-based. Los usuarios deben existir como personas en las sedes.

### Variables de Entorno

#### Backend (.env)
```bash
# Configuración de Sede Activa
SEDE_ID=norte  # norte | centro | sur

# Database Configuration - AWS RDS (Sedes)
DB_HOST=hospital-db.ckxkg4eau7cu.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=cTupP74Hg3nhKeQ
DB_SSL=true

# Authentication Database (Hub Centralizado)
AUTH_DB_HOST=hospital-db.ckxkg4eau7cu.us-east-1.rds.amazonaws.com
AUTH_DB_PORT=5432
AUTH_DB_USERNAME=postgres
AUTH_DB_PASSWORD=cTupP74Hg3nhKeQ
AUTH_DB_NAME=hospital_hub

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 📚 Documentación

- **Desarrollo**: [AI-Dev-Guidelines.md](documents/AI-Dev-Guidelines.md) - Arquitectura completa NestJS + Next.js
- **Base de Datos**: [db/README_INSTALACION.md](db/README_INSTALACION.md) - Sistema distribuido multi-red
- **Inicio Rápido**: [db/LEEME.md](db/LEEME.md) - Resumen ejecutivo y instalación
- **Arquitectura**: [db/ARQUITECTURA.txt](db/ARQUITECTURA.txt) - Diagrama visual del sistema

## 🔧 Scripts Disponibles

### Backend
- `npm run start:dev` - Modo desarrollo con hot-reload
- `npm run build` - Compilar para producción
- `npm run start:prod` - Ejecutar en producción
- `npm run lint` - Ejecutar ESLint

### Frontend
- `npm run dev` - Modo desarrollo en puerto 3001
- `npm run build` - Compilar para producción
- `npm start` - Ejecutar en producción
- `npm run lint` - Ejecutar ESLint

### Base de Datos
- `psql -U postgres -f db/ejecutar_todo.sql` - Instalación completa
- `psql -U postgres -f db/verificacion_final.sql` - Verificar instalación
- `psql -U postgres -d hospital_hub` - Conectar al hub central

## 👥 Roles de Usuario y Permisos

| Rol | Usuario | Contraseña | Acceso |
|-----|---------|-----------|--------|
| **Administrador** | `administrador` | `admin_2025` | Acceso total a todas las bases y tablas |
| **Médico** | `medico` | `medico_2025` | Lectura/escritura clínica (pacientes, citas, historiales, prescripciones) |
| **Enfermero** | `enfermero` | `enfermero_2025` | Lectura completa + actualización limitada de citas |
| **Administrativo** | `personal_administrativo` | `admin_personal_2025` | Gestión de pacientes, citas y consulta de información general |

⚠️ **Importante**: Cambiar estas contraseñas en producción

## 🏥 Características del Sistema

### Gestión Distribuida
- **Hub Central**: Consolida información de toda la red
- **3 Sedes Independientes**: Operación autónoma con sincronización
- **Replicación Automática**: Triggers para datos críticos
- **Foreign Data Wrappers**: Consultas distribuidas en tiempo real

### Módulos Funcionales
- ✅ Gestión de pacientes (local y red)
- ✅ Empleados y departamentos
- ✅ Agenda de citas médicas
- ✅ Historiales clínicos compartidos
- ✅ Prescripciones y medicamentos
- ✅ Equipamiento hospitalario
- ✅ Auditoría de accesos y operaciones
- ✅ Transferencias entre sedes

### Vistas Consolidadas
- `v_todos_pacientes_red` - Todos los pacientes de la red (hub)
- `v_pacientes_red` - Pacientes locales + remotos (por sede)
- `v_historial_completo` - Historiales locales y compartidos
- `v_dashboard_red` - Estadísticas en tiempo real
- `v_actividad_reciente` - Últimas operaciones

## 📄 Licencia

ISC
