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

&ensp;O **SparX Dashboard** é a interface web para monitoramento e análise térmica de transformadores. Construído em React + TypeScript (Vite + Tailwind), o dashboard oferece visualização em tempo real de leituras, indicadores de alerta por faixa de temperatura, gráficos de tendência, tabelas e um mapa interativo com geolocalização dos dispositivos.

&ensp;Principais recursos:

- Visualização em tempo real e alertas (verde / amarelo / vermelho);

- Map view com acesso rápido ao histórico de cada dispositivo;

- Gráficos de tendência e exportação de dados;

- Integração com Supabase para persistência e com pipeline MQTT/edge functions para ingestão de dados.

## 📁 Estrutura de pastas

Dentre os arquivos e pastas presentes na raiz do projeto, definem-se:

```
Dashboard-SparX/
│
├── esp32-device/                  # Código do firmware
│   ├── pipipi.ino
│   └── sparx_temperature_monitor.ino
│
├── public/                        # Arquivos estáticos públicos
│   └── parana.json                
│
├── scripts/                       # Scripts auxiliares de automação/teste
│   ├── run-migrations.js          
│   └── test-integration.js        
│
├── src/                           # Código-fonte da aplicação React
│   ├── components/                # Componentes UI (botões, cards, charts)
│   ├── data/                      # JSONs importados diretamente no código
│   ├── hooks/                     # Custom hooks
│   ├── lib/                       # Configurações de libs (utils, axios, supabase client)
│   ├── pages/                     # Rotas/Páginas da aplicação
│   ├── styles/                    # CSS global se quiser separar do index.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── supabase/                      # Backend Supabase
│   ├── functions/                 # Edge Functions
│   ├── migrations/                # Histórico de schema
│   ├── queries/                   # Pasta para organizar seus SQLs soltos
│   │   ├── add-prototype-device.sql
│   │   ├── verify_map_data.sql
│   │   ├── quick_test_readings.sql
│   │   └── USEFUL_QUERIES.sql
│   └── config.toml
│
├── .env                           # Variáveis de ambiente
├── .gitignore
├── components.json                # Config do shadcn/ui
├── eslint.config.js
├── index.html                     # Ponto de entrada do Vite
├── mqtt-bridge.js                 # Script principal da ponte MQTT 
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## 🔧 Instalação

### Pré-requisitos

&ensp;Antes de iniciar a instalação da Dashboard, certifique-se de ter os seguintes componentes e ferramentas:

#### Software e Ferramentas

**Serviços em Nuvem:**
- **Broker MQTT HiveMQ**
  - Acesso: https://www.hivemq.com
- **Supabase** (para banco de dados PostgreSQL)
  - Registro: https://supabase.com

### Instalação do Dashboard

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
