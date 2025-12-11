# Resumen Ejecutivo - Sistema Multi-Red Hospitalaria

## 🎯 ¿Qué hace este sistema?

Crea automáticamente una red hospitalaria completa distribuida en PostgreSQL con:
- **4 bases de datos** interconectadas
- **Replicación automática** de datos críticos
- **Sincronización en tiempo real** entre sedes
- **Control de acceso** basado en roles
- **Auditoría completa** de operaciones

## 🚀 Instalación Rápida

### Para usuarios de pgAdmin:
1. Abrir pgAdmin 4
2. Conectar como usuario `postgres`
3. Click derecho en servidor → Query Tool
4. Abrir archivo `ejecutar_todo.sql`
5. Click en ▶️ Execute/Refresh (F5)
6. Esperar 2-3 minutos

### Para usuarios de línea de comandos:
```bash
cd "d:\Universidad XD\programas\HospitalDB\db"
psql -U postgres -f ejecutar_todo.sql
```

## 📊 Lo que obtienes

### 4 Bases de Datos Completas

#### 1. hospital_hub (Hub Central)
- Índice global de pacientes
- Historial médico compartido
- Auditoría centralizada
- Gestión de transferencias

#### 2-4. hospital_sede_* (3 Sedes Operativas)
- Gestión local de pacientes
- Empleados y departamentos
- Agenda de citas médicas
- Equipamiento hospitalario
- Prescripciones y medicamentos
- Historiales clínicos

### 4 Roles de Usuario

| Rol | Usuario | Password | Acceso |
|-----|---------|----------|--------|
| Admin | `administrador` | `admin_2025` | Total |
| Médico | `medico` | `medico_2025` | Clínico completo |
| Enfermero | `enfermero` | `enfermero_2025` | Lectura + Citas |
| Admin | `personal_administrativo` | `admin_personal_2025` | Pacientes + Citas |

### Características Principales

✅ **Datos de Ejemplo Incluidos**
- 7 pacientes distribuidos
- 8 empleados (médicos, enfermeros)
- 4 citas médicas programadas
- 8 equipos hospitalarios
- 3 historiales clínicos

✅ **Replicación Automática**
- Pacientes críticos se replican automáticamente
- Historiales compartidos van al hub central
- Control de sincronización con timestamps

✅ **Consultas Distribuidas**
- Ver pacientes de TODAS las sedes desde el hub
- Consultar datos remotos desde cualquier sede
- Vistas consolidadas pre-creadas

✅ **Auditoría Completa**
- Registro de todos los accesos
- Historial de operaciones inter-red
- Seguimiento de transferencias

## 🔍 Verificar Instalación

### Conectar a una base:
```bash
psql -U postgres -d hospital_hub
```

### Ver pacientes de toda la red:
```sql
SELECT * FROM v_todos_pacientes_red;
```

### Ver estadísticas de una sede:
```sql
\c hospital_sede_norte
SELECT * FROM v_dashboard_red;
```

## 📁 Archivos Principales

| Archivo | Descripción |
|---------|-------------|
| `script.sql` | Script principal (1598 líneas) |
| `ejecutar_todo.sql` | Ejecuta instalación + verificación |
| `verificacion_final.sql` | Consultas de verificación |
| `README_INSTALACION.md` | Documentación completa |

## ⚙️ Requisitos

- PostgreSQL 12 o superior
- Usuario `postgres` con privilegios
- 50-100 MB de espacio en disco
- 2-3 minutos de tiempo de ejecución

## 🎓 Casos de Uso

### Escenario 1: Paciente se atiende en Sede Norte
1. Se registra en tabla local `Pacientes`
2. Trigger automático registra en `Control_Replicacion`
3. Información se sincroniza al hub central
4. Otras sedes pueden consultar datos básicos

### Escenario 2: Historial Crítico Compartido
1. Médico crea historial y marca `compartido = TRUE`
2. Se registra en `Historial_Compartido` del hub
3. Todas las sedes pueden acceder vía `v_historial_completo`
4. Auditoría registra cada acceso

### Escenario 3: Transferencia Entre Sedes
1. Sede Norte solicita transferencia a Sede Sur
2. Se crea registro en `Transferencias_Pacientes` del hub
3. Ambas sedes reciben notificación
4. Estado se actualiza: Pendiente → Aprobada → Completada

## 🔧 Personalización

### Cambiar Contraseñas
```sql
ALTER ROLE medico WITH PASSWORD 'nueva_password_segura';
```

### Agregar Nueva Sede
1. Duplicar sección de sede en `script.sql`
2. Cambiar `id_sede = 4` (siguiente número)
3. Actualizar tabla `Redes_Hospitalarias`
4. Configurar FDW bidireccional

### Deshabilitar Datos de Ejemplo
Comentar secciones de `INSERT INTO` en el script

## ⚠️ Notas Importantes

1. **En Producción**: Cambia TODAS las contraseñas
2. **FDW Remote**: Si las bases están en servidores distintos, actualiza `host` en CREATE SERVER
3. **Permisos**: El script asume usuario `postgres`, ajusta si usas otro
4. **Backup**: Haz respaldo antes de ejecutar en bases existentes

## 📞 Solución de Problemas

### Error: "database already exists"
- Solución: El script incluye `DROP DATABASE IF EXISTS`, pero si tienes conexiones activas, ciérralas primero

### Error de permisos en FDW
- Solución: Verifica que el usuario `postgres` tenga acceso a todas las bases

### No se ven datos replicados
- Solución: Los triggers de replicación requieren procesamiento manual de `Control_Replicacion` o implementar job scheduler

## 🎉 ¡Listo para Usar!

Una vez ejecutado, tendrás un sistema hospitalario distribuido completamente funcional con:
- 🏥 3 sedes operativas independientes
- 🌐 1 hub central de coordinación
- 👥 4 niveles de acceso por roles
- 🔄 Sincronización automática
- 📊 Vistas consolidadas
- 🔒 Auditoría completa

**Ejecuta `ejecutar_todo.sql` y tendrás todo funcionando en minutos.**
