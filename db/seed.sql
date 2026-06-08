-- ============================================================
--  Chempion Burger — namuna menyu (faqat baza bo'sh bo'lsa yuklanadi)
-- ============================================================

INSERT INTO categories (name, icon, sort_order) VALUES
  ('Burgerlar',    '🍔', 1),
  ('Setlar',       '🍟', 2),
  ('Garnirlar',    '🍗', 3),
  ('Ichimliklar',  '🥤', 4),
  ('Souslar',      '🥫', 5),
  ('Shirinliklar', '🍰', 6);

-- Burgerlar (category_id = 1)
INSERT INTO products (category_id, name, price, description) VALUES
  (1, 'Chempion Burger',   39000, 'Ikki qavat mol go''shti, chedder, maxsus sous'),
  (1, 'Cheeseburger',      28000, 'Klassik pishloqli burger'),
  (1, 'Double Burger',     45000, 'Ikki qavat go''sht, ikki pishloq'),
  (1, 'Chicken Burger',    32000, 'Tovuq filesi, salat, sous'),
  (1, 'Spicy Burger',      34000, 'Achchiq sous bilan');

-- Setlar (2)
INSERT INTO products (category_id, name, price, description) VALUES
  (2, 'Chempion Set',      55000, 'Burger + fri + ichimlik'),
  (2, 'Klassik Set',       42000, 'Cheeseburger + fri + cola');

-- Garnirlar (3)
INSERT INTO products (category_id, name, price, description) VALUES
  (3, 'Fri kartoshka',     15000, 'Yirik bo''lakli'),
  (3, 'Nuggets (6 dona)',  22000, 'Tovuq nuggets'),
  (3, 'Onion rings',       18000, 'Piyoz halqalari');

-- Ichimliklar (4)
INSERT INTO products (category_id, name, price, description) VALUES
  (4, 'Coca-Cola 0.5',      8000, ''),
  (4, 'Fanta 0.5',          8000, ''),
  (4, 'Suv 0.5',            4000, ''),
  (4, 'Choy',               5000, ''),
  (4, 'Kofe',              12000, '');

-- Souslar (5)
INSERT INTO products (category_id, name, price, description) VALUES
  (5, 'Ketchup',            2000, ''),
  (5, 'Mayonez',            2000, ''),
  (5, 'Cheese sous',        5000, '');

-- Shirinliklar (6)
INSERT INTO products (category_id, name, price, description) VALUES
  (6, 'Muzqaymoq',         12000, ''),
  (6, 'Brauni',            15000, 'Shokoladli');
