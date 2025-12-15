/*
 * SparX - Sistema de Monitoramento de Transformadores
 * ESP32 + Sensor de Temperatura DS18B20 + MQTT HiveMQ
 * 
 * Este código lê a temperatura de um sensor DS18B20 e envia
 * os dados para o HiveMQ via MQTT, que então sincroniza com o Supabase
 */

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// ========== CONFIGURAÇÕES - EDITE AQUI ==========

// WiFi
const char *WIFI_SSID = "Inteli.Iot";
const char *WIFI_PASS = "%(Yk(sxGMtvFEs.3";

// HiveMQ Cloud
const char *MQTT_BROKER = "6747634fafcf4abfba8d2d2aad5c14fb.s1.eu.hivemq.cloud";
const int MQTT_PORT = 8883;  // TLS/SSL
const char *MQTT_USER = "SEU_USUARIO_HIVEMQ";  // Configure no HiveMQ Cloud
const char *MQTT_PASS = "SUA_SENHA_HIVEMQ";    // Configure no HiveMQ Cloud
const char *DEVICE_LABEL = "esp32-transformador-prototype";

// Tópicos MQTT
const char *TOPIC_TEMPERATURE = "sparx/temperature";
const char *TOPIC_STATUS = "sparx/status";

// Sensor DS18B20
const int ONE_WIRE_BUS = 4;  // GPIO4 (D4)

// Intervalos de leitura
const unsigned long READING_INTERVAL = 2000;    // Leitura do sensor: 2s
const unsigned long MQTT_INTERVAL = 5000;       // Envio MQTT: 5s

// Limites de temperatura
const float TEMP_LOW_THRESHOLD = 0;
const float TEMP_HIGH_THRESHOLD = 50;
const float TEMP_DANGER_THRESHOLD = 60;

// ================================================

// Setup do sensor de temperatura
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// Setup WiFi e MQTT com TLS
WiFiClientSecure wifiClient;
PubSubClient mqttClient(wifiClient);

// Variáveis de controle
float temperature = 0.0;
int currentStatus = 0;
unsigned long lastReadTime = 0;
unsigned long lastMqttTime = 0;

// Callback MQTT
void callback(char *topic, byte *payload, unsigned int length) {
  Serial.print("Mensagem recebida [");
  Serial.print(topic);
  Serial.print("]: ");
  for (unsigned int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

void connectWiFi() {
  Serial.print("Conectando ao WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("✓ WiFi conectado!");
  Serial.print("  IP: ");
  Serial.println(WiFi.localIP());
}

void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("Conectando ao HiveMQ...");
    
    // Gera um client ID único
    String clientId = "SparX-";
    clientId += String(random(0xffff), HEX);
    
    if (mqttClient.connect(clientId.c_str(), MQTT_USER, MQTT_PASS)) {
      Serial.println(" conectado!");
      Serial.println("✓ MQTT HiveMQ conectado!");
      
      // Subscreve a tópicos (opcional)
      mqttClient.subscribe("sparx/commands/#");
    } else {
      Serial.print(" falhou, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" tentando novamente em 5s");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n");
  Serial.println("=================================");
  Serial.println("  SparX - Monitor de Temperatura");
  Serial.println("  ESP32 + DS18B20 + MQTT HiveMQ");
  Serial.println("=================================\n");

  // Inicia sensor de temperatura
  sensors.begin();
  Serial.println("✓ Sensor DS18B20 inicializado");

  // Conecta ao WiFi
  connectWiFi();
  
  // Configura MQTT com TLS
  wifiClient.setInsecure();  // Aceita qualquer certificado (produção: usar certificado)
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(callback);
  mqttClient.setBufferSize(512);
  
  // Conecta ao MQTT
  reconnectMQTT();
  
  Serial.println("\n✓ Sistema inicializado com sucesso!");
  Serial.println("Iniciando monitoramento...\n");
}

void loop() {
  // Mantém conexão MQTT
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();

  unsigned long currentTime = millis();

  // Lê temperatura a cada READING_INTERVAL
  if (currentTime - lastReadTime >= READING_INTERVAL) {
    lastReadTime = currentTime;
    
    temperature = readTemperature();
    
    if (temperature != -127.0 && temperature != -999.0) {
      updateSystemStatus(temperature);
      
      Serial.print("🌡️  Temperatura: ");
      Serial.print(temperature, 1);
      Serial.println(" °C");
      Serial.print("   Status: ");
      Serial.println(getStatusText(currentStatus));
    } else {
      Serial.println("❌ Erro ao ler temperatura do sensor!");
    }
  }

  // Envia dados ao HiveMQ a cada MQTT_INTERVAL
  if (currentTime - lastMqttTime >= MQTT_INTERVAL) {
    lastMqttTime = currentTime;
    
    if (temperature != -127.0 && temperature != -999.0 && mqttClient.connected()) {
      publishTemperature(temperature);
    }
  }

  delay(10);
}

float readTemperature() {
  sensors.requestTemperatures();
  float tempC = sensors.getTempCByIndex(0);

  if (tempC == DEVICE_DISCONNECTED_C) {
    return -999.0;
  }
  return tempC;
}

void updateSystemStatus(float temp) {
  if (temp == -999.0) {
    currentStatus = 3; // Erro
  }
  else if (temp <= TEMP_HIGH_THRESHOLD) {
    currentStatus = 0; // Adequado
  }
  else if (temp <= TEMP_DANGER_THRESHOLD) {
    currentStatus = 1; // Precário
  }
  else {
    currentStatus = 2; // Crítico
  }
}

String getStatusText(int status) {
  switch(status) {
    case 0: return "adequado";
    case 1: return "precario";
    case 2: return "critico";
    case 3: return "erro";
    default: return "desconhecido";
  }
}

void publishTemperature(float temp) {
  // Monta o payload JSON
  char payload[256];
  snprintf(payload, sizeof(payload),
    "{\"device_label\":\"%s\",\"temperature\":%.2f,\"status\":\"%s\",\"status_code\":%d,\"timestamp\":%lu}",
    DEVICE_LABEL,
    temp,
    getStatusText(currentStatus).c_str(),
    currentStatus,
    millis()
  );
  
  // Publica temperatura
  bool success = mqttClient.publish(TOPIC_TEMPERATURE, payload, false);
  
  if (success) {
    Serial.println("✓ Dados enviados ao HiveMQ");
    Serial.print("  Payload: ");
    Serial.println(payload);
    Serial.println();
  } else {
    Serial.println("❌ Falha ao enviar dados");
  }
}
