# Inteli - Instituto de Tecnologia e Liderança 

<p align="center">
<a href= "https://www.inteli.edu.br/"><img src="assets/inteli.png" alt="Inteli - Instituto de Tecnologia e Liderança" border="0" width=40% height=40%></a>
</p>

<br>

# SparX

## Shelley

<div align="center">

  <img src="assets/shelley.jpg"><br>
</div>

## 👨‍🎓 Integrantes: 
- Anny Cerazi - [ [Github](https://github.com/annyjhulia) | [LinkedIn](https://www.linkedin.com/in/annycerazi/) ]

- Átila Neto - [ [Github](https://github.com/atilaneto) | [LinkedIn](https://www.linkedin.com/in/%C3%A1tila-neto-439909258/) ]

- Eduardo Casarini - [ [Github](https://github.com/educasarini) | [LinkedIn](https://www.linkedin.com/in/eduardo-casarini/) ]

- Giorgia Rigatti Scherer - [ [Github](https://github.com/giorgiascherer21) | [LinkedIn](https://www.linkedin.com/in/giorgiascherer/) ]

- Leonardo Ramos Vieira - [ [Github](https://github.com/leormsvieira) | [LinkedIn](https://www.linkedin.com/in/leonardoramosvieira/) ]

- Lucas Cofcewicz Faria - [ [Github](https://github.com/Lucas-Cofcewicz-Faria) | [LinkedIn](https://www.linkedin.com/in/lucas-cofcewicz-faria-65b221310/) ]

- Rafael Josué - [ [Github](https://github.com/J05UE-l) | [LinkedIn](https://www.linkedin.com/in/rafael-josue/) ]

## 👩‍🏫 Professores:

### Orientador(a) 
- <a href="https://www.linkedin.com/in/laizaribeiro/">Laíza Ribeiro Silva</a>

### Instrutores
- <a href="https://www.linkedin.com/in/bruna-mayer/">Bruna Mayer</a>
- <a href="https://www.linkedin.com/in/crishna-irion-7b5aa311/">Crishna Iron</a> 
- <a href="https://www.linkedin.com/in/filipe-gon%C3%A7alves-08a55015b/">Filipe Gonçalves</a> 
- <a href="https://www.linkedin.com/in/henrique-mohallem-paiva-6854b460/">Henrique Mohallem</a>
- <a href="https://www.linkedin.com/in/rafael-jacomossi-6135b0a1/">Rafael Jacomossi</a> 

## 📜 Descrição

&ensp;O SparX é um sistema inteligente de monitoramento térmico desenvolvido para a Companhia Paranaense de Energia (COPEL), com o objetivo de revolucionar a gestão preventiva de transformadores na rede de distribuição elétrica. A solução integra tecnologias de Internet das Coisas, análise preditiva e visualização de dados em tempo real para prevenir falhas, otimizar manutenções e prolongar a vida útil dos equipamentos críticos da infraestrutura elétrica.

&ensp;A problemática enfrentada pela COPEL decorre da ausência de mecanismos contínuos e inteligentes de monitoramento térmico dos transformadores. Esses equipamentos sofrem desgastes resultantes de sobreaquecimento, sobrecarga e intempéries climáticas, fatores que frequentemente conduzem a interrupções no fornecimento de energia e elevação dos custos operacionais com manutenções corretivas ou substituições emergenciais. O SparX surge como resposta a esse desafio, transformando a gestão reativa em uma abordagem proativa e baseada em dados.

&ensp;A arquitetura da solução é composta por três componentes principais integrados. O primeiro é o dispositivo IoT baseado em ESP32 DevKit V1, equipado com sensor de temperatura digital DS18B20, que realiza medições periódicas e transmite os dados via protocolo MQTT. O dispositivo incorpora um sistema visual de alertas com LEDs coloridos que indicam rapidamente o nível de risco de superaquecimento, permitindo identificação imediata de problemas mesmo em campo. 

&ensp;O segundo componente é a infraestrutura de comunicação e processamento, que utiliza o broker **HiveMQ** para gerenciar o fluxo de mensagens MQTT com alta confiabilidade e baixa latência. O backend desenvolvido em Node.js com Express processa os dados recebidos, implementa a lógica de alertas baseada em faixas de temperatura e gerencia a autenticação via JWT. O banco de dados PostgreSQL, disponibilizado através do **Supabase**, armazena o histórico completo de medições, permitindo análises preditivas e acompanhamento do desempenho operacional ao longo do tempo.

&ensp;O terceiro componente é a plataforma web interativa desenvolvida em React com TypeScript, que oferece aos operadores da COPEL uma interface centralizada e intuitiva para monitoramento em tempo real. O dashboard apresenta painéis com medições atualizadas, alertas automáticos, tendências térmicas e histórico de dados exportáveis. A interface também incorpora mapa interativo com geolocalização dos transformadores, facilitando significativamente a atuação das equipes de manutenção em campo ao priorizar intervenções com base no histórico térmico de cada equipamento.

&ensp;O sistema de alertas do SparX opera em quatro níveis distintos. O status verde indica temperatura adequada, representando operação normal do transformador. O status amarelo sinaliza temperatura precária, demandando atenção e monitoramento mais frequente. O status vermelho indica temperatura crítica, exigindo intervenção imediata para prevenir falhas. Adicionalmente, o sistema detecta e reporta falhas no próprio sensor, garantindo a confiabilidade das medições.

&ensp;Os benefícios trazidos pelo SparX são significativos e mensuráveis. A solução aumenta a confiabilidade da rede ao monitorar continuamente a temperatura dos transformadores, reduzindo falhas críticas e interrupções no fornecimento de energia. Possibilita manutenção proativa, permitindo que as equipes priorizem ações com base em dados concretos ao invés de agir apenas reativamente. Gera dados estratégicos para análises avançadas e otimização da gestão de ativos, contribuindo para decisões mais informadas. Reduz custos operacionais ao diminuir manutenções corretivas emergenciais e prolongar a vida útil dos transformadores. A integração à infraestrutura existente da COPEL garante monitoramento remoto seguro, contínuo e eficiente, aproveitando os investimentos já realizados em redes inteligentes.

&ensp;Dessa forma, a solução representa um avanço tecnológico e uma transformação na forma como concessionárias de energia podem gerenciar seus ativos críticos, trazendo mais segurança, eficiência e previsibilidade para a operação da rede elétrica.

[Vídeo de demonstração do projeto]()


## 📁 Estrutura de pastas

Dentre os arquivos e pastas presentes na raiz do projeto, definem-se:

```
Dashboard-SparX/
│
├── esp32-device/                    # Código-fonte para o dispositivo IoT (ESP32)
│   └── ...                          # Arquivos de firmware
│
├── src/                             # Código-fonte da aplicação web (React/TypeScript)
│   └── ...                          # Componentes, páginas e lógica do frontend
│
├── supabase/                        # Configurações e migrações do banco de dados Supabase
│   └── ...                          # Arquivos SQL e de configuração
│
├── mqtt-bridge.js                   # Script de ponte MQTT para processamento de dados
├── package.json                     # Metadados e dependências do projeto
├── vite.config.ts                   # Configuração do bundler Vite
└── README.md                        # Este arquivo
```

## 🔧 Instalação

### Pré-requisitos

&ensp;Antes de iniciar a instalação do SparX, certifique-se de ter os seguintes componentes e ferramentas:

#### Hardware Necessário

- **ESP32 DevKit V1** - Microcontrolador principal
- **Sensor DS18B20** - Sensor de temperatura digital
- **Display LCD I2C 16x2** (endereço 0x27)
- **LED RGB** - Indicador visual de status
- **3 Resistores de 220Ω** (para os LEDs)
- **1 Resistor de 4.7kΩ** (pull-up para o DS18B20)
- **1 Pushbutton** (botão de reset)
- **Protoboard e jumpers** para montagem do circuito
- **Cabo USB** para programação do ESP32

#### Software e Ferramentas

**Para o Firmware (ESP32):**

- **Arduino IDE** versão 2.0 ou superior
  - Download: https://www.arduino.cc/en/software
- **Bibliotecas Arduino necessárias:**
  - `OneWire` - Comunicação com sensor DS18B20
  - `DallasTemperature` - Leitura do sensor DS18B20
  - `LiquidCrystal_I2C` - Controle do display LCD
  - `Wire` - Comunicação I2C
  - **Biblioteca MQTT** - Para comunicação com o HiveMQ.

**Serviços em Nuvem:**
- **Broker MQTT HiveMQ**
  - Acesso: https://www.hivemq.com
- **Supabase** (para banco de dados PostgreSQL)
  - Registro: https://supabase.com

### Instalação do Frontend/Backend (Dashboard)

1.  **Clonar o Repositório:**
    ```bash
    git clone https://github.com/leormsvieira/Dashboard-SparX.git
    cd Dashboard-SparX
    ```

2.  **Instalar Dependências:**
    ```bash
    # Use seu gerenciador de pacotes preferido (npm, pnpm ou yarn)
    npm install 
    # ou pnpm install
    ```

3.  **Configurar Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz do projeto com as credenciais do Supabase e do HiveMQ.

    ```
    # Exemplo de .env
    VITE_SUPABASE_URL="SUA_URL_SUPABASE"
    VITE_SUPABASE_ANON_KEY="SUA_CHAVE_ANON_SUPABASE"
    MQTT_BROKER_URL="URL_DO_BROKER_HIVEMQ"
    MQTT_USERNAME="SEU_USUARIO_MQTT"
    MQTT_PASSWORD="SUA_SENHA_MQTT"
    ```

4.  **Iniciar o Servidor de Desenvolvimento:**
    ```bash
    npm run dev
    # ou pnpm run dev
    ```
    O dashboard estará acessível em `http://localhost:8080/`.

### Instalação do Firmware no ESP32

#### Passo 1: Configurar o Arduino IDE

1. Abra o Arduino IDE
2. Vá em **File > Preferences**
3. Em "Additional Board Manager URLs", adicione:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Vá em **Tools > Board > Boards Manager**
5. Procure por "esp32" e instale **"ESP32 by Espressif Systems"**

#### Passo 2: Instalar as Bibliotecas

1. Vá em **Sketch > Include Library > Manage Libraries**
2. Instale as seguintes bibliotecas:
   - `OneWire` por Paul Stoffregen
   - `DallasTemperature` por Miles Burton
   - `LiquidCrystal I2C` por Frank de Brabander
   - **Instale uma biblioteca MQTT compatível com ESP32** (e.g., `PubSubClient` ou similar)

#### Passo 3: Configurar as Credenciais

1. Abra o arquivo de firmware desejado (e.g., `esp32-device/main.ino`)
2. Edite as seguintes linhas com suas credenciais:

```cpp
const char *WIFI_SSID = "NOME_DA_SUA_REDE_WIFI";
const char *WIFI_PASS = "SENHA_DA_SUA_REDE_WIFI";
const char *MQTT_SERVER = "URL_DO_BROKER_HIVEMQ";
const char *MQTT_USER = "SEU_USUARIO_MQTT";
const char *MQTT_PASS = "SUA_SENHA_MQTT";
```

#### Passo 4: Montar o Circuito

Conecte os componentes de acordo com o esquema elétrico fornecido (verifique a pasta de assets).

#### Passo 5: Fazer Upload do Código

1. Conecte o ESP32 ao computador via USB
2. No Arduino IDE, selecione:
   - **Tools > Board > ESP32 Dev Module**
   - **Tools > Port** → Selecione a porta COM do ESP32
3. Clique em **Upload** (seta para direita)
4. Aguarde a compilação e upload do código

#### Passo 6: Monitorar o Funcionamento

1. Abra o **Serial Monitor** (Tools > Serial Monitor)
2. Configure a velocidade para **115200 baud**
3. Observe as leituras de temperatura e status do sistema


### Manual de Instruções Completo

Para informações detalhadas sobre instalação, operação e manutenção do sistema, consulte a documentação completa (verifique a pasta `document/`).


## 🗃 Histórico de lançamentos

* 0.5.0 - 17/12/2025
    * 
* 0.4.0 - 05/12/2025
    * 
* 0.3.0 - 19/11/2025
    * 
* 0.2.0 - 07/11/2025
    * 
* 0.1.0 - 24/10/2025
    * 

## 📋 Licença/License
