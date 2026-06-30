-- Agregar columna puntos a tabla usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS puntos INTEGER NOT NULL DEFAULT 0;
