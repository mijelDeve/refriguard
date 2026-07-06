ALTER TABLE rangos_alimentos ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT false;

-- Activar el primer rango por defecto (Lácteos)
UPDATE rangos_alimentos SET activo = true WHERE id = (SELECT id FROM rangos_alimentos ORDER BY id LIMIT 1);
