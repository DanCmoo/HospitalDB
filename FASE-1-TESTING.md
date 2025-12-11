# Instrucciones para Probar la Fase 1

## ✅ Fase 1: Conexión Backend-Frontend - COMPLETADA

### Pasos para probar:

#### 1. Instalar dependencias del backend

```powershell
cd backend
npm install
```

Esto instalará todas las dependencias incluyendo las nuevas de desarrollo (ESLint, Prettier, Jest, etc.)

#### 2. Configurar variables de entorno

Asegúrate de que el archivo `backend/.env` existe con:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password_aqui
DB_DATABASE=hospital_db
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
```

#### 3. Crear la base de datos

En PostgreSQL, ejecuta:
```sql
CREATE DATABASE hospital_db;
```

Luego ejecuta el script SQL ubicado en `documents/Schema + Users.sql`

#### 4. Iniciar el backend

```powershell
cd backend
npm run start:dev
```

Deberías ver en consola:
```
🚀 Application is running on: http://localhost:3000
```

#### 5. Probar los endpoints de Health Check

Abre tu navegador o usa curl/Postman:

- **Health Check General**: http://localhost:3000/health
  
  Respuesta esperada:
  ```json
  {
    "status": "ok",
    "message": "Hospital Management System is running",
    "timestamp": "2025-12-10T...",
    "uptime": "15s",
    "environment": "development",
    "version": "1.0.0"
  }
  ```

- **Database Health Check**: http://localhost:3000/health/database
  
  Respuesta esperada:
  ```json
  {
    "status": "ok",
    "message": "Database connection is healthy",
    "database": "hospital_db",
    "timestamp": "2025-12-10T..."
  }
  ```

#### 6. Iniciar el frontend

En otra terminal:

```powershell
cd frontend
npm install
npm run dev
```

El frontend estará en: http://localhost:3001

#### 7. Probar la página de test de conexión

Abre en tu navegador: http://localhost:3001/test-connection

Deberías ver:
- ✅ **API Status**: OK (verde)
- ✅ **Database Status**: OK (verde)
- Información de versión, uptime, etc.

### Características implementadas en Fase 1:

✅ **Backend:**
- Validación global de inputs con `ValidationPipe`
- Sanitización de datos con `SanitizationPipe`
- Filtro global de excepciones HTTP
- Logging interceptor para todas las requests
- Middleware de headers de seguridad
- Middleware de logging de requests
- Guard de validación de origen
- Prevención de SQL injection
- Módulo de Health Check con endpoints de API y Database

✅ **Frontend:**
- Cliente API mejorado con manejo de errores
- Hook `useApi` para consumir APIs
- Componentes de UI: LoadingSpinner, ErrorMessage, ErrorBoundary
- Utilidades de validación y formateo
- Página de test de conexión
- Tipos TypeScript para respuestas del API

✅ **Seguridad:**
- CORS configurado
- Headers de seguridad HTTP (X-Frame-Options, X-Content-Type-Options, etc.)
- Sanitización automática de inputs
- Validación de origen de requests
- Prevención de XSS básica

### Problemas comunes:

❌ **Error: "Database connection failed"**
- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales en `.env`
- Verifica que la base de datos `hospital_db` exista

❌ **Error: "CORS error" en frontend**
- Verifica que `FRONTEND_URL` en backend/.env sea `http://localhost:3001`
- Verifica que `NEXT_PUBLIC_API_URL` en frontend/.env.local sea `http://localhost:3000`

❌ **Error: "Module not found"**
- Ejecuta `npm install` en ambas carpetas (backend y frontend)
- Si persiste, elimina `node_modules` y `package-lock.json`, luego vuelve a instalar

### Verificación de seguridad:

Para verificar los headers de seguridad, abre las DevTools del navegador (F12) → Network → inspecciona cualquier request y verifica los Response Headers:

Deberías ver:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy: ...`

---

## 🎉 Si todo funciona correctamente, la Fase 1 está COMPLETADA

Puedes proceder con la **Fase 2: Módulos Base - Personas y Empleados**
