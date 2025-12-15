// SparX - MQTT Bridge (HiveMQ → Supabase)
// Este script conecta ao HiveMQ, recebe dados do ESP32 e envia ao Supabase

const mqtt = require('mqtt');

// ========== CONFIGURAÇÕES ==========

// HiveMQ Cloud
const MQTT_BROKER = 'mqtts://6747634fafcf4abfba8d2d2aad5c14fb.s1.eu.hivemq.cloud:8883';
const MQTT_USER = 'SEU_USUARIO_HIVEMQ';
const MQTT_PASS = 'SUA_SENHA_HIVEMQ';
const MQTT_TOPIC = 'sparx/temperature';

// Supabase
const SUPABASE_URL = 'https://ulsdpggzsebmmvxdadxd.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_ANON_KEY_AQUI';  // Pegue em Settings → API
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/ubidots-webhook`;

// ===================================

console.log('🌉 SparX MQTT Bridge');
console.log('='.repeat(50));
console.log(`📡 Broker: ${MQTT_BROKER}`);
console.log(`📊 Tópico: ${MQTT_TOPIC}`);
console.log(`🗄️  Supabase: ${SUPABASE_URL}`);
console.log('='.repeat(50));
console.log('\n🚀 Iniciando...\n');

// Conecta ao HiveMQ
const client = mqtt.connect(MQTT_BROKER, {
  username: MQTT_USER,
  password: MQTT_PASS,
  rejectUnauthorized: true,  // Valida certificado SSL
});

// Quando conectar
client.on('connect', () => {
  console.log('✅ Conectado ao HiveMQ!\n');
  
  // Subscribe ao tópico
  client.subscribe(MQTT_TOPIC, (err) => {
    if (!err) {
      console.log(`📬 Inscrito no tópico: ${MQTT_TOPIC}`);
      console.log('⏳ Aguardando mensagens do ESP32...\n');
    } else {
      console.error('❌ Erro ao inscrever:', err);
    }
  });
});

// Quando receber mensagem
client.on('message', async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    
    console.log('📩 Mensagem recebida:');
    console.log(`   Device: ${data.device_label}`);
    console.log(`   Temp: ${data.temperature}°C`);
    console.log(`   Status: ${data.status}`);
    console.log(`   Time: ${new Date().toLocaleString()}`);
    
    // Envia ao Supabase
    await sendToSupabase(data);
    
    console.log('');
  } catch (error) {
    console.error('❌ Erro ao processar mensagem:', error.message);
  }
});

// Erros de conexão
client.on('error', (error) => {
  console.error('❌ Erro MQTT:', error.message);
});

// Desconexão
client.on('close', () => {
  console.log('⚠️  Desconectado do HiveMQ');
});

// Função para enviar ao Supabase
async function sendToSupabase(data) {
  const payload = {
    device_label: data.device_label,
    variable_label: 'temperature',
    value: data.temperature,
    timestamp: Date.now(),
    context: {
      status: data.status,
      device_label: data.device_label
    }
  };

  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`   ✅ Salvo no Supabase (ID: ${result.reading_id})`);
    } else {
      const error = await response.text();
      console.error(`   ❌ Erro Supabase (${response.status}):`, error);
    }
  } catch (error) {
    console.error('   ❌ Erro ao enviar ao Supabase:', error.message);
  }
}

// Tratamento de encerramento gracioso
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Encerrando bridge...');
  client.end(false, {}, () => {
    console.log('✅ Desconectado com sucesso');
    process.exit(0);
  });
});

// Mantém o processo ativo
console.log('💡 Pressione Ctrl+C para encerrar\n');
