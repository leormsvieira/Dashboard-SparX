-- Insert sample alerts for testing export functionality
-- This assumes devices already exist from previous migrations

-- Insert critical alerts
INSERT INTO alerts (device_id, temperature, status, message, acknowledged, created_at)
SELECT 
  id,
  65.5,
  'critico',
  '⚠️ TEMPERATURA CRÍTICA: 65.5°C - Ação imediata necessária!',
  false,
  NOW() - INTERVAL '2 hours'
FROM devices
WHERE serial_number = 'ESP32-001'
LIMIT 1;

INSERT INTO alerts (device_id, temperature, status, message, acknowledged, created_at)
SELECT 
  id,
  68.2,
  'critico',
  '⚠️ TEMPERATURA CRÍTICA: 68.2°C - Ação imediata necessária!',
  false,
  NOW() - INTERVAL '1 hour'
FROM devices
WHERE serial_number = 'ESP32-002'
LIMIT 1;

-- Insert precarious alerts
INSERT INTO alerts (device_id, temperature, status, message, acknowledged, created_at)
SELECT 
  id,
  55.3,
  'precario',
  '⚡ Temperatura elevada: 55.3°C - Monitoramento necessário',
  false,
  NOW() - INTERVAL '3 hours'
FROM devices
WHERE serial_number = 'ESP32-003'
LIMIT 1;

INSERT INTO alerts (device_id, temperature, status, message, acknowledged, created_at)
SELECT 
  id,
  52.8,
  'precario',
  '⚡ Temperatura elevada: 52.8°C - Monitoramento necessário',
  true,
  NOW() - INTERVAL '5 hours'
FROM devices
WHERE serial_number = 'ESP32-001'
LIMIT 1;

-- Update the acknowledged alert with acknowledgment details
UPDATE alerts
SET 
  acknowledged_by = 'admin',
  acknowledged_at = NOW() - INTERVAL '4 hours'
WHERE acknowledged = true
  AND acknowledged_by IS NULL;

-- Insert adequate alerts (for completeness)
INSERT INTO alerts (device_id, temperature, status, message, acknowledged, created_at)
SELECT 
  id,
  45.0,
  'adequado',
  'Temperatura normalizada: 45.0°C',
  true,
  NOW() - INTERVAL '6 hours'
FROM devices
WHERE serial_number = 'ESP32-002'
LIMIT 1;

UPDATE alerts
SET 
  acknowledged_by = 'admin',
  acknowledged_at = NOW() - INTERVAL '5 hours 30 minutes'
WHERE status = 'adequado'
  AND acknowledged_by IS NULL;

