-- UniTrack - Politicas RLS para Supabase
-- Ejecutar en Supabase SQL Editor despues de crear las tablas.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE carreras ENABLE ROW LEVEL SECURITY;
ALTER TABLE materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE correlativas ENABLE ROW LEVEL SECURITY;
ALTER TABLE parciales ENABLE ROW LEVEL SECURITY;
ALTER TABLE finales ENABLE ROW LEVEL SECURITY;
ALTER TABLE trabajos_practicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT
USING (id = auth.uid());

CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "carreras_all_own"
ON carreras FOR ALL
USING (usuario_id = auth.uid())
WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "materias_all_own"
ON materias FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM carreras
    WHERE carreras.id = materias.carrera_id
      AND carreras.usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM carreras
    WHERE carreras.id = materias.carrera_id
      AND carreras.usuario_id = auth.uid()
  )
);

CREATE POLICY "correlativas_all_own"
ON correlativas FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM materias
    JOIN carreras ON carreras.id = materias.carrera_id
    WHERE materias.id = correlativas.materia_id
      AND carreras.usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM materias
    JOIN carreras ON carreras.id = materias.carrera_id
    WHERE materias.id = correlativas.materia_id
      AND carreras.usuario_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1
    FROM materias
    JOIN carreras ON carreras.id = materias.carrera_id
    WHERE materias.id = correlativas.correlativa_id
      AND carreras.usuario_id = auth.uid()
  )
);

CREATE POLICY "parciales_all_own"
ON parciales FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM materias
    JOIN carreras ON carreras.id = materias.carrera_id
    WHERE materias.id = parciales.materia_id
      AND carreras.usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM materias
    JOIN carreras ON carreras.id = materias.carrera_id
    WHERE materias.id = parciales.materia_id
      AND carreras.usuario_id = auth.uid()
  )
);

CREATE POLICY "finales_all_own"
ON finales FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM materias
    JOIN carreras ON carreras.id = materias.carrera_id
    WHERE materias.id = finales.materia_id
      AND carreras.usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM materias
    JOIN carreras ON carreras.id = materias.carrera_id
    WHERE materias.id = finales.materia_id
      AND carreras.usuario_id = auth.uid()
  )
);

CREATE POLICY "trabajos_practicos_all_own"
ON trabajos_practicos FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM materias
    JOIN carreras ON carreras.id = materias.carrera_id
    WHERE materias.id = trabajos_practicos.materia_id
      AND carreras.usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM materias
    JOIN carreras ON carreras.id = materias.carrera_id
    WHERE materias.id = trabajos_practicos.materia_id
      AND carreras.usuario_id = auth.uid()
  )
);

CREATE POLICY "eventos_all_own"
ON eventos FOR ALL
USING (usuario_id = auth.uid())
WITH CHECK (usuario_id = auth.uid());
