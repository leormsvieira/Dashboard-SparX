-- SparX - Consultas SQL Úteis
-- Execute estas queries no SQL Editor do Supabase

-- ============================================
-- 1. VERIFICAR DISPOSITIVOS
-- ============================================

-- Listar todos os dispositivos
SELECT 
  serial_number,
  name,
  location,
  current_status,
  last_reading_at,
  is_active
FROM devices
ORDER BY name;

-- Dispositivos com status crítico
SELECT * FROM devices 
WHERE current_status = 'critico' 
  AND is_active = true;

-- ============================================
-- 2. LEITURAS DE TEMPERATURA
-- ============================================

-- Últimas 10 leituras
SELECT 
  d.name,
  d.serial_number,
  t.temperature,
  t.status,
  t.timestamp
FROM temperature_readings t
JOIN devices d ON t.device_id = d.id
ORDER BY t.timestamp DESC
LIMIT 10;

-- Temperatura média por dispositivo (últimas 24h)
SELECT 
  d.name,
  d.serial_number,
  ROUND(AVG(t.temperature)::numeric, 2) as temp_media,
  ROUND(MIN(t.temperature)::numeric, 2) as temp_min,
  ROUND(MAX(t.temperature)::numeric, 2) as temp_max,
  COUNT(*) as num_leituras
FROM temperature_readings t
JOIN devices d ON t.device_id = d.id
WHERE t.timestamp > NOW() - INTERVAL '24 hours'
GROUP BY d.id, d.name, d.serial_number
ORDER BY temp_media DESC;

-- Leituras de um dispositivo específico
SELECT 
  temperature,
  status,
  timestamp
FROM temperature_readings
WHERE device_id = (
  SELECT id FROM devices 
  WHERE serial_number = 'esp32-001'
)
ORDER BY timestamp DESC
LIMIT 50;

-- ============================================
-- 3. ALERTAS
-- ============================================

-- Alertas não reconhecidos
SELECT 
  d.name,
  a.temperature,
  a.status,
  a.message,
  a.created_at
FROM alerts a
JOIN devices d ON a.device_id = d.id
WHERE a.acknowledged = false
ORDER BY a.created_at DESC;

-- Todos os alertas de hoje
SELECT 
  d.name,
  a.status,
  a.temperature,
  a.message,
  a.created_at,
  a.acknowledged
FROM alerts a
JOIN devices d ON a.device_id = d.id
WHERE DATE(a.created_at) = CURRENT_DATE
ORDER BY a.created_at DESC;

-- Reconhecer um alerta
UPDATE alerts 
SET 
  acknowledged = true,
  acknowledged_at = NOW(),
  acknowledged_by = 'admin'
WHERE id = 'COLE_O_ID_AQUI';

-- ============================================
-- 4. ESTATÍSTICAS
-- ============================================

-- Resumo geral do sistema
SELECT 
  COUNT(*) FILTER (WHERE is_active = true) as dispositivos_ativos,
  COUNT(*) FILTER (WHERE current_status = 'adequado') as adequados,
  COUNT(*) FILTER (WHERE current_status = 'precario') as precarios,
  COUNT(*) FILTER (WHERE current_status = 'critico') as criticos
FROM devices;

-- Leituras por dia (última semana)
SELECT 
  DATE(timestamp) as data,
  COUNT(*) as num_leituras,
  ROUND(AVG(temperature)::numeric, 2) as temp_media
FROM temperature_readings
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY DATE(timestamp)
ORDER BY data DESC;

-- ============================================
-- 5. MANUTENÇÃO
-- ============================================

-- Limpar leituras antigas (mais de 30 dias)
DELETE FROM temperature_readings
WHERE timestamp < NOW() - INTERVAL '30 days';

-- Limpar alertas reconhecidos antigos (mais de 60 dias)
DELETE FROM alerts
WHERE acknowledged = true
  AND acknowledged_at < NOW() - INTERVAL '60 days';

-- Resetar status de um dispositivo
UPDATE devices
SET current_status = 'adequado'
WHERE serial_number = 'esp32-001';

-- ============================================
-- 6. INSERIR DADOS DE TESTE
-- ============================================

-- Adicionar novo dispositivo
INSERT INTO devices (serial_number, name, location, latitude, longitude, model)
VALUES (
  'esp32-002',
  'Transformador Teste 2',
  'Laboratório - Sala 102',
  -25.4290,
  -49.2740,
  'ESP32-WROOM-32'
)
RETURNING *;

-- Simular leitura de temperatura
INSERT INTO temperature_readings (
  device_id,
  temperature,
  status,
  timestamp
)
VALUES (
  (SELECT id FROM devices WHERE serial_number = 'esp32-001'),
  55.5,
  'precario',
  NOW()
)
RETURNING *;

-- ============================================
-- 7. VALIDAÇÃO
-- ============================================

-- Verificar integridade dos dados
SELECT 
  'Devices sem leituras' as issue,
  COUNT(*) as count
FROM devices d
LEFT JOIN temperature_readings t ON d.id = t.device_id
WHERE t.id IS NULL AND d.is_active = true

UNION ALL

SELECT 
  'Leituras órfãs' as issue,
  COUNT(*) as count
FROM temperature_readings t
LEFT JOIN devices d ON t.device_id = d.id
WHERE d.id IS NULL;

-- Dispositivos que não enviam dados há mais de 1 hora
SELECT 
  serial_number,
  name,
  last_reading_at,
  NOW() - last_reading_at as tempo_sem_dados
FROM devices
WHERE is_active = true
  AND (last_reading_at IS NULL OR last_reading_at < NOW() - INTERVAL '1 hour')
ORDER BY last_reading_at NULLS FIRST;

-- ============================================
-- 8. VIEWS ÚTEIS (OPCIONAL)
-- ============================================

-- View: Últimas leituras de cada dispositivo
CREATE OR REPLACE VIEW latest_readings AS
SELECT DISTINCT ON (d.id)
  d.id as device_id,
  d.serial_number,
  d.name,
  d.location,
  d.current_status,
  t.temperature,
  t.timestamp
FROM devices d
LEFT JOIN temperature_readings t ON d.id = t.device_id
ORDER BY d.id, t.timestamp DESC NULLS LAST;

-- Usar a view
SELECT * FROM latest_readings;

-- View: Dashboard summary
CREATE OR REPLACE VIEW dashboard_summary AS
SELECT 
  COUNT(DISTINCT d.id) as total_devices,
  COUNT(DISTINCT d.id) FILTER (WHERE d.is_active = true) as active_devices,
  COUNT(DISTINCT d.id) FILTER (WHERE d.current_status = 'critico') as critical_devices,
  COUNT(DISTINCT d.id) FILTER (WHERE d.current_status = 'precario') as warning_devices,
  COUNT(a.id) FILTER (WHERE a.acknowledged = false) as unacknowledged_alerts,
  ROUND(AVG(t.temperature)::numeric, 2) as avg_temperature
FROM devices d
LEFT JOIN temperature_readings t ON d.id = t.device_id 
  AND t.timestamp > NOW() - INTERVAL '1 hour'
LEFT JOIN alerts a ON d.id = a.device_id
  AND a.created_at > NOW() - INTERVAL '24 hours';

-- Usar a view
SELECT * FROM dashboard_summary;

-- ============================================
-- 9. FUNÇÕES ÚTEIS
-- ============================================

-- Função: Obter temperatura atual de um dispositivo
CREATE OR REPLACE FUNCTION get_current_temperature(device_serial TEXT)
RETURNS TABLE (
  temperature DECIMAL,
  status alert_status,
  timestamp TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT t.temperature, t.status, t.timestamp
  FROM temperature_readings t
  JOIN devices d ON t.device_id = d.id
  WHERE d.serial_number = device_serial
  ORDER BY t.timestamp DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Usar a função
SELECT * FROM get_current_temperature('esp32-001');

-- ============================================
-- 10. BACKUP & RESTORE
-- ============================================

-- Exportar dispositivos (copie o resultado)
SELECT json_agg(row_to_json(devices.*))
FROM devices;

-- Exportar últimas 1000 leituras
SELECT json_agg(row_to_json(temperature_readings.*))
FROM (
  SELECT * FROM temperature_readings 
  ORDER BY timestamp DESC 
  LIMIT 1000
) temperature_readings;
