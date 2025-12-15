-- Script Rápido: Gerar apenas 1 leitura atual para cada transformador
-- Use este script se quiser apenas testar rapidamente sem gerar muitos dados

-- Gerar 1 leitura atual para cada dispositivo (exceto protótipo)
INSERT INTO temperature_readings (device_id, temperature, status, timestamp)
SELECT 
  d.id,
  CASE 
    WHEN d.current_status = 'adequado' THEN ROUND((40 + RANDOM() * 10)::numeric, 1)
    WHEN d.current_status = 'precario' THEN ROUND((51 + RANDOM() * 9)::numeric, 1)
    WHEN d.current_status = 'critico' THEN ROUND((61 + RANDOM() * 15)::numeric, 1)
    ELSE 45.0
  END as temperature,
  d.current_status,
  NOW()
FROM devices d
WHERE d.serial_number != 'esp32-transformador-prototype'
  AND d.is_active = true;

-- Atualizar last_reading_at
UPDATE devices
SET last_reading_at = NOW()
WHERE serial_number != 'esp32-transformador-prototype'
  AND is_active = true;

-- Verificar
SELECT 
  d.name,
  d.current_status,
  tr.temperature,
  tr.timestamp
FROM devices d
LEFT JOIN temperature_readings tr ON tr.device_id = d.id
WHERE d.serial_number != 'esp32-transformador-prototype'
  AND tr.timestamp >= NOW() - INTERVAL '1 minute'
ORDER BY d.name;

