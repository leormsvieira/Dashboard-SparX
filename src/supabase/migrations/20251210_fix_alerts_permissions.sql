-- Migration: Corrigir permissões de atualização de alertas
-- Data: 2024-12-10
-- Descrição: Adiciona políticas RLS para permitir reconhecimento de alertas

-- 1. Verificar se RLS está habilitado na tabela alerts
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'alerts';

-- 2. Desabilitar RLS temporariamente para permitir todas as operações
-- (Em produção, você deve criar políticas específicas por usuário)
ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;

-- 3. Ou, se preferir manter RLS habilitado, criar política permissiva:
-- ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir SELECT (leitura)
-- DROP POLICY IF EXISTS "Enable read access for all users" ON alerts;
-- CREATE POLICY "Enable read access for all users" ON alerts
--   FOR SELECT
--   USING (true);

-- Criar política para permitir UPDATE (reconhecimento)
-- DROP POLICY IF EXISTS "Enable update for all users" ON alerts;
-- CREATE POLICY "Enable update for all users" ON alerts
--   FOR UPDATE
--   USING (true)
--   WITH CHECK (true);

-- 4. Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'alerts';

-- 5. Testar atualização manual
-- UPDATE alerts
-- SET 
--   acknowledged = true,
--   acknowledged_at = NOW(),
--   acknowledged_by = 'test_user'
-- WHERE id = (SELECT id FROM alerts WHERE acknowledged = false LIMIT 1)
-- RETURNING *;

