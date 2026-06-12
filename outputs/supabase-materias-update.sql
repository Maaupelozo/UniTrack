-- UniTrack - Script para actualizar tabla materias
-- Ejecutar en Supabase SQL Editor
-- Agrega campos de notas TPs y parciales

-- Agregar columnas de notas a la tabla materias
ALTER TABLE materias ADD COLUMN nota_tp_promedio NUMERIC(3,1);
ALTER TABLE materias ADD COLUMN nota_parcial_promedio NUMERIC(3,1);

-- Agregar comentarios descriptivos (opcional, pero recomendado)
COMMENT ON COLUMN materias.nota_tp_promedio IS 'Promedio de notas de trabajos prácticos';
COMMENT ON COLUMN materias.nota_parcial_promedio IS 'Promedio de notas de exámenes parciales';

-- Crear índices para mejor performance
CREATE INDEX idx_materias_usuario ON materias(carrera_id);
CREATE INDEX idx_parciales_materia ON parciales(materia_id);
CREATE INDEX idx_trabajos_practicos_materia ON trabajos_practicos(materia_id);

-- Establecer valores por defecto en NULL para registros existentes (automático)
-- Las nuevas filas tendrán NULL si no se especifica otro valor
