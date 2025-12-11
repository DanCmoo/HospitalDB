-- ============================================
-- EJECUTAR INSTALACIÓN COMPLETA
-- ============================================
-- Este es el punto de entrada principal
-- Ejecutar como usuario 'postgres'
-- ============================================

\echo '============================================'
\echo 'SISTEMA MULTI-RED HOSPITALARIA'
\echo 'Instalación Completa'
\echo '============================================'
\echo ''
\echo 'Este proceso creará:'
\echo '  - 1 Base de datos HUB Central'
\echo '  - 3 Bases de datos de Sedes'
\echo '  - 4 Roles de usuario'
\echo '  - Foreign Data Wrappers'
\echo '  - Datos de ejemplo'
\echo ''
\echo 'Tiempo estimado: 2-3 minutos'
\echo ''
\echo 'Iniciando instalación...'
\echo '============================================'

\i script.sql

\echo ''
\echo '============================================'
\echo 'Ejecutando verificaciones...'
\echo '============================================'

\i verificacion_final.sql

\echo ''
\echo '============================================'
\echo '✅ INSTALACIÓN COMPLETADA'
\echo '============================================'
\echo ''
\echo 'Próximos pasos:'
\echo '1. Cambiar contraseñas de roles en producción'
\echo '2. Configurar FDW si bases están en servidores remotos'
\echo '3. Probar conectividad: psql -U medico -d hospital_sede_norte'
\echo '4. Revisar vistas consolidadas en cada base'
\echo ''
\echo 'Documentación completa en: README_INSTALACION.md'
\echo '============================================'
