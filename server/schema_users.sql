-- ── Usuarios ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  password     VARCHAR(255),           -- NULL si se registró con Google
  google_id    VARCHAR(100) UNIQUE,    -- NULL si se registró con email
  avatar       VARCHAR(500),           -- URL foto de perfil (Google)
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER trg_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
