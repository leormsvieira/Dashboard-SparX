import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração do Supabase
const SUPABASE_URL = 'https://ulsdpggzsebmmvxdadxd.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada!');
  console.log('\nPara executar migrations, você precisa da service_role key:');
  console.log('1. Acesse: https://ulsdpggzsebmmvxdadxd.supabase.co');
  console.log('2. Vá em Settings → API');
  console.log('3. Copie a "service_role" key (não a anon key!)');
  console.log('4. Execute: $env:SUPABASE_SERVICE_ROLE_KEY="sua_key_aqui"; node run-migrations.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigrations() {
  console.log('🚀 Iniciando execução das migrations...\n');

  const migrations = [
    'supabase/migrations/20251201234734_c6491a66-1d29-41a9-9ffe-0d7e0271938e.sql',
    'supabase/migrations/20251201234747_8dbbc44d-8811-4791-a35f-b8b135e0bb24.sql'
  ];

  for (const migrationFile of migrations) {
    const migrationPath = join(__dirname, migrationFile);
    console.log(`📄 Executando: ${migrationFile}`);
    
    try {
      const sql = readFileSync(migrationPath, 'utf8');
      
      // Supabase client não suporta execução direta de SQL múltiplo
      // Vamos usar a API REST do Supabase
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({ query: sql })
      });

      if (response.ok) {
        console.log(`✅ Migration executada com sucesso!\n`);
      } else {
        const error = await response.text();
        console.log(`⚠️  Resposta: ${response.status} - ${error}\n`);
      }
    } catch (error) {
      console.error(`❌ Erro ao executar migration: ${error.message}\n`);
    }
  }

  console.log('✨ Processo de migrations concluído!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Verifique as tabelas no painel do Supabase');
  console.log('2. Se houver erros, você pode executar o SQL manualmente no SQL Editor');
}

runMigrations();
