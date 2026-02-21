// run-migration.mjs — Execute com: node supabase/run-migration.mjs <numero>
// Exemplo: node supabase/run-migration.mjs 019
// Requer: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local

import { readFileSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))

// Ler .env.local
const envPath = join(__dir, '../.env.local')
const envContent = readFileSync(envPath, 'utf8')
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(l => l && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
    .filter(([k]) => k)
)

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontrados em .env.local')
  process.exit(1)
}

// Encontrar arquivo de migration
const arg = process.argv[2]
const migsDir = join(__dir, 'migrations')
let migFile

if (arg) {
  const files = readdirSync(migsDir)
  migFile = files.find(f => f.startsWith(arg.padStart(3, '0')))
  if (!migFile) {
    console.error(`❌ Migration "${arg}" não encontrada em supabase/migrations/`)
    process.exit(1)
  }
} else {
  console.error('❌ Informe o número da migration. Ex: node supabase/run-migration.mjs 019')
  process.exit(1)
}

const sql = readFileSync(join(migsDir, migFile), 'utf8')
const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '')

console.log(`\n📦 Migration: ${migFile}`)
console.log(`📡 Projeto: ${projectRef}\n`)

// Tenta executar via Supabase Management API
// Requer Personal Access Token (diferente da service role key)
// Se falhar, exibe o SQL para execução manual

async function runViaMgmtApi() {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })

  if (res.ok) {
    const data = await res.json()
    return { ok: true, data }
  }

  const text = await res.text()
  return { ok: false, status: res.status, text }
}

// Tenta executar via RPC se existir a função exec_sql
async function runViaRpc() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_migration_sql`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ migration_sql: sql }),
  })

  if (res.ok) {
    return { ok: true }
  }

  return { ok: false, status: res.status }
}

console.log('🔄 Tentando executar via Management API...')
const mgmtResult = await runViaMgmtApi()

if (mgmtResult.ok) {
  console.log('✅ Migration executada com sucesso via Management API!\n')
  process.exit(0)
}

console.log(`   ⚠️  Management API: ${mgmtResult.status} — ${mgmtResult.text?.slice(0, 100) ?? ''}`)
console.log('🔄 Tentando executar via RPC...')
const rpcResult = await runViaRpc()

if (rpcResult.ok) {
  console.log('✅ Migration executada com sucesso via RPC!\n')
  process.exit(0)
}

// Fallback: exibir SQL para execução manual
console.log(`   ⚠️  RPC: ${rpcResult.status}\n`)
console.log('━'.repeat(70))
console.log('📋 Execute o SQL abaixo no Supabase SQL Editor:')
console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql/new`)
console.log('━'.repeat(70))
console.log('\n' + sql)
console.log('━'.repeat(70))
console.log('\n💡 Cole o SQL acima no editor e clique em "Run"\n')
