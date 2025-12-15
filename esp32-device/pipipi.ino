#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>
#include "UbidotsEsp32Mqtt.h"

// --- CONFIGURAÇÕES UBIDOTS E WIFI ---
const char *UBIDOTS_TOKEN = "BBUS-vy5q4l1Dar3mvQKBxtpY02Y9bCvpWW";
const char *WIFI_SSID = "Inteli.Iot";
const char *WIFI_PASS = "%(Yk(sxGMtvFEs.3";
const char *DEVICE_LABEL = "esp32-transformador-prototype";

Ubidots ubidots(UBIDOTS_TOKEN);

// --- DEFINIÇÕES DE PINOS ---
// LED RGB —> substitui os LEDs antigos
#define RGB_R_PIN 14
#define RGB_G_PIN 26
#define RGB_B_PIN 25

#define ONE_WIRE_BUS   4
#define PUSHBUTTON_PIN 32

// --- CONFIGURAÇÃO DO HARDWARE ---
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
LiquidCrystal_I2C lcd(0x27, 16, 2);

// --- VARIÁVEIS DE CONTROLE ---
float temperature = 0.0;
int currentStatus = 0;
unsigned long lastReadTime = 0;
const long readInterval = 2000;
unsigned long lastUbidotsTime = 0;
const long ubidotsInterval = 5000;
volatile bool reset_flag = false;

// --- LIMITES DE TEMPERATURA ---
const float TEMP_LOW_THRESHOLD = 0;
const float TEMP_HIGH_THRESHOLD = 51;
const float TEMP_DANGER_THRESHOLD = 60;

// Callback MQTT (não usado)
void callback(char *topic, byte *payload, unsigned int length) {}

// Interrupção do botão de reset
void IRAM_ATTR handleResetButton() {
  reset_flag = true;
}

// --- FUNÇÕES DO LED RGB ---

void setRgbColor(bool r, bool g, bool b) {
  digitalWrite(RGB_R_PIN, r ? HIGH : LOW);
  digitalWrite(RGB_G_PIN, g ? HIGH : LOW);
  digitalWrite(RGB_B_PIN, b ? HIGH : LOW);
}

void turnOffRgb() {
  setRgbColor(false, false, false);
}

// Piscar branco
void blinkWhite(int times, int intervalMs) {
  for (int i = 0; i < times; i++) {
    setRgbColor(true, true, true);  
    delay(intervalMs);
    turnOffRgb();
    delay(intervalMs);
  }
}

void setup() {
  Serial.begin(115200);

  // --- LED RGB ---
  pinMode(RGB_R_PIN, OUTPUT);
  pinMode(RGB_G_PIN, OUTPUT);
  pinMode(RGB_B_PIN, OUTPUT);
  turnOffRgb();

  // --- BOTÃO ---
  pinMode(PUSHBUTTON_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PUSHBUTTON_PIN), handleResetButton, FALLING);

  // --- SENSOR ---
  sensors.begin();

  // --- LCD ---
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("SparX");
  lcd.setCursor(0, 1);
  lcd.print("Iniciando...");
  delay(2000);

  // --- WIFI + MQTT ---
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Conectando WiFi");

  ubidots.connectToWifi(WIFI_SSID, WIFI_PASS);
  ubidots.setCallback(callback);
  ubidots.setup();
  ubidots.reconnect();

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("WiFi Conectado");
  lcd.setCursor(0, 1);
  lcd.print("MQTT OK");
  delay(2000);

  // ⭐⭐⭐ Piscar branco após inicializar (boot concluído)
  blinkWhite(3, 200);

  Serial.println("[OK] Sistema iniciado com sucesso!");
}

// Ler temperatura
float readTemperature() {
  sensors.requestTemperatures();
  float tempC = sensors.getTempCByIndex(0);

  if (tempC == DEVICE_DISCONNECTED_C) {
    return -999.0;
  }
  return tempC;
}

// Atualizar RGB por faixa de temperatura
void updateSystemStatus(float temp) {
  turnOffRgb();

  if (temp == -999.0) {
    // Erro de sensor → LED apagado
    currentStatus = 3;
  }
  else if (temp <= TEMP_HIGH_THRESHOLD) {
    // Adequado — Verde
    setRgbColor(false, true, false);
    currentStatus = 0;
  }
  else if (temp <= TEMP_DANGER_THRESHOLD) {
    // Precário — Amarelo (R+G)
    setRgbColor(true, true, false);
    currentStatus = 1;
  }
  else {
    // Crítico — Vermelho
    setRgbColor(true, false, false);
    currentStatus = 2;
  }
}

// Atualizar LCD
void updateLcd(float temp) {
  lcd.clear();

  lcd.setCursor(0, 0);
  lcd.print("Temp:");

  if (temp == -999.0) {
    lcd.setCursor(8, 0);
    lcd.print("ERRO");
  } else {
    lcd.setCursor(8, 0);
    lcd.print(temp, 1);
    lcd.print((char)223);
    lcd.print("C");
  }

  lcd.setCursor(0, 1);
  lcd.print("Status:");

  if (temp == -999.0) {
    lcd.setCursor(8, 1);
    lcd.print("SENSOR?");
  }
  else if (currentStatus == 0) {
    lcd.setCursor(8, 1);
    lcd.print("ADEQUADO");
  }
  else if (currentStatus == 1) {
    lcd.setCursor(8, 1);
    lcd.print("PRECARIO");
  }
  else {
    lcd.setCursor(8, 1);
    lcd.print("CRITICO");
  }
}

void loop() {
  if (!ubidots.connected()) ubidots.reconnect();
  ubidots.loop();

  unsigned long currentTime = millis();

  // --- RESET VIA BOTÃO ---
  if (reset_flag) {
    blinkWhite(3, 200);   // Piscar branco ANTES de reiniciar

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("REINICIANDO...");
    lcd.setCursor(0, 1);
    lcd.print("Aguarde...");

    delay(1500);
    ESP.restart();
  }

  // --- LEITURA DO SENSOR ---
  if (currentTime - lastReadTime >= readInterval) {
    lastReadTime = currentTime;

    temperature = readTemperature();
    updateSystemStatus(temperature);
    updateLcd(temperature);
  }

  // --- ENVIO UBIDOTS ---
  if (currentTime - lastUbidotsTime >= ubidotsInterval) {
    lastUbidotsTime = currentTime;

    if (temperature != -999.0 && ubidots.connected()) {
      ubidots.add("temperatura", temperature);
      ubidots.add("status_alerta", currentStatus);
      ubidots.publish(DEVICE_LABEL);
    }
  }

  vTaskDelay(1);
}