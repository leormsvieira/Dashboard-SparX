-- Adicionar dispositivo esp32-transformador-prototype ao Supabase
-- Execute este SQL no SQL Editor do Supabase

INSERT INTO devices (serial_number, name, location, latitude, longitude, model, current_status)
VALUES (
  'esp32-transformador-prototype',
  'Transformador Ivaiporã',
  'Ivaiporã - Centro',
  -24.2500,
  -51.6789,
  'ESP32-WROOM-32',
  'precario'
)
ON CONFLICT (serial_number) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  current_status = EXCLUDED.current_status;

-- Verificar se foi criado/atualizado
SELECT * FROM devices WHERE serial_number = 'esp32-transformador-prototype';
