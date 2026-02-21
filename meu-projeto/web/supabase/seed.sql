-- =============================================================
-- SYNKRA LAUNDRY OS — Seed de Teste
-- Execute no SQL Editor do Supabase (com service_role)
-- Após rodar: acesse http://localhost:3000/login
-- Senha de todos os usuários de teste: Synkra@123
-- =============================================================

-- IDs fixos para facilitar referências
-- Unidades
-- 10000000-0000-0000-0000-000000000001  → Unidade Centro
-- 10000000-0000-0000-0000-000000000002  → Unidade Norte

-- Usuários de teste
-- a0000000-0000-0000-0000-000000000001  → gerente@synkra.test   (unit_manager)
-- a0000000-0000-0000-0000-000000000002  → operador@synkra.test  (operator / washing)
-- a0000000-0000-0000-0000-000000000003  → motorista@synkra.test (driver)
-- a0000000-0000-0000-0000-000000000004  → loja@synkra.test      (store)

-- =============================================================
-- 1. UNIDADES
-- =============================================================
INSERT INTO units (id, name, slug, address, city, state, phone, active)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Unidade Centro', 'centro',
   'Rua das Flores, 100', 'São Paulo', 'SP', '(11) 3000-0001', true),
  ('10000000-0000-0000-0000-000000000002', 'Unidade Norte', 'norte',
   'Av. Norte, 500', 'São Paulo', 'SP', '(11) 3000-0002', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 2. USUÁRIOS AUTH (cria diretamente na tabela auth.users)
-- =============================================================
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
)
VALUES
  -- Gerente de Unidade
  ('00000000-0000-0000-0000-000000000000',
   'a0000000-0000-0000-0000-000000000001',
   'authenticated', 'authenticated', 'gerente@synkra.test',
   crypt('Synkra@123', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, NOW(), NOW()),

  -- Operador
  ('00000000-0000-0000-0000-000000000000',
   'a0000000-0000-0000-0000-000000000002',
   'authenticated', 'authenticated', 'operador@synkra.test',
   crypt('Synkra@123', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, NOW(), NOW()),

  -- Motorista
  ('00000000-0000-0000-0000-000000000000',
   'a0000000-0000-0000-0000-000000000003',
   'authenticated', 'authenticated', 'motorista@synkra.test',
   crypt('Synkra@123', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, NOW(), NOW()),

  -- Loja (store)
  ('00000000-0000-0000-0000-000000000000',
   'a0000000-0000-0000-0000-000000000004',
   'authenticated', 'authenticated', 'loja@synkra.test',
   crypt('Synkra@123', gen_salt('bf')), NOW(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 3. PROFILES DOS USUÁRIOS DE TESTE
-- =============================================================
INSERT INTO profiles (id, full_name, role, unit_id, sector, active)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Carlos Gerente',    'unit_manager', '10000000-0000-0000-0000-000000000001', null,      true),
  ('a0000000-0000-0000-0000-000000000002', 'Ana Operadora',     'operator',     '10000000-0000-0000-0000-000000000001', 'washing', true),
  ('a0000000-0000-0000-0000-000000000003', 'João Motorista',    'driver',       '10000000-0000-0000-0000-000000000001', null,      true),
  ('a0000000-0000-0000-0000-000000000004', 'Boa Aparência Loja','store',        '10000000-0000-0000-0000-000000000001', null,      true)
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 4. EQUIPAMENTOS
-- =============================================================
INSERT INTO equipment (id, unit_id, name, type, brand, model, serial_number, capacity_kg, status)
VALUES
  -- Centro
  ('e1000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Lavadora Industrial 1', 'washer',  'Electrolux',  'WP-25', 'SN-001', 25, 'active'),
  ('e1000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Lavadora Industrial 2', 'washer',  'Electrolux',  'WP-25', 'SN-002', 25, 'active'),
  ('e1000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Secadora 1',            'dryer',   'Primus',      'T-30',  'SN-003', 30, 'active'),
  ('e1000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Calandra Grande',       'ironer',  'Jensen',      'CA-60', 'SN-004', null,'active'),
  ('e1000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'Secadora 2',            'dryer',   'Primus',      'T-30',  'SN-005', 30, 'maintenance'),
  -- Norte
  ('e2000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Lavadora Norte 1',      'washer',  'Girbau',      'GS-20', 'SN-101', 20, 'active'),
  ('e2000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Secadora Norte 1',      'dryer',   'Girbau',      'GD-20', 'SN-102', 20, 'active')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 5. INSUMOS QUÍMICOS
-- =============================================================
INSERT INTO chemical_products (id, unit_id, name, category, measure_unit, cost_per_unit, minimum_stock, supplier, active)
VALUES
  ('c1000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Detergente Industrial', 'detergent', 'litro', 8.50,  20, 'QuimiPro',   true),
  ('c1000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Alvejante',             'bleach',    'litro', 5.00,  15, 'CleanBrasil', true),
  ('c1000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Amaciante Profissional','softener',  'litro', 12.00, 10, 'QuimiPro',   true),
  ('c1000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Removedor de Manchas',  'stain',     'kg',    22.00, 5,  'TechClean',  true)
ON CONFLICT (id) DO NOTHING;

-- Movimentações de estoque (entradas)
INSERT INTO chemical_movements (product_id, unit_id, movement_type, quantity, notes, operator_id)
VALUES
  ('c1000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'in', 50, 'Estoque inicial', 'a0000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'in', 40, 'Estoque inicial', 'a0000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'in', 30, 'Estoque inicial', 'a0000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'in', 15, 'Estoque inicial', 'a0000000-0000-0000-0000-000000000002');

-- Saídas (uso em lavagens)
INSERT INTO chemical_movements (product_id, unit_id, movement_type, quantity, notes, operator_id)
VALUES
  ('c1000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'out', 12, 'Uso em lavagens', 'a0000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'out', 8,  'Uso em lavagens', 'a0000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'out', 6,  'Uso em lavagens', 'a0000000-0000-0000-0000-000000000002');

-- =============================================================
-- 6. RECEITAS (fichas técnicas)
-- =============================================================
INSERT INTO recipes (id, unit_id, name, piece_type, description, temperature_celsius, duration_minutes, active)
VALUES
  ('r1000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Toalha Padrão',     'toalha',    'Lavagem padrão para toalhas de hotel',      60, 45, true),
  ('r1000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Roupa Delicada',    'roupa',     'Lavagem delicada para roupas finas',        30, 30, true),
  ('r1000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Roupa de Cama',    'lençol',    'Lavagem completa para enxoval de cama',     60, 50, true),
  ('r1000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Uniforme Pesado',   'uniforme',  'Lavagem para uniformes industriais pesados', 80, 60, true)
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 7. CLIENTES
-- =============================================================
INSERT INTO clients (id, unit_id, name, type, document, phone, email, address_street, address_city, address_state, active)
VALUES
  ('b1000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Hotel Grand Palace',      'pj', '12.345.678/0001-90', '(11) 9000-0001', 'compras@grandpalace.com',  'Av. Paulista, 1000',  'São Paulo', 'SP', true),
  ('b1000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Restaurante Bella Cucina','pj', '98.765.432/0001-10', '(11) 9000-0002', 'admin@bellacucina.com',    'Rua Augusta, 200',   'São Paulo', 'SP', true),
  ('b1000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Clínica São Lucas',       'pj', '11.222.333/0001-44', '(11) 9000-0003', 'compras@saolucas.com.br', 'Rua da Saúde, 50',   'São Paulo', 'SP', true),
  ('b1000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Academia FitLife',        'pj', '55.666.777/0001-88', '(11) 9000-0004', 'contato@fitlife.com',     'Av. Brasil, 300',    'São Paulo', 'SP', true),
  ('b1000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'Maria Silva',             'pf', '123.456.789-00',     '(11) 9000-0005', 'maria.silva@email.com',   'Rua das Rosas, 10',  'São Paulo', 'SP', true),
  -- Unidade Norte
  ('b2000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Pousada Vista Bela',      'pj', '44.555.666/0001-22', '(11) 9100-0001', 'admin@vistabela.com',     'Rua Norte, 100',     'São Paulo', 'SP', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 8. TABELA DE PREÇOS
-- =============================================================
INSERT INTO price_table (unit_id, piece_type, price, unit_label, active)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'toalha',   12.00, 'por peça', true),
  ('10000000-0000-0000-0000-000000000001', 'lençol',   18.00, 'por peça', true),
  ('10000000-0000-0000-0000-000000000001', 'roupa',     8.00, 'por peça', true),
  ('10000000-0000-0000-0000-000000000001', 'uniforme', 25.00, 'por peça', true),
  ('10000000-0000-0000-0000-000000000001', 'tapete',   35.00, 'por m²',   true),
  ('10000000-0000-0000-0000-000000000002', 'toalha',   13.00, 'por peça', true),
  ('10000000-0000-0000-0000-000000000002', 'lençol',   20.00, 'por peça', true)
ON CONFLICT DO NOTHING;

-- =============================================================
-- 9. PEDIDOS
-- =============================================================
INSERT INTO orders (id, unit_id, client_id, client_name, order_number, status, promised_at, created_by)
VALUES
  ('o1000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000001', 'Hotel Grand Palace', 'ORD-0001', 'completed',
   NOW() - INTERVAL '2 days', 'a0000000-0000-0000-0000-000000000001'),

  ('o1000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000001', 'Hotel Grand Palace', 'ORD-0002', 'washing',
   NOW() + INTERVAL '1 day', 'a0000000-0000-0000-0000-000000000001'),

  ('o1000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000002', 'Restaurante Bella Cucina', 'ORD-0003', 'ready',
   NOW() + INTERVAL '3 hours', 'a0000000-0000-0000-0000-000000000001'),

  ('o1000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000003', 'Clínica São Lucas', 'ORD-0004', 'received',
   NOW() + INTERVAL '2 days', 'a0000000-0000-0000-0000-000000000001'),

  ('o1000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000004', 'Academia FitLife', 'ORD-0005', 'drying',
   NOW() + INTERVAL '6 hours', 'a0000000-0000-0000-0000-000000000001'),

  -- Pedido atrasado (para testar alertas SLA)
  ('o1000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000005', 'Maria Silva', 'ORD-0006', 'washing',
   NOW() - INTERVAL '4 hours', 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Itens dos pedidos
INSERT INTO order_items (order_id, piece_type, quantity, recipe_id)
VALUES
  ('o1000000-0000-0000-0000-000000000001', 'toalha',   50, 'r1000000-0000-0000-0000-000000000001'),
  ('o1000000-0000-0000-0000-000000000001', 'lençol',   30, 'r1000000-0000-0000-0000-000000000003'),
  ('o1000000-0000-0000-0000-000000000002', 'toalha',   80, 'r1000000-0000-0000-0000-000000000001'),
  ('o1000000-0000-0000-0000-000000000002', 'lençol',   40, 'r1000000-0000-0000-0000-000000000003'),
  ('o1000000-0000-0000-0000-000000000003', 'roupa',    15, 'r1000000-0000-0000-0000-000000000002'),
  ('o1000000-0000-0000-0000-000000000004', 'uniforme', 20, 'r1000000-0000-0000-0000-000000000004'),
  ('o1000000-0000-0000-0000-000000000005', 'roupa',    30, 'r1000000-0000-0000-0000-000000000002'),
  ('o1000000-0000-0000-0000-000000000006', 'toalha',   25, 'r1000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- =============================================================
-- 10. FINANCEIRO
-- =============================================================
INSERT INTO receivables (unit_id, client_id, description, amount, due_date, status)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'Lavagem jan/2026 — Hotel Grand Palace', 1560.00, CURRENT_DATE + 5, 'pending'),
  ('10000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002',
   'Serviços fev/2026 — Restaurante', 420.00, CURRENT_DATE - 3, 'overdue'),
  ('10000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003',
   'Roupas clínica jan/2026', 800.00, CURRENT_DATE - 10, 'paid'),
  ('10000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004',
   'Uniformes jan/2026', 625.00, CURRENT_DATE + 10, 'pending');

INSERT INTO payables (unit_id, description, supplier, amount, due_date, category, status)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Detergente industrial — fev/2026',  'QuimiPro',    340.00, CURRENT_DATE + 7,  'supplies',     'pending'),
  ('10000000-0000-0000-0000-000000000001', 'Energia elétrica — jan/2026',        'Enel',       2100.00, CURRENT_DATE - 2,  'utilities',    'overdue'),
  ('10000000-0000-0000-0000-000000000001', 'Manutenção calandra',                'TecniLav',    550.00, CURRENT_DATE + 15, 'maintenance',  'pending'),
  ('10000000-0000-0000-0000-000000000001', 'Aluguel galpão fev/2026',            'Imobiliária', 4500.00, CURRENT_DATE + 5, 'rent',         'pending');

-- =============================================================
-- 11. NPS SURVEYS
-- =============================================================
INSERT INTO nps_surveys (id, unit_id, client_id, sent_at)
VALUES
  ('ns000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '5 days'),
  ('ns000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000002', NOW() - INTERVAL '3 days'),
  ('ns000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000003', NOW() - INTERVAL '1 day'),
  ('ns000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002',
   'b2000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO nps_responses (survey_id, score, comment)
VALUES
  ('ns000000-0000-0000-0000-000000000001', 9,  'Excelente serviço, muito satisfeitos!'),
  ('ns000000-0000-0000-0000-000000000002', 7,  'Bom mas prazo poderia ser melhor.'),
  ('ns000000-0000-0000-0000-000000000003', 5,  'Roupas voltaram com manchas.'),
  ('ns000000-0000-0000-0000-000000000004', 10, 'Perfeito, recomendo!')
ON CONFLICT DO NOTHING;

-- =============================================================
-- 12. ROTAS LOGÍSTICAS
-- =============================================================
INSERT INTO logistics_routes (id, unit_id, name, shift, weekdays, driver_id, active)
VALUES
  ('lr000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   'Rota Centro-Paulista', 'morning', ARRAY[1,2,3,4,5], 'a0000000-0000-0000-0000-000000000003', true),
  ('lr000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001',
   'Rota Sul-Clínicas', 'afternoon', ARRAY[1,3,5], 'a0000000-0000-0000-0000-000000000003', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO route_stops (route_id, client_id, position)
VALUES
  ('lr000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 1),
  ('lr000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 2),
  ('lr000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 3),
  ('lr000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', 1),
  ('lr000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000004', 2)
ON CONFLICT DO NOTHING;

-- =============================================================
-- 13. ROMANEIOS
-- =============================================================
INSERT INTO daily_manifests (id, unit_id, route_id, date, status, driver_id)
VALUES
  ('dm000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   'lr000000-0000-0000-0000-000000000001', CURRENT_DATE, 'in_progress', 'a0000000-0000-0000-0000-000000000003'),
  ('dm000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001',
   'lr000000-0000-0000-0000-000000000002', CURRENT_DATE, 'pending', 'a0000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

INSERT INTO manifest_stops (manifest_id, client_id, position, status)
VALUES
  ('dm000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 1, 'visited'),
  ('dm000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 2, 'pending'),
  ('dm000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 3, 'pending'),
  ('dm000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', 1, 'pending'),
  ('dm000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000004', 2, 'pending')
ON CONFLICT DO NOTHING;

-- =============================================================
-- 14. NOTAS CRM
-- =============================================================
INSERT INTO crm_notes (unit_id, client_id, author_id, category, content)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'a0000000-0000-0000-0000-000000000001', 'commercial',
   'Cliente solicitou aumento de volume para março. Negociação de desconto em andamento.'),
  ('10000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002',
   'a0000000-0000-0000-0000-000000000001', 'complaint',
   'Reclamação sobre prazo de entrega na semana passada. Prometemos prioridade.'),
  ('10000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003',
   'a0000000-0000-0000-0000-000000000001', 'operational',
   'Clínica pediu embalagem individual para cada uniforme.');

-- =============================================================
-- FIM DO SEED
-- =============================================================
-- Verifique se tudo foi criado:
-- SELECT 'units' as tabela, count(*) FROM units
-- UNION ALL SELECT 'profiles', count(*) FROM profiles
-- UNION ALL SELECT 'equipment', count(*) FROM equipment
-- UNION ALL SELECT 'clients', count(*) FROM clients
-- UNION ALL SELECT 'orders', count(*) FROM orders
-- UNION ALL SELECT 'receivables', count(*) FROM receivables;
