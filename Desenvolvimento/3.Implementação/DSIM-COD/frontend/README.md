# Frontend - DSIM (Sistema de Monitoramento de Pacientes)

Interface web para monitoramento em tempo real de sinais vitais de pacientes através de pulseiras IoT.

## 🚀 Deploy em Produção

### AWS Amplify (Configurado)

O frontend está pronto para deploy no AWS Amplify conectado ao GitHub.

**Configurações da infraestrutura:**

| Configuração | Valor |
|--------------|-------|
| **Repositório** | `FTakElu/DSIM` |
| **Branch** | `main` |
| **Arquivo de Build** | `amplify.yml` (raiz do repositório) |
| **Output Directory** | `dist` |
| **API Backend** | `https://87xx2k2vn5.execute-api.us-east-1.amazonaws.com` |

**Variável de ambiente necessária no Amplify:**

```env
VITE_API_URL=https://87xx2k2vn5.execute-api.us-east-1.amazonaws.com
```

### Como Fazer o Deploy

**1. Acessar Console AWS Amplify:**
   - URL: https://console.aws.amazon.com/amplify/

**2. Criar Nova Aplicação:**
   - Clique em **"New app"** → **"Host web app"**
   - Escolha **GitHub** como provider
   - Autorize a conexão do AWS Amplify com sua conta GitHub

**3. Configurar Repositório:**
   - Selecione o repositório: **`FTakElu/DSIM`**
   - Escolha o branch: **`main`**
   - O Amplify detectará automaticamente o arquivo **`amplify.yml`** na raiz

**4. Configurar Variáveis de Ambiente:**
   - Na seção **"Environment variables"**, adicione:
     - **Key**: `VITE_API_URL`
     - **Value**: `https://87xx2k2vn5.execute-api.us-east-1.amazonaws.com`

**5. Revisar e Deploy:**
   - Revise as configurações
   - Clique em **"Save and deploy"**
   - Aguarde ~5-10 minutos para o build completar

**6. Deploy Automático:**
   - ✅ A cada `git push` no branch `main`, o Amplify faz rebuild automaticamente
   - ✅ Você receberá notificações de sucesso/erro do deploy
   - ✅ O frontend ficará acessível via URL fornecida pelo Amplify

**Arquivo de configuração**: `amplify.yml` (localizado na raiz do repositório)

---

## 🎯 Funcionalidades

- ✅ **Dashboard de Pacientes**: Visualização em cards com dados em tempo real e cores dinâmicas
- ✅ **Cadastro Completo de Pacientes**: Formulário com upload de foto, dados pessoais, contato de emergência e histórico médico
- ✅ **Edição de Pacientes**: Atualização de dados com formulário pré-preenchido
- ✅ **Exclusão de Pacientes**: Remoção segura com confirmação
- ✅ **Sistema de Cores Inteligente**: 
  - 🟢 Verde: Sinais vitais normais
  - 🟡 Amarelo: Valores próximos aos limites (atenção)
  - 🔴 Vermelho: Valores críticos excedendo limites
- ✅ **Histórico de Sinais Vitais**: Gráficos e tabelas com dados históricos
- ✅ **Alertas em Tempo Real**: Notificações via WebSocket quando limites são excedidos
- ✅ **Sistema de Alarmes**: Configuração personalizada de limites por paciente
- ✅ **Score MEWS**: Cálculo automático do Modified Early Warning Score
- ✅ **Autenticação JWT**: Login seguro para profissionais de saúde
- ✅ **Gestão de Dispositivos IoT**: Atribuição e gerenciamento de pulseiras
- ✅ **Responsivo**: Interface adaptável para desktop, tablet e mobile

## 🛠️ Tecnologias

- **React 18**: Biblioteca UI com hooks
- **TypeScript**: Tipagem estática
- **Vite**: Build tool rápido e moderno
- **CSS Modules**: Estilos encapsulados por componente
- **Axios**: Cliente HTTP para API REST
- **WebSocket**: Conexão em tempo real para alertas
- **React Router**: Navegação entre páginas

## 📁 Estrutura do Projeto

```
frontend/
├── public/               # Arquivos estáticos
│   └── vite.svg
├── src/
│   ├── assets/          # Imagens, ícones, logos
│   ├── components/      # Componentes reutilizáveis
│   │   ├── Alarme/     # Componente de configuração de alarmes
│   │   ├── BannerSlides/ # Slider da página inicial
│   │   ├── Funcionalidades/ # Cards de funcionalidades
│   │   ├── Header/      # Cabeçalho da aplicação
│   │   ├── Historico/   # Visualização de histórico
│   │   ├── PatientCard/ # Card de paciente individual
│   │   ├── PageShell.tsx # Layout padrão das páginas
│   │   └── Sobre/       # Seção "Sobre o projeto"
│   ├── pages/          # Páginas da aplicação
│   │   ├── AddPatientPage.tsx         # Cadastro de paciente
│   │   ├── EditPatientPage.tsx        # Edição de paciente
│   │   ├── DetalhesPacientePage.tsx   # Detalhes do paciente
│   │   ├── PainelListaPacientes.tsx   # Listagem de pacientes
│   │   ├── ConfigurarAlarmePage.tsx   # Configuração de alarmes
│   │   ├── HistoricoPage.tsx          # Histórico detalhado
│   │   ├── HomePage.tsx               # Página inicial
│   │   ├── LoginPage.tsx              # Login
│   │   └── CadastroUsuarioPage.tsx    # Cadastro de usuário
│   ├── service/        # Integração com backend
│   │   ├── api.ts      # Cliente HTTP configurado
│   │   └── mockData.ts # Dados de teste (se necessário)
│   ├── utils/          # Utilitários e helpers
│   │   ├── mews.ts     # Cálculo do MEWS
│   │   └── vitalStatus.ts # Sistema de cores dinâmicas
│   ├── styles/         # Estilos globais e temas
│   ├── Types/          # Definições TypeScript
│   │   └── PacientesType.ts # Interfaces de Paciente, Vitals, etc.
│   ├── App.tsx         # Componente raiz com rotas
│   ├── main.tsx        # Entry point da aplicação
│   └── index.css       # Estilos globais
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## ⚙️ Configuração

### Opção 1: Desenvolvimento Local

#### 1. Instalar Dependências

```bash
cd frontend
npm install
```

#### 2. Configurar URL da API

**Para desenvolvimento local** conectado ao backend de produção na EC2:

Edite `src/service/api.ts`:

```typescript
const api = axios.create({
  baseURL: 'https://87xx2k2vn5.execute-api.us-east-1.amazonaws.com',
  timeout: 10000,
});
```

**Ou para desenvolvimento local** com backend local:

```typescript
const api = axios.create({
  baseURL: 'http://localhost:9999/api',
  timeout: 10000,
});
```

#### 3. Executar em Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em: **http://localhost:5173**

### Opção 2: Build para Produção (Amplify)

```bash
npm run build
```

Os arquivos otimizados estarão em `dist/` e serão automaticamente deployados pelo Amplify a cada push no GitHub.

## 🚀 Como Usar

### 1. **Primeiro Acesso**

1. Acesse `http://localhost:5173`
2. Clique em **"Entrar"** → **"Registrar"**
3. Cadastre-se como administrador:
   - Nome: Seu nome
   - Email: seu@email.com
   - Senha: senha123

### 2. **Cadastrar Paciente**

1. Faça login
2. Clique em **"Adicionar"** no painel de pacientes
3. Preencha todos os campos:
   - **Informações Pessoais**: Nome, Data de Nascimento, Gênero, Estado Civil, Telefone
   - **ID da Pulseira IoT**: Selecione um dispositivo disponível
   - **Contato de Emergência**: Nome, Telefone, Email, Parentesco
   - **Ficha Médica**: Tipo Sanguíneo, Possui Deficiência?, Problemas Específicos
   - **Foto**: Upload opcional (clique em "Escolher Foto")
4. Clique em **"Cadastrar Paciente"**

### 3. **Editar Paciente**

1. No card do paciente, clique no botão **"Editar"** (azul)
2. Modifique os campos necessários
3. Altere a foto se desejar (clique em "Alterar Foto")
4. Clique em **"Atualizar Paciente"**

### 4. **Excluir Paciente**

1. No card do paciente, clique no botão **"Excluir"** (vermelho)
2. Confirme a exclusão no dialog
3. O paciente será removido permanentemente

### 5. **Sistema de Cores dos Sinais Vitais**

Os cards exibem cores dinâmicas baseadas nos valores dos sinais vitais:

**🟢 Verde (Normal):**
- Saturação O₂: ≥95%
- Temperatura: 36.0-37.5°C
- Batimentos: 60-100 bpm

**🟡 Amarelo (Atenção):**
- Saturação O₂: 92-94% (próximo ao limite)
- Temperatura: 37.6-37.9°C ou 35.5-35.9°C
- Batimentos: 51-60 bpm ou 101-109 bpm

**🔴 Vermelho (Crítico):**
- Saturação O₂: <92%
- Temperatura: ≥38°C ou <35°C
- Batimentos: ≤50 bpm ou ≥110 bpm

**Limites MEWS Padrão (não podem ser removidos):**
- Batimentos: 51-110 bpm
- Saturação O₂: ≥92%
- Temperatura: ≤38.0°C

### 6. **Monitorar em Tempo Real**

1. No **Dashboard**, você verá o card do paciente
2. Cada card mostra:
   - 🩸 **Saturação de O₂** (%)
   - 🌡️ **Temperatura** (°C)
   - ❤️ **Batimentos Cardíacos** (bpm)
3. Dados atualizados automaticamente via WebSocket
4. **Cores indicam situação:**
   - 🟢 Verde: Tudo normal
   - 🟡 Amarelo: Atenção (próximo aos limites)
   - 🔴 Vermelho: Alerta crítico (limites excedidos)

### 7. **Ver Histórico**

1. Clique no card do paciente
2. Veja gráficos de:
   - Batimentos cardíacos (BPM)
   - Saturação de oxigênio (SpO2)
   - Temperatura corporal
3. Filtre por período: Dia, Mês, Ano

### 8. **Configurar Alarmes**

1. Na página de detalhes do paciente
2. Clique em **"Configurar Alarmes"**
3. Defina limites personalizados:
   - BPM mínimo/máximo
   - SpO2 mínimo
   - Temperatura máxima
4. Clique em **"Salvar Configuração"**

**Nota:** Os limites MEWS padrão sempre serão respeitados, mesmo com configurações personalizadas.

## 🔌 Integração com Backend

### Endpoints Utilizados

```typescript
// Autenticação
POST /api/auth/register  // Cadastro de usuário
POST /api/auth/login     // Login com JWT

// Pacientes
GET  /api/pacientes              // Listar todos
POST /api/pacientes              // Criar novo
GET  /api/pacientes/:id          // Buscar por ID
PUT  /api/pacientes/:id          // Atualizar dados
DELETE /api/pacientes/:id        // Excluir paciente
GET  /api/pacientes/devices/available // Listar dispositivos

// Histórico
GET /api/historico/:pacienteId?periodo=dia|mes|ano
GET /api/historico/:pacienteId/latest

// Alarmes
GET  /api/alarms/:pacienteId  // Obter configuração
POST /api/alarms/:pacienteId  // Salvar configuração
```

### WebSocket (Alertas em Tempo Real)

```typescript
const ws = new WebSocket('ws://localhost:8080');

ws.onmessage = (event) => {
  const alert = JSON.parse(event.data);
  // Exibir notificação de alerta
};
```

## 🎨 Customização

### Temas e Cores

Edite `src/index.css` para alterar o tema:

```css
:root {
  --primary-color: #007bff;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --success-color: #28a745;
}
```

### Layout dos Cards

Componentes em `src/components/PatientCard/` podem ser customizados.

## 📊 Componentes Principais

### PatientCard
Exibe informações resumidas do paciente com dados em tempo real.

```tsx
<PatientCard 
  patient={paciente}
  latestData={dados}
  onCardClick={() => navigate(`/paciente/${id}`)}
/>
```

### Historico
Gráficos interativos com histórico de sinais vitais.

```tsx
<Historico 
  pacienteId={id}
  periodo="dia"
/>
```

### Alarme
Configuração de limites personalizados.

```tsx
<Alarme 
  pacienteId={id}
  currentConfig={config}
  onSave={handleSave}
/>
```

## 🐛 Troubleshooting

### Erro de CORS
Configure o backend para aceitar requisições do frontend:

```typescript
// backend/src/server.ts
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### WebSocket não conecta
Verifique se o WebSocket server está rodando na porta 8080:

```bash
netstat -ano | findstr :8080
```

### Dados não aparecem
1. Verifique se o backend está rodando (`npm run dev`)
2. Confirme que o token JWT está válido
3. Veja o console do navegador (F12) para erros
4. Verifique se a pulseira IoT está enviando dados

## 📦 Deploy

### AWS Amplify (Recomendado)

1. Faça build do projeto:
```bash
npm run build
```

2. Crie app no Amplify:
```bash
aws amplify create-app --name dsim-frontend --region us-east-1
```

3. Faça upload da pasta `dist/`

### Servidor Tradicional

```bash
npm run build
# Copie o conteúdo de dist/ para seu servidor web
```

## 📚 Referências

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Axios Documentation](https://axios-http.com/)

## 👥 Suporte

Para problemas ou dúvidas:
1. Verifique o console do navegador (F12)
2. Consulte os logs do backend
3. Revise a documentação da API em `../backend/README.md`


