# Hospital Management System

Sistema integral de gestión hospitalaria desarrollado con NestJS y Next.js.

## 🏗️ Estructura del Proyecto

```
hospital-system/
├── backend/          # API NestJS
├── frontend/         # Aplicación Next.js
├── db/              # Scripts de base de datos
└── documents/       # Documentación
```

## 🚀 Inicio Rápido

### Backend (NestJS)

```bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno
npm run start:dev
```

El backend estará disponible en `http://localhost:3000`

### Frontend (Next.js)

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

### Base de Datos

1. Crear base de datos PostgreSQL
2. Ejecutar scripts en `db/Schema + Users.sql`
3. Configurar credenciales en `backend/.env`

### Variables de Entorno

#### Backend (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=hospital_db
PORT=3000
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 📚 Documentación

Ver [AI-Dev-Guidelines.md](documents/AI-Dev-Guidelines.md) para la guía completa de desarrollo.

## 🔧 Scripts Disponibles

### Backend
- `npm run start:dev` - Modo desarrollo
- `npm run build` - Compilar producción
- `npm run start:prod` - Ejecutar producción

### Frontend
- `npm run dev` - Modo desarrollo
- `npm run build` - Compilar producción
- `npm start` - Ejecutar producción

## 👥 Roles de Usuario

- Administrador
- Médico
- Enfermera
- Recepcionista

## 📄 Licencia

ISC
