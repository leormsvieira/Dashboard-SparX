-- Migration: Gerar leituras de temperatura de teste para todos os transformadores
-- Data: 2024-12-10
-- Descrição: Cria leituras de temperatura realistas para os 29 transformadores (exceto o protótipo)
--            Simula dados das últimas 24 horas com variações realistas

-- 1. Limpar leituras antigas de teste (opcional - comente se quiser manter)
-- DELETE FROM temperature_readings 
-- WHERE device_id IN (
--   SELECT id FROM devices WHERE serial_number != 'esp32-transformador-prototype'
-- );

-- 2. Função para gerar leituras de temperatura baseadas no status do dispositivo
DO $$
DECLARE
  device_record RECORD;
  reading_time TIMESTAMP;
  base_temp DECIMAL(5,2);
  temp_variation DECIMAL(5,2);
  current_temp DECIMAL(5,2);
  reading_status alert_status;
  i INTEGER;
BEGIN
  -- Para cada dispositivo (exceto o protótipo)
  FOR device_record IN
    SELECT d.id, d.serial_number, d.current_status, d.name
    FROM devices d
    WHERE d.serial_number != 'esp32-transformador-prototype'
    AND d.is_active = true
  LOOP
    -- Gerar 10 leituras (últimas 5 horas, uma a cada 30 minutos)
    FOR i IN 0..9 LOOP
      reading_time := NOW() - (i * INTERVAL '30 minutes');

      -- Definir temperatura base de acordo com o status atual (com variação a cada leitura)
      CASE device_record.current_status
        WHEN 'adequado' THEN
          base_temp := 40.0 + (RANDOM() * 10); -- 40-50°C
        WHEN 'precario' THEN
          base_temp := 51.0 + (RANDOM() * 9);  -- 51-60°C
        WHEN 'critico' THEN
          base_temp := 61.0 + (RANDOM() * 15); -- 61-76°C
        ELSE
          base_temp := 45.0;
      END CASE;

      -- Adicionar variação aleatória adicional (-2°C a +2°C)
      temp_variation := (RANDOM() * 4) - 2;
      current_temp := base_temp + temp_variation;

      -- Garantir que a temperatura não seja negativa
      IF current_temp < 0 THEN
        current_temp := 0;
      END IF;

      -- Determinar status baseado na temperatura
      IF current_temp < 51 THEN
        reading_status := 'adequado';
      ELSIF current_temp >= 51 AND current_temp <= 60 THEN
        reading_status := 'precario';
      ELSE
        reading_status := 'critico';
      END IF;

      -- Inserir leitura
      INSERT INTO temperature_readings (device_id, temperature, status, timestamp)
      VALUES (
        device_record.id,
        ROUND(current_temp, 1),
        reading_status,
        reading_time
      );
    END LOOP;

    -- Atualizar last_reading_at do dispositivo
    UPDATE devices
    SET last_reading_at = NOW()
    WHERE id = device_record.id;

    RAISE NOTICE 'Geradas 10 leituras para: %', device_record.name;
  END LOOP;
END $$;

-- 3. Gerar alertas para leituras críticas e precárias recentes (últimas 6 horas)
INSERT INTO alerts (device_id, temperature, status, message, acknowledged, created_at)
SELECT 
  tr.device_id,
  tr.temperature,
  tr.status,
  CASE 
    WHEN tr.status = 'critico' THEN 
      '⚠️ TEMPERATURA CRÍTICA: ' || tr.temperature || '°C - Ação imediata necessária!'
    WHEN tr.status = 'precario' THEN 
      '⚡ Temperatura elevada: ' || tr.temperature || '°C - Monitoramento necessário'
    ELSE
      'Temperatura normal: ' || tr.temperature || '°C'
  END,
  CASE 
    WHEN RANDOM() > 0.7 THEN true  -- 30% dos alertas já reconhecidos
    ELSE false
  END,
  tr.timestamp
FROM temperature_readings tr
WHERE tr.timestamp >= NOW() - INTERVAL '6 hours'
  AND tr.status IN ('critico', 'precario')
  AND tr.device_id IN (
    SELECT id FROM devices WHERE serial_number != 'esp32-transformador-prototype'
  )
  -- Evitar duplicatas
  AND NOT EXISTS (
    SELECT 1 FROM alerts a 
    WHERE a.device_id = tr.device_id 
    AND a.created_at = tr.timestamp
  )
ORDER BY tr.timestamp DESC;

-- 4. Verificar resultados
SELECT 
  d.name,
  d.serial_number,
  d.current_status,
  COUNT(tr.id) as total_readings,
  ROUND(AVG(tr.temperature), 1) as avg_temp,
  ROUND(MIN(tr.temperature), 1) as min_temp,
  ROUND(MAX(tr.temperature), 1) as max_temp,
  MAX(tr.timestamp) as last_reading
FROM devices d
LEFT JOIN temperature_readings tr ON tr.device_id = d.id
WHERE d.serial_number != 'esp32-transformador-prototype'
GROUP BY d.id, d.name, d.serial_number, d.current_status
ORDER BY d.name;

-- 5. Resumo de alertas gerados
SELECT 
  status,
  COUNT(*) as total_alerts,
  SUM(CASE WHEN acknowledged THEN 1 ELSE 0 END) as acknowledged_count,
  SUM(CASE WHEN NOT acknowledged THEN 1 ELSE 0 END) as pending_count
FROM alerts
WHERE device_id IN (
  SELECT id FROM devices WHERE serial_number != 'esp32-transformador-prototype'
)
GROUP BY status
ORDER BY status;

