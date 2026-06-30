-- Tabla principal de lecturas
CREATE TABLE IF NOT EXISTS lecturas_refrigerador (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at      TIMESTAMPTZ       DEFAULT now(),
  temperatura     NUMERIC(5, 2)     NOT NULL,
  humedad         NUMERIC(5, 2)     NOT NULL,
  dispositivo_id  TEXT              NOT NULL,
  estado          TEXT              NOT NULL DEFAULT 'normal',
  mensaje_estado  TEXT
);

-- Tabla de historial de alertas
CREATE TABLE IF NOT EXISTS historial_alertas (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at      TIMESTAMPTZ       DEFAULT now(),
  lectura_id      BIGINT            REFERENCES lecturas_refrigerador(id),
  temperatura     NUMERIC(5, 2)     NOT NULL,
  humedad         NUMERIC(5, 2)     NOT NULL,
  dispositivo_id  TEXT              NOT NULL,
  mensaje         TEXT
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_lecturas_dispositivo ON lecturas_refrigerador(dispositivo_id);
CREATE INDEX IF NOT EXISTS idx_lecturas_estado ON lecturas_refrigerador(estado);
CREATE INDEX IF NOT EXISTS idx_historial_alertas_dispositivo ON historial_alertas(dispositivo_id);
