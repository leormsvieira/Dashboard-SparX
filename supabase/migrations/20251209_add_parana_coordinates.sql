-- Migration: Adicionar coordenadas geográficas de transformadores no Paraná
-- Data: 2024-12-09
-- Descrição: Atualiza dispositivos existentes com coordenadas de cidades do Paraná
--            e cria novos dispositivos de teste distribuídos pelo estado

-- Atualizar dispositivos existentes com coordenadas de cidades principais do Paraná
UPDATE devices 
SET 
  latitude = -25.4284,
  longitude = -49.2733,
  location = 'Curitiba - Centro'
WHERE serial_number = 'ESP32-001';

UPDATE devices 
SET 
  latitude = -23.3045,
  longitude = -51.1696,
  location = 'Londrina - Zona Norte'
WHERE serial_number = 'ESP32-002';

UPDATE devices 
SET 
  latitude = -25.0916,
  longitude = -50.1668,
  location = 'Ponta Grossa - Centro'
WHERE serial_number = 'ESP32-003';

-- Inserir novos dispositivos de teste distribuídos pelo Paraná
INSERT INTO devices (serial_number, name, location, latitude, longitude, model, current_status, is_active)
VALUES
  -- Região Metropolitana de Curitiba
  ('ESP32-004', 'Transformador Batel', 'Curitiba - Batel', -25.4372, -49.2844, 'ESP32-WROOM-32', 'adequado', true),
  ('ESP32-005', 'Transformador Água Verde', 'Curitiba - Água Verde', -25.4419, -49.2397, 'ESP32-WROOM-32', 'adequado', true),
  ('ESP32-006', 'Transformador CIC', 'Curitiba - CIC', -25.5297, -49.3297, 'ESP32-WROOM-32', 'precario', true),
  ('ESP32-007', 'Transformador São José', 'São José dos Pinhais', -25.5347, -49.2064, 'ESP32-WROOM-32', 'adequado', true),
  ('ESP32-008', 'Transformador Colombo', 'Colombo - Centro', -25.2917, -49.2244, 'ESP32-WROOM-32', 'adequado', true),
  
  -- Norte do Paraná
  ('ESP32-009', 'Transformador Londrina Sul', 'Londrina - Zona Sul', -23.3200, -51.1628, 'ESP32-WROOM-32', 'critico', true),
  ('ESP32-010', 'Transformador Maringá', 'Maringá - Centro', -23.4205, -51.9333, 'ESP32-WROOM-32', 'adequado', true),
  ('ESP32-011', 'Transformador Apucarana', 'Apucarana - Industrial', -23.5508, -51.4608, 'ESP32-WROOM-32', 'adequado', true),
  ('ESP32-012', 'Transformador Arapongas', 'Arapongas - Centro', -23.4194, -51.4244, 'ESP32-WROOM-32', 'precario', true),
  
  -- Oeste do Paraná
  ('ESP32-013', 'Transformador Cascavel', 'Cascavel - Centro', -24.9558, -53.4552, 'ESP32-WROOM-32', 'adequado', true),
  ('ESP32-014', 'Transformador Foz do Iguaçu', 'Foz do Iguaçu - Centro', -25.5469, -54.5882, 'ESP32-WROOM-32', 'adequado', true),
  ('ESP32-015', 'Transformador Toledo', 'Toledo - Industrial', -24.7136, -53.7428, 'ESP32-WROOM-32', 'critico', true),
  
  -- Sudoeste do Paraná
  ('ESP32-016', 'Transformador Pato Branco', 'Pato Branco - Centro', -26.2289, -52.6708, 'ESP32-WROOM-32', 'adequado', true),
  ('ESP32-017', 'Transformador Francisco Beltrão', 'Francisco Beltrão', -26.0811, -53.0547, 'ESP32-WROOM-32', 'precario', true),
  
  -- Centro-Sul do Paraná
  ('ESP32-018', 'Transformador Guarapuava', 'Guarapuava - Centro', -25.3906, -51.4625, 'ESP32-WROOM-32', 'adequado', true),
  ('ESP32-019', 'Transformador Irati', 'Irati - Centro', -25.4678, -50.6511, 'ESP32-WROOM-32', 'adequado', true),
  
  -- Litoral do Paraná
  ('ESP32-020', 'Transformador Paranaguá', 'Paranaguá - Porto', -25.5163, -48.5097, 'ESP32-WROOM-32', 'precario', true),
  ('ESP32-021', 'Transformador Antonina', 'Antonina - Centro', -25.4289, -48.7119, 'ESP32-WROOM-32', 'adequado', true),
  ('ESP32-022', 'Transformador Pontal do Paraná', 'Pontal do Paraná', -25.6700, -48.5058, 'ESP32-WROOM-32', 'adequado', true),
  
  -- Campos Gerais
  ('ESP32-023', 'Transformador Castro', 'Castro - Centro', -24.7911, -50.0119, 'ESP32-WROOM-32', 'adequado', true),
  ('ESP32-024', 'Transformador Telêmaco Borba', 'Telêmaco Borba - Industrial', -24.3236, -50.6156, 'ESP32-WROOM-32', 'critico', true),
  
  -- Norte Pioneiro
  ('ESP32-025', 'Transformador Cornélio Procópio', 'Cornélio Procópio', -23.1811, -50.6475, 'ESP32-WROOM-32', 'adequado', true),
  ('ESP32-026', 'Transformador Jacarezinho', 'Jacarezinho - Centro', -23.1611, -49.9697, 'ESP32-WROOM-32', 'precario', true),
  
  -- Noroeste do Paraná
  ('ESP32-027', 'Transformador Umuarama', 'Umuarama - Centro', -23.7661, -53.3250, 'ESP32-WROOM-32', 'adequado', true),
  ('ESP32-028', 'Transformador Paranavaí', 'Paranavaí - Industrial', -23.0733, -52.4653, 'ESP32-WROOM-32', 'adequado', true),
  
  -- Vale do Ivaí
  ('ESP32-029', 'Transformador Ivaiporã', 'Ivaiporã - Centro', -24.2500, -51.6789, 'ESP32-WROOM-32', 'precario', true),
  ('ESP32-030', 'Transformador Cianorte', 'Cianorte - Industrial', -23.6633, -52.6050, 'ESP32-WROOM-32', 'critico', true);

-- Criar índice geoespacial para otimizar buscas por localização
CREATE INDEX IF NOT EXISTS idx_devices_location ON devices(latitude, longitude);

-- Comentários para documentação
COMMENT ON COLUMN devices.latitude IS 'Latitude do transformador (coordenadas geográficas)';
COMMENT ON COLUMN devices.longitude IS 'Longitude do transformador (coordenadas geográficas)';

-- Verificar dados inseridos
SELECT 
  name,
  location,
  latitude,
  longitude,
  current_status,
  CASE 
    WHEN current_status = 'critico' THEN '🔴'
    WHEN current_status = 'precario' THEN '🟡'
    ELSE '🟢'
  END as status_icon
FROM devices
WHERE is_active = true
ORDER BY location;

