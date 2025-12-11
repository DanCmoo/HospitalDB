-- ============================================
-- FINALIZACIÓN DEL SCRIPT PRINCIPAL
-- Este archivo completa el script.sql
-- ============================================

-- ============================================
-- CONSULTAS DE VERIFICACIÓN FINAL
-- ============================================

\c hospital_hub;
\echo ''
\echo '============================================'
\echo 'ÍNDICE GLOBAL DE PACIENTES'
\echo '============================================'
SELECT id_global, num_doc, nom_pers, nombre_red, cod_pac_local 
FROM Indice_Pacientes_Global ipg
JOIN Redes_Hospitalarias rh ON ipg.id_red_origen = rh.id_red
ORDER BY id_global;

\echo ''
\echo '============================================'
\echo 'HISTORIAL COMPARTIDO'
\echo '============================================'
SELECT * FROM Historial_Compartido ORDER BY fecha_compartido DESC LIMIT 5;

\echo ''
\echo '============================================'
\echo 'REDES HOSPITALARIAS REGISTRADAS'
\echo '============================================'
SELECT * FROM Redes_Hospitalarias ORDER BY id_red;

\echo ''
\echo '============================================'
\echo 'VERIFICACIÓN DE SEDES'
\echo '============================================'

\c hospital_sede_norte;
\echo ''
\echo 'SEDE NORTE - Estadísticas'
\echo '========================='
SELECT 
    'Pacientes' as tabla, COUNT(*) as registros FROM Pacientes
UNION ALL
SELECT 'Empleados', COUNT(*) FROM Empleados
UNION ALL
SELECT 'Citas', COUNT(*) FROM Agenda_Cita
UNION ALL
SELECT 'Equipos', COUNT(*) FROM Equipamiento
UNION ALL
SELECT 'Historiales', COUNT(*) FROM Emite_Hist;

\c hospital_sede_centro;
\echo ''
\echo 'SEDE CENTRO - Estadísticas'
\echo '==========================='
SELECT 
    'Pacientes' as tabla, COUNT(*) as registros FROM Pacientes
UNION ALL
SELECT 'Empleados', COUNT(*) FROM Empleados
UNION ALL
SELECT 'Citas', COUNT(*) FROM Agenda_Cita
UNION ALL
SELECT 'Equipos', COUNT(*) FROM Equipamiento
UNION ALL
SELECT 'Historiales', COUNT(*) FROM Emite_Hist;

\c hospital_sede_sur;
\echo ''
\echo 'SEDE SUR - Estadísticas'
\echo '======================='
SELECT 
    'Pacientes' as tabla, COUNT(*) as registros FROM Pacientes
UNION ALL
SELECT 'Empleados', COUNT(*) FROM Empleados
UNION ALL
SELECT 'Citas', COUNT(*) FROM Agenda_Cita
UNION ALL
SELECT 'Equipos', COUNT(*) FROM Equipamiento
UNION ALL
SELECT 'Historiales', COUNT(*) FROM Emite_Hist;

\c postgres;
\echo ''
\echo '============================================'
\echo 'INSTALACIÓN COMPLETADA EXITOSAMENTE'
\echo '============================================'
\echo 'Bases de datos creadas:'
\echo '  - hospital_hub (Hub Central)'
\echo '  - hospital_sede_norte (Sede Norte)'
\echo '  - hospital_sede_centro (Sede Centro)'
\echo '  - hospital_sede_sur (Sede Sur)'
\echo ''
\echo 'Roles creados:'
\echo '  - administrador (password: admin_2025)'
\echo '  - medico (password: medico_2025)'
\echo '  - enfermero (password: enfermero_2025)'
\echo '  - personal_administrativo (password: admin_personal_2025)'
\echo ''
\echo 'Características implementadas:'
\echo '  ✓ Sistema distribuido con 1 hub central y 3 sedes'
\echo '  ✓ Replicación automática de datos críticos'
\echo '  ✓ Foreign Data Wrappers configurados'
\echo '  ✓ Control de acceso basado en roles'
\echo '  ✓ Auditoría centralizada'
\echo '  ✓ Vistas consolidadas de red'
\echo '  ✓ Sincronización en tiempo real'
\echo ''
\echo 'Conectar a las bases:'
\echo '  psql -U postgres -d hospital_hub'
\echo '  psql -U postgres -d hospital_sede_norte'
\echo '  psql -U postgres -d hospital_sede_centro'
\echo '  psql -U postgres -d hospital_sede_sur'
\echo '============================================'
