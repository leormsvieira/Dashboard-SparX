-- Script de teste para verificar atualizações em tempo real
-- Execute este script no SQL Editor do Supabase para testar o Realtime

-- 1. Inserir nova leitura de temperatura (simula ESP32 enviando dados)
INSERT INTO temperature_readings (device_id, temperature, status, timestamp)
SELECT 
  id,
  ROUND((RANDOM() * 40 + 30)::numeric, 1), -- Temperatura entre 30-70°C
  CASE 
    WHEN RANDOM() > 0.7 THEN 'critico'
    WHEN RANDOM() > 0.4 THEN 'precario'
    ELSE 'adequado'
  END,
  NOW()
FROM devices
WHERE is_active = true
LIMIT 1;

-- 2. Criar novo alerta crítico
INSERT INTO alerts (device_id, temperature, status, message, acknowledged, created_at)
SELECT 
  id,
  ROUND((RANDOM() * 20 + 60)::numeric, 1), -- Temperatura crítica 60-80°C
  'critico',
  '⚠️ TESTE REALTIME: Temperatura crítica detectada!',
  false,
  NOW()
FROM devices
WHERE is_active = true
LIMIT 1;

-- 3. Atualizar status de um dispositivo
UPDATE devices
SET 
  current_status = CASE 
    WHEN RANDOM() > 0.5 THEN 'critico'
    ELSE 'adequado'
  END,
  last_reading_at = NOW()
WHERE is_active = true
LIMIT 1;

-- Verificar se os dados foram inseridos
SELECT 
  'Última leitura inserida:' as tipo,
  t.temperature,
  t.status,
  t.timestamp,
  d.name as dispositivo
FROM temperature_readings t
JOIN devices d ON d.id = t.device_id
ORDER BY t.created_at DESC
LIMIT 1;

SELECT 
  'Último alerta criado:' as tipo,
  a.temperature,
  a.status,
  a.message,
  d.name as dispositivo
FROM alerts a
JOIN devices d ON d.id = a.device_id
ORDER BY a.created_at DESC
LIMIT 1;

