-- =====================================================
-- MIGRACIÓN: CONTROL DE AUTORIZACIÓN PARA SUPERADMIN
-- =====================================================
-- Objetivo:
-- 1. Permitir que cada organización defina si el superadmin
--    puede gestionar usuarios (crear/asignar roles) una vez
--    que ya exista un Administrador activo.
-- 2. Registrar quién autorizó y desde cuándo está activa
--    dicha autorización.
-- =====================================================

ALTER TABLE "ORGANIZACION"
  ADD COLUMN IF NOT EXISTS "autorizaSuperadminUsuarios" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "autorizaSuperadminUsuariosDesde" TIMESTAMP WITH TIME ZONE NULL,
  ADD COLUMN IF NOT EXISTS "autorizaSuperadminUsuariosPor" INTEGER NULL REFERENCES "USUARIO"("idUsuario");

-- Inicialmente se permite al superadmin gestionar organizaciones que aún no tienen administrador asignado.
-- Si ya existe un administrador, la autorización permanecerá desactivada hasta que él mismo la habilite manualmente.

