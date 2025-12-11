-- Fase 17: Sistema de Gestión Avanzada de Usuarios
-- Crear tabla de logs de actividad

CREATE TABLE IF NOT EXISTS activity_logs (
    id_log SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    accion VARCHAR(100) NOT NULL,
    detalles TEXT,
    ip_address VARCHAR(45),
    fecha_accion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_logs_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_activity_logs_usuario ON activity_logs(id_usuario);
CREATE INDEX idx_activity_logs_fecha ON activity_logs(fecha_accion DESC);
CREATE INDEX idx_activity_logs_accion ON activity_logs(accion);

-- Comentarios
COMMENT ON TABLE activity_logs IS 'Tabla de registro de actividad de usuarios para auditoría';
COMMENT ON COLUMN activity_logs.id_log IS 'Identificador único del log';
COMMENT ON COLUMN activity_logs.id_usuario IS 'ID del usuario que realizó la acción';
COMMENT ON COLUMN activity_logs.accion IS 'Tipo de acción realizada (login, update_usuario, delete_usuario, etc.)';
COMMENT ON COLUMN activity_logs.detalles IS 'Detalles adicionales sobre la acción';
COMMENT ON COLUMN activity_logs.ip_address IS 'Dirección IP desde donde se realizó la acción';
COMMENT ON COLUMN activity_logs.fecha_accion IS 'Fecha y hora en que se realizó la acción';
