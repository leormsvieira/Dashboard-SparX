# SparX - ESP32 Temperature Monitor

Código para ESP32 que monitora temperatura usando sensor DS18B20 e envia dados via MQTT para Ubidots.

## 📋 Hardware Necessário

- ESP32 (qualquer modelo)
- Sensor de temperatura DS18B20
- Resistor de 4.7kΩ (pull-up)
- Cabos jumper

## 🔌 Diagrama de Conexão

```
DS18B20          ESP32
--------         -----
VCC    ------->  3.3V
GND    ------->  GND
DATA   ------->  GPIO4 (D4) + Resistor 4.7kΩ para 3.3V
```

## 📚 Bibliotecas Necessárias

Instale via Arduino IDE (Sketch → Include Library → Manage Libraries):

1. **OneWire** - by Paul Stoffregen
2. **DallasTemperature** - by Miles Burton
3. **PubSubClient** - by Nick O'Leary
4. **WiFiClientSecure** - (já inclusa no ESP32)

## ⚙️ Configuração

### 1. Configurar HiveMQ Cloud

1. Acesse [HiveMQ Cloud](https://console.hivemq.cloud/) e crie uma conta gratuita
2. Crie um novo cluster (Free tier)
3. Configure credenciais de acesso:
   - Username e Password para MQTT
4. Anote o **broker URL**: `6747634fafcf4abfba8d2d2aad5c14fb.s1.eu.hivemq.cloud`

### 2. Configurar o Código

Edite as seguintes linhas no arquivo `sparx_temperature_monitor.ino`:

```cpp
// WiFi
const char *WIFI_SSID = "Seu_WiFi";
const char *WIFI_PASS = "Sua_Senha";

// HiveMQ Cloud
const char *MQTT_USER = "seu_usuario_hivemq";
const char *MQTT_PASS = "sua_senha_hivemq";
const char *DEVICE_LABEL = "esp32-transformador-prototype";
```

⚠️ **IMPORTANTE**: O `DEVICE_LABEL` deve corresponder ao `serial_number` na tabela `devices` do Supabase!

### 3. Upload do Código

1. Abra o arquivo no Arduino IDE
2. Selecione a placa: **Tools → Board → ESP32 Arduino → ESP32 Dev Module**
3. Selecione a porta COM correta
4. Clique em **Upload**

## 🚀 Funcionamento

O ESP32 irá:
1. Conectar ao WiFi
2. Conectar ao broker MQTT do HiveMQ Cloud (porta 8883 com TLS)
3. Ler a temperatura a cada 2 segundos
4. Enviar dados ao HiveMQ a cada 5 segundos
5. Classificar o status:
   - **Adequado**: ≤ 50°C (status 0)
   - **Precário**: 51-60°C (status 1)
   - **Crítico**: > 60°C (status 2)
6. Publicar no tópico `sparx/temperature` em formato JSON

## 📊 Formato dos Dados

O ESP32 publica no tópico `sparx/temperature` em formato JSON:

```json
{
  "device_label": "esp32-transformador-prototype",
  "temperature": 45.5,
  "status": "adequado",
  "status_code": 0,
  "timestamp": 123456789
}
```

## 🔍 Monitoramento

### Serial Monitor

Abra o Serial Monitor (115200 baud) para ver logs em tempo real:

```
=================================
  SparX - Monitor de Temperatura
  ESP32 + DS18B20 + MQTT Ubidots
=================================

✓ Sensor DS18B20 inicializado
Conectando ao WiFi.....
✓ WiFi conectado!
IP: 192.168.1.100

✓ Sistema inicializado com sucesso!
Iniciando monitoramento...

🌡️  Temperatura: 45.50 °C
✓ Dados enviados ao Ubidots
  Status: adequado
```

## 🐛 Troubleshooting

### Erro: Sensor não encontrado
- Verifique as conexões
- Confirme o resistor pull-up de 4.7kΩ
- Teste outro GPIO se necessário

### Erro: Falha ao conectar MQTT
- Verifique o token do Ubidots
- Confirme conexão com internet
- Tente usar outro broker (opcional)

### Temperatura sempre -127.0
- Sensor desconectado ou com defeito
- Verifique alimentação (3.3V)
- Teste o sensor com exemplo básico

## 🔗 Integração com Supabase

Os dados são automaticamente sincronizados:

1. ESP32 → MQTT → Ubidots
2. Ubidots → Webhook → Supabase Edge Function
3. Edge Function → Insert/Update → Tabela `temperature_readings`

Veja `../supabase/functions/ubidots-webhook/` para detalhes do webhook.

## 📝 Licença

MIT License - SparX Project
