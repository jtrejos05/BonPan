-- ============================================================
--  BON PAN — Schema PostgreSQL
-- ============================================================

-- Extensión para UUIDs (opcional, usamos SERIAL por simplicidad)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Productos ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS productos (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  category    VARCHAR(50)  NOT NULL,
  price       INTEGER      NOT NULL CHECK (price >= 0),
  description TEXT,
  emoji       VARCHAR(10)  DEFAULT '🥐',
  stock       INTEGER      NOT NULL DEFAULT 0 CHECK (stock >= 0),
  active      BOOLEAN      DEFAULT TRUE,
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Clientes ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clientes (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  phone      VARCHAR(20)  NOT NULL UNIQUE,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Pedidos ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pedidos (
  id          SERIAL PRIMARY KEY,
  cliente_id  INTEGER     REFERENCES clientes(id),
  total       INTEGER     NOT NULL CHECK (total >= 0),
  status      VARCHAR(30) NOT NULL DEFAULT 'Pendiente',
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Items de cada pedido ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS pedido_items (
  id          SERIAL PRIMARY KEY,
  pedido_id   INTEGER     NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id INTEGER     REFERENCES productos(id),
  name        VARCHAR(100) NOT NULL,  -- snapshot del nombre al momento del pedido
  emoji       VARCHAR(10),
  price       INTEGER     NOT NULL,
  qty         INTEGER     NOT NULL CHECK (qty > 0)
);

-- ── Historial de estados ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS pedido_estado_historial (
  id         SERIAL PRIMARY KEY,
  pedido_id  INTEGER     NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  status     VARCHAR(30) NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Log de actividad ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS actividad_log (
  id          SERIAL PRIMARY KEY,
  type        VARCHAR(20) NOT NULL,  -- pedido | estado | producto | carrito | sistema
  description TEXT        NOT NULL,
  data        JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Función para actualizar updated_at automáticamente ────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_productos_updated_at
  BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_pedidos_updated_at
  BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Datos iniciales (productos) ───────────────────────────────
INSERT INTO productos (name, category, price, description, emoji, stock) VALUES
  ('Croissant de Mantequilla',    'Croissants',       4500,  'Croissant hojaldrado tradicional con mantequilla francesa, dorado y crujiente.',             '🥐', 20),
  ('Croissant de Jamón y Queso',  'Croissants',       6500,  'Croissant relleno de jamón serrano y queso gouda derretido.',                               '🥐', 15),
  ('Croissant de Almendras',      'Croissants',       5800,  'Croissant cubierto de crema de almendras y láminas tostadas.',                              '🥐', 12),
  ('Croissant de Chocolate',      'Croissants',       5500,  'Pain au chocolat con barras de chocolate semi-amargo en masa hojaldrada.',                   '🥐', 18),
  ('Croissant de Espinaca',       'Croissants',       6000,  'Croissant salado relleno de espinaca salteada con ajo y queso crema.',                       '🥐', 10),
  ('Pastel de Pollo',             'Pasteles Salados',  8500,  'Hojaldre relleno de pollo desmechado con verduras y salsa bechamel especiada.',              '🥧', 14),
  ('Pastel de Carne',             'Pasteles Salados',  9000,  'Hojaldre dorado con carne molida, cebolla caramelizada y hierbas aromáticas.',               '🥧', 12),
  ('Pastelito de Pollo',          'Pasteles Salados',  5500,  'Porción individual de hojaldre relleno de pollo en salsa suave.',                            '🥧', 20),
  ('Pastelito de Carne',          'Pasteles Salados',  5800,  'Mini pastel hojaldrado con carne molida y papas.',                                           '🥧', 20),
  ('Vol-au-vent de Pollo',        'Pasteles Salados',  7500,  'Canastilla de hojaldre rellena de pollo en salsa de champiñones y crema.',                   '🥧',  8),
  ('Empanada de Hojaldre Carne',  'Pasteles Salados',  4800,  'Empanada crujiente de masa hojaldrada con guiso de carne y aceitunas.',                      '🥧', 25),
  ('Empanada de Hojaldre Pollo',  'Pasteles Salados',  4800,  'Empanada hojaldrada con relleno de pollo, champiñones y hierbas finas.',                     '🥧', 25),
  ('Milhojas de Crema',           'Hojaldre Dulce',    7500,  'Capas de hojaldre crujiente con crema pastelera de vainilla y azúcar glass.',                '🍰', 10),
  ('Palmera de Azúcar',           'Hojaldre Dulce',    3500,  'Galleta de hojaldre enrollada en azúcar caramelizada.',                                      '🍪', 30),
  ('Tarta de Manzana Hojaldre',   'Hojaldre Dulce',    9500,  'Base de hojaldre con crema de almendras y láminas de manzana acarameladas.',                 '🥧',  6),
  ('Napolitana de Chocolate',     'Hojaldre Dulce',    5000,  'Triángulo de hojaldre relleno de crema de chocolate y avellana.',                            '🍫', 15),
  ('Strudel de Frutas',           'Hojaldre Dulce',    8000,  'Rollo hojaldrado con manzana, canela, pasas y nueces.',                                      '🥧',  8),
  ('Café Americano',              'Bebidas',           4000,  'Café de origen colombiano, tostado en casa.',                                                '☕', 50),
  ('Chocolate Caliente',          'Bebidas',           5500,  'Chocolate espeso con leche entera y canela.',                                                '☕', 50),
  ('Capuchino',                   'Bebidas',           6000,  'Espresso doble con espuma de leche cremosa y toque de canela.',                              '☕', 50)
ON CONFLICT DO NOTHING;
