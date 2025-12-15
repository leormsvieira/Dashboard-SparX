-- Script para verificar se os dispositivos têm coordenadas

-- Contar total de dispositivos
SELECT 
  'Total de dispositivos' as info,
  COUNT(*) as quantidade
FROM devices;

-- Contar dispositivos com coordenadas
SELECT 
  'Dispositivos com coordenadas' as info,
  COUNT(*) as quantidade
FROM devices
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Listar todos os dispositivos com suas coordenadas
SELECT 
  serial_number,
  name,
  location,
  latitude,
  longitude,
  current_status,
  is_active
FROM devices
ORDER BY serial_number;

-- Verificar se há dispositivos sem coordenadas
SELECT 
  serial_number,
  name,
  location,
  'SEM COORDENADAS' as problema
FROM devices
WHERE latitude IS NULL OR longitude IS NULL;

