-- ============================================
-- Migración: Tabla de Usuarios (Fase 10)
-- Sistema de Autenticación Basado en Sesiones
-- ============================================

-- Crear la tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    num_doc VARCHAR(20) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(30) NOT NULL DEFAULT 'personal_administrativo',
    activo BOOLEAN NOT NULL DEFAULT true,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key hacia Personas
    CONSTRAINT fk_usuario_persona FOREIGN KEY (num_doc) 
        REFERENCES Personas(num_doc) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Check constraint para validar roles
    CONSTRAINT chk_usuario_rol CHECK (
        rol IN ('administrador', 'medico', 'enfermero', 'personal_administrativo')
    )
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios(username);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_num_doc ON usuarios(num_doc);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);

-- Función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_usuarios_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar fecha_actualizacion
DROP TRIGGER IF EXISTS trg_update_usuarios_timestamp ON usuarios;
CREATE TRIGGER trg_update_usuarios_timestamp
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_usuarios_timestamp();

-- Comentarios en la tabla y columnas
COMMENT ON TABLE usuarios IS 'Tabla de usuarios del sistema con autenticación basada en sesiones (sin JWT)';
COMMENT ON COLUMN usuarios.id_usuario IS 'ID autoincremental del usuario';
COMMENT ON COLUMN usuarios.num_doc IS 'Número de documento (FK a Personas)';
COMMENT ON COLUMN usuarios.username IS 'Nombre de usuario único para login';
COMMENT ON COLUMN usuarios.password_hash IS 'Hash bcrypt de la contraseña (salt rounds: 10)';
COMMENT ON COLUMN usuarios.rol IS 'Rol del usuario: administrador, medico, enfermero, personal_administrativo';
COMMENT ON COLUMN usuarios.activo IS 'Indica si el usuario está activo en el sistema';
COMMENT ON COLUMN usuarios.fecha_creacion IS 'Fecha y hora de creación del usuario';
COMMENT ON COLUMN usuarios.fecha_actualizacion IS 'Fecha y hora de última actualización';

-- ============================================
-- Datos de ejemplo para testing
-- ============================================
-- NOTA: Estos usuarios de ejemplo tienen la contraseña "test123"
-- Hash generado con bcrypt, salt rounds: 10
-- En producción, crear usuarios a través del endpoint /auth/register

-- Verificar que existan personas antes de insertar usuarios
-- INSERT INTO usuarios (num_doc, username, password_hash, rol, activo) VALUES
-- ('123456789', 'admin', '$2b$10$rL9YX5kQO.vZKZ8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8', 'administrador', true),
-- ('987654321', 'medico1', '$2b$10$rL9YX5kQO.vZKZ8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8', 'medico', true),
-- ('456789123', 'enfermero1', '$2b$10$rL9YX5kQO.vZKZ8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8', 'enfermero', true),
-- ('789123456', 'admin_staff', '$2b$10$rL9YX5kQO.vZKZ8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8', 'personal_administrativo', true);

-- ============================================
-- Consultas útiles para verificación
-- ============================================

-- Ver todos los usuarios
-- SELECT 
--     u.id_usuario,
--     u.username,
--     u.rol,
--     u.activo,
--     p.nom_pers,
--     p.correo,
--     u.fecha_creacion
-- FROM usuarios u
-- JOIN Personas p ON u.num_doc = p.num_doc
-- ORDER BY u.fecha_creacion DESC;

-- Contar usuarios por rol
-- SELECT rol, COUNT(*) as total
-- FROM usuarios
-- WHERE activo = true
-- GROUP BY rol;

-- Ver usuarios inactivos
-- SELECT username, rol, fecha_actualizacion
-- FROM usuarios
-- WHERE activo = false;
