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
- **1 Hub Central**: Base de datos maestra que consolida información
- **3 Sedes Hospitalarias**: Norte, Centro y Sur
- **Replicación automática**: Datos críticos se sincronizan en tiempo real
- **Foreign Data Wrappers**: Consultas distribuidas entre bases
- **4 Roles de usuario**: Control de acceso granular

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

**Roles creados automáticamente:**
- `administrador` / `admin_2025` (acceso total)
- `medico` / `medico_2025` (clínico)
- `enfermero` / `enfermero_2025` (limitado)
- `personal_administrativo` / `admin_personal_2025` (administrativo)

### Variables de Entorno

#### Backend (.env)
```bash
# Conectar al hub central o a una sede específica
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=hospital_hub  # o hospital_sede_norte, hospital_sede_centro, hospital_sede_sur
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h
FRONTEND_URL=http://localhost:3001
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
