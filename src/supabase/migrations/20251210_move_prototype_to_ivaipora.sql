-- Migration: Mover protótipo funcional para Ivaiporã
-- Data: 2024-12-10
-- Descrição: Atualiza o dispositivo esp32-transformador-prototype para as coordenadas
--            de Ivaiporã e remove o dispositivo ESP32-029 (Transformador Ivaiporã)

-- 1. Atualizar o protótipo funcional para as coordenadas de Ivaiporã
UPDATE devices
SET 
  location = 'Ivaiporã - Centro',
  latitude = -24.2500,
  longitude = -51.6789,
  name = 'Transformador Ivaiporã',
  current_status = 'precario'
WHERE serial_number = 'esp32-transformador-prototype';

-- 2. Deletar o transformador ESP32-029 (antigo Transformador Ivaiporã)
DELETE FROM devices
WHERE serial_number = 'ESP32-029';

-- 3. Verificar a mudança
SELECT 
  serial_number,
  name,
  location,
  latitude,
  longitude,
  current_status,
  model
FROM devices
WHERE serial_number = 'esp32-transformador-prototype';

