-- Create enum for alert status
CREATE TYPE alert_status AS ENUM ('adequado', 'precario', 'critico');

-- Create devices table (transformadores)
CREATE TABLE public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  model TEXT,
  installation_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_reading_at TIMESTAMP WITH TIME ZONE,
  current_status alert_status DEFAULT 'adequado',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create temperature_readings table
CREATE TABLE public.temperature_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE NOT NULL,
  temperature DECIMAL(5, 2) NOT NULL,
  status alert_status NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create alerts table (histórico de alertas)
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE NOT NULL,
  temperature DECIMAL(5, 2) NOT NULL,
  status alert_status NOT NULL,
  message TEXT,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temperature_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access (monitoring dashboard)
CREATE POLICY "Enable read access for all users" ON public.devices FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.temperature_readings FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.alerts FOR SELECT USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_temperature_readings_device_id ON public.temperature_readings(device_id);
CREATE INDEX idx_temperature_readings_timestamp ON public.temperature_readings(timestamp DESC);
CREATE INDEX idx_alerts_device_id ON public.alerts(device_id);
CREATE INDEX idx_alerts_created_at ON public.alerts(created_at DESC);
CREATE INDEX idx_alerts_acknowledged ON public.alerts(acknowledged);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for devices table
CREATE TRIGGER update_devices_updated_at
  BEFORE UPDATE ON public.devices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.devices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.temperature_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;

-- Insert sample data for demonstration
INSERT INTO public.devices (serial_number, name, location, latitude, longitude, model, current_status) VALUES
  ('ESP32-001', 'Transformador Curitiba Centro', 'Curitiba - Centro', -25.4284, -49.2733, 'ESP32-WROOM-32', 'adequado'),
  ('ESP32-002', 'Transformador Maringá Norte', 'Maringá - Zona Norte', -23.4273, -51.9375, 'ESP32-WROOM-32', 'precario'),
  ('ESP32-003', 'Transformador Londrina Sul', 'Londrina - Zona Sul', -23.3045, -51.1696, 'ESP32-WROOM-32', 'critico'),
  ('ESP32-004', 'Transformador Ponta Grossa', 'Ponta Grossa - Industrial', -25.0916, -50.1668, 'ESP32-WROOM-32', 'adequado');

-- Insert sample temperature readings
INSERT INTO public.temperature_readings (device_id, temperature, status, timestamp) 
SELECT 
  d.id,
  CASE 
    WHEN d.current_status = 'adequado' THEN 45.5
    WHEN d.current_status = 'precario' THEN 56.2
    ELSE 68.7
  END,
  d.current_status,
  now() - (random() * interval '1 hour')
FROM public.devices d;

-- Update last_reading_at for devices
UPDATE public.devices d
SET last_reading_at = (
  SELECT MAX(timestamp) 
  FROM public.temperature_readings tr 
  WHERE tr.device_id = d.id
);