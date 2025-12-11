-- ============================================
-- VISTAS BASE PARA EL SISTEMA
-- ============================================

-- Vista: Información completa de pacientes
CREATE VIEW Vista_Pacientes_Completa AS
SELECT 
    pac.cod_pac,
    pac.num_doc,
    per.nom_pers AS nombre_paciente,
    per.tipo_doc,
    per.correo,
    per.tel_pers AS telefono,
    pac.fecha_nac,
    pac.genero,
    pac.dr_pac AS direccion,
    EXTRACT(YEAR FROM AGE(pac.fecha_nac)) AS edad
FROM Pacientes pac
INNER JOIN Personas per ON pac.num_doc = per.num_doc;

-- Vista: Información completa de empleados
CREATE VIEW Vista_Empleados_Completa AS
SELECT 
    emp.id_emp,
    emp.num_doc,
    per.nom_pers AS nombre_empleado,
    per.tipo_doc,
    per.correo,
    per.tel_pers AS telefono,
    emp.cargo,
    emp.nom_dept AS departamento,
    d.id_sede,
    sh.nom_sede,
    sh.ciudad,
    sh.direccion AS direccion_sede,
    sh.telefono AS telefono_sede
FROM Empleados emp
INNER JOIN Personas per ON emp.num_doc = per.num_doc
INNER JOIN Departamentos d ON emp.nom_dept = d.nom_dept
INNER JOIN Sedes_Hospitalarias sh ON d.id_sede = sh.id_sede;

-- Vista: Citas con información completa
CREATE VIEW Vista_Citas_Completa AS
SELECT 
    ac.id_cita,
    ac.fecha,
    ac.hora,
    ac.tipo_servicio,
    ac.estado,
    pac.cod_pac,
    vp.nombre_paciente,
    vp.telefono AS telefono_paciente,
    vp.edad,
    emp.id_emp,
    ve.nombre_empleado AS nombre_medico,
    ve.cargo,
    ve.departamento,
    sh.nom_sede,
    sh.ciudad
FROM Agenda_Cita ac
INNER JOIN Vista_Pacientes_Completa vp ON ac.cod_pac = vp.cod_pac
INNER JOIN Vista_Empleados_Completa ve ON ac.id_emp = ve.id_emp
INNER JOIN Sedes_Hospitalarias sh ON ac.id_sede = sh.id_sede;

-- Vista: Historias clínicas consolidadas
CREATE VIEW Vista_Historias_Consolidadas AS
SELECT 
    eh.cod_hist,
    eh.fecha,
    eh.hora,
    eh.diagnostico,
    vp.cod_pac,
    vp.nombre_paciente,
    vp.edad,
    vp.genero,
    vp.telefono AS telefono_paciente,
    ve.id_emp,
    ve.nombre_empleado AS nombre_medico,
    ve.cargo,
    ve.departamento,
    sh.nom_sede,
    sh.ciudad,
    sh.direccion AS direccion_sede
FROM Emite_Hist eh
INNER JOIN Vista_Pacientes_Completa vp ON eh.cod_pac = vp.cod_pac
INNER JOIN Vista_Empleados_Completa ve ON eh.id_emp = ve.id_emp
INNER JOIN Sedes_Hospitalarias sh ON eh.id_sede = sh.id_sede;

-- Vista: Prescripciones con información completa
CREATE OR REPLACE VIEW Vista_Prescripciones_Completa AS
SELECT 
    p.cod_med,
    p.id_cita,
    p.dosis,
    p.frecuencia,
    p.duracion,
    p.fecha_emision,
    m.nom_med,
    m.descripcion AS descripcion_medicamento,
    m.stock AS stock_disponible,
    vc.fecha AS fecha_cita,
    vc.nombre_paciente,
    vc.nombre_medico,
    vc.departamento,
    vc.nom_sede,
    vc.ciudad
FROM Prescribe p
INNER JOIN Medicamentos m ON p.cod_med = m.cod_med
INNER JOIN Vista_Citas_Completa vc ON p.id_cita = vc.id_cita;

-- Vista: Equipamiento con información completa
CREATE OR REPLACE VIEW Vista_Equipamiento_Completo AS
SELECT 
    eq.cod_eq,
    eq.nom_eq,
    eq.estado,
    eq.fecha_mant,
    CURRENT_DATE - eq.fecha_mant AS dias_desde_mantenimiento,
    CASE 
        WHEN CURRENT_DATE - eq.fecha_mant > 180 THEN 'Urgente'
        WHEN CURRENT_DATE - eq.fecha_mant > 90 THEN 'Próximo'
        ELSE 'Normal'
    END AS prioridad_mantenimiento,
    ve.nombre_empleado AS responsable,
    ve.cargo AS cargo_responsable,
    ve.telefono AS telefono_responsable,
    pt.nom_dept AS departamento,
    ve.nom_sede,
    ve.ciudad
FROM Equipamiento eq
INNER JOIN Vista_Empleados_Completa ve ON eq.id_emp = ve.id_emp
INNER JOIN Pertenece pt ON eq.cod_eq = pt.cod_eq;


-- ============================================
-- VISTAS ANALÍTICAS
-- ============================================

-- Vista: Frecuencia de enfermedades
CREATE OR REPLACE VIEW Vista_Frecuencia_Enfermedades AS
SELECT 
    vh.diagnostico,
    vh.nom_sede,
    vh.ciudad,
    COUNT(vh.cod_hist) AS total_casos,
    COUNT(DISTINCT vh.cod_pac) AS pacientes_unicos,
    DATE_TRUNC('month', vh.fecha) AS mes
FROM Vista_Historias_Consolidadas vh
WHERE vh.fecha >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY vh.diagnostico, vh.nom_sede, vh.ciudad, DATE_TRUNC('month', vh.fecha);

-- Vista: Consumo de medicamentos por departamento
CREATE OR REPLACE VIEW Vista_Consumo_Medicamentos AS
SELECT 
    vpc.departamento,
    vpc.nom_sede,
    vpc.nom_med,
    COUNT(vpc.cod_med) AS veces_prescrito,
    SUM(vpc.dosis) AS dosis_total,
    AVG(vpc.dosis) AS dosis_promedio,
    vpc.stock_disponible,
    CASE 
        WHEN vpc.stock_disponible < COUNT(vpc.cod_med) * 0.5 THEN 'CRÍTICO'
        WHEN vpc.stock_disponible < COUNT(vpc.cod_med) THEN 'BAJO'
        ELSE 'NORMAL'
    END AS nivel_stock
FROM Vista_Prescripciones_Completa vpc
WHERE vpc.fecha_emision >= CURRENT_DATE - INTERVAL '3 months'
GROUP BY vpc.departamento, vpc.nom_sede, vpc.nom_med, vpc.stock_disponible;

-- Vista: Estadísticas de citas por sede
CREATE OR REPLACE VIEW Vista_Estadisticas_Citas AS
SELECT 
    vc.nom_sede,
    vc.ciudad,
    vc.departamento,
    COUNT(vc.id_cita) AS total_citas,
    COUNT(CASE WHEN vc.estado = 'Completada' THEN 1 END) AS citas_completadas,
    COUNT(CASE WHEN vc.estado = 'Cancelada' THEN 1 END) AS citas_canceladas,
    COUNT(CASE WHEN vc.estado = 'No Asistió' THEN 1 END) AS citas_no_asistio,
    COUNT(CASE WHEN vc.estado = 'Programada' THEN 1 END) AS citas_programadas,
    ROUND(COUNT(CASE WHEN vc.estado = 'Completada' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(vc.id_cita), 0), 2) AS tasa_cumplimiento,
    ROUND(COUNT(CASE WHEN vc.estado = 'No Asistió' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(vc.id_cita), 0), 2) AS tasa_ausentismo,
    DATE_TRUNC('month', vc.fecha) AS mes
FROM Vista_Citas_Completa vc
WHERE vc.fecha >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY vc.nom_sede, vc.ciudad, vc.departamento, DATE_TRUNC('month', vc.fecha);

-- Vista: Rendimiento de médicos
CREATE OR REPLACE VIEW Vista_Rendimiento_Medicos AS
SELECT 
    vc.id_emp,
    vc.nombre_medico,
    vc.cargo,
    vc.departamento,
    vc.nom_sede,
    DATE_TRUNC('week', vc.fecha) AS semana,
    COUNT(vc.id_cita) AS total_citas,
    COUNT(CASE WHEN vc.estado = 'Completada' THEN 1 END) AS citas_completadas,
    ROUND(COUNT(CASE WHEN vc.estado = 'Completada' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(vc.id_cita), 0), 2) AS porcentaje_completadas
FROM Vista_Citas_Completa vc
WHERE vc.cargo IN ('Médico', 'Médico General', 'Médico Especialista')
  AND vc.fecha >= CURRENT_DATE - INTERVAL '3 months'
GROUP BY vc.id_emp, vc.nombre_medico, vc.cargo, vc.departamento, 
         vc.nom_sede, DATE_TRUNC('week', vc.fecha);

-- Vista: Estado de equipamiento por sede
CREATE OR REPLACE VIEW Vista_Estado_Equipamiento AS
SELECT 
    vec.nom_sede,
    vec.ciudad,
    vec.departamento,
    vec.estado,
    COUNT(vec.cod_eq) AS cantidad_equipos,
    ROUND(COUNT(vec.cod_eq) * 100.0 / 
          SUM(COUNT(vec.cod_eq)) OVER (PARTITION BY vec.nom_sede), 2) AS porcentaje_sede,
    COUNT(CASE WHEN vec.prioridad_mantenimiento = 'Urgente' THEN 1 END) AS mantenimiento_urgente,
    COUNT(CASE WHEN vec.prioridad_mantenimiento = 'Próximo' THEN 1 END) AS mantenimiento_proximo
FROM Vista_Equipamiento_Completo vec
GROUP BY vec.nom_sede, vec.ciudad, vec.departamento, vec.estado;

-- Vista: Tiempos de atención
CREATE OR REPLACE VIEW Vista_Tiempos_Atencion AS
SELECT 
    vc.id_cita,
    vc.nom_sede,
    vc.ciudad,
    vc.departamento,
    vc.nombre_medico,
    vc.fecha AS fecha_cita,
    vh.fecha AS fecha_diagnostico,
    EXTRACT(EPOCH FROM (vh.fecha + vh.hora - (vc.fecha + vc.hora)))/3600 AS horas_diferencia,
    EXTRACT(DAY FROM (vh.fecha - vc.fecha)) AS dias_diferencia
FROM Vista_Citas_Completa vc
INNER JOIN Vista_Historias_Consolidadas vh 
    ON vc.cod_pac = vh.cod_pac 
    AND vc.id_emp = vh.id_emp
    AND vh.fecha >= vc.fecha
WHERE vc.estado = 'Completada';


-- ============================================
-- QUERIES USANDO LAS VISTAS CREADAS
-- ============================================

-- 1. Medicamentos más recetados por sede en el último mes
SELECT 
    nom_sede,
    nom_med,
    veces_prescrito,
    dosis_total,
    nivel_stock
FROM Vista_Consumo_Medicamentos
ORDER BY nom_sede, veces_prescrito DESC;

-- 2. Médicos con mayor número de consultas atendidas por semana
SELECT 
    nombre_medico,
    cargo,
    departamento,
    nom_sede,
    semana,
    citas_completadas,
    porcentaje_completadas
FROM Vista_Rendimiento_Medicos
ORDER BY semana DESC, citas_completadas DESC
LIMIT 20;

-- 3. Tiempo promedio entre cita y diagnóstico
SELECT 
    nom_sede,
    departamento,
    COUNT(*) AS total_casos,
    ROUND(AVG(horas_diferencia), 2) AS horas_promedio,
    ROUND(AVG(dias_diferencia), 2) AS dias_promedio,
    MIN(horas_diferencia) AS horas_minimo,
    MAX(horas_diferencia) AS horas_maximo
FROM Vista_Tiempos_Atencion
GROUP BY nom_sede, departamento
ORDER BY horas_promedio;

-- 4. Últimos 10 accesos a historias clínicas (auditoría)
SELECT 
    aa.id_evento,
    aa.fecha_evento,
    aa.accion,
    per.nom_pers AS usuario,
    per.tipo_doc,
    per.num_doc,
    aa.ip_origen,
    aa.tabla_afectada
FROM Auditoria_Accesos aa
INNER JOIN Personas per ON aa.num_doc = per.num_doc
WHERE aa.tabla_afectada = 'Emite_Hist'
ORDER BY aa.fecha_evento DESC
LIMIT 10;

-- 5. Departamentos que comparten equipamiento entre sedes
SELECT DISTINCT
    vec1.departamento,
    vec1.nom_sede AS sede_1,
    vec2.nom_sede AS sede_2,
    vec1.nom_eq AS equipamiento_compartido,
    vec1.estado
FROM Vista_Equipamiento_Completo vec1
INNER JOIN Vista_Equipamiento_Completo vec2 
    ON vec1.cod_eq = vec2.cod_eq 
    AND vec1.departamento != vec2.departamento
    AND vec1.nom_sede != vec2.nom_sede
ORDER BY vec1.departamento;

-- 6. Total de pacientes atendidos por enfermedad y sede
SELECT 
    nom_sede,
    ciudad,
    diagnostico,
    SUM(total_casos) AS total_casos,
    SUM(pacientes_unicos) AS pacientes_unicos,
    COUNT(DISTINCT mes) AS meses_activos
FROM Vista_Frecuencia_Enfermedades
GROUP BY nom_sede, ciudad, diagnostico
ORDER BY nom_sede, total_casos DESC;

-- 7. Vista consolidada de historias clínicas (ya existe)
SELECT * 
FROM Vista_Historias_Consolidadas
ORDER BY fecha DESC, hora DESC
LIMIT 100;


-- ============================================
-- ANÁLISIS ADICIONALES USANDO VISTAS
-- ============================================

-- A. Ranking de frecuencia de enfermedades (últimos 12 meses)
SELECT 
    diagnostico,
    SUM(total_casos) AS total_casos,
    SUM(pacientes_unicos) AS total_pacientes,
    COUNT(DISTINCT nom_sede) AS sedes_afectadas,
    ROUND(SUM(total_casos) * 100.0 / 
          SUM(SUM(total_casos)) OVER(), 2) AS porcentaje_total
FROM Vista_Frecuencia_Enfermedades
GROUP BY diagnostico
ORDER BY total_casos DESC;

-- A.1. Tendencia de enfermedades por mes
SELECT 
    diagnostico,
    nom_sede,
    mes,
    total_casos,
    pacientes_unicos
FROM Vista_Frecuencia_Enfermedades
WHERE diagnostico IN (
    SELECT diagnostico 
    FROM Vista_Frecuencia_Enfermedades 
    GROUP BY diagnostico 
    ORDER BY SUM(total_casos) DESC 
    LIMIT 10
)
ORDER BY mes DESC, total_casos DESC;

-- B. Consumo de medicamentos con alertas de stock
SELECT 
    nom_sede,
    departamento,
    nom_med,
    veces_prescrito,
    dosis_total,
    stock_disponible,
    nivel_stock
FROM Vista_Consumo_Medicamentos
WHERE nivel_stock IN ('CRÍTICO', 'BAJO')
ORDER BY 
    CASE nivel_stock 
        WHEN 'CRÍTICO' THEN 1 
        WHEN 'BAJO' THEN 2 
    END,
    veces_prescrito DESC;

-- C. Utilización y estado de equipamiento
SELECT 
    nom_sede,
    ciudad,
    departamento,
    estado,
    cantidad_equipos,
    porcentaje_sede,
    mantenimiento_urgente,
    mantenimiento_proximo
FROM Vista_Estado_Equipamiento
ORDER BY nom_sede, cantidad_equipos DESC;

-- C.1. Equipos que requieren mantenimiento urgente
SELECT 
    nom_eq,
    estado,
    dias_desde_mantenimiento,
    prioridad_mantenimiento,
    departamento,
    nom_sede,
    responsable,
    telefono_responsable
FROM Vista_Equipamiento_Completo
WHERE prioridad_mantenimiento = 'Urgente'
   OR estado = 'En Mantenimiento'
ORDER BY dias_desde_mantenimiento DESC;

-- D. Índices de atención por sede
SELECT 
    nom_sede,
    ciudad,
    SUM(total_citas) AS total_citas,
    SUM(citas_completadas) AS total_completadas,
    SUM(citas_canceladas) AS total_canceladas,
    SUM(citas_no_asistio) AS total_no_asistio,
    ROUND(AVG(tasa_cumplimiento), 2) AS tasa_cumplimiento_promedio,
    ROUND(AVG(tasa_ausentismo), 2) AS tasa_ausentismo_promedio
FROM Vista_Estadisticas_Citas
GROUP BY nom_sede, ciudad
ORDER BY tasa_cumplimiento_promedio DESC;

-- D.1. Estadísticas por departamento
SELECT 
    nom_sede,
    departamento,
    mes,
    total_citas,
    citas_completadas,
    tasa_cumplimiento,
    tasa_ausentismo
FROM Vista_Estadisticas_Citas
ORDER BY mes DESC, nom_sede, tasa_cumplimiento DESC;

-- D.2. Análisis de tiempos de espera
SELECT 
    nom_sede,
    departamento,
    COUNT(*) AS casos_analizados,
    ROUND(AVG(horas_diferencia), 2) AS horas_promedio,
    ROUND(AVG(dias_diferencia), 2) AS dias_promedio,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY horas_diferencia) AS mediana_horas
FROM Vista_Tiempos_Atencion
GROUP BY nom_sede, departamento
ORDER BY horas_promedio;

-- E. Top médicos por rendimiento
SELECT 
    nombre_medico,
    cargo,
    departamento,
    nom_sede,
    SUM(citas_completadas) AS total_completadas,
    ROUND(AVG(porcentaje_completadas), 2) AS eficiencia_promedio,
    COUNT(DISTINCT semana) AS semanas_activas
FROM Vista_Rendimiento_Medicos
GROUP BY nombre_medico, cargo, departamento, nom_sede
HAVING SUM(citas_completadas) > 0
ORDER BY total_completadas DESC
LIMIT 20;

-- F. Pacientes con mayor frecuencia de visitas
SELECT 
    vc.cod_pac,
    vc.nombre_paciente,
    vc.edad,
    vc.telefono_paciente,
    COUNT(vc.id_cita) AS total_visitas,
    COUNT(CASE WHEN vc.estado = 'Completada' THEN 1 END) AS visitas_completadas,
    MAX(vc.fecha) AS ultima_visita,
    vc.nom_sede
FROM Vista_Citas_Completa vc
WHERE vc.fecha >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY vc.cod_pac, vc.nombre_paciente, vc.edad, 
         vc.telefono_paciente, vc.nom_sede
HAVING COUNT(vc.id_cita) >= 3
ORDER BY total_visitas DESC;