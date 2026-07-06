CREATE TABLE IF NOT EXISTS dispositivos (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre     TEXT NOT NULL UNIQUE,
  ubicacion  TEXT,
  tipo       TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO dispositivos (nombre, ubicacion, tipo) VALUES
  ('Refrigerador-Cocina', 'Cocina', 'refrigerador'),
  ('Refrigerador-Patio',  'Patio', 'refrigerador'),
  ('Congelador-Sótano',   'Sótano', 'congelador'),
  ('Cava-Vinos',          'Sótano', 'cava')
ON CONFLICT (nombre) DO NOTHING;
