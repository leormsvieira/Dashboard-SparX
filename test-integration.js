// Test script for SparX MQTT Integration
// Run with: node test-integration.js

const SUPABASE_URL = 'https://ulsdpggzsebmmvxdadxd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsc2RwZ2d6c2VibW12eGRhZHhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNzE0ODEsImV4cCI6MjA3OTc0NzQ4MX0.CIqJ8X3rtgT8s0XEw3HRsAbuvvVsxhK8sktAhXaHw6A';
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/ubidots-webhook`;

console.log('🧪 SparX Integration Test\n');
console.log('='.repeat(50));

async function testWebhook() {
  console.log('\n1️⃣  Testando Edge Function (Webhook)...\n');

  const payload = {
    device_label: 'esp32-001',
    variable_label: 'temperature',
    value: 45.5,
    timestamp: Date.now(),
    context: {
      status: 'adequado',
      device_label: 'esp32-001'
    }
  };

  console.log('📤 Enviando payload:');
  console.log(JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('\n✅ Webhook funcionando!');
      console.log('📥 Resposta:', result);
    } else {
      console.log('\n❌ Erro no webhook!');
      console.log('📥 Resposta:', result);
      console.log('Status:', response.status);
    }
  } catch (error) {
    console.log('\n❌ Erro ao chamar webhook:', error.message);
  }
}

async function testSupabaseConnection() {
  console.log('\n2️⃣  Testando conexão com Supabase...\n');

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/devices?limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (response.ok) {
      const devices = await response.json();
      console.log('✅ Conexão com Supabase OK!');
      console.log(`📊 Encontrado(s) ${devices.length} dispositivo(s)`);
      if (devices.length > 0) {
        console.log('Exemplo:', devices[0].name);
      }
    } else {
      console.log('❌ Erro ao conectar no Supabase');
      console.log('Status:', response.status);
    }
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

async function checkDeviceExists() {
  console.log('\n3️⃣  Verificando se esp32-001 existe...\n');

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/devices?serial_number=eq.esp32-001`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );

    if (response.ok) {
      const devices = await response.json();
      if (devices.length > 0) {
        console.log('✅ Dispositivo esp32-001 encontrado!');
        console.log('📋 Dados:', {
          name: devices[0].name,
          location: devices[0].location,
          status: devices[0].current_status
        });
      } else {
        console.log('⚠️  Dispositivo esp32-001 NÃO encontrado!');
        console.log('💡 Execute esta query no SQL Editor do Supabase:');
        console.log(`
INSERT INTO devices (serial_number, name, location, latitude, longitude, model)
VALUES (
  'esp32-001',
  'Transformador Teste ESP32',
  'Laboratório - Sala 101',
  -25.4284,
  -49.2733,
  'ESP32-WROOM-32'
);
        `);
      }
    }
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

async function getRecentReadings() {
  console.log('\n4️⃣  Buscando últimas leituras...\n');

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/temperature_readings?select=*,devices(name,serial_number)&order=timestamp.desc&limit=5`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );

    if (response.ok) {
      const readings = await response.json();
      if (readings.length > 0) {
        console.log(`✅ ${readings.length} leituras recentes:\n`);
        readings.forEach((r, i) => {
          console.log(`${i + 1}. ${r.devices?.name || 'Unknown'}`);
          console.log(`   Temp: ${r.temperature}°C | Status: ${r.status}`);
          console.log(`   Data: ${new Date(r.timestamp).toLocaleString()}\n`);
        });
      } else {
        console.log('⚠️  Nenhuma leitura encontrada');
        console.log('💡 Execute o teste do webhook primeiro (opção 1)');
      }
    }
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

async function runAllTests() {
  console.log('\n🚀 Executando todos os testes...\n');

  await testSupabaseConnection();
  await checkDeviceExists();
  await testWebhook();
  await getRecentReadings();

  console.log('\n' + '='.repeat(50));
  console.log('✨ Testes concluídos!\n');
  console.log('📚 Próximos passos:');
  console.log('1. Se todos os testes passaram, configure o ESP32');
  console.log('2. Veja esp32-device/README.md para instruções');
  console.log('3. Configure o webhook no Ubidots');
  console.log('4. Veja MQTT_INTEGRATION.md para guia completo\n');
}

// Menu interativo
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('\n📋 Escolha um teste:\n');
  console.log('node test-integration.js webhook    - Testar Edge Function');
  console.log('node test-integration.js connection - Testar conexão Supabase');
  console.log('node test-integration.js device     - Verificar dispositivo');
  console.log('node test-integration.js readings   - Ver últimas leituras');
  console.log('node test-integration.js all        - Executar todos\n');
} else {
  const test = args[0].toLowerCase();
  
  switch (test) {
    case 'webhook':
      testWebhook();
      break;
    case 'connection':
      testSupabaseConnection();
      break;
    case 'device':
      checkDeviceExists();
      break;
    case 'readings':
      getRecentReadings();
      break;
    case 'all':
      runAllTests();
      break;
    default:
      console.log('❌ Opção inválida. Use: webhook, connection, device, readings ou all');
  }
}
