-- Script rápido para verificar se os dados do mapa estão corretos

-- 1. Contar dispositivos
SELECT COUNT(*) as total_dispositivos FROM devices;

-- 2. Contar dispositivos com coordenadas
SELECT COUNT(*) as com_coordenadas 
FROM devices 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 3. Listar primeiros 5 dispositivos com coordenadas
SELECT 
  serial_number,
  name,
  location,
  latitude,
  longitude,
  current_status
FROM devices
WHERE latitude IS NOT NULL AND longitude IS NOT NULL
LIMIT 5;

-- 4. Se não houver dispositivos com coordenadas, execute a migration:
-- Copie e cole o conteúdo de: supabase/migrations/20251209_add_parana_coordinates.sql

