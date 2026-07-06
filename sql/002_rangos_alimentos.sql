CREATE TABLE IF NOT EXISTS rangos_alimentos (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre         TEXT              NOT NULL UNIQUE,
  temp_min       NUMERIC(5, 2)    NOT NULL,
  temp_max       NUMERIC(5, 2)    NOT NULL,
  humedad_min    NUMERIC(5, 2)    NOT NULL,
  humedad_max    NUMERIC(5, 2)    NOT NULL,
  created_at     TIMESTAMPTZ      DEFAULT now()
);

INSERT INTO rangos_alimentos (nombre, temp_min, temp_max, humedad_min, humedad_max) VALUES
  ('Lácteos', 1.0, 4.0, 85.0, 95.0),
  ('Carnes rojas', -1.0, 3.0, 80.0, 90.0),
  ('Aves y pescados', -1.0, 2.0, 85.0, 95.0),
  ('Verduras y hortalizas', 2.0, 8.0, 90.0, 100.0),
  ('Frutas', 2.0, 7.0, 85.0, 95.0),
  ('Huevos', 1.0, 5.0, 80.0, 90.0),
  ('Bebidas', 2.0, 6.0, 70.0, 85.0)
ON CONFLICT (nombre) DO NOTHING;
