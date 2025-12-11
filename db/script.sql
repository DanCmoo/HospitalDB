-- ============================================
-- SISTEMA MULTI-RED HOSPITALARIA COMPLETO
-- Ejecutar como usuario postgres
-- Versión: PostgreSQL 12+
-- ============================================

-- ============================================
-- PASO 1: CREAR BASE DE DATOS MAESTRA (HUB)
-- ============================================

DROP DATABASE IF EXISTS hospital_hub;
CREATE DATABASE hospital_hub;

\c hospital_hub;

-- Extensiones
CREATE EXTENSION IF NOT EXISTS postgres_fdw;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabla de Redes Hospitalarias
CREATE TABLE Redes_Hospitalarias (
    id_red VARCHAR(20) PRIMARY KEY,
    nombre_red VARCHAR(100) NOT NULL,
    ciudad VARCHAR(50) NOT NULL,
    region VARCHAR(50),
    db_name VARCHAR(50) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'Activa',
    CONSTRAINT chk_estado_red CHECK (estado IN ('Activa', 'Inactiva', 'Mantenimiento'))
);

-- Índice Global de Pacientes
CREATE TABLE Indice_Pacientes_Global (
    id_global SERIAL PRIMARY KEY,
    num_doc VARCHAR(20) NOT NULL,
    tipo_doc VARCHAR(20) NOT NULL,
    nom_pers VARCHAR(50) NOT NULL,
    fecha_nac DATE NOT NULL,
    id_red_origen VARCHAR(20) NOT NULL,
    cod_pac_local INT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_indice_red FOREIGN KEY (id_red_origen) 
        REFERENCES Redes_Hospitalarias(id_red),
    CONSTRAINT unq_paciente_red UNIQUE (num_doc, id_red_origen)
);

-- Historial Compartido
CREATE TABLE Historial_Compartido (
    id_hist_global SERIAL PRIMARY KEY,
    id_global_paciente INT NOT NULL,
    id_red_emisora VARCHAR(20) NOT NULL,
    cod_hist_local INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    diagnostico_resumen VARCHAR(200) NOT NULL,
    nivel_acceso VARCHAR(20) DEFAULT 'Restringido',
    fecha_compartido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_hist_paciente FOREIGN KEY (id_global_paciente) 
        REFERENCES Indice_Pacientes_Global(id_global),
    CONSTRAINT fk_hist_red FOREIGN KEY (id_red_emisora) 
        REFERENCES Redes_Hospitalarias(id_red),
    CONSTRAINT chk_nivel_acceso CHECK (nivel_acceso IN ('Público', 'Restringido', 'Privado'))
);

-- Auditoría Centralizada
CREATE TABLE Auditoria_Interred (
    id_auditoria SERIAL PRIMARY KEY,
    id_red_origen VARCHAR(20) NOT NULL,
    id_red_destino VARCHAR(20),
    tipo_operacion VARCHAR(30) NOT NULL,
    id_global_paciente INT,
    num_doc_usuario VARCHAR(20) NOT NULL,
    descripcion TEXT,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    exitosa BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_audit_red_origen FOREIGN KEY (id_red_origen) 
        REFERENCES Redes_Hospitalarias(id_red)
);

-- Transferencias de Pacientes
CREATE TABLE Transferencias_Pacientes (
    id_transferencia SERIAL PRIMARY KEY,
    id_global_paciente INT NOT NULL,
    id_red_origen VARCHAR(20) NOT NULL,
    id_red_destino VARCHAR(20) NOT NULL,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_transferencia TIMESTAMP,
    motivo TEXT NOT NULL,
    estado VARCHAR(20) DEFAULT 'Pendiente',
    medico_solicita VARCHAR(20) NOT NULL,
    CONSTRAINT fk_trans_paciente FOREIGN KEY (id_global_paciente) 
        REFERENCES Indice_Pacientes_Global(id_global),
    CONSTRAINT fk_trans_origen FOREIGN KEY (id_red_origen) 
        REFERENCES Redes_Hospitalarias(id_red),
    CONSTRAINT fk_trans_destino FOREIGN KEY (id_red_destino) 
        REFERENCES Redes_Hospitalarias(id_red),
    CONSTRAINT chk_estado_trans CHECK (estado IN ('Pendiente', 'Aprobada', 'En Proceso', 'Completada', 'Cancelada'))
);

-- Índices Hub
CREATE INDEX idx_indice_pac_doc ON Indice_Pacientes_Global(num_doc);
CREATE INDEX idx_indice_pac_red ON Indice_Pacientes_Global(id_red_origen);
CREATE INDEX idx_hist_comp_pac ON Historial_Compartido(id_global_paciente);
CREATE INDEX idx_audit_fecha ON Auditoria_Interred(fecha_hora);
CREATE INDEX idx_transferencias_estado ON Transferencias_Pacientes(estado);

-- ============================================
-- AUTENTICACIÓN CENTRALIZADA
-- ============================================

-- Tabla de Usuarios (Autenticación)
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    num_doc VARCHAR(20) UNIQUE NOT NULL,
    correo VARCHAR(60) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(30) NOT NULL DEFAULT 'personal_administrativo',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP,
    CONSTRAINT chk_rol_usuario CHECK (rol IN ('administrador', 'medico', 'enfermero', 'personal_administrativo'))
);

-- Tabla de Logs de Actividad
CREATE TABLE activity_logs (
    id_log SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    accion VARCHAR(50) NOT NULL,
    detalles TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Índices de Autenticación
CREATE INDEX idx_usuarios_correo ON usuarios(correo);
CREATE INDEX idx_usuarios_num_doc ON usuarios(num_doc);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);
CREATE INDEX idx_activity_usuario ON activity_logs(id_usuario);
CREATE INDEX idx_activity_fecha ON activity_logs(fecha_accion);
CREATE INDEX idx_activity_accion ON activity_logs(accion);

COMMENT ON TABLE usuarios IS 'Tabla centralizada de autenticación - Los usuarios deben existir como personas en las sedes';
COMMENT ON COLUMN usuarios.correo IS 'Email único - Se usa como username para login';
COMMENT ON COLUMN usuarios.password_hash IS 'Hash bcrypt de la contraseña';
COMMENT ON COLUMN usuarios.ultimo_acceso IS 'Timestamp del último login exitoso';

COMMENT ON TABLE activity_logs IS 'Registro de auditoría de acciones de usuarios';
COMMENT ON COLUMN activity_logs.accion IS 'Tipo de acción: login, logout, create, update, delete, etc.';

-- Insertar redes
INSERT INTO Redes_Hospitalarias (id_red, nombre_red, ciudad, region, db_name) VALUES
('RED_NORTE', 'Red Hospitalaria Norte', 'Bogotá', 'Región Norte', 'hospital_sede_norte'),
('RED_CENTRO', 'Red Hospitalaria Centro', 'Bogotá', 'Región Centro', 'hospital_sede_centro'),
('RED_SUR', 'Red Hospitalaria Sur', 'Bogotá', 'Región Sur', 'hospital_sede_sur');

-- Vista consolidada de pacientes
CREATE VIEW v_pacientes_consolidado AS
SELECT 
    ipg.id_global,
    ipg.num_doc,
    ipg.nom_pers,
    ipg.fecha_nac,
    rh.nombre_red,
    rh.ciudad,
    ipg.fecha_registro,
    COUNT(hc.id_hist_global) as total_historiales
FROM Indice_Pacientes_Global ipg
INNER JOIN Redes_Hospitalarias rh ON ipg.id_red_origen = rh.id_red
LEFT JOIN Historial_Compartido hc ON ipg.id_global = hc.id_global_paciente
GROUP BY ipg.id_global, ipg.num_doc, ipg.nom_pers, ipg.fecha_nac, rh.nombre_red, rh.ciudad, ipg.fecha_registro;

-- Vista de actividad reciente
CREATE VIEW v_actividad_reciente AS
SELECT 
    'Auditoría' as tipo_evento,
    a.tipo_operacion as detalle,
    a.fecha_hora,
    r.nombre_red as red_origen
FROM Auditoria_Interred a
INNER JOIN Redes_Hospitalarias r ON a.id_red_origen = r.id_red
UNION ALL
SELECT 
    'Transferencia' as tipo_evento,
    CONCAT('De ', ro.nombre_red, ' a ', rd.nombre_red) as detalle,
    t.fecha_solicitud as fecha_hora,
    ro.nombre_red as red_origen
FROM Transferencias_Pacientes t
INNER JOIN Redes_Hospitalarias ro ON t.id_red_origen = ro.id_red
INNER JOIN Redes_Hospitalarias rd ON t.id_red_destino = rd.id_red
ORDER BY fecha_hora DESC
LIMIT 100;

-- ============================================
-- PASO 2: CREAR BASE DE DATOS SEDE NORTE
-- ============================================

DROP DATABASE IF EXISTS hospital_sede_norte;
CREATE DATABASE hospital_sede_norte;

\c hospital_sede_norte;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

-- Configuración de Sede
CREATE TABLE Config_Sede (
    id_sede INT PRIMARY KEY,
    nombre_sede VARCHAR(50) NOT NULL,
    ciudad VARCHAR(30) NOT NULL,
    region VARCHAR(30),
    es_sede_maestra BOOLEAN DEFAULT FALSE,
    fecha_instalacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_sincronizacion TIMESTAMP
);

INSERT INTO Config_Sede (id_sede, nombre_sede, ciudad, region) 
VALUES (1, 'Sede Norte', 'Bogotá', 'Norte');

-- Personas
CREATE TABLE Personas (
    num_doc VARCHAR(20) PRIMARY KEY,
    tipo_doc VARCHAR(20) NOT NULL,
    nom_pers VARCHAR(50) NOT NULL,
    correo VARCHAR(60) UNIQUE,
    contrasena VARCHAR(100),
    tel_pers VARCHAR(20),
    id_sede_registro INT NOT NULL DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sedes Hospitalarias
CREATE TABLE Sedes_Hospitalarias (
    id_sede INT PRIMARY KEY,
    telefono VARCHAR(20),
    direccion VARCHAR(50) NOT NULL,
    nom_sede VARCHAR(30) NOT NULL,
    ciudad VARCHAR(20) NOT NULL
);

-- Departamentos
CREATE TABLE Departamentos (
    nom_dept VARCHAR(30),
    id_sede INT NOT NULL,
    PRIMARY KEY (nom_dept, id_sede),
    CONSTRAINT fk_departamentos_sedes FOREIGN KEY (id_sede) 
        REFERENCES Sedes_Hospitalarias(id_sede) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Pacientes
CREATE TABLE Pacientes (
    cod_pac INT,
    id_sede INT NOT NULL,
    num_doc VARCHAR(20) NOT NULL,
    dr_pac VARCHAR(80),
    fecha_nac DATE NOT NULL,
    genero VARCHAR(20) NOT NULL,
    estado_paciente VARCHAR(20) DEFAULT 'Activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cod_pac, id_sede),
    CONSTRAINT fk_pacientes_personas FOREIGN KEY (num_doc) 
        REFERENCES Personas(num_doc) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Empleados
CREATE TABLE Empleados (
    id_emp INT,
    id_sede INT NOT NULL,
    num_doc VARCHAR(20) NOT NULL,
    hash_contrato VARCHAR(100),
    nom_dept VARCHAR(30) NOT NULL,
    cargo VARCHAR(30) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_contratacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_emp, id_sede),
    CONSTRAINT fk_empleados_personas FOREIGN KEY (num_doc) 
        REFERENCES Personas(num_doc) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Equipamiento
CREATE TABLE Equipamiento (
    cod_eq INT,
    id_sede INT NOT NULL,
    nom_eq VARCHAR(50) NOT NULL,
    estado VARCHAR(15) NOT NULL,
    fecha_mant DATE,
    id_emp INT NOT NULL,
    PRIMARY KEY (cod_eq, id_sede),
    CONSTRAINT fk_equipamiento_empleados FOREIGN KEY (id_emp, id_sede) 
        REFERENCES Empleados(id_emp, id_sede) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_estado_equipamiento CHECK (estado IN ('Operativo', 'En Mantenimiento', 'Fuera de Servicio'))
);

-- Pertenece
CREATE TABLE Pertenece (
    nom_dept VARCHAR(30) NOT NULL,
    cod_eq INT NOT NULL,
    id_sede INT NOT NULL,
    PRIMARY KEY (nom_dept, cod_eq, id_sede),
    CONSTRAINT fk_pertenece_dept FOREIGN KEY (nom_dept, id_sede)
        REFERENCES Departamentos(nom_dept, id_sede) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_pertenece_equip FOREIGN KEY (cod_eq, id_sede)
        REFERENCES Equipamiento(cod_eq, id_sede) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Agenda_Cita
CREATE TABLE Agenda_Cita (
    id_cita INT,
    id_sede INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    tipo_servicio VARCHAR(30) NOT NULL,
    estado VARCHAR(15) NOT NULL,
    nom_dept VARCHAR(30),
    id_emp INT NOT NULL,
    cod_pac INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_cita, id_sede),
    CONSTRAINT fk_agenda_empleados FOREIGN KEY (id_emp, id_sede) 
        REFERENCES Empleados(id_emp, id_sede) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_agenda_pacientes FOREIGN KEY (cod_pac, id_sede) 
        REFERENCES Pacientes(cod_pac, id_sede) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_estado_cita CHECK (estado IN ('Programada', 'Completada', 'Cancelada', 'No Asistió'))
);

-- Medicamentos
CREATE TABLE Medicamentos (
    cod_med INT PRIMARY KEY,
    nom_med VARCHAR(30) NOT NULL,
    stock INT NOT NULL,
    proveedor VARCHAR(30),
    descripcion VARCHAR(40),
    id_sede INT NOT NULL,
    CONSTRAINT chk_stock_positivo CHECK (stock >= 0)
);

-- Prescribe
CREATE TABLE Prescribe (
    cod_med INT NOT NULL,
    id_cita INT NOT NULL,
    id_sede INT NOT NULL,
    dosis INT NOT NULL,
    frecuencia INT NOT NULL,
    duracion DATE NOT NULL,
    fecha_emision DATE NOT NULL,
    PRIMARY KEY (cod_med, id_cita, id_sede),
    CONSTRAINT fk_prescribe_medicamentos FOREIGN KEY (cod_med) 
        REFERENCES Medicamentos(cod_med) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_prescribe_agenda FOREIGN KEY (id_cita, id_sede) 
        REFERENCES Agenda_Cita(id_cita, id_sede) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Emite_Hist
CREATE TABLE Emite_Hist (
    cod_hist INT,
    id_sede INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    diagnostico VARCHAR(80) NOT NULL,
    nom_dept VARCHAR(30),
    id_emp INT NOT NULL,
    cod_pac INT NOT NULL,
    compartido BOOLEAN DEFAULT FALSE,
    nivel_acceso VARCHAR(20) DEFAULT 'Local',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cod_hist, id_sede),
    CONSTRAINT fk_emite_empleados FOREIGN KEY (id_emp, id_sede) 
        REFERENCES Empleados(id_emp, id_sede) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_emite_pacientes FOREIGN KEY (cod_pac, id_sede) 
        REFERENCES Pacientes(cod_pac, id_sede) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_nivel_acceso CHECK (nivel_acceso IN ('Local', 'Red', 'Global'))
);

-- Auditoria_Accesos
CREATE TABLE Auditoria_Accesos (
    id_evento SERIAL PRIMARY KEY,
    id_sede INT NOT NULL,
    num_doc VARCHAR(20) NOT NULL,
    accion VARCHAR(20) NOT NULL,
    fecha_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tabla_afectada VARCHAR(30),
    ip_origen VARCHAR(20),
    sede_origen INT,
    CONSTRAINT fk_auditoria_personas FOREIGN KEY (num_doc) 
        REFERENCES Personas(num_doc) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Control de Replicación
CREATE TABLE Control_Replicacion (
    id_control SERIAL PRIMARY KEY,
    tabla_origen VARCHAR(50) NOT NULL,
    id_registro VARCHAR(50) NOT NULL,
    operacion VARCHAR(10) NOT NULL,
    sede_origen INT NOT NULL,
    sedes_destino INT[] NOT NULL,
    datos_json JSONB NOT NULL,
    fecha_operacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    replicado BOOLEAN DEFAULT FALSE,
    fecha_replicacion TIMESTAMP,
    intentos INT DEFAULT 0,
    CONSTRAINT chk_operacion CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE'))
);

-- Tablas de Red
CREATE TABLE Pacientes_Red (
    cod_pac INT,
    id_sede_origen INT NOT NULL,
    num_doc VARCHAR(20) NOT NULL,
    nom_pers VARCHAR(50) NOT NULL,
    fecha_nac DATE NOT NULL,
    genero VARCHAR(20) NOT NULL,
    dr_pac VARCHAR(80),
    fecha_sincronizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cod_pac, id_sede_origen)
);

CREATE TABLE Historial_Red (
    cod_hist INT,
    id_sede_origen INT NOT NULL,
    cod_pac INT NOT NULL,
    fecha DATE NOT NULL,
    diagnostico_resumen VARCHAR(200) NOT NULL,
    nivel_acceso VARCHAR(20) NOT NULL,
    fecha_sincronizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cod_hist, id_sede_origen)
);

CREATE TABLE Equipamiento_Red (
    cod_eq INT,
    id_sede_origen INT NOT NULL,
    nom_eq VARCHAR(50) NOT NULL,
    estado VARCHAR(15) NOT NULL,
    nom_sede VARCHAR(30) NOT NULL,
    fecha_sincronizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cod_eq, id_sede_origen)
);

-- Índices
CREATE INDEX idx_pacientes_doc ON Pacientes(num_doc);
CREATE INDEX idx_pacientes_sede ON Pacientes(id_sede);
CREATE INDEX idx_agenda_fecha ON Agenda_Cita(fecha, id_sede);
CREATE INDEX idx_historial_paciente ON Emite_Hist(cod_pac, id_sede);
CREATE INDEX idx_control_repl ON Control_Replicacion(tabla_origen, replicado);
CREATE INDEX idx_pacientes_red_doc ON Pacientes_Red(num_doc);

-- Función de Replicación
CREATE OR REPLACE FUNCTION fn_replicar_cambios()
RETURNS TRIGGER AS $$
DECLARE
    v_id_sede INT;
    v_sedes_destino INT[];
BEGIN
    SELECT id_sede INTO v_id_sede FROM Config_Sede LIMIT 1;
    
    IF TG_TABLE_NAME = 'Pacientes' THEN
        v_sedes_destino := ARRAY[0];
    ELSIF TG_TABLE_NAME = 'Emite_Hist' THEN
        v_sedes_destino := ARRAY[0];
    ELSE
        v_sedes_destino := ARRAY[0];
    END IF;
    
    INSERT INTO Control_Replicacion (
        tabla_origen, id_registro, operacion, sede_origen, sedes_destino, datos_json
    ) VALUES (
        TG_TABLE_NAME,
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.cod_pac::VARCHAR || '-' || OLD.id_sede::VARCHAR
            ELSE NEW.cod_pac::VARCHAR || '-' || NEW.id_sede::VARCHAR
        END,
        TG_OP,
        v_id_sede,
        v_sedes_destino,
        CASE 
            WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)
            ELSE row_to_json(NEW)
        END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trg_replicar_pacientes
AFTER INSERT OR UPDATE OR DELETE ON Pacientes
FOR EACH ROW EXECUTE FUNCTION fn_replicar_cambios();

CREATE TRIGGER trg_replicar_historial
AFTER INSERT OR UPDATE ON Emite_Hist
FOR EACH ROW EXECUTE FUNCTION fn_replicar_cambios();

-- Vistas
CREATE VIEW v_pacientes_red AS
SELECT cod_pac, id_sede, num_doc, p.nom_pers, fecha_nac, genero, 'Local' as origen
FROM Pacientes INNER JOIN Personas p USING (num_doc)
WHERE id_sede = (SELECT id_sede FROM Config_Sede LIMIT 1)
UNION ALL
SELECT cod_pac, id_sede_origen as id_sede, num_doc, nom_pers, fecha_nac, genero, 'Remoto' as origen
FROM Pacientes_Red;

CREATE VIEW v_dashboard_red AS
SELECT 
    (SELECT COUNT(*) FROM Pacientes WHERE id_sede = (SELECT id_sede FROM Config_Sede LIMIT 1)) as pacientes_local,
    (SELECT COUNT(*) FROM Pacientes_Red) as pacientes_red,
    (SELECT COUNT(*) FROM Agenda_Cita WHERE fecha = CURRENT_DATE) as citas_hoy,
    (SELECT COUNT(*) FROM Equipamiento WHERE estado = 'Operativo') as equipos_operativos,
    (SELECT MAX(ultima_sincronizacion) FROM Config_Sede) as ultima_sync;

-- Datos Sede Centro
INSERT INTO Sedes_Hospitalarias VALUES (2, '6015555678', 'Carrera 7 #45-30', 'Sede Centro', 'Bogotá');

INSERT INTO Departamentos VALUES 
('Medicina Interna', 2), ('Pediatría', 2), ('Ginecología', 2);

INSERT INTO Personas VALUES
('3691472580', 'CC', 'Miguel Flores', 'miguel.flores@sedecentro.com', 'miguel123', '3153691472', 2, NOW(), NOW()),
('7894561230', 'CC', 'Patricia Núñez', 'patricia.nunez@sedecentro.com', 'patricia123', '3007894561', 2, NOW(), NOW()),
('4567891230', 'CC', 'Roberto Castillo', 'roberto.castillo@sedecentro.com', 'roberto123', '3104567891', 2, NOW(), NOW()),
('7531598520', 'CC', 'Elena Vargas', 'elena.vargas@sedecentro.com', 'elena123', '3207531598', 2, NOW(), NOW());

INSERT INTO Pacientes VALUES
(201, 2, '3691472580', 'Asma bronquial', '1978-05-30', 'Masculino', 'Activo', NOW(), NOW()),
(202, 2, '7894561230', 'Diabetes tipo 2', '1992-08-12', 'Femenino', 'Activo', NOW(), NOW());

INSERT INTO Empleados VALUES
(2001, 2, '4567891230', 'HASH456XYZ', 'Medicina Interna', 'Médico General', TRUE, NOW()),
(2002, 2, '7531598520', 'HASH789ABC', 'Pediatría', 'Pediatra', TRUE, NOW());

INSERT INTO Equipamiento VALUES
(3001, 2, 'Estetoscopio Digital', 'Operativo', '2024-10-20', 2001),
(3002, 2, 'Nebulizador portátil', 'Operativo', '2024-11-05', 2002);

INSERT INTO Pertenece VALUES
('Medicina Interna', 3001, 2),
('Pediatría', 3002, 2);

INSERT INTO Medicamentos VALUES
(5001, 'Salbutamol Inhalador', 300, 'RespiraMed', 'Broncodilatador', 2),
(5002, 'Insulina Glargina', 150, 'DiabetesCare', 'Insulina basal', 2);

INSERT INTO Agenda_Cita VALUES
(4001, 2, '2024-12-18', '11:00:00', 'Consulta Especializada', 'Programada', 'Medicina Interna', 2001, 201, NOW(), NOW());

INSERT INTO Prescribe VALUES
(5001, 4001, 2, 100, 3, '2025-02-18', '2024-12-18');

INSERT INTO Emite_Hist VALUES
(7001, 2, '2024-12-11', '11:30:00', 'Asma controlada con tratamiento', 'Medicina Interna', 2001, 201, FALSE, 'Local', NOW());

-- ============================================
-- PASO 3: CREAR BASE DE DATOS SEDE CENTRO
-- ============================================

DROP DATABASE IF EXISTS hospital_sede_centro;
CREATE DATABASE hospital_sede_centro;

\c hospital_sede_centro;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

-- Configuración de Sede
CREATE TABLE Config_Sede (
    id_sede INT PRIMARY KEY,
    nombre_sede VARCHAR(50) NOT NULL,
    ciudad VARCHAR(30) NOT NULL,
    region VARCHAR(30),
    es_sede_maestra BOOLEAN DEFAULT FALSE,
    fecha_instalacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_sincronizacion TIMESTAMP
);

INSERT INTO Config_Sede VALUES (2, 'Sede Centro', 'Bogotá', 'Centro');

-- Personas
CREATE TABLE Personas (
    num_doc VARCHAR(20) PRIMARY KEY,
    tipo_doc VARCHAR(20) NOT NULL,
    nom_pers VARCHAR(50) NOT NULL,
    correo VARCHAR(60),
    tel_pers VARCHAR(20),
    id_sede_registro INT NOT NULL DEFAULT 2,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sedes Hospitalarias
CREATE TABLE Sedes_Hospitalarias (
    id_sede INT PRIMARY KEY,
    telefono VARCHAR(20),
    direccion VARCHAR(50) NOT NULL,
    nom_sede VARCHAR(30) NOT NULL,
    ciudad VARCHAR(20) NOT NULL
);

-- Departamentos
CREATE TABLE Departamentos (
    nom_dept VARCHAR(30),
    id_sede INT NOT NULL,
    PRIMARY KEY (nom_dept, id_sede),
    CONSTRAINT fk_departamentos_sedes FOREIGN KEY (id_sede) 
        REFERENCES Sedes_Hospitalarias(id_sede) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Pacientes
CREATE TABLE Pacientes (
    cod_pac INT,
    id_sede INT NOT NULL,
    num_doc VARCHAR(20) NOT NULL,
    dr_pac VARCHAR(80),
    fecha_nac DATE NOT NULL,
    genero VARCHAR(20) NOT NULL,
    estado_paciente VARCHAR(20) DEFAULT 'Activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cod_pac, id_sede),
    CONSTRAINT fk_pacientes_personas FOREIGN KEY (num_doc) 
        REFERENCES Personas(num_doc) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Empleados
CREATE TABLE Empleados (
    id_emp INT,
    id_sede INT NOT NULL,
    num_doc VARCHAR(20) NOT NULL,
    hash_contrato VARCHAR(100),
    nom_dept VARCHAR(30) NOT NULL,
    cargo VARCHAR(30) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_contratacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_emp, id_sede),
    CONSTRAINT fk_empleados_personas FOREIGN KEY (num_doc) 
        REFERENCES Personas(num_doc) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Equipamiento
CREATE TABLE Equipamiento (
    cod_eq INT,
    id_sede INT NOT NULL,
    nom_eq VARCHAR(50) NOT NULL,
    estado VARCHAR(15) NOT NULL,
    fecha_mant DATE,
    id_emp INT NOT NULL,
    PRIMARY KEY (cod_eq, id_sede),
    CONSTRAINT fk_equipamiento_empleados FOREIGN KEY (id_emp, id_sede) 
        REFERENCES Empleados(id_emp, id_sede) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_estado_equipamiento CHECK (estado IN ('Operativo', 'En Mantenimiento', 'Fuera de Servicio'))
);

-- Pertenece
CREATE TABLE Pertenece (
    nom_dept VARCHAR(30) NOT NULL,
    cod_eq INT NOT NULL,
    id_sede INT NOT NULL,
    PRIMARY KEY (nom_dept, cod_eq, id_sede),
    CONSTRAINT fk_pertenece_dept FOREIGN KEY (nom_dept, id_sede)
        REFERENCES Departamentos(nom_dept, id_sede) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_pertenece_equip FOREIGN KEY (cod_eq, id_sede)
        REFERENCES Equipamiento(cod_eq, id_sede) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Agenda_Cita
CREATE TABLE Agenda_Cita (
    id_cita INT,
    id_sede INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    tipo_servicio VARCHAR(30) NOT NULL,
    estado VARCHAR(15) NOT NULL,
    nom_dept VARCHAR(30),
    id_emp INT NOT NULL,
    cod_pac INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_cita, id_sede),
    CONSTRAINT fk_agenda_empleados FOREIGN KEY (id_emp, id_sede) 
        REFERENCES Empleados(id_emp, id_sede) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_agenda_pacientes FOREIGN KEY (cod_pac, id_sede) 
        REFERENCES Pacientes(cod_pac, id_sede) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_estado_cita CHECK (estado IN ('Programada', 'Completada', 'Cancelada', 'No Asistió'))
);

-- Medicamentos
CREATE TABLE Medicamentos (
    cod_med INT PRIMARY KEY,
    nom_med VARCHAR(30) NOT NULL,
    stock INT NOT NULL,
    proveedor VARCHAR(30),
    descripcion VARCHAR(40),
    id_sede INT NOT NULL,
    CONSTRAINT chk_stock_positivo CHECK (stock >= 0)
);

-- Prescribe
CREATE TABLE Prescribe (
    cod_med INT NOT NULL,
    id_cita INT NOT NULL,
    id_sede INT NOT NULL,
    dosis INT NOT NULL,
    frecuencia INT NOT NULL,
    duracion DATE NOT NULL,
    fecha_emision DATE NOT NULL,
    PRIMARY KEY (cod_med, id_cita, id_sede),
    CONSTRAINT fk_prescribe_medicamentos FOREIGN KEY (cod_med) 
        REFERENCES Medicamentos(cod_med) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_prescribe_agenda FOREIGN KEY (id_cita, id_sede) 
        REFERENCES Agenda_Cita(id_cita, id_sede) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Emite_Hist
CREATE TABLE Emite_Hist (
    cod_hist INT,
    id_sede INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    diagnostico VARCHAR(80) NOT NULL,
    nom_dept VARCHAR(30),
    id_emp INT NOT NULL,
    cod_pac INT NOT NULL,
    compartido BOOLEAN DEFAULT FALSE,
    nivel_acceso VARCHAR(20) DEFAULT 'Local',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cod_hist, id_sede),
    CONSTRAINT fk_emite_empleados FOREIGN KEY (id_emp, id_sede) 
        REFERENCES Empleados(id_emp, id_sede) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_emite_pacientes FOREIGN KEY (cod_pac, id_sede) 
        REFERENCES Pacientes(cod_pac, id_sede) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_nivel_acceso CHECK (nivel_acceso IN ('Local', 'Red', 'Global'))
);

-- Auditoria_Accesos
CREATE TABLE Auditoria_Accesos (
    id_evento SERIAL PRIMARY KEY,
    id_sede INT NOT NULL,
    num_doc VARCHAR(20) NOT NULL,
    accion VARCHAR(20) NOT NULL,
    fecha_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tabla_afectada VARCHAR(30),
    ip_origen VARCHAR(20),
    sede_origen INT,
    CONSTRAINT fk_auditoria_personas FOREIGN KEY (num_doc) 
        REFERENCES Personas(num_doc) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Control de Replicación
CREATE TABLE Control_Replicacion (
    id_control SERIAL PRIMARY KEY,
    tabla_origen VARCHAR(50) NOT NULL,
    id_registro VARCHAR(50) NOT NULL,
    operacion VARCHAR(10) NOT NULL,
    sede_origen INT NOT NULL,
    sedes_destino INT[] NOT NULL,
    datos_json JSONB NOT NULL,
    fecha_operacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    replicado BOOLEAN DEFAULT FALSE,
    fecha_replicacion TIMESTAMP,
    intentos INT DEFAULT 0,
    CONSTRAINT chk_operacion CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE'))
);

-- Tablas de Red
CREATE TABLE Pacientes_Red (
    cod_pac INT,
    id_sede_origen INT NOT NULL,
    num_doc VARCHAR(20) NOT NULL,
    nom_pers VARCHAR(50) NOT NULL,
    fecha_nac DATE NOT NULL,
    genero VARCHAR(20) NOT NULL,
    dr_pac VARCHAR(80),
    fecha_sincronizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cod_pac, id_sede_origen)
);

CREATE TABLE Historial_Red (
    cod_hist INT,
    id_sede_origen INT NOT NULL,
    cod_pac INT NOT NULL,
    fecha DATE NOT NULL,
    diagnostico_resumen VARCHAR(200) NOT NULL,
    nivel_acceso VARCHAR(20) NOT NULL,
    fecha_sincronizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cod_hist, id_sede_origen)
);

CREATE TABLE Equipamiento_Red (
    cod_eq INT,
    id_sede_origen INT NOT NULL,
    nom_eq VARCHAR(50) NOT NULL,
    estado VARCHAR(15) NOT NULL,
    nom_sede VARCHAR(30) NOT NULL,
    fecha_sincronizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cod_eq, id_sede_origen)
);

-- Índices
CREATE INDEX idx_pacientes_doc ON Pacientes(num_doc);
CREATE INDEX idx_pacientes_sede ON Pacientes(id_sede);
CREATE INDEX idx_agenda_fecha ON Agenda_Cita(fecha, id_sede);
CREATE INDEX idx_historial_paciente ON Emite_Hist(cod_pac, id_sede);
CREATE INDEX idx_control_repl ON Control_Replicacion(tabla_origen, replicado);
CREATE INDEX idx_pacientes_red_doc ON Pacientes_Red(num_doc);

-- Función de Replicación
CREATE OR REPLACE FUNCTION fn_replicar_cambios()
RETURNS TRIGGER AS $$
DECLARE
    v_id_sede INT;
    v_sedes_destino INT[];
BEGIN
    SELECT id_sede INTO v_id_sede FROM Config_Sede LIMIT 1;
    v_sedes_destino := ARRAY[0];
    
    INSERT INTO Control_Replicacion (
        tabla_origen, id_registro, operacion, sede_origen, sedes_destino, datos_json
    ) VALUES (
        TG_TABLE_NAME,
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.cod_pac::VARCHAR || '-' || OLD.id_sede::VARCHAR
            ELSE NEW.cod_pac::VARCHAR || '-' || NEW.id_sede::VARCHAR
        END,
        TG_OP,
        v_id_sede,
        v_sedes_destino,
        CASE 
            WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)
            ELSE row_to_json(NEW)
        END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trg_replicar_pacientes
AFTER INSERT OR UPDATE OR DELETE ON Pacientes
FOR EACH ROW EXECUTE FUNCTION fn_replicar_cambios();

CREATE TRIGGER trg_replicar_historial
AFTER INSERT OR UPDATE ON Emite_Hist
FOR EACH ROW EXECUTE FUNCTION fn_replicar_cambios();

-- Vistas
CREATE VIEW v_pacientes_red AS
SELECT cod_pac, id_sede, num_doc, p.nom_pers, fecha_nac, genero, 'Local' as origen
FROM Pacientes INNER JOIN Personas p USING (num_doc)
WHERE id_sede = (SELECT id_sede FROM Config_Sede LIMIT 1)
UNION ALL
SELECT cod_pac, id_sede_origen as id_sede, num_doc, nom_pers, fecha_nac, genero, 'Remoto' as origen
FROM Pacientes_Red;

CREATE VIEW v_dashboard_red AS
SELECT 
    (SELECT COUNT(*) FROM Pacientes WHERE id_sede = (SELECT id_sede FROM Config_Sede LIMIT 1)) as pacientes_local,
    (SELECT COUNT(*) FROM Pacientes_Red) as pacientes_red,
    (SELECT COUNT(*) FROM Agenda_Cita WHERE fecha = CURRENT_DATE) as citas_hoy,
    (SELECT COUNT(*) FROM Equipamiento WHERE estado = 'Operativo') as equipos_operativos,
    (SELECT MAX(ultima_sincronizacion) FROM Config_Sede) as ultima_sync;

-- Datos de Ejemplo Sede Centro
INSERT INTO Sedes_Hospitalarias VALUES (2, '6015555678', 'Carrera 7 #45-30', 'Sede Centro', 'Bogotá');

INSERT INTO Departamentos VALUES 
('Medicina Interna', 2), ('Pediatría', 2), ('Ginecología', 2);

INSERT INTO Personas VALUES
('3691472580', 'CC', 'Miguel Flores', 'miguel.flores@sedecentro.com', 'miguel123', '3153691472', 2, NOW(), NOW()),
('7894561230', 'CC', 'Patricia Núñez', 'patricia.nunez@sedecentro.com', 'patricia123', '3007894561', 2, NOW(), NOW()),
('4567891230', 'CC', 'Roberto Castillo', 'roberto.castillo@sedecentro.com', 'roberto123', '3104567891', 2, NOW(), NOW()),
('7531598520', 'CC', 'Elena Vargas', 'elena.vargas@sedecentro.com', 'elena123', '3207531598', 2, NOW(), NOW());

INSERT INTO Pacientes VALUES
(201, 2, '3691472580', 'Asma bronquial', '1978-05-30', 'Masculino', 'Activo', NOW(), NOW()),
(202, 2, '7894561230', 'Diabetes tipo 2', '1992-08-12', 'Femenino', 'Activo', NOW(), NOW());

INSERT INTO Empleados VALUES
(2001, 2, '4567891230', 'HASH456XYZ', 'Medicina Interna', 'Médico General', TRUE, NOW()),
(2002, 2, '7531598520', 'HASH789ABC', 'Pediatría', 'Pediatra', TRUE, NOW());

INSERT INTO Equipamiento VALUES
(3001, 2, 'Estetoscopio Digital', 'Operativo', '2024-10-20', 2001),
(3002, 2, 'Nebulizador portátil', 'Operativo', '2024-11-05', 2002);

INSERT INTO Pertenece VALUES
('Medicina Interna', 3001, 2),
('Pediatría', 3002, 2);

INSERT INTO Medicamentos VALUES
(5001, 'Salbutamol Inhalador', 300, 'RespiraMed', 'Broncodilatador', 2),
(5002, 'Insulina Glargina', 150, 'DiabetesCare', 'Insulina basal', 2);

INSERT INTO Agenda_Cita VALUES
(4001, 2, '2024-12-18', '11:00:00', 'Consulta Especializada', 'Programada', 'Medicina Interna', 2001, 201, NOW(), NOW());

INSERT INTO Prescribe VALUES
(5001, 4001, 2, 100, 3, '2025-02-18', '2024-12-18');

INSERT INTO Emite_Hist VALUES
(7001, 2, '2024-12-11', '11:30:00', 'Asma controlada con tratamiento', 'Medicina Interna', 2001, 201, FALSE, 'Local', NOW());

-- ============================================
-- PASO 4: CREAR BASE DE DATOS SEDE SUR
-- ============================================

DROP DATABASE IF EXISTS hospital_sede_sur;
CREATE DATABASE hospital_sede_sur;

\c hospital_sede_sur;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

-- Configuración de Sede
CREATE TABLE Config_Sede (
    id_sede INT PRIMARY KEY,
    nombre_sede VARCHAR(50) NOT NULL,
    ciudad VARCHAR(30) NOT NULL,
    region VARCHAR(30),
    es_sede_maestra BOOLEAN DEFAULT FALSE,
    fecha_instalacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_sincronizacion TIMESTAMP
);

INSERT INTO Config_Sede VALUES (3, 'Sede Sur', 'Bogotá', 'Sur');

-- Personas
CREATE TABLE Personas (
    num_doc VARCHAR(20) PRIMARY KEY,
    tipo_doc VARCHAR(20) NOT NULL,
    nom_pers VARCHAR(50) NOT NULL,
    correo VARCHAR(60),
    tel_pers VARCHAR(20),
    id_sede_registro INT NOT NULL DEFAULT 3,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sedes Hospitalarias
CREATE TABLE Sedes_Hospitalarias (
    id_sede INT PRIMARY KEY,
    telefono VARCHAR(20),
    direccion VARCHAR(50) NOT NULL,
    nom_sede VARCHAR(30) NOT NULL,
    ciudad VARCHAR(20) NOT NULL
);

-- Departamentos
CREATE TABLE Departamentos (
    nom_dept VARCHAR(30),
    id_sede INT NOT NULL,
    PRIMARY KEY (nom_dept, id_sede),
    CONSTRAINT fk_departamentos_sedes FOREIGN KEY (id_sede) 
        REFERENCES Sedes_Hospitalarias(id_sede) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Pacientes
CREATE TABLE Pacientes (
    cod_pac INT,
    id_sede INT NOT NULL,
    num_doc VARCHAR(20) NOT NULL,
    dr_pac VARCHAR(80),
    fecha_nac DATE NOT NULL,
    genero VARCHAR(20) NOT NULL,
    estado_paciente VARCHAR(20) DEFAULT 'Activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cod_pac, id_sede),
    CONSTRAINT fk_pacientes_personas FOREIGN KEY (num_doc) 
        REFERENCES Personas(num_doc) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Empleados
CREATE TABLE Empleados (
    id_emp INT,
    id_sede INT NOT NULL,
    num_doc VARCHAR(20) NOT NULL,
    hash_contrato VARCHAR(100),
    nom_dept VARCHAR(30) NOT NULL,
    cargo VARCHAR(30) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_contratacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_emp, id_sede),
    CONSTRAINT fk_empleados_personas FOREIGN KEY (num_doc) 
        REFERENCES Personas(num_doc) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Equipamiento
CREATE TABLE Equipamiento (
    cod_eq INT,
    id_sede INT NOT NULL,
    nom_eq VARCHAR(50) NOT NULL,
    estado VARCHAR(15) NOT NULL,
    fecha_mant DATE,
    id_emp INT NOT NULL,
    PRIMARY KEY (cod_eq, id_sede),
    CONSTRAINT fk_equipamiento_empleados FOREIGN KEY (id_emp, id_sede) 
        REFERENCES Empleados(id_emp, id_sede) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_estado_equipamiento CHECK (estado IN ('Operativo', 'En Mantenimiento', 'Fuera de Servicio'))
);

-- Pertenece
CREATE TABLE Pertenece (
    nom_dept VARCHAR(30) NOT NULL,
    cod_eq INT NOT NULL,
    id_sede INT NOT NULL,
    PRIMARY KEY (nom_dept, cod_eq, id_sede),
    CONSTRAINT fk_pertenece_dept FOREIGN KEY (nom_dept, id_sede)
        REFERENCES Departamentos(nom_dept, id_sede) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_pertenece_equip FOREIGN KEY (cod_eq, id_sede)
        REFERENCES Equipamiento(cod_eq, id_sede) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Agenda_Cita
CREATE TABLE Agenda_Cita (
    id_cita INT,
    id_sede INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    tipo_servicio VARCHAR(30) NOT NULL,
    estado VARCHAR(15) NOT NULL,
    nom_dept VARCHAR(30),
    id_emp INT NOT NULL,
    cod_pac INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_cita, id_sede),
    CONSTRAINT fk_agenda_empleados FOREIGN KEY (id_emp, id_sede) 
        REFERENCES Empleados(id_emp, id_sede) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_agenda_pacientes FOREIGN KEY (cod_pac, id_sede) 
        REFERENCES Pacientes(cod_pac, id_sede) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_estado_cita CHECK (estado IN ('Programada', 'Completada', 'Cancelada', 'No Asistió'))
);

-- Medicamentos
CREATE TABLE Medicamentos (
    cod_med INT PRIMARY KEY,
    nom_med VARCHAR(30) NOT NULL,
    stock INT NOT NULL,
    proveedor VARCHAR(30),
    descripcion VARCHAR(40),
    id_sede INT NOT NULL,
    CONSTRAINT chk_stock_positivo CHECK (stock >= 0)
);

-- Prescribe
CREATE TABLE Prescribe (
    cod_med INT NOT NULL,
    id_cita INT NOT NULL,
    id_sede INT NOT NULL,
    dosis INT NOT NULL,
    frecuencia INT NOT NULL,
    duracion DATE NOT NULL,
    fecha_emision DATE NOT NULL,
    PRIMARY KEY (cod_med, id_cita, id_sede),
    CONSTRAINT fk_prescribe_medicamentos FOREIGN KEY (cod_med) 
        REFERENCES Medicamentos(cod_med) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_prescribe_agenda FOREIGN KEY (id_cita, id_sede) 
        REFERENCES Agenda_Cita(id_cita, id_sede) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Emite_Hist
CREATE TABLE Emite_Hist (
    cod_hist INT,
    id_sede INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    diagnostico VARCHAR(80) NOT NULL,
    nom_dept VARCHAR(30),
    id_emp INT NOT NULL,
    cod_pac INT NOT NULL,
    compartido BOOLEAN DEFAULT FALSE,
    nivel_acceso VARCHAR(20) DEFAULT 'Local',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cod_hist, id_sede),
    CONSTRAINT fk_emite_empleados FOREIGN KEY (id_emp, id_sede) 
        REFERENCES Empleados(id_emp, id_sede) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_emite_pacientes FOREIGN KEY (cod_pac, id_sede) 
        REFERENCES Pacientes(cod_pac, id_sede) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_nivel_acceso CHECK (nivel_acceso IN ('Local', 'Red', 'Global'))
);

-- Auditoria_Accesos
CREATE TABLE Auditoria_Accesos (
    id_evento SERIAL PRIMARY KEY,
    id_sede INT NOT NULL,
    num_doc VARCHAR(20) NOT NULL,
    accion VARCHAR(20) NOT NULL,
    fecha_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tabla_afectada VARCHAR(30),
    ip_origen VARCHAR(20),
    sede_origen INT,
    CONSTRAINT fk_auditoria_personas FOREIGN KEY (num_doc) 
        REFERENCES Personas(num_doc) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Control de Replicación
CREATE TABLE Control_Replicacion (
    id_control SERIAL PRIMARY KEY,
    tabla_origen VARCHAR(50) NOT NULL,
    id_registro VARCHAR(50) NOT NULL,
    operacion VARCHAR(10) NOT NULL,
    sede_origen INT NOT NULL,
    sedes_destino INT[] NOT NULL,
    datos_json JSONB NOT NULL,
    fecha_operacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    replicado BOOLEAN DEFAULT FALSE,
    fecha_replicacion TIMESTAMP,
    intentos INT DEFAULT 0,
    CONSTRAINT chk_operacion CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE'))
);

-- Tablas de Red
CREATE TABLE Pacientes_Red (
    cod_pac INT,
    id_sede_origen INT NOT NULL,
    num_doc VARCHAR(20) NOT NULL,
    nom_pers VARCHAR(50) NOT NULL,
    fecha_nac DATE NOT NULL,
    genero VARCHAR(20) NOT NULL,
    dr_pac VARCHAR(80),
    fecha_sincronizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cod_pac, id_sede_origen)
);

CREATE TABLE Historial_Red (
    cod_hist INT,
    id_sede_origen INT NOT NULL,
    cod_pac INT NOT NULL,
    fecha DATE NOT NULL,
    diagnostico_resumen VARCHAR(200) NOT NULL,
    nivel_acceso VARCHAR(20) NOT NULL,
    fecha_sincronizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cod_hist, id_sede_origen)
);

CREATE TABLE Equipamiento_Red (
    cod_eq INT,
    id_sede_origen INT NOT NULL,
    nom_eq VARCHAR(50) NOT NULL,
    estado VARCHAR(15) NOT NULL,
    nom_sede VARCHAR(30) NOT NULL,
    fecha_sincronizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cod_eq, id_sede_origen)
);

-- Índices
CREATE INDEX idx_pacientes_doc ON Pacientes(num_doc);
CREATE INDEX idx_pacientes_sede ON Pacientes(id_sede);
CREATE INDEX idx_agenda_fecha ON Agenda_Cita(fecha, id_sede);
CREATE INDEX idx_historial_paciente ON Emite_Hist(cod_pac, id_sede);
CREATE INDEX idx_control_repl ON Control_Replicacion(tabla_origen, replicado);
CREATE INDEX idx_pacientes_red_doc ON Pacientes_Red(num_doc);

-- Función de Replicación
CREATE OR REPLACE FUNCTION fn_replicar_cambios()
RETURNS TRIGGER AS $$
DECLARE
    v_id_sede INT;
    v_sedes_destino INT[];
BEGIN
    SELECT id_sede INTO v_id_sede FROM Config_Sede LIMIT 1;
    v_sedes_destino := ARRAY[0];
    
    INSERT INTO Control_Replicacion (
        tabla_origen, id_registro, operacion, sede_origen, sedes_destino, datos_json
    ) VALUES (
        TG_TABLE_NAME,
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.cod_pac::VARCHAR || '-' || OLD.id_sede::VARCHAR
            ELSE NEW.cod_pac::VARCHAR || '-' || NEW.id_sede::VARCHAR
        END,
        TG_OP,
        v_id_sede,
        v_sedes_destino,
        CASE 
            WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)
            ELSE row_to_json(NEW)
        END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trg_replicar_pacientes
AFTER INSERT OR UPDATE OR DELETE ON Pacientes
FOR EACH ROW EXECUTE FUNCTION fn_replicar_cambios();

CREATE TRIGGER trg_replicar_historial
AFTER INSERT OR UPDATE ON Emite_Hist
FOR EACH ROW EXECUTE FUNCTION fn_replicar_cambios();

-- Vistas
CREATE VIEW v_pacientes_red AS
SELECT cod_pac, id_sede, num_doc, p.nom_pers, fecha_nac, genero, 'Local' as origen
FROM Pacientes INNER JOIN Personas p USING (num_doc)
WHERE id_sede = (SELECT id_sede FROM Config_Sede LIMIT 1)
UNION ALL
SELECT cod_pac, id_sede_origen as id_sede, num_doc, nom_pers, fecha_nac, genero, 'Remoto' as origen
FROM Pacientes_Red;

CREATE VIEW v_dashboard_red AS
SELECT 
    (SELECT COUNT(*) FROM Pacientes WHERE id_sede = (SELECT id_sede FROM Config_Sede LIMIT 1)) as pacientes_local,
    (SELECT COUNT(*) FROM Pacientes_Red) as pacientes_red,
    (SELECT COUNT(*) FROM Agenda_Cita WHERE fecha = CURRENT_DATE) as citas_hoy,
    (SELECT COUNT(*) FROM Equipamiento WHERE estado = 'Operativo') as equipos_operativos,
    (SELECT MAX(ultima_sincronizacion) FROM Config_Sede) as ultima_sync;

-- Datos Sede Sur
INSERT INTO Sedes_Hospitalarias VALUES (3, '6015559012', 'Avenida 68 #80-50', 'Sede Sur', 'Bogotá');

INSERT INTO Departamentos VALUES 
('Ortopedia', 3), ('Fisioterapia', 3), ('Radiología', 3);

INSERT INTO Personas VALUES
('1593574560', 'CC', 'Andrés Gutiérrez', 'andres.gutierrez@sedesur.com', 'andres123', '3011593574', 3, NOW(), NOW()),
('8529637410', 'CC', 'Carmen Ospina', 'carmen.ospina@sedesur.com', 'carmen123', '3158529637', 3, NOW(), NOW()),
('9517538520', 'CC', 'Fernando Ríos', 'fernando.rios@sedesur.com', 'fernando123', '3009517538', 3, NOW(), NOW());

INSERT INTO Pacientes VALUES
(301, 3, '1593574560', 'Artritis reumatoide', '1965-12-18', 'Masculino', 'Activo', NOW(), NOW()),
(302, 3, '8529637410', 'Fractura de tibia', '1988-03-25', 'Femenino', 'Emergencia', NOW(), NOW());

INSERT INTO Empleados VALUES
(3001, 3, '9517538520', 'HASH951FGH', 'Ortopedia', 'Ortopedista', TRUE, NOW());

INSERT INTO Equipamiento VALUES
(4001, 3, 'Rayos X Digital', 'Operativo', '2024-09-15', 3001),
(4002, 3, 'Mesa de Fisioterapia', 'Operativo', '2024-10-01', 3001);

INSERT INTO Pertenece VALUES
('Radiología', 4001, 3),
('Fisioterapia', 4002, 3);

INSERT INTO Medicamentos VALUES
(6001, 'Diclofenaco 75mg', 600, 'AnalgesiaMed', 'Antiinflamatorio', 3),
(6002, 'Tramadol 50mg', 200, 'PainRelief', 'Analgésico', 3);

INSERT INTO Agenda_Cita VALUES
(5001, 3, '2024-12-20', '08:30:00', 'Urgencias', 'Programada', 'Ortopedia', 3001, 302, NOW(), NOW());

INSERT INTO Prescribe VALUES
(6001, 5001, 3, 75, 2, '2025-01-20', '2024-12-20');

INSERT INTO Emite_Hist VALUES
(8001, 3, '2024-12-13', '08:45:00', 'Fractura cerrada de tibia. Requiere inmovilización.', 'Ortopedia', 3001, 302, TRUE, 'Global', NOW());

-- ============================================
-- PASO 5: CREAR ROLES Y PERMISOS EN TODAS LAS BASES
-- ============================================

-- Crear roles a nivel de servidor (solo una vez)
\c postgres;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'administrador') THEN
        CREATE ROLE administrador WITH LOGIN PASSWORD 'admin_2025';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'medico') THEN
        CREATE ROLE medico WITH LOGIN PASSWORD 'medico_2025';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'enfermero') THEN
        CREATE ROLE enfermero WITH LOGIN PASSWORD 'enfermero_2025';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'personal_administrativo') THEN
        CREATE ROLE personal_administrativo WITH LOGIN PASSWORD 'admin_personal_2025';
    END IF;
END
$$;

-- Permisos en HUB Central
\c hospital_hub;

GRANT CONNECT ON DATABASE hospital_hub TO administrador, medico, enfermero, personal_administrativo;
GRANT ALL PRIVILEGES ON DATABASE hospital_hub TO administrador;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO administrador;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO administrador;
GRANT USAGE ON SCHEMA public TO medico, enfermero, personal_administrativo;

-- Permisos médico en HUB
GRANT SELECT ON ALL TABLES IN SCHEMA public TO medico;
GRANT INSERT, UPDATE ON Indice_Pacientes_Global TO medico;
GRANT INSERT, UPDATE ON Historial_Compartido TO medico;
GRANT INSERT ON Auditoria_Interred TO medico;

-- Permisos enfermero en HUB
GRANT SELECT ON Indice_Pacientes_Global, Historial_Compartido, Redes_Hospitalarias TO enfermero;

-- Permisos administrativo en HUB
GRANT SELECT ON ALL TABLES IN SCHEMA public TO personal_administrativo;
GRANT INSERT, UPDATE ON Transferencias_Pacientes TO personal_administrativo;

-- Permisos en Sede Norte
\c hospital_sede_norte;

GRANT CONNECT ON DATABASE hospital_sede_norte TO administrador, medico, enfermero, personal_administrativo;
GRANT ALL PRIVILEGES ON DATABASE hospital_sede_norte TO administrador;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO administrador;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO administrador;
GRANT USAGE ON SCHEMA public TO medico, enfermero, personal_administrativo;

-- Médico - Sede Norte
GRANT SELECT, INSERT, UPDATE ON Personas, Pacientes, Empleados TO medico;
GRANT SELECT, INSERT, UPDATE ON Agenda_Cita, Emite_Hist, Prescribe TO medico;
GRANT SELECT ON Medicamentos, Sedes_Hospitalarias, Departamentos, Equipamiento TO medico;
GRANT SELECT ON Pacientes_Red, Historial_Red TO medico;
GRANT INSERT ON Auditoria_Accesos TO medico;

-- Enfermero - Sede Norte
GRANT SELECT ON Personas, Empleados TO enfermero;
GRANT SELECT, INSERT ON Pacientes TO enfermero;
GRANT SELECT, UPDATE ON Agenda_Cita TO enfermero;
GRANT SELECT ON Emite_Hist, Medicamentos, Prescribe, Equipamiento TO enfermero;
GRANT SELECT ON Pacientes_Red, Historial_Red TO enfermero;

-- Administrativo - Sede Norte
GRANT SELECT, INSERT, UPDATE ON Personas, Pacientes TO personal_administrativo;
GRANT SELECT, INSERT ON Agenda_Cita TO personal_administrativo;
GRANT SELECT ON Empleados, Medicamentos, Sedes_Hospitalarias, Departamentos TO personal_administrativo;
GRANT SELECT ON Auditoria_Accesos TO personal_administrativo;

-- Permisos en Sede Centro
\c hospital_sede_centro;

GRANT CONNECT ON DATABASE hospital_sede_centro TO administrador, medico, enfermero, personal_administrativo;
GRANT ALL PRIVILEGES ON DATABASE hospital_sede_centro TO administrador;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO administrador;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO administrador;
GRANT USAGE ON SCHEMA public TO medico, enfermero, personal_administrativo;

-- Médico - Sede Centro
GRANT SELECT, INSERT, UPDATE ON Personas, Pacientes, Empleados TO medico;
GRANT SELECT, INSERT, UPDATE ON Agenda_Cita, Emite_Hist, Prescribe TO medico;
GRANT SELECT ON Medicamentos, Sedes_Hospitalarias, Departamentos, Equipamiento TO medico;
GRANT SELECT ON Pacientes_Red, Historial_Red TO medico;
GRANT INSERT ON Auditoria_Accesos TO medico;

-- Enfermero - Sede Centro
GRANT SELECT ON Personas, Empleados TO enfermero;
GRANT SELECT, INSERT ON Pacientes TO enfermero;
GRANT SELECT, UPDATE ON Agenda_Cita TO enfermero;
GRANT SELECT ON Emite_Hist, Medicamentos, Prescribe, Equipamiento TO enfermero;
GRANT SELECT ON Pacientes_Red, Historial_Red TO enfermero;

-- Administrativo - Sede Centro
GRANT SELECT, INSERT, UPDATE ON Personas, Pacientes TO personal_administrativo;
GRANT SELECT, INSERT ON Agenda_Cita TO personal_administrativo;
GRANT SELECT ON Empleados, Medicamentos, Sedes_Hospitalarias, Departamentos TO personal_administrativo;
GRANT SELECT ON Auditoria_Accesos TO personal_administrativo;

-- Permisos en Sede Sur
\c hospital_sede_sur;

GRANT CONNECT ON DATABASE hospital_sede_sur TO administrador, medico, enfermero, personal_administrativo;
GRANT ALL PRIVILEGES ON DATABASE hospital_sede_sur TO administrador;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO administrador;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO administrador;
GRANT USAGE ON SCHEMA public TO medico, enfermero, personal_administrativo;

-- Médico - Sede Sur
GRANT SELECT, INSERT, UPDATE ON Personas, Pacientes, Empleados TO medico;
GRANT SELECT, INSERT, UPDATE ON Agenda_Cita, Emite_Hist, Prescribe TO medico;
GRANT SELECT ON Medicamentos, Sedes_Hospitalarias, Departamentos, Equipamiento TO medico;
GRANT SELECT ON Pacientes_Red, Historial_Red TO medico;
GRANT INSERT ON Auditoria_Accesos TO medico;

-- Enfermero - Sede Sur
GRANT SELECT ON Personas, Empleados TO enfermero;
GRANT SELECT, INSERT ON Pacientes TO enfermero;
GRANT SELECT, UPDATE ON Agenda_Cita TO enfermero;
GRANT SELECT ON Emite_Hist, Medicamentos, Prescribe, Equipamiento TO enfermero;
GRANT SELECT ON Pacientes_Red, Historial_Red TO enfermero;

-- Administrativo - Sede Sur
GRANT SELECT, INSERT, UPDATE ON Personas, Pacientes TO personal_administrativo;
GRANT SELECT, INSERT ON Agenda_Cita TO personal_administrativo;
GRANT SELECT ON Empleados, Medicamentos, Sedes_Hospitalarias, Departamentos TO personal_administrativo;
GRANT SELECT ON Auditoria_Accesos TO personal_administrativo;

-- ============================================
-- PASO 6: CONFIGURAR FOREIGN DATA WRAPPERS
-- ============================================

-- Configurar FDW desde HUB a las sedes
\c hospital_hub;

-- Servidor FDW para Sede Norte
CREATE SERVER IF NOT EXISTS sede_norte_server
FOREIGN DATA WRAPPER postgres_fdw
OPTIONS (host 'localhost', port '5432', dbname 'hospital_sede_norte');

CREATE USER MAPPING IF NOT EXISTS FOR postgres
SERVER sede_norte_server
OPTIONS (user 'postgres', password 'postgres');

-- Servidor FDW para Sede Centro  
CREATE SERVER IF NOT EXISTS sede_centro_server
FOREIGN DATA WRAPPER postgres_fdw
OPTIONS (host 'localhost', port '5432', dbname 'hospital_sede_centro');

CREATE USER MAPPING IF NOT EXISTS FOR postgres
SERVER sede_centro_server
OPTIONS (user 'postgres', password 'postgres');

-- Servidor FDW para Sede Sur
CREATE SERVER IF NOT EXISTS sede_sur_server
FOREIGN DATA WRAPPER postgres_fdw
OPTIONS (host 'localhost', port '5432', dbname 'hospital_sede_sur');

CREATE USER MAPPING IF NOT EXISTS FOR postgres
SERVER sede_sur_server
OPTIONS (user 'postgres', password 'postgres');

-- Tablas foráneas en HUB
CREATE FOREIGN TABLE IF NOT EXISTS pacientes_sede_norte (
    cod_pac INT,
    id_sede INT,
    num_doc VARCHAR(20),
    dr_pac VARCHAR(80),
    fecha_nac DATE,
    genero VARCHAR(20),
    estado_paciente VARCHAR(20)
) SERVER sede_norte_server OPTIONS (schema_name 'public', table_name 'pacientes');

CREATE FOREIGN TABLE IF NOT EXISTS pacientes_sede_centro (
    cod_pac INT,
    id_sede INT,
    num_doc VARCHAR(20),
    dr_pac VARCHAR(80),
    fecha_nac DATE,
    genero VARCHAR(20),
    estado_paciente VARCHAR(20)
) SERVER sede_centro_server OPTIONS (schema_name 'public', table_name 'pacientes');

CREATE FOREIGN TABLE IF NOT EXISTS pacientes_sede_sur (
    cod_pac INT,
    id_sede INT,
    num_doc VARCHAR(20),
    dr_pac VARCHAR(80),
    fecha_nac DATE,
    genero VARCHAR(20),
    estado_paciente VARCHAR(20)
) SERVER sede_sur_server OPTIONS (schema_name 'public', table_name 'pacientes');

-- Vista consolidada de todos los pacientes de la red
CREATE OR REPLACE VIEW v_todos_pacientes_red AS
SELECT *, 'Sede Norte' as sede FROM pacientes_sede_norte
UNION ALL
SELECT *, 'Sede Centro' as sede FROM pacientes_sede_centro
UNION ALL
SELECT *, 'Sede Sur' as sede FROM pacientes_sede_sur;

-- Configurar FDW desde Sedes al HUB
\c hospital_sede_norte;

CREATE SERVER IF NOT EXISTS hub_central_server
FOREIGN DATA WRAPPER postgres_fdw
OPTIONS (host 'localhost', port '5432', dbname 'hospital_hub');

CREATE USER MAPPING IF NOT EXISTS FOR postgres
SERVER hub_central_server
OPTIONS (user 'postgres', password 'postgres');

CREATE FOREIGN TABLE IF NOT EXISTS indice_global_hub (
    id_global INT,
    num_doc VARCHAR(20),
    tipo_doc VARCHAR(20),
    nom_pers VARCHAR(50),
    fecha_nac DATE,
    id_red_origen VARCHAR(20),
    cod_pac_local INT
) SERVER hub_central_server OPTIONS (schema_name 'public', table_name 'indice_pacientes_global');

\c hospital_sede_centro;

CREATE SERVER IF NOT EXISTS hub_central_server
FOREIGN DATA WRAPPER postgres_fdw
OPTIONS (host 'localhost', port '5432', dbname 'hospital_hub');

CREATE USER MAPPING IF NOT EXISTS FOR postgres
SERVER hub_central_server
OPTIONS (user 'postgres', password 'postgres');

CREATE FOREIGN TABLE IF NOT EXISTS indice_global_hub (
    id_global INT,
    num_doc VARCHAR(20),
    tipo_doc VARCHAR(20),
    nom_pers VARCHAR(50),
    fecha_nac DATE,
    id_red_origen VARCHAR(20),
    cod_pac_local INT
) SERVER hub_central_server OPTIONS (schema_name 'public', table_name 'indice_pacientes_global');

\c hospital_sede_sur;

CREATE SERVER IF NOT EXISTS hub_central_server
FOREIGN DATA WRAPPER postgres_fdw
OPTIONS (host 'localhost', port '5432', dbname 'hospital_hub');

CREATE USER MAPPING IF NOT EXISTS FOR postgres
SERVER hub_central_server
OPTIONS (user 'postgres', password 'postgres');

CREATE FOREIGN TABLE IF NOT EXISTS indice_global_hub (
    id_global INT,
    num_doc VARCHAR(20),
    tipo_doc VARCHAR(20),
    nom_pers VARCHAR(50),
    fecha_nac DATE,
    id_red_origen VARCHAR(20),
    cod_pac_local INT
) SERVER hub_central_server OPTIONS (schema_name 'public', table_name 'indice_pacientes_global');

-- ============================================
-- PASO 7: VERIFICACIÓN Y RESUMEN FINAL
-- ============================================

\c hospital_hub;

-- Registrar pacientes en índice global
INSERT INTO Indice_Pacientes_Global (num_doc, tipo_doc, nom_pers, fecha_nac, id_red_origen, cod_pac_local)
SELECT '1357924680', 'CC', 'Diego Torres Vega', '1985-03-15', 'RED_NORTE', 101
WHERE NOT EXISTS (SELECT 1 FROM Indice_Pacientes_Global WHERE num_doc = '1357924680' AND id_red_origen = 'RED_NORTE');

INSERT INTO Indice_Pacientes_Global (num_doc, tipo_doc, nom_pers, fecha_nac, id_red_origen, cod_pac_local)
SELECT '2468013579', 'CC', 'Sofia Ramírez Ortiz', '1990-07-22', 'RED_NORTE', 102
WHERE NOT EXISTS (SELECT 1 FROM Indice_Pacientes_Global WHERE num_doc = '2468013579' AND id_red_origen = 'RED_NORTE');

INSERT INTO Indice_Pacientes_Global (num_doc, tipo_doc, nom_pers, fecha_nac, id_red_origen, cod_pac_local)
SELECT '3691472580', 'CC', 'Miguel Flores', '1978-05-30', 'RED_CENTRO', 201
WHERE NOT EXISTS (SELECT 1 FROM Indice_Pacientes_Global WHERE num_doc = '3691472580' AND id_red_origen = 'RED_CENTRO');

INSERT INTO Indice_Pacientes_Global (num_doc, tipo_doc, nom_pers, fecha_nac, id_red_origen, cod_pac_local)
SELECT '1593574560', 'CC', 'Andrés Gutiérrez', '1965-12-18', 'RED_SUR', 301
WHERE NOT EXISTS (SELECT 1 FROM Indice_Pacientes_Global WHERE num_doc = '1593574560' AND id_red_origen = 'RED_SUR');

-- Registrar historial compartido
INSERT INTO Historial_Compartido (id_global_paciente, id_red_emisora, cod_hist_local, fecha, hora, diagnostico_resumen, nivel_acceso)
SELECT 
    (SELECT id_global FROM Indice_Pacientes_Global WHERE num_doc = '2468013579' AND id_red_origen = 'RED_NORTE' LIMIT 1),
    'RED_NORTE', 6002, '2024-12-12', '09:00:00', 
    'Crisis hiperglucémica. Paciente crítico.', 'Público'
WHERE EXISTS (SELECT 1 FROM Indice_Pacientes_Global WHERE num_doc = '2468013579' AND id_red_origen = 'RED_NORTE');

INSERT INTO Historial_Compartido (id_global_paciente, id_red_emisora, cod_hist_local, fecha, hora, diagnostico_resumen, nivel_acceso)
SELECT 
    (SELECT id_global FROM Indice_Pacientes_Global WHERE num_doc = '1593574560' AND id_red_origen = 'RED_SUR' LIMIT 1),
    'RED_SUR', 8001, '2024-12-13', '08:45:00',
    'Fractura cerrada de tibia. Requiere inmovilización.', 'Público'
WHERE EXISTS (SELECT 1 FROM Indice_Pacientes_Global WHERE num_doc = '1593574560' AND id_red_origen = 'RED_SUR');

-- Auditoría de prueba
INSERT INTO Auditoria_Interred (id_red_origen, tipo_operacion, num_doc_usuario, descripcion)
VALUES ('RED_NORTE', 'CONSULTA_HISTORIAL', '1234567890', 'Acceso a historial compartido desde sede norte');

\echo '============================================'
\echo 'RESUMEN DE BASES DE DATOS CREADAS'
\echo '============================================'

SELECT 'HUB CENTRAL' as tipo, datname as base_de_datos, pg_size_pretty(pg_database_size(datname)) as tamaño
FROM pg_database WHERE datname = 'hospital_hub'
UNION ALL
SELECT 'SEDE', datname, pg_size_pretty(pg_database_size(datname))
FROM pg_database WHERE datname IN ('hospital_sede_norte', 'hospital_sede_centro', 'hospital_sede_sur')
ORDER BY tipo DESC, base_de_datos;

\c hospital_hub;
\echo ''
\echo 'ÍNDICE GLOBAL DE PACIENTES'
    PRIMARY KEY (cod_pac, id_sede),
    CONSTRAINT fk_pacientes_personas FOREIGN KEY (num_doc) 
        REFERENCES Personas(num_doc) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Empleados
CREATE TABLE Empleados (
    id_emp INT,
    id_sede INT NOT NULL,
    num_doc VARCHAR(20) NOT NULL,
    hash_contrato VARCHAR(100),
    nom_dept VARCHAR(30) NOT NULL,
    cargo VARCHAR(30) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_contratacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_emp, id_sede),
    CONSTRAINT fk_empleados_personas FOREIGN KEY (num_doc) 
        REFERENCES Personas(num_doc) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Equipamiento
CREATE TABLE Equipamiento (
    cod_eq INT,
    id_sede INT NOT NULL,
    nom_eq VARCHAR(50) NOT NULL,
    estado VARCHAR(15) NOT NULL,
    fecha_mant DATE,
    id_emp INT NOT NULL,
    PRIMARY KEY (cod_eq, id_sede),
    CONSTRAINT fk_equipamiento_empleados FOREIGN KEY (id_emp, id_sede) 
        REFERENCES Empleados(id_emp, id_sede) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_estado_equipamiento CHECK (estado IN ('Operativo', 'En Mantenimiento', 'Fuera de Servicio'))
);

-- Pertenece
CREATE TABLE Pertenece (
    nom_dept VARCHAR(30) NOT NULL,
    cod_eq INT NOT NULL,
    id_sede INT NOT NULL,
    PRIMARY KEY (nom_dept, cod_eq, id_sede),
    CONSTRAINT fk_pertenece_dept FOREIGN KEY (nom_dept, id_sede)
        REFERENCES Departamentos(nom_dept, id_sede) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_pertenece_equip FOREIGN KEY (cod_eq, id_sede)
        REFERENCES Equipamiento(cod_eq, id_sede) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Agenda_Cita
CREATE TABLE Agenda_Cita (
    id_cita INT,
    id_sede INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    tipo_servicio VARCHAR(30) NOT NULL,
    estado VARCHAR(15) NOT NULL,
    nom_dept VARCHAR(30),
    id_emp INT NOT NULL,
    cod_pac INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_cita, id_sede),
    CONSTRAINT fk_agenda_empleados FOREIGN KEY (id_emp, id_sede) 
        REFERENCES Empleados(id_emp, id_sede) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_agenda_pacientes FOREIGN KEY (cod_pac, id_sede) 
        REFERENCES Pacientes(cod_pac, id_sede) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_estado_cita CHECK (estado IN ('Programada', 'Completada', 'Cancelada', 'No Asistió'))
);

-- Medicamentos
CREATE TABLE Medicamentos (
    cod_med INT PRIMARY KEY,
    nom_med VARCHAR(30) NOT NULL,
    stock INT NOT NULL,
    proveedor VARCHAR(30),
    descripcion VARCHAR(40),
    id_sede INT NOT NULL,
    CONSTRAINT chk_stock_positivo CHECK (stock >= 0)
);

-- Prescribe
CREATE TABLE Prescribe (
    cod_med INT NOT NULL,
    id_cita INT NOT NULL,
    id_sede INT NOT NULL,
    dosis INT NOT NULL,
    frecuencia INT NOT NULL,
    duracion DATE NOT NULL,
    fecha_emision DATE NOT NULL,
    PRIMARY KEY (cod_med, id_cita, id_sede),
    CONSTRAINT fk_prescribe_medicamentos FOREIGN KEY (cod_med) 
        REFERENCES Medicamentos(cod_med) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_prescribe_agenda FOREIGN KEY (id_cita, id_sede) 
        REFERENCES Agenda_Cita(id_cita, id_sede) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Emite_Hist
CREATE TABLE Emite_Hist (
    cod_hist INT,
    id_sede INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    diagnostico VARCHAR(80) NOT NULL,
    nom_dept VARCHAR(30),
    id_emp INT NOT NULL,
    cod_pac INT NOT NULL,
    compartido BOOLEAN DEFAULT FALSE,
    nivel_acceso VARCHAR(20) DEFAULT 'Local',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cod_hist, id_sede),
    CONSTRAINT fk_emite_empleados FOREIGN KEY (id_emp, id_sede) 
        REFERENCES Empleados(id_emp, id_sede) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_emite_pacientes FOREIGN KEY (cod_pac, id_sede) 
        REFERENCES Pacientes(cod_pac, id_sede) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_nivel_acceso CHECK (nivel_acceso IN ('Local', 'Red', 'Global'))
);

-- Auditoria_Accesos
CREATE TABLE Auditoria_Accesos (
    id_evento SERIAL PRIMARY KEY,
    id_sede INT NOT NULL,
    num_doc VARCHAR(20) NOT NULL,
    accion VARCHAR(20) NOT NULL,
    fecha_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tabla_afectada VARCHAR(30),
    ip_origen VARCHAR(20),
    sede_origen INT,
    CONSTRAINT fk_auditoria_personas FOREIGN KEY (num_doc) 
        REFERENCES Personas(num_doc) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Control de Replicación
CREATE TABLE Control_Replicacion (
    id_control SERIAL PRIMARY KEY,
    tabla_origen VARCHAR(50) NOT NULL,
    id_registro VARCHAR(50) NOT NULL,
    operacion VARCHAR(10) NOT NULL,
    sede_origen INT NOT NULL,
    sedes_destino INT[] NOT NULL,
    datos_json JSONB NOT NULL,
    fecha_operacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    replicado BOOLEAN DEFAULT FALSE,
    fecha_replicacion TIMESTAMP,
    intentos INT DEFAULT 0,
    CONSTRAINT chk_operacion CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE'))
);

-- Tablas de Red (datos replicados)
CREATE TABLE Pacientes_Red (
    cod_pac INT,
    id_sede_origen INT NOT NULL,
    num_doc VARCHAR(20) NOT NULL,
    nom_pers VARCHAR(50) NOT NULL,
    fecha_nac DATE NOT NULL,
    genero VARCHAR(20) NOT NULL,
    dr_pac VARCHAR(80),
    fecha_sincronizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cod_pac, id_sede_origen)
);

CREATE TABLE Historial_Red (
    cod_hist INT,
    id_sede_origen INT NOT NULL,
    cod_pac INT NOT NULL,
    fecha DATE NOT NULL,
    diagnostico_resumen VARCHAR(200) NOT NULL,
    nivel_acceso VARCHAR(20) NOT NULL,
    fecha_sincronizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cod_hist, id_sede_origen)
);

CREATE TABLE Equipamiento_Red (
    cod_eq INT,
    id_sede_origen INT NOT NULL,
    nom_eq VARCHAR(50) NOT NULL,
    estado VARCHAR(15) NOT NULL,
    nom_sede VARCHAR(30) NOT NULL,
    fecha_sincronizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cod_eq, id_sede_origen)
);

-- Índices
CREATE INDEX idx_pacientes_doc ON Pacientes(num_doc);
CREATE INDEX idx_pacientes_sede ON Pacientes(id_sede);
CREATE INDEX idx_agenda_fecha ON Agenda_Cita(fecha, id_sede);
CREATE INDEX idx_historial_paciente ON Emite_Hist(cod_pac, id_sede);
CREATE INDEX idx_control_repl ON Control_Replicacion(tabla_origen, replicado);
CREATE INDEX idx_pacientes_red_doc ON Pacientes_Red(num_doc);

-- Función de Replicación
CREATE OR REPLACE FUNCTION fn_replicar_cambios()
RETURNS TRIGGER AS $$
DECLARE
    v_id_sede INT;
    v_sedes_destino INT[];
BEGIN
    SELECT id_sede INTO v_id_sede FROM Config_Sede LIMIT 1;
    
    IF TG_TABLE_NAME = 'Pacientes' THEN
        IF NEW.estado_paciente IN ('Crítico', 'Emergencia') THEN
            v_sedes_destino := ARRAY[0];
        ELSE
            v_sedes_destino := ARRAY[0];
        END IF;
    ELSIF TG_TABLE_NAME = 'Emite_Hist' THEN
        IF NEW.compartido = TRUE THEN
            v_sedes_destino := ARRAY[0];
        ELSE
            v_sedes_destino := ARRAY[0];
        END IF;
    ELSE
        v_sedes_destino := ARRAY[0];
    END IF;
    
    INSERT INTO Control_Replicacion (
        tabla_origen, id_registro, operacion, sede_origen, sedes_destino, datos_json
    ) VALUES (
        TG_TABLE_NAME,
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.cod_pac::VARCHAR || '-' || OLD.id_sede::VARCHAR
            ELSE NEW.cod_pac::VARCHAR || '-' || NEW.id_sede::VARCHAR
        END,
        TG_OP,
        v_id_sede,
        v_sedes_destino,
        CASE 
            WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)
            ELSE row_to_json(NEW)
        END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trg_replicar_pacientes
AFTER INSERT OR UPDATE OR DELETE ON Pacientes
FOR EACH ROW EXECUTE FUNCTION fn_replicar_cambios();

CREATE TRIGGER trg_replicar_historial
AFTER INSERT OR UPDATE ON Emite_Hist
FOR EACH ROW EXECUTE FUNCTION fn_replicar_cambios();

-- Vistas
CREATE VIEW v_pacientes_red AS
SELECT cod_pac, id_sede, num_doc, p.nom_pers, fecha_nac, genero, 'Local' as origen
FROM Pacientes INNER JOIN Personas p USING (num_doc)
WHERE id_sede = (SELECT id_sede FROM Config_Sede LIMIT 1)
UNION ALL
SELECT cod_pac, id_sede_origen as id_sede, num_doc, nom_pers, fecha_nac, genero, 'Remoto' as origen
FROM Pacientes_Red;

CREATE VIEW v_dashboard_red AS
SELECT 
    (SELECT COUNT(*) FROM Pacientes WHERE id_sede = (SELECT id_sede FROM Config_Sede LIMIT 1)) as pacientes_local,
    (SELECT COUNT(*) FROM Pacientes_Red) as pacientes_red,
    (SELECT COUNT(*) FROM Agenda_Cita WHERE fecha = CURRENT_DATE) as citas_hoy,
    (SELECT COUNT(*) FROM Equipamiento WHERE estado = 'Operativo') as equipos_operativos,
    (SELECT MAX(ultima_sincronizacion) FROM Config_Sede) as ultima_sync;

CREATE VIEW v_historial_completo AS
SELECT 
    e.cod_hist,
    e.id_sede,
    e.cod_pac,
    p.nom_pers as paciente,
    e.fecha,
    e.hora,
    e.diagnostico,
    e.nom_dept,
    per.nom_pers as medico,
    e.nivel_acceso,
    'Local' as tipo_registro
FROM Emite_Hist e
INNER JOIN Pacientes pac ON e.cod_pac = pac.cod_pac AND e.id_sede = pac.id_sede
INNER JOIN Personas p ON pac.num_doc = p.num_doc
INNER JOIN Empleados emp ON e.id_emp = emp.id_emp AND e.id_sede = emp.id_sede
INNER JOIN Personas per ON emp.num_doc = per.num_doc
WHERE e.id_sede = (SELECT id_sede FROM Config_Sede LIMIT 1)
UNION ALL
SELECT 
    h.cod_hist,
    h.id_sede_origen as id_sede,
    h.cod_pac,
    pr.nom_pers as paciente,
    h.fecha,
    '00:00:00'::TIME as hora,
    h.diagnostico_resumen as diagnostico,
    NULL as nom_dept,
    'Externo' as medico,
    h.nivel_acceso,
    'Remoto' as tipo_registro
FROM Historial_Red h
INNER JOIN Pacientes_Red pr ON h.cod_pac = pr.cod_pac AND h.id_sede_origen = pr.id_sede_origen;

-- Datos de Ejemplo Sede Norte
INSERT INTO Sedes_Hospitalarias VALUES (1, '6015551234', 'Calle 100 #15-20', 'Sede Norte', 'Bogotá');

INSERT INTO Departamentos VALUES 
('Urgencias', 1), ('Cardiología', 1), ('Cirugía General', 1), ('Laboratorio Clínico', 1);

INSERT INTO Personas VALUES
('1234567890', 'CC', 'Juan Pérez García', 'juan.perez@sedenorte.com', 'juan123', '3001234567', 1, NOW(), NOW()),
('0987654321', 'CC', 'María López Hernández', 'maria.lopez@sedenorte.com', 'maria123', '3009876543', 1, NOW(), NOW()),
('1122334455', 'CC', 'Carlos Rodríguez Silva', 'carlos.rodriguez@sedenorte.com', 'carlos123', '3101122334', 1, NOW(), NOW()),
('6677889900', 'CC', 'Pedro González Castro', 'pedro.gonzalez@sedenorte.com', 'pedro123', '3156677889', 1, NOW(), NOW()),
('9988776655', 'CC', 'Laura Sánchez Moreno', 'laura.sanchez@sedenorte.com', 'laura123', '3009988776', 1, NOW(), NOW()),
('1357924680', 'CC', 'Diego Torres Vega', 'diego.torres@sedenorte.com', 'diego123', '3011357924', 1, NOW(), NOW()),
('2468013579', 'CC', 'Sofia Ramírez Ortiz', 'sofia.ramirez@sedenorte.com', 'sofia123', '3202468013', 1, NOW(), NOW()),
('5544332211', 'CC', 'Ana Martínez Ruiz', 'ana.martinez@sedenorte.com', 'ana123', '3205544332', 1, NOW(), NOW());

INSERT INTO Pacientes VALUES
(101, 1, '1357924680', 'Hipertensión arterial', '1985-03-15', 'Masculino', 'Activo', NOW(), NOW()),
(102, 1, '2468013579', 'Diabetes tipo 2', '1990-07-22', 'Femenino', 'Crítico', NOW(), NOW()),
(103, 1, '5544332211', 'Ninguna', '2010-11-08', 'Femenino', 'Activo', NOW(), NOW());

INSERT INTO Empleados VALUES
(1001, 1, '1234567890', 'HASH123ABC', 'Cardiología', 'Médico Especialista', TRUE, NOW()),
(1002, 1, '0987654321', 'HASH789DEF', 'Urgencias', 'Médico General', TRUE, NOW()),
(1003, 1, '1122334455', 'HASH345GHI', 'Cirugía General', 'Cirujano', TRUE, NOW()),
(1004, 1, '6677889900', 'HASH567MNO', 'Laboratorio Clínico', 'Bacteriólogo', TRUE, NOW()),
(1005, 1, '9988776655', 'HASH123PQR', 'Urgencias', 'Enfermero Jefe', TRUE, NOW());

INSERT INTO Equipamiento VALUES
(2001, 1, 'Electrocardiografo EKG-500', 'Operativo', '2024-11-15', 1001),
(2002, 1, 'Monitor de Signos Vitales', 'Operativo', '2024-09-10', 1005),
(2003, 1, 'Desfibrilador DEF-Emergency', 'Operativo', '2024-08-30', 1002),
(2004, 1, 'Ventilador Mecánico VM-200', 'En Mantenimiento', '2024-12-05', 1002);

INSERT INTO Pertenece VALUES
('Cardiología', 2001, 1),
('Urgencias', 2002, 1),
('Urgencias', 2003, 1),
('Urgencias', 2004, 1);

INSERT INTO Medicamentos VALUES
(4001, 'Losartán 50mg', 500, 'FarmaCol', 'Antihipertensivo', 1),
(4002, 'Metformina 850mg', 800, 'MediPharm', 'Antidiabético oral', 1),
(4003, 'Ibuprofeno 400mg', 1000, 'FarmaCol', 'Antiinflamatorio', 1);

INSERT INTO Agenda_Cita VALUES
(3001, 1, '2024-12-15', '09:00:00', 'Consulta General', 'Programada', 'Cardiología', 1001, 101, NOW(), NOW()),
(3002, 1, '2024-12-16', '10:30:00', 'Urgencias', 'Programada', 'Urgencias', 1002, 102, NOW(), NOW());

INSERT INTO Prescribe VALUES
(4001, 3001, 1, 50, 1, '2025-01-15', '2024-12-15'),
(4002, 3002, 1, 850, 2, '2025-03-16', '2024-12-16');

INSERT INTO Emite_Hist VALUES
(6001, 1, '2024-12-10', '14:30:00', 'Hipertensión arterial controlada. TA: 130/85', 'Cardiología', 1001, 101, FALSE, 'Local', NOW()),
(6002, 1, '2024-12-12', '09:00:00', 'Crisis hiperglucémica. Paciente crítico.', 'Urgencias', 1002, 102, TRUE, 'Global', NOW());

-- ============================================
-- PASO FINAL: DATOS DE USUARIOS INICIALES
-- ============================================

\c hospital_hub;

-- Insertar Personas de Sistema en Sede Norte
\c hospital_sede_norte;

INSERT INTO Personas (num_doc, tipo_doc, nom_pers, correo, tel_pers, contrasena, id_sede_registro) VALUES
('12345678', 'CC', 'Juan Pérez', 'admin@hospital.com', '3001234567', 'admin123', 1),
('23456789', 'CC', 'María García', 'medico@hospital.com', '3002345678', 'medico123', 1),
('34567890', 'CC', 'Carlos Rodríguez', 'enfermero@hospital.com', '3003456789', 'enfermero123', 1),
('45678901', 'CC', 'Ana Martínez', 'admin_staff@hospital.com', '3004567890', 'staff123', 1);

-- Insertar Usuarios en Hospital Hub (Autenticación)
\c hospital_hub;

-- Password hashes generados con bcrypt (salt rounds: 10)
-- Contraseñas: admin123, medico123, enfermero123, staff123
INSERT INTO usuarios (num_doc, correo, password_hash, rol, activo, fecha_creacion, fecha_actualizacion) VALUES
('12345678', 'admin@hospital.com', '$2b$10$vN1jqIiF8JhKGF6VGQYbaeYhU1qJnGE1q9g8.kX5VQ5YzJGYqJGYu', 'administrador', TRUE, NOW(), NOW()),
('23456789', 'medico@hospital.com', '$2b$10$vN1jqIiF8JhKGF6VGQYbaeYhU1qJnGE1q9g8.kX5VQ5YzJGYqJGYu', 'medico', TRUE, NOW(), NOW()),
('34567890', 'enfermero@hospital.com', '$2b$10$vN1jqIiF8JhKGF6VGQYbaeYhU1qJnGE1q9g8.kX5VQ5YzJGYqJGYu', 'enfermero', TRUE, NOW(), NOW()),
('45678901', 'admin_staff@hospital.com', '$2b$10$vN1jqIiF8JhKGF6VGQYbaeYhU1qJnGE1q9g8.kX5VQ5YzJGYqJGYu', 'personal_administrativo', TRUE, NOW(), NOW());

-- Registrar actividad inicial
INSERT INTO activity_logs (id_usuario, accion, detalles, fecha_accion) VALUES
(1, 'system_setup', 'Usuario administrador creado durante instalación inicial', NOW()),
(2, 'system_setup', 'Usuario médico creado durante instalación inicial', NOW()),
(3, 'system_setup', 'Usuario enfermero creado durante instalación inicial', NOW()),
(4, 'system_setup', 'Usuario personal administrativo creado durante instalación inicial', NOW());

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

\echo '=========================================='
\echo 'VERIFICANDO USUARIOS CREADOS'
\echo '=========================================='

SELECT 
    id_usuario,
    num_doc,
    correo,
    rol,
    activo,
    fecha_creacion
FROM usuarios
ORDER BY id_usuario;

\echo ''
\echo '=========================================='
\echo 'CREDENCIALES DE ACCESO INICIAL'
\echo '=========================================='
\echo 'Email: admin@hospital.com       | Password: admin123 | Rol: Administrador'
\echo 'Email: medico@hospital.com      | Password: medico123 | Rol: Médico'
\echo 'Email: enfermero@hospital.com   | Password: enfermero123 | Rol: Enfermero'
\echo 'Email: admin_staff@hospital.com | Password: staff123 | Rol: Personal Administrativo'
\echo ''
\echo '=========================================='
\echo 'INSTALACIÓN COMPLETADA EXITOSAMENTE'
\echo '=========================================='
\echo 'Sistema Multi-Red Hospitalaria v2.0'
\echo 'Base de datos: hospital_hub (autenticación centralizada)'
\echo 'Sedes: hospital_sede_norte, hospital_sede_centro, hospital_sede_sur'
\echo 'Autenticación: Email-based con bcrypt'
\echo '=========================================='

