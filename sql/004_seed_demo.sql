-- Seed de datos demo: 4 dispositivos, ~20 lecturas cada uno en las últimas 24h
-- Ejecutar en el SQL Editor de Supabase
-- ATENCIÓN: Borra datos existentes en lecturas_refrigerador e historial_alertas

TRUNCATE TABLE lecturas_refrigerador RESTART IDENTITY CASCADE;

WITH
  device_config (name, temp_base, temp_range, hum_base, hum_range) AS (
    VALUES
      ('Refrigerador-Cocina', 5.0,  3.0,  85.0,  6.0),
      ('Refrigerador-Patio',  3.5,  3.0,  80.0,  8.0),
      ('Congelador-Sótano',   0.0,  10.0, 70.0,  15.0),
      ('Cava-Vinos',          11.5, 2.0,  72.0,  6.0)
  ),
  series AS (
    SELECT generate_series(1, 20) AS i
  ),
  raw AS (
    SELECT
      d.name,
      d.temp_base + (d.temp_range * (random() - 0.5) * 2) AS temp,
      d.hum_base + (d.hum_range * (random() - 0.5) * 2)   AS hum,
      now() - (random() * INTERVAL '24 hours')             AS ts
    FROM device_config d
    CROSS JOIN series s
  ),
  estados AS (
    SELECT *,
      CASE
        WHEN temp < 2                           THEN 'alerta'
        WHEN temp >= 2 AND temp < 4             THEN 'pre-alerta'
        WHEN temp >= 4 AND temp <= 10           THEN 'normal'
        WHEN temp > 10 AND temp <= 12           THEN 'pre-alerta'
        ELSE                                          'alerta'
      END AS estado,
      CASE
        WHEN temp < 2                           THEN 'Temperatura crítica: bajo cero'
        WHEN temp >= 2 AND temp < 4             THEN 'Temperatura baja, acercándose a límite crítico'
        WHEN temp >= 4 AND temp <= 10           THEN 'Temperatura dentro del rango óptimo'
        WHEN temp > 10 AND temp <= 12           THEN 'Temperatura elevada, acercándose a límite crítico'
        ELSE                                          'Temperatura crítica: sobrecalentamiento'
      END AS mensaje
    FROM raw
  )
INSERT INTO lecturas_refrigerador (temperatura, humedad, dispositivo_id, estado, mensaje_estado, created_at)
SELECT
  ROUND(temp::numeric, 2),
  ROUND(GREATEST(0, LEAST(100, hum))::numeric, 2),
  name,
  estado,
  mensaje,
  ts
FROM estados
ORDER BY ts;

-- Poblar historial_alertas con las lecturas en estado alerta
INSERT INTO historial_alertas (lectura_id, temperatura, humedad, dispositivo_id, mensaje)
SELECT id, temperatura, humedad, dispositivo_id, mensaje_estado
FROM lecturas_refrigerador
WHERE estado = 'alerta';
