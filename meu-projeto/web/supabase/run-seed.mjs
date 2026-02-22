// run-seed.mjs — Execute com: node supabase/run-seed.mjs
// Requer: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local

import { createClient } from '../node_modules/@supabase/supabase-js/dist/index.mjs'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Ler .env.local manualmente
const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dir, '../.env.local')
const envContent = readFileSync(envPath, 'utf8')
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(l => l && !l.startsWith('#'))
    .map(l => l.split('=').map(s => s.trim()))
    .filter(([k]) => k)
)

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontrados em .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const UNIT_CENTRO = '10000000-0000-0000-0000-000000000001'
const UNIT_NORTE  = '10000000-0000-0000-0000-000000000002'
const U_GERENTE   = 'a0000000-0000-0000-0000-000000000001'
const U_OPERADOR  = 'a0000000-0000-0000-0000-000000000002'
const U_MOTORISTA = 'a0000000-0000-0000-0000-000000000003'
const U_LOJA      = 'a0000000-0000-0000-0000-000000000004'
const U_DIRECTOR  = 'a0000000-0000-0000-0000-000000000005'

async function step(label, fn) {
  process.stdout.write(`  ${label}... `)
  try {
    await fn()
    console.log('✓')
  } catch (e) {
    console.log(`✗ ${e.message}`)
  }
}

// ─── Helpers ─────────────────────────────────────────────────
async function upsertUser(id, email, password, name) {
  const { error } = await supabase.auth.admin.createUser({
    user_metadata: { full_name: name },
    email,
    password,
    email_confirm: true,
    id,
  })
  // Se o UUID já existe (email diferente), atualiza e-mail + senha
  if (error) {
    if (error.message.includes('already been registered') || error.message.includes('already exists')) {
      return // mesmo e-mail, nada a fazer
    }
    // Tenta atualizar usuário existente com o mesmo UUID
    const { error: updateError } = await supabase.auth.admin.updateUserById(id, {
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    })
    if (updateError) throw updateError
  }
}

// ─── MAIN ────────────────────────────────────────────────────
console.log('\n🌱 A7x TecNologia OS — Seed de Teste\n')

// 1. UNIDADES
console.log('1. Unidades')
await step('Unidade Centro', () =>
  supabase.from('units').upsert({
    id: UNIT_CENTRO, name: 'Unidade Centro', slug: 'centro',
    address: 'Rua das Flores, 100', city: 'São Paulo', state: 'SP',
    phone: '(11) 3000-0001', active: true
  }, { onConflict: 'id' })
)
await step('Unidade Norte', () =>
  supabase.from('units').upsert({
    id: UNIT_NORTE, name: 'Unidade Norte', slug: 'norte',
    address: 'Av. Norte, 500', city: 'São Paulo', state: 'SP',
    phone: '(11) 3000-0002', active: true
  }, { onConflict: 'id' })
)

// 2. USUÁRIOS AUTH
console.log('\n2. Usuários Auth')
await step('dennisarruda25@gmail.com (director)', () => upsertUser(U_DIRECTOR,  'dennisarruda25@gmail.com', 'A7l@vanderia25', 'Dennis Arruda'))
await step('gerente@a7x.test  (unit_manager)', () => upsertUser(U_GERENTE,   'gerente@a7x.test',   'A7x@123', 'Carlos Gerente'))
await step('operador@a7x.test (operator)',     () => upsertUser(U_OPERADOR,  'operador@a7x.test',  'A7x@123', 'Ana Operadora'))
await step('motorista@a7x.test (driver)',      () => upsertUser(U_MOTORISTA, 'motorista@a7x.test', 'A7x@123', 'João Motorista'))
await step('loja@a7x.test (store)',            () => upsertUser(U_LOJA,      'loja@a7x.test',      'A7x@123', 'Boa Aparência Loja'))

// 3. PROFILES
console.log('\n3. Profiles')
await step('Todos os profiles', () =>
  supabase.from('profiles').upsert([
    { id: U_DIRECTOR,  full_name: 'Dennis Arruda',      role: 'director',     unit_id: null,        sector: null,      active: true },
    { id: U_GERENTE,   full_name: 'Carlos Gerente',     role: 'unit_manager', unit_id: UNIT_CENTRO, sector: null,      active: true },
    { id: U_OPERADOR,  full_name: 'Ana Operadora',      role: 'operator',     unit_id: UNIT_CENTRO, sector: 'washing', active: true },
    { id: U_MOTORISTA, full_name: 'João Motorista',     role: 'driver',       unit_id: UNIT_CENTRO, sector: null,      active: true },
    { id: U_LOJA,      full_name: 'Boa Aparência Loja', role: 'store',        unit_id: UNIT_CENTRO, sector: null,      active: true },
  ], { onConflict: 'id' })
)

// 4. EQUIPAMENTOS
console.log('\n4. Equipamentos')
await step('Equipamentos Centro e Norte', () =>
  supabase.from('equipment').upsert([
    { id: 'e1000000-0000-0000-0000-000000000001', unit_id: UNIT_CENTRO, name: 'Lavadora Industrial 1', type: 'washer', brand: 'Electrolux', model: 'WP-25', serial_number: 'SN-001', capacity_kg: 25, status: 'active' },
    { id: 'e1000000-0000-0000-0000-000000000002', unit_id: UNIT_CENTRO, name: 'Lavadora Industrial 2', type: 'washer', brand: 'Electrolux', model: 'WP-25', serial_number: 'SN-002', capacity_kg: 25, status: 'active' },
    { id: 'e1000000-0000-0000-0000-000000000003', unit_id: UNIT_CENTRO, name: 'Secadora 1',            type: 'dryer',  brand: 'Primus',     model: 'T-30',  serial_number: 'SN-003', capacity_kg: 30, status: 'active' },
    { id: 'e1000000-0000-0000-0000-000000000004', unit_id: UNIT_CENTRO, name: 'Calandra Grande',       type: 'ironer', brand: 'Jensen',     model: 'CA-60', serial_number: 'SN-004', capacity_kg: null, status: 'active' },
    { id: 'e1000000-0000-0000-0000-000000000005', unit_id: UNIT_CENTRO, name: 'Secadora 2',            type: 'dryer',  brand: 'Primus',     model: 'T-30',  serial_number: 'SN-005', capacity_kg: 30, status: 'maintenance' },
    { id: 'e2000000-0000-0000-0000-000000000001', unit_id: UNIT_NORTE,  name: 'Lavadora Norte 1',      type: 'washer', brand: 'Girbau',     model: 'GS-20', serial_number: 'SN-101', capacity_kg: 20, status: 'active' },
    { id: 'e2000000-0000-0000-0000-000000000002', unit_id: UNIT_NORTE,  name: 'Secadora Norte 1',      type: 'dryer',  brand: 'Girbau',     model: 'GD-20', serial_number: 'SN-102', capacity_kg: 20, status: 'active' },
  ], { onConflict: 'id' })
)

// 5. INSUMOS QUÍMICOS
console.log('\n5. Insumos Químicos')
await step('Produtos', () =>
  supabase.from('chemical_products').upsert([
    { id: 'c1000000-0000-0000-0000-000000000001', unit_id: UNIT_CENTRO, name: 'Detergente Industrial', category: 'detergent', measure_unit: 'litro', cost_per_unit: 8.50,  minimum_stock: 20, supplier: 'QuimiPro',    active: true },
    { id: 'c1000000-0000-0000-0000-000000000002', unit_id: UNIT_CENTRO, name: 'Alvejante',             category: 'bleach',    measure_unit: 'litro', cost_per_unit: 5.00,  minimum_stock: 15, supplier: 'CleanBrasil', active: true },
    { id: 'c1000000-0000-0000-0000-000000000003', unit_id: UNIT_CENTRO, name: 'Amaciante Profissional',category: 'softener',  measure_unit: 'litro', cost_per_unit: 12.00, minimum_stock: 10, supplier: 'QuimiPro',    active: true },
    { id: 'c1000000-0000-0000-0000-000000000004', unit_id: UNIT_CENTRO, name: 'Removedor de Manchas',  category: 'stain',     measure_unit: 'kg',    cost_per_unit: 22.00, minimum_stock: 5,  supplier: 'TechClean',   active: true },
  ], { onConflict: 'id' })
)
await step('Movimentações (entradas)', () =>
  supabase.from('chemical_movements').insert([
    { product_id: 'c1000000-0000-0000-0000-000000000001', unit_id: UNIT_CENTRO, movement_type: 'in',  quantity: 50, notes: 'Estoque inicial', operator_id: U_OPERADOR },
    { product_id: 'c1000000-0000-0000-0000-000000000002', unit_id: UNIT_CENTRO, movement_type: 'in',  quantity: 40, notes: 'Estoque inicial', operator_id: U_OPERADOR },
    { product_id: 'c1000000-0000-0000-0000-000000000003', unit_id: UNIT_CENTRO, movement_type: 'in',  quantity: 30, notes: 'Estoque inicial', operator_id: U_OPERADOR },
    { product_id: 'c1000000-0000-0000-0000-000000000001', unit_id: UNIT_CENTRO, movement_type: 'out', quantity: 12, notes: 'Uso em lavagens',  operator_id: U_OPERADOR },
    { product_id: 'c1000000-0000-0000-0000-000000000002', unit_id: UNIT_CENTRO, movement_type: 'out', quantity: 8,  notes: 'Uso em lavagens',  operator_id: U_OPERADOR },
  ])
)

// 6. RECEITAS
console.log('\n6. Receitas')
await step('Fichas técnicas', () =>
  supabase.from('recipes').upsert([
    { id: 'r1000000-0000-0000-0000-000000000001', unit_id: UNIT_CENTRO, name: 'Toalha Padrão',   piece_type: 'toalha',   temperature_celsius: 60, duration_minutes: 45, active: true },
    { id: 'r1000000-0000-0000-0000-000000000002', unit_id: UNIT_CENTRO, name: 'Roupa Delicada',  piece_type: 'roupa',    temperature_celsius: 30, duration_minutes: 30, active: true },
    { id: 'r1000000-0000-0000-0000-000000000003', unit_id: UNIT_CENTRO, name: 'Roupa de Cama',   piece_type: 'lençol',   temperature_celsius: 60, duration_minutes: 50, active: true },
    { id: 'r1000000-0000-0000-0000-000000000004', unit_id: UNIT_CENTRO, name: 'Uniforme Pesado', piece_type: 'uniforme', temperature_celsius: 80, duration_minutes: 60, active: true },
  ], { onConflict: 'id' })
)

// 7. CLIENTES
console.log('\n7. Clientes')
await step('Clientes Centro', () =>
  supabase.from('clients').upsert([
    { id: 'b1000000-0000-0000-0000-000000000001', unit_id: UNIT_CENTRO, name: 'Hotel Grand Palace',       type: 'pj', document: '12.345.678/0001-90', phone: '(11) 9000-0001', email: 'compras@grandpalace.com',  address_street: 'Av. Paulista, 1000', address_city: 'São Paulo', address_state: 'SP', active: true },
    { id: 'b1000000-0000-0000-0000-000000000002', unit_id: UNIT_CENTRO, name: 'Restaurante Bella Cucina', type: 'pj', document: '98.765.432/0001-10', phone: '(11) 9000-0002', email: 'admin@bellacucina.com',    address_street: 'Rua Augusta, 200',   address_city: 'São Paulo', address_state: 'SP', active: true },
    { id: 'b1000000-0000-0000-0000-000000000003', unit_id: UNIT_CENTRO, name: 'Clínica São Lucas',        type: 'pj', document: '11.222.333/0001-44', phone: '(11) 9000-0003', email: 'compras@saolucas.com.br',  address_street: 'Rua da Saúde, 50',   address_city: 'São Paulo', address_state: 'SP', active: true },
    { id: 'b1000000-0000-0000-0000-000000000004', unit_id: UNIT_CENTRO, name: 'Academia FitLife',         type: 'pj', document: '55.666.777/0001-88', phone: '(11) 9000-0004', email: 'contato@fitlife.com',      address_street: 'Av. Brasil, 300',    address_city: 'São Paulo', address_state: 'SP', active: true },
    { id: 'b1000000-0000-0000-0000-000000000005', unit_id: UNIT_CENTRO, name: 'Maria Silva',              type: 'pf', document: '123.456.789-00',     phone: '(11) 9000-0005', email: 'maria.silva@email.com',    address_street: 'Rua das Rosas, 10',  address_city: 'São Paulo', address_state: 'SP', active: true },
    { id: 'b2000000-0000-0000-0000-000000000001', unit_id: UNIT_NORTE,  name: 'Pousada Vista Bela',       type: 'pj', document: '44.555.666/0001-22', phone: '(11) 9100-0001', email: 'admin@vistabela.com',      address_street: 'Rua Norte, 100',     address_city: 'São Paulo', address_state: 'SP', active: true },
  ], { onConflict: 'id' })
)

// 8. TABELA DE PREÇOS
console.log('\n8. Preços')
await step('Tabela de preços', () =>
  supabase.from('price_table').upsert([
    { unit_id: UNIT_CENTRO, piece_type: 'toalha',   price: 12.00, unit_label: 'por peça', active: true },
    { unit_id: UNIT_CENTRO, piece_type: 'lençol',   price: 18.00, unit_label: 'por peça', active: true },
    { unit_id: UNIT_CENTRO, piece_type: 'roupa',    price:  8.00, unit_label: 'por peça', active: true },
    { unit_id: UNIT_CENTRO, piece_type: 'uniforme', price: 25.00, unit_label: 'por peça', active: true },
    { unit_id: UNIT_CENTRO, piece_type: 'tapete',   price: 35.00, unit_label: 'por m²',   active: true },
    { unit_id: UNIT_NORTE,  piece_type: 'toalha',   price: 13.00, unit_label: 'por peça', active: true },
    { unit_id: UNIT_NORTE,  piece_type: 'lençol',   price: 20.00, unit_label: 'por peça', active: true },
  ], { onConflict: 'unit_id,piece_type' })
)

// 9. PEDIDOS
console.log('\n9. Pedidos')

const now = new Date()
const d = (offsetHours) => new Date(now.getTime() + offsetHours * 3600000).toISOString()

await step('Pedidos (6 no total)', () =>
  supabase.from('orders').upsert([
    { id: 'o1000000-0000-0000-0000-000000000001', unit_id: UNIT_CENTRO, client_id: 'b1000000-0000-0000-0000-000000000001', client_name: 'Hotel Grand Palace',       order_number: 'ORD-0001', status: 'completed', promised_at: d(-48), created_by: U_GERENTE },
    { id: 'o1000000-0000-0000-0000-000000000002', unit_id: UNIT_CENTRO, client_id: 'b1000000-0000-0000-0000-000000000001', client_name: 'Hotel Grand Palace',       order_number: 'ORD-0002', status: 'washing',   promised_at: d(24),  created_by: U_GERENTE },
    { id: 'o1000000-0000-0000-0000-000000000003', unit_id: UNIT_CENTRO, client_id: 'b1000000-0000-0000-0000-000000000002', client_name: 'Restaurante Bella Cucina', order_number: 'ORD-0003', status: 'ready',     promised_at: d(3),   created_by: U_GERENTE },
    { id: 'o1000000-0000-0000-0000-000000000004', unit_id: UNIT_CENTRO, client_id: 'b1000000-0000-0000-0000-000000000003', client_name: 'Clínica São Lucas',        order_number: 'ORD-0004', status: 'received',  promised_at: d(48),  created_by: U_GERENTE },
    { id: 'o1000000-0000-0000-0000-000000000005', unit_id: UNIT_CENTRO, client_id: 'b1000000-0000-0000-0000-000000000004', client_name: 'Academia FitLife',         order_number: 'ORD-0005', status: 'drying',    promised_at: d(6),   created_by: U_GERENTE },
    { id: 'o1000000-0000-0000-0000-000000000006', unit_id: UNIT_CENTRO, client_id: 'b1000000-0000-0000-0000-000000000005', client_name: 'Maria Silva',              order_number: 'ORD-0006', status: 'washing',   promised_at: d(-4),  created_by: U_GERENTE },
  ], { onConflict: 'id' })
)
await step('Itens dos pedidos', () =>
  supabase.from('order_items').upsert([
    { order_id: 'o1000000-0000-0000-0000-000000000001', piece_type: 'toalha',   quantity: 50, recipe_id: 'r1000000-0000-0000-0000-000000000001' },
    { order_id: 'o1000000-0000-0000-0000-000000000001', piece_type: 'lençol',   quantity: 30, recipe_id: 'r1000000-0000-0000-0000-000000000003' },
    { order_id: 'o1000000-0000-0000-0000-000000000002', piece_type: 'toalha',   quantity: 80, recipe_id: 'r1000000-0000-0000-0000-000000000001' },
    { order_id: 'o1000000-0000-0000-0000-000000000002', piece_type: 'lençol',   quantity: 40, recipe_id: 'r1000000-0000-0000-0000-000000000003' },
    { order_id: 'o1000000-0000-0000-0000-000000000003', piece_type: 'roupa',    quantity: 15, recipe_id: 'r1000000-0000-0000-0000-000000000002' },
    { order_id: 'o1000000-0000-0000-0000-000000000004', piece_type: 'uniforme', quantity: 20, recipe_id: 'r1000000-0000-0000-0000-000000000004' },
    { order_id: 'o1000000-0000-0000-0000-000000000005', piece_type: 'roupa',    quantity: 30, recipe_id: 'r1000000-0000-0000-0000-000000000002' },
    { order_id: 'o1000000-0000-0000-0000-000000000006', piece_type: 'toalha',   quantity: 25, recipe_id: 'r1000000-0000-0000-0000-000000000001' },
  ], { onConflict: 'id' })
)

// 10. FINANCEIRO
console.log('\n10. Financeiro')
const today = now.toISOString().split('T')[0]
const dateOffset = (days) => {
  const d = new Date(now); d.setDate(d.getDate() + days); return d.toISOString().split('T')[0]
}
await step('Contas a receber', () =>
  supabase.from('receivables').insert([
    { unit_id: UNIT_CENTRO, client_id: 'b1000000-0000-0000-0000-000000000001', description: 'Lavagem jan/2026 — Hotel Grand Palace', amount: 1560.00, due_date: dateOffset(5),   status: 'pending' },
    { unit_id: UNIT_CENTRO, client_id: 'b1000000-0000-0000-0000-000000000002', description: 'Serviços fev/2026 — Restaurante',       amount:  420.00, due_date: dateOffset(-3), status: 'overdue' },
    { unit_id: UNIT_CENTRO, client_id: 'b1000000-0000-0000-0000-000000000003', description: 'Roupas clínica jan/2026',                amount:  800.00, due_date: dateOffset(-10), status: 'paid'    },
    { unit_id: UNIT_CENTRO, client_id: 'b1000000-0000-0000-0000-000000000004', description: 'Uniformes jan/2026',                    amount:  625.00, due_date: dateOffset(10), status: 'pending' },
  ])
)
await step('Contas a pagar', () =>
  supabase.from('payables').insert([
    { unit_id: UNIT_CENTRO, description: 'Detergente industrial — fev/2026', supplier: 'QuimiPro',    amount:  340.00, due_date: dateOffset(7),   category: 'supplies',    status: 'pending' },
    { unit_id: UNIT_CENTRO, description: 'Energia elétrica — jan/2026',      supplier: 'Enel',        amount: 2100.00, due_date: dateOffset(-2),  category: 'utilities',   status: 'overdue' },
    { unit_id: UNIT_CENTRO, description: 'Manutenção calandra',               supplier: 'TecniLav',   amount:  550.00, due_date: dateOffset(15),  category: 'maintenance', status: 'pending' },
    { unit_id: UNIT_CENTRO, description: 'Aluguel galpão fev/2026',           supplier: 'Imobiliária',amount: 4500.00, due_date: dateOffset(5),   category: 'rent',        status: 'pending' },
  ])
)

// 11. NPS
console.log('\n11. NPS')
await step('Pesquisas NPS', () =>
  supabase.from('nps_surveys').upsert([
    { id: 'ns000000-0000-0000-0000-000000000001', unit_id: UNIT_CENTRO, client_id: 'b1000000-0000-0000-0000-000000000001' },
    { id: 'ns000000-0000-0000-0000-000000000002', unit_id: UNIT_CENTRO, client_id: 'b1000000-0000-0000-0000-000000000002' },
    { id: 'ns000000-0000-0000-0000-000000000003', unit_id: UNIT_CENTRO, client_id: 'b1000000-0000-0000-0000-000000000003' },
    { id: 'ns000000-0000-0000-0000-000000000004', unit_id: UNIT_NORTE,  client_id: 'b2000000-0000-0000-0000-000000000001' },
  ], { onConflict: 'id' })
)
await step('Respostas NPS', () =>
  supabase.from('nps_responses').upsert([
    { survey_id: 'ns000000-0000-0000-0000-000000000001', score: 9, comment: 'Excelente serviço!' },
    { survey_id: 'ns000000-0000-0000-0000-000000000002', score: 7, comment: 'Bom, mas prazo poderia ser melhor.' },
    { survey_id: 'ns000000-0000-0000-0000-000000000003', score: 5, comment: 'Roupas voltaram com manchas.' },
    { survey_id: 'ns000000-0000-0000-0000-000000000004', score: 10, comment: 'Perfeito, recomendo!' },
  ], { onConflict: 'survey_id' })
)

// 12. ROTAS E ROMANEIOS
console.log('\n12. Logística')
await step('Rotas logísticas', () =>
  supabase.from('logistics_routes').upsert([
    { id: 'lr000000-0000-0000-0000-000000000001', unit_id: UNIT_CENTRO, name: 'Rota Centro-Paulista', shift: 'morning',   weekdays: [1,2,3,4,5], driver_id: U_MOTORISTA, active: true },
    { id: 'lr000000-0000-0000-0000-000000000002', unit_id: UNIT_CENTRO, name: 'Rota Sul-Clínicas',   shift: 'afternoon', weekdays: [1,3,5],     driver_id: U_MOTORISTA, active: true },
  ], { onConflict: 'id' })
)
await step('Paradas das rotas', () =>
  supabase.from('route_stops').upsert([
    { route_id: 'lr000000-0000-0000-0000-000000000001', client_id: 'b1000000-0000-0000-0000-000000000001', position: 1 },
    { route_id: 'lr000000-0000-0000-0000-000000000001', client_id: 'b1000000-0000-0000-0000-000000000002', position: 2 },
    { route_id: 'lr000000-0000-0000-0000-000000000001', client_id: 'b1000000-0000-0000-0000-000000000005', position: 3 },
    { route_id: 'lr000000-0000-0000-0000-000000000002', client_id: 'b1000000-0000-0000-0000-000000000003', position: 1 },
    { route_id: 'lr000000-0000-0000-0000-000000000002', client_id: 'b1000000-0000-0000-0000-000000000004', position: 2 },
  ], { onConflict: 'route_id,position' })
)
await step('Romaneios do dia', () =>
  supabase.from('daily_manifests').upsert([
    { id: 'dm000000-0000-0000-0000-000000000001', unit_id: UNIT_CENTRO, route_id: 'lr000000-0000-0000-0000-000000000001', date: today, status: 'in_progress', driver_id: U_MOTORISTA },
    { id: 'dm000000-0000-0000-0000-000000000002', unit_id: UNIT_CENTRO, route_id: 'lr000000-0000-0000-0000-000000000002', date: today, status: 'pending',     driver_id: U_MOTORISTA },
  ], { onConflict: 'id' })
)
await step('Paradas dos romaneios', () =>
  supabase.from('manifest_stops').upsert([
    { manifest_id: 'dm000000-0000-0000-0000-000000000001', client_id: 'b1000000-0000-0000-0000-000000000001', position: 1, status: 'visited' },
    { manifest_id: 'dm000000-0000-0000-0000-000000000001', client_id: 'b1000000-0000-0000-0000-000000000002', position: 2, status: 'pending' },
    { manifest_id: 'dm000000-0000-0000-0000-000000000001', client_id: 'b1000000-0000-0000-0000-000000000005', position: 3, status: 'pending' },
    { manifest_id: 'dm000000-0000-0000-0000-000000000002', client_id: 'b1000000-0000-0000-0000-000000000003', position: 1, status: 'pending' },
    { manifest_id: 'dm000000-0000-0000-0000-000000000002', client_id: 'b1000000-0000-0000-0000-000000000004', position: 2, status: 'pending' },
  ], { onConflict: 'manifest_id,position' })
)

// 13. NOTAS CRM
console.log('\n13. CRM')
await step('Notas de CRM', () =>
  supabase.from('crm_notes').insert([
    { unit_id: UNIT_CENTRO, client_id: 'b1000000-0000-0000-0000-000000000001', author_id: U_GERENTE, category: 'commercial',  content: 'Cliente solicitou aumento de volume para março. Negociação de desconto em andamento.' },
    { unit_id: UNIT_CENTRO, client_id: 'b1000000-0000-0000-0000-000000000002', author_id: U_GERENTE, category: 'complaint',   content: 'Reclamação sobre prazo de entrega na semana passada. Prometemos prioridade.' },
    { unit_id: UNIT_CENTRO, client_id: 'b1000000-0000-0000-0000-000000000003', author_id: U_GERENTE, category: 'operational', content: 'Clínica pediu embalagem individual para cada uniforme.' },
  ])
)

console.log('\n✅ Seed concluído!\n')
console.log('Logins de teste:')
console.log('  Director:    dennisarruda25@gmail.com / A7l@vanderia25')
console.log('  Gerente:     gerente@a7x.test     / A7x@123')
console.log('  Operador:    operador@a7x.test    / A7x@123')
console.log('  Motorista:   motorista@a7x.test   / A7x@123')
console.log('  Loja:        loja@a7x.test        / A7x@123')
console.log('\nAcesse: http://localhost:3000/login\n')
