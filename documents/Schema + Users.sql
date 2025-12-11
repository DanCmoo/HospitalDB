-- ============================================
-- TABLA: Personas
-- ============================================
CREATE TABLE Personas (
    num_doc VARCHAR(20) PRIMARY KEY,
    tipo_doc VARCHAR(20) NOT NULL,
    nom_pers VARCHAR(50) NOT NULL,
    correo VARCHAR(60),
    tel_pers VARCHAR(20)
);

-- ============================================
-- TABLA: Sedes_Hospitalarias
-- ============================================
CREATE TABLE Sedes_Hospitalarias (
    id_sede INT PRIMARY KEY,
    telefono VARCHAR(20),
    direccion VARCHAR(50) NOT NULL,
    nom_sede VARCHAR(30) NOT NULL,
    ciudad VARCHAR(20) NOT NULL
);

-- ============================================
-- TABLA: Departamentos
-- ============================================
CREATE TABLE Departamentos (
    nom_dept VARCHAR(30) PRIMARY KEY,
    id_sede INT NOT NULL,
    CONSTRAINT fk_departamentos_sedes FOREIGN KEY (id_sede) 
        REFERENCES Sedes_Hospitalarias(id_sede) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- ============================================
-- TABLA: Pacientes
-- ============================================
CREATE TABLE Pacientes (
    cod_pac INT PRIMARY KEY,
    num_doc VARCHAR(20) NOT NULL,
    dr_pac VARCHAR(80),
    fecha_nac DATE NOT NULL,
    genero VARCHAR(20) NOT NULL,
    CONSTRAINT fk_pacientes_personas FOREIGN KEY (num_doc) 
        REFERENCES Personas(num_doc) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- ============================================
-- TABLA: Empleados
-- ============================================
CREATE TABLE Empleados (
    id_emp INT PRIMARY KEY,
    num_doc VARCHAR(20) NOT NULL,
    hash_contrato VARCHAR(100),
    id_sede INT NOT NULL,
    nom_dept VARCHAR(30) NOT NULL,
    cargo VARCHAR(30) NOT NULL,
    CONSTRAINT fk_empleados_personas FOREIGN KEY (num_doc) 
        REFERENCES Personas(num_doc) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_empleados_departamentos FOREIGN KEY (nom_dept) 
        REFERENCES Departamentos(nom_dept) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
);

-- ============================================
-- TABLA: Equipamiento
-- ============================================
CREATE TABLE Equipamiento (
    cod_eq INT PRIMARY KEY,
    nom_eq VARCHAR(50) NOT NULL,
    estado VARCHAR(15) NOT NULL,
    fecha_mant DATE,
    id_emp INT NOT NULL,
    CONSTRAINT fk_equipamiento_empleados FOREIGN KEY (id_emp) 
        REFERENCES Empleados(id_emp) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT chk_estado_equipamiento CHECK (estado IN ('Operativo', 'En Mantenimiento', 'Fuera de Servicio'))
);

-- ============================================
-- TABLA: Pertenece (Relación Departamentos-Equipamiento)
-- ============================================
CREATE TABLE Pertenece (
    nom_dept VARCHAR(30) NOT NULL,
    cod_eq INT NOT NULL,
    PRIMARY KEY (nom_dept, cod_eq),
    CONSTRAINT fk_pertenece_departamentos FOREIGN KEY (nom_dept) 
        REFERENCES Departamentos(nom_dept) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_pertenece_equipamiento FOREIGN KEY (cod_eq) 
        REFERENCES Equipamiento(cod_eq) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- ============================================
-- TABLA: Auditoria_Accesos
-- ============================================
CREATE TABLE Auditoria_Accesos (
    id_evento INT PRIMARY KEY,
    num_doc VARCHAR(20) NOT NULL,
    accion VARCHAR(20) NOT NULL,
    fecha_evento DATE NOT NULL,
    tabla_afectada VARCHAR(30),
    ip_origen VARCHAR(20),
    CONSTRAINT fk_auditoria_personas FOREIGN KEY (num_doc) 
        REFERENCES Personas(num_doc) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- ============================================
-- TABLA: Agenda_Cita
-- ============================================
CREATE TABLE Agenda_Cita (
    id_cita INT PRIMARY KEY,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    tipo_servicio VARCHAR(30) NOT NULL,
    estado VARCHAR(15) NOT NULL,
    id_sede INT NOT NULL,
    nom_dept VARCHAR(30),
    id_emp INT NOT NULL,
    cod_pac INT NOT NULL,
    CONSTRAINT fk_agenda_empleados FOREIGN KEY (id_emp) 
        REFERENCES Empleados(id_emp) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_agenda_pacientes FOREIGN KEY (cod_pac) 
        REFERENCES Pacientes(cod_pac) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT chk_estado_cita CHECK (estado IN ('Programada', 'Completada', 'Cancelada', 'No Asistió'))
);

-- ============================================
-- TABLA: Medicamentos
-- ============================================
CREATE TABLE Medicamentos (
    cod_med INT PRIMARY KEY,
    nom_med VARCHAR(30) NOT NULL,
    stock INT NOT NULL,
    proveedor VARCHAR(30),
    descripcion VARCHAR(40),
    CONSTRAINT chk_stock_positivo CHECK (stock >= 0)
);

-- ============================================
-- TABLA: Prescribe (Relación Agenda_Cita-Medicamentos)
-- ============================================
CREATE TABLE Prescribe (
    cod_med INT NOT NULL,
    id_cita INT NOT NULL,
    dosis INT NOT NULL,
    frecuencia INT NOT NULL,
    duracion DATE NOT NULL,
    fecha_emision DATE NOT NULL,
    PRIMARY KEY (cod_med, id_cita),
    CONSTRAINT fk_prescribe_medicamentos FOREIGN KEY (cod_med) 
        REFERENCES Medicamentos(cod_med) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_prescribe_agenda FOREIGN KEY (id_cita) 
        REFERENCES Agenda_Cita(id_cita) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT chk_dosis_positiva CHECK (dosis > 0),
    CONSTRAINT chk_frecuencia_positiva CHECK (frecuencia > 0)
);

-- ============================================
-- TABLA: Emite_Hist (Historial Médico)
-- ============================================
CREATE TABLE Emite_Hist (
    cod_hist INT PRIMARY KEY,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    diagnostico VARCHAR(80) NOT NULL,
    id_sede INT NOT NULL,
    nom_dept VARCHAR(30),
    id_emp INT NOT NULL,
    cod_pac INT NOT NULL,
    CONSTRAINT fk_emite_empleados FOREIGN KEY (id_emp) 
        REFERENCES Empleados(id_emp) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_emite_pacientes FOREIGN KEY (cod_pac) 
        REFERENCES Pacientes(cod_pac) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Crear roles
CREATE ROLE administrador WITH LOGIN PASSWORD 'admin_2025';
CREATE ROLE medico WITH LOGIN PASSWORD 'medico_2025';
CREATE ROLE enfermero WITH LOGIN PASSWORD 'enfermero_2025';
CREATE ROLE personal_administrativo WITH LOGIN PASSWORD 'admin_personal_2025';


-- Permisos para ADMINISTRADOR (acceso total)
GRANT ALL PRIVILEGES ON DATABASE clinicamedica TO administrador;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO administrador;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO administrador;
GRANT USAGE ON SCHEMA public TO administrador;

-- Permisos para MÉDICO (lectura + escritura en citas, historiales, medicamentos)
GRANT USAGE ON SCHEMA public TO medico;
GRANT SELECT, INSERT, UPDATE ON personas TO medico;
GRANT SELECT, INSERT, UPDATE ON empleados TO medico;
GRANT SELECT, INSERT, UPDATE ON pacientes TO medico;
GRANT SELECT, INSERT, UPDATE ON agenda_cita TO medico;
GRANT SELECT, INSERT, UPDATE ON emite_hist TO medico;
GRANT SELECT, INSERT ON prescribe TO medico;
GRANT SELECT ON medicamentos TO medico;
GRANT SELECT ON sedes_hospitalarias TO medico;
GRANT SELECT ON departamentos TO medico;
GRANT SELECT ON auditoria_accesos TO medico;

-- Permisos para ENFERMERO (lectura + acceso limitado a citas y pacientes)
GRANT USAGE ON SCHEMA public TO enfermero;
GRANT SELECT ON personas TO enfermero;
GRANT SELECT ON empleados TO enfermero;
GRANT SELECT, INSERT ON pacientes TO enfermero;
GRANT SELECT, UPDATE ON agenda_cita TO enfermero;
GRANT SELECT ON emite_hist TO enfermero;
GRANT SELECT ON prescribe TO enfermero;
GRANT SELECT ON medicamentos TO enfermero;
GRANT SELECT ON sedes_hospitalarias TO enfermero;
GRANT SELECT ON departamentos TO enfermero;

-- Permisos para PERSONAL_ADMINISTRATIVO (lectura + escritura en tablas administrativas)
GRANT USAGE ON SCHEMA public TO personal_administrativo;
GRANT SELECT, INSERT, UPDATE ON personas TO personal_administrativo;
GRANT SELECT, INSERT, UPDATE ON pacientes TO personal_administrativo;
GRANT SELECT, INSERT ON agenda_cita TO personal_administrativo;
GRANT SELECT ON empleados TO personal_administrativo;
GRANT SELECT ON medicamentos TO personal_administrativo;
GRANT SELECT ON sedes_hospitalarias TO personal_administrativo;
GRANT SELECT ON departamentos TO personal_administrativo;
GRANT SELECT ON auditoria_accesos TO personal_administrativo;