-- Enable Realtime for temperature_readings table
ALTER PUBLICATION supabase_realtime ADD TABLE temperature_readings;

-- Enable Realtime for alerts table
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;

-- Enable Realtime for devices table (useful for device status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE devices;

-- Create index for better realtime performance on temperature_readings
CREATE INDEX IF NOT EXISTS idx_temperature_readings_created_at 
ON temperature_readings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_temperature_readings_device_id_created_at 
ON temperature_readings(device_id, created_at DESC);

-- Create index for better realtime performance on alerts
CREATE INDEX IF NOT EXISTS idx_alerts_created_at 
ON alerts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged 
ON alerts(acknowledged, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_alerts_status 
ON alerts(status, created_at DESC);

