# 🚀 Inicio Rápido - Sistema Hospitalario

## ⚡ Instalación en 3 Pasos

### 1️⃣ Instalar Base de Datos (2-3 minutos)

```bash
cd "d:\Universidad XD\programas\HospitalDB\db"
psql -U postgres -f ejecutar_todo.sql
```

O desde **pgAdmin**:
1. Conectar como `postgres`
2. Query Tool (Alt+Shift+Q)
3. Abrir `ejecutar_todo.sql`
4. Ejecutar (F5)

✅ Esto crea:
- 4 bases de datos (1 hub + 3 sedes)
- 4 roles de usuario
- Datos de ejemplo
- Foreign Data Wrappers

---

### 2️⃣ Configurar Backend (30 segundos)

```bash
cd "d:\Universidad XD\programas\HospitalDB\backend"

# Crear archivo .env
copy .env.example .env

# Editar .env con:
# DB_DATABASE=hospital_hub
# DB_PASSWORD=tu_password_postgres

# Iniciar
npm run start:dev
```

✅ Backend corriendo en: http://localhost:3000

---

### 3️⃣ Configurar Frontend (30 segundos)

```bash
cd "d:\Universidad XD\programas\HospitalDB\frontend"

# Crear archivo .env.local
copy .env.local.example .env.local

# Iniciar
npm run dev
```

✅ Frontend corriendo en: http://localhost:3001

---

## ✅ Verificar Instalación

### Base de Datos

```bash
# Conectar al hub
psql -U postgres -d hospital_hub

# Ver pacientes de toda la red
SELECT * FROM v_todos_pacientes_red;

# Ver bases creadas
\l hospital*
```

### Backend
```bash
# En navegador
http://localhost:3000

# Debería mostrar: "Cannot GET /"
# Esto es normal, significa que el servidor está corriendo
```

### Frontend
```bash
# En navegador
http://localhost:3001

# Debería mostrar la página de inicio del sistema hospitalario
```

---

## 🔑 Credenciales por Defecto

| Usuario | Password | Uso |
|---------|----------|-----|
| `postgres` | (tu password de PostgreSQL) | Instalación y admin de bases |
| `administrador` | `admin_2025` | Acceso total al sistema |
| `medico` | `medico_2025` | Operaciones clínicas |
| `enfermero` | `enfermero_2025` | Consultas y citas |
| `personal_administrativo` | `admin_personal_2025` | Gestión administrativa |

⚠️ **CAMBIAR EN PRODUCCIÓN**

---

## 📊 Datos de Ejemplo

El sistema incluye datos de prueba:
- **7 pacientes** distribuidos en 3 sedes
- **8 empleados** (médicos, enfermeros, administrativos)
- **4 citas médicas** programadas
- **8 equipos hospitalarios**
- **4 historiales clínicos**

---

## 🔍 Consultas Útiles

### Ver todos los pacientes de la red
```sql
\c hospital_hub
SELECT * FROM v_todos_pacientes_red;
```

### Ver estadísticas de una sede
```sql
\c hospital_sede_norte
SELECT * FROM v_dashboard_red;
```

### Ver pacientes locales y remotos
```sql
\c hospital_sede_norte
SELECT * FROM v_pacientes_red ORDER BY origen, nom_pers;
```

### Ver historial completo (local + compartido)
```sql
\c hospital_sede_norte
SELECT * FROM v_historial_completo ORDER BY fecha DESC;
```

### Ver últimas operaciones
```sql
\c hospital_hub
SELECT * FROM v_actividad_reciente;
```

---

## 🛠️ Comandos Útiles

### Reiniciar servicios
```bash
# Backend
cd backend
npm run start:dev

# Frontend
cd frontend
npm run dev
```

### Limpiar y reinstalar
```bash
# Eliminar bases de datos
psql -U postgres -c "DROP DATABASE IF EXISTS hospital_hub;"
psql -U postgres -c "DROP DATABASE IF EXISTS hospital_sede_norte;"
psql -U postgres -c "DROP DATABASE IF EXISTS hospital_sede_centro;"
psql -U postgres -c "DROP DATABASE IF EXISTS hospital_sede_sur;"

# Reinstalar
cd db
psql -U postgres -f ejecutar_todo.sql
```

### Ver logs
```bash
# Backend logs (en la consola donde ejecutaste npm run start:dev)
# Frontend logs (en la consola donde ejecutaste npm run dev)
# PostgreSQL logs (depende de tu configuración, usualmente en data/log/)
```

---

## 🐛 Solución de Problemas

### Error: "database already exists"
```bash
# Cerrar todas las conexiones activas
# Eliminar bases manualmente
psql -U postgres -c "DROP DATABASE IF EXISTS hospital_hub CASCADE;"
# Ejecutar de nuevo el script
```

### Error: "role already exists"
```bash
# Normal, el script maneja esto automáticamente
# Puedes ignorar este mensaje
```

### Backend no conecta a la base
1. Verificar que PostgreSQL está corriendo
2. Revisar `backend/.env`:
   - `DB_HOST=localhost`
   - `DB_PORT=5432`
   - `DB_USERNAME=postgres`
   - `DB_PASSWORD=tu_password`
   - `DB_DATABASE=hospital_hub`

### Frontend no conecta al backend
1. Verificar que backend está corriendo en puerto 3000
2. Revisar `frontend/.env.local`:
   - `NEXT_PUBLIC_API_URL=http://localhost:3000`

---

## 📚 Documentación Completa

- **Instalación Detallada**: [db/README_INSTALACION.md](db/README_INSTALACION.md)
- **Resumen Ejecutivo**: [db/LEEME.md](db/LEEME.md)
- **Arquitectura**: [db/ARQUITECTURA.txt](db/ARQUITECTURA.txt)
- **Guía de Desarrollo**: [documents/AI-Dev-Guidelines.md](documents/AI-Dev-Guidelines.md)
- **README Principal**: [README.md](../README.md)

---

## ⏱️ Tiempo Total de Instalación

- **Base de Datos**: 2-3 minutos
- **Backend**: 30 segundos
- **Frontend**: 30 segundos
- **Total**: ~4 minutos

---

## 🎉 ¡Listo!

Tu sistema hospitalario distribuido está funcionando. 

**Próximos pasos:**
1. Explorar las bases de datos
2. Probar las consultas de ejemplo
3. Revisar la documentación de desarrollo
4. Comenzar a desarrollar módulos en NestJS/Next.js

**¿Necesitas ayuda?** Revisa la documentación completa en los enlaces arriba.
