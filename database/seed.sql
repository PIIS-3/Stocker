-- ==========================================================
-- SEED DATA COMPLETO PARA STOCKER (Categorías y Productos)
-- ==========================================================

-- 1. ROLES
INSERT INTO role (role_name, status) VALUES 
('SuperAdmin', 'Active'), 
('Manager', 'Active'), 
('Staff', 'Active') 
ON CONFLICT (role_name) DO NOTHING;

-- 2. TIENDA CENTRAL
INSERT INTO store (store_name, address, status) VALUES 
('Tienda Central Madrid', 'Calle de Alcalá 1, Madrid', 'Active')
ON CONFLICT (store_name) DO NOTHING;

-- 3. CATEGORÍAS (Esenciales para organizar el stock)
INSERT INTO category (category_name, description, status) VALUES 
('Electrónica', 'Dispositivos, cables y componentes tecnológicos', 'Active'),
('Herramientas', 'Herramientas manuales y eléctricas para mantenimiento', 'Active'),
('Papelería', 'Material de oficina, papel y consumibles', 'Active')
ON CONFLICT (category_name) DO NOTHING;

-- 4. USUARIOS (Admin, Manager y Staff)
-- Password: 'admin123' (hash simulado para pruebas)
INSERT INTO employee (first_name, last_name, username, hashed_password, role_id, store_id, status) VALUES 
(
  'Admin', 'Sistema', 'superadmin', '$2b$12$N9uXZeB9lP...mockedhash',
  (SELECT id_role FROM role WHERE role_name = 'SuperAdmin' LIMIT 1),
  (SELECT id_store FROM store LIMIT 1),
  'Active'
),
(
  'Ana', 'Gerente', 'manager_madrid', '$2b$12$N9uXZeB9lP...mockedhash',
  (SELECT id_role FROM role WHERE role_name = 'Manager' LIMIT 1),
  (SELECT id_store FROM store WHERE store_name = 'Tienda Central Madrid' LIMIT 1),
  'Active'
),
(
  'Carlos', 'Operario', 'worker_1', '$2b$12$N9uXZeB9lP...mockedhash',
  (SELECT id_role FROM role WHERE role_name = 'Staff' LIMIT 1),
  (SELECT id_store FROM store WHERE store_name = 'Tienda Central Madrid' LIMIT 1),
  'Active'
) ON CONFLICT (username) DO NOTHING;

-- 5. PRODUCTOS DE PRUEBA
-- Insertamos productos variados para probar precios y categorías
INSERT INTO product_template (product_name, sku, fixed_selling_price, category_id, status) VALUES 
(
  'Monitor 24 Pulgadas LED', 
  'ELEC-MON-001', 
  150.00, 
  (SELECT id_category FROM category WHERE category_name = 'Electrónica' LIMIT 1),
  'Active'
),
(
  'Teclado Mecánico RGB', 
  'ELEC-TEC-002', 
  85.50, 
  (SELECT id_category FROM category WHERE category_name = 'Electrónica' LIMIT 1),
  'Active'
),
(
  'Taladro Percutor 18V', 
  'TOOL-TAL-045', 
  120.00, 
  (SELECT id_category FROM category WHERE category_name = 'Herramientas' LIMIT 1),
  'Active'
),
(
  'Caja de Folios A4 (500h)', 
  'PAP-FOL-100', 
  5.95, 
  (SELECT id_category FROM category WHERE category_name = 'Papelería' LIMIT 1),
  'Active'
) ON CONFLICT (sku) DO NOTHING;