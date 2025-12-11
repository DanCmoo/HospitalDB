# Sistema Multi-Red Hospitalaria - Guía de Instalación

## 📋 Descripción

Script SQL completo para desplegar un sistema hospitalario distribuido con:
- **1 Hub Central**: Base de datos maestra que consolida información y gestiona autenticación
- **3 Sedes Hospitalarias**: Norte, Centro y Sur
- **Sistema de Autenticación Centralizado**: Email-based con bcrypt

## 🏗️ Arquitectura

```
┌─────────────────┐
│  HOSPITAL_HUB   │ ← Hub Central (Índice Global)
└────────┬────────┘
         │
    ┌────┴────┬────────┐
    │         │        │
┌───▼────┐ ┌──▼─────┐ ┌▼────────┐
│ NORTE  │ │ CENTRO │ │   SUR   │
└────────┘ └────────┘ └─────────┘
```

## 🚀 Instalación

### Requisitos Previos
- PostgreSQL 12 o superior
- Usuario `postgres` con permisos de superusuario
- pgAdmin 4 (opcional, para GUI)

### Ejecutar el Script

#### Opción 1: Desde psql (Recomendado)
```bash
psql -U postgres -f script.sql
```

#### Opción 2: Desde pgAdmin
1. Abrir pgAdmin
2. Conectar como usuario `postgres`
3. Abrir Query Tool
4. Cargar y ejecutar `script.sql`
5. Opcional: Ejecutar `verificacion_final.sql` para ver estadísticas

### Tiempo de Ejecución
⏱️ Aproximadamente 2-3 minutos

## 📊 Bases de Datos Creadas

| Base de Datos | Propósito | Tablas Principales |
|--------------|-----------|-------------------|
| `hospital_hub` | Hub central | Índice global de pacientes, Historial compartido, Auditoría, **Usuarios (Auth)**, Activity Logs |
| `hospital_sede_norte` | Sede operativa | Pacientes, Empleados, Citas, Equipamiento |
| `hospital_sede_centro` | Sede operativa | Pacientes, Empleados, Citas, Equipamiento |
| `hospital_sede_sur` | Sede operativa | Pacientes, Empleados, Citas, Equipamiento |

## 👥 Usuarios Iniciales (Autenticación Centralizada)

El sistema incluye 4 usuarios de prueba creados automáticamente:

| Email | Contraseña | Rol | Documento |
|-------|-----------|-----|-----------|
| `admin@hospital.com` | `admin123` | Administrador | 12345678 |
| `medico@hospital.com` | `medico123` | Médico | 23456789 |
| `enfermero@hospital.com` | `enfermero123` | Enfermero | 34567890 |
| `admin_staff@hospital.com` | `staff123` | Personal Administrativo | 45678901 |

**Nota:** Las contraseñas están hasheadas con bcrypt (10 rounds). Los usuarios están vinculados a personas en `hospital_sede_norte.personas`.

## 🔗 Características Implementadas

### ✅ Replicación
- Control automático de replicación con triggers
- Tabla `Control_Replicacion` en cada sede
- Replicación de pacientes críticos/emergencia

### ✅ Sincronización
- Tablas `*_Red` para datos replicados
- Actualización automática mediante triggers
- Timestamp de sincronización

### ✅ Foreign Data Wrappers (FDW)
- Hub conectado a las 3 sedes
- Sedes conectadas al Hub
- Consultas distribuidas habilitadas

### ✅ Vistas Consolidadas
- `v_pacientes_consolidado`: Todos los pacientes de la red
- `v_pacientes_red`: Vista local + remota por sede
- `v_historial_completo`: Historiales locales y remotos
- `v_dashboard_red`: Estadísticas en tiempo real

### ✅ Auditoría
- Tabla `Auditoria_Interred` en hub
- `Auditoria_Accesos` en cada sede
- Registro automático de operaciones

## 📝 Datos de Ejemplo

El script incluye datos de prueba para demostrar funcionalidad:

### Sede Norte
- 3 pacientes
- 5 empleados
- 2 citas programadas
- 4 equipos

### Sede Centro
- 2 pacientes
- 2 empleados
- 1 cita
- 2 equipos

### Sede Sur
- 2 pacientes
- 1 empleado
- 1 cita urgente
- 2 equipos

## 🔍 Verificación Post-Instalación

### Conectar a las Bases
```bash
# Hub Central
psql -U postgres -d hospital_hub

# Sede Norte
psql -U postgres -d hospital_sede_norte

# Sede Centro
psql -U postgres -d hospital_sede_centro

# Sede Sur
psql -U postgres -d hospital_sede_sur
```

### Consultas de Prueba

#### Ver usuarios del sistema (desde Hub)
```sql
\c hospital_hub
SELECT id_usuario, correo, rol, activo, fecha_creacion 
FROM usuarios 
ORDER BY id_usuario;
```

#### Ver logs de actividad
```sql
\c hospital_hub
SELECT al.id_log, u.correo, al.accion, al.fecha_accion
FROM activity_logs al
JOIN usuarios u ON al.id_usuario = u.id_usuario
ORDER BY al.fecha_accion DESC
LIMIT 10;
```

#### Ver todos los pacientes de la red (desde Hub)
```sql
\c hospital_hub
SELECT * FROM v_todos_pacientes_red;
```

#### Ver pacientes locales + remotos (desde cualquier sede)
```sql
\c hospital_sede_norte
SELECT * FROM v_pacientes_red;
```

#### Ver estadísticas del dashboard
```sql
SELECT * FROM v_dashboard_red;
```

#### Verificar replicación pendiente
```sql
SELECT * FROM Control_Replicacion WHERE replicado = FALSE;
```

## 🛠️ Gestión

### Agregar Nueva Sede
1. Duplicar sección de creación de sede en el script
2. Actualizar `id_sede` y nombres
3. Registrar en `Redes_Hospitalarias` del hub
4. Configurar FDW bidereccional

### Respaldar Datos
```bash
# Hub
pg_dump -U postgres hospital_hub > backup_hub.sql

# Sedes
pg_dump -U postgres hospital_sede_norte > backup_norte.sql
pg_dump -U postgres hospital_sede_centro > backup_centro.sql
pg_dump -U postgres hospital_sede_sur > backup_sur.sql
```

### Restaurar Datos
```bash
psql -U postgres -d hospital_hub < backup_hub.sql
```

## 📈 Escalabilidad

### Agregar Más Sedes
El sistema está diseñado para escalar:
- Agregue nuevas sedes con IDs únicos (4, 5, 6...)
- Configure FDW desde el hub
- Actualice las tablas `*_Red` en sedes existentes

### Optimización
- Índices ya creados en columnas críticas
- Particionamiento posible por `id_sede`
- Considere caching para consultas frecuentes

## ⚠️ Consideraciones Importantes

1. **Contraseñas**: Cambie las contraseñas por defecto en producción
2. **FDW**: Ajuste host/puerto si las bases están en servidores diferentes
3. **Sincronización**: Implemente job scheduler para procesamiento de `Control_Replicacion`
4. **Red**: Asegure conectividad entre servidores para FDW
5. **Permisos**: Revise permisos según políticas de seguridad

## 📞 Soporte

Para problemas o consultas:
1. Revise los logs de PostgreSQL
2. Ejecute `verificacion_final.sql`
3. Verifique conectividad de FDW

## 📄 Archivos

- `script.sql`: Script principal de instalación
- `verificacion_final.sql`: Consultas de verificación
- `README_INSTALACION.md`: Esta guía

---

**Versión**: 1.0  
**Fecha**: Diciembre 2025  
**PostgreSQL**: 12+
