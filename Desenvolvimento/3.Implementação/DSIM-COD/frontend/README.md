# Frontend - DSIM (Sistema de Monitoramento de Pacientes)

Interface web para monitoramento em tempo real de sinais vitais de pacientes através de pulseiras IoT.

## 🎯 Funcionalidades

- ✅ **Dashboard de Pacientes**: Visualização em cards com dados em tempo real
- ✅ **Cadastro de Pacientes**: Formulário completo com dados pessoais e foto
- ✅ **Histórico de Sinais Vitais**: Gráficos e tabelas com dados históricos
- ✅ **Alertas em Tempo Real**: Notificações via WebSocket quando limites são excedidos
- ✅ **Sistema de Alarmes**: Configuração personalizada de limites por paciente
- ✅ **Score MEWS**: Cálculo automático do Modified Early Warning Score
- ✅ **Autenticação JWT**: Login seguro para profissionais de saúde
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
│   │   ├── AddPatientPage.tsx    # Cadastro de paciente
│   │   ├── Dashboard.tsx          # Listagem de pacientes
│   │   ├── HistoricoPage.tsx      # Histórico detalhado
│   │   ├── HomePage.tsx           # Página inicial
│   │   ├── LoginPage.tsx          # Login
│   │   └── PatientDetailsPage.tsx # Detalhes do paciente
│   ├── service/        # Integração com backend
│   │   └── api.ts      # Cliente HTTP configurado
│   ├── styles/         # Estilos globais e temas
│   ├── Types/          # Definições TypeScript
│   │   └── types.ts    # Interfaces de Paciente, Dados, etc.
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

### 1. Instalar Dependências

```bash
cd frontend
npm install
```

### 2. Configurar URL da API

Edite `src/service/api.ts` para apontar para o backend:

```typescript
const api = axios.create({
  baseURL: 'http://localhost:9999/api', // URL do backend
  timeout: 10000,
});
```

### 3. Executar em Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em: **http://localhost:5173**

### 4. Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão em `dist/`

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
2. Clique em **"Adicionar Paciente"**
3. Preencha:
   - Nome, CPF, Data de Nascimento
   - Dados de contato
   - Histórico médico
   - Foto (opcional)
4. Clique em **"Cadastrar"**

### 3. **Vincular Device IoT**

Após cadastrar o paciente, vincule a pulseira:

```bash
curl -X POST http://localhost:9999/api/pacientes/PACIENTE_ID/device \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"Pulseira_DSIM"}'
```

### 4. **Monitorar em Tempo Real**

1. No **Dashboard**, você verá o card do paciente
2. Dados atualizados automaticamente a cada 10s
3. **Cores dos cards indicam situação:**
   - 🟢 Verde: Tudo normal
   - 🟡 Amarelo: Atenção (MEWS elevado)
   - 🔴 Vermelho: Alerta crítico

### 5. **Ver Histórico**

1. Clique no card do paciente
2. Veja gráficos de:
   - Batimentos cardíacos (BPM)
   - Saturação de oxigênio (SpO2)
   - Temperatura corporal
3. Filtre por período: Dia, Mês, Ano

### 6. **Configurar Alarmes**

1. Na página de detalhes do paciente
2. Clique em **"Configurar Alarmes"**
3. Defina limites personalizados:
   - BPM mínimo/máximo
   - SpO2 mínimo
   - Temperatura mínima/máxima

## 🔌 Integração com Backend

### Endpoints Utilizados

```typescript
// Autenticação
POST /api/auth/register  // Cadastro
POST /api/auth/login     // Login

// Pacientes
GET  /api/pacientes           // Listar todos
POST /api/pacientes           // Criar novo
GET  /api/pacientes/:id       // Buscar por ID
PUT  /api/pacientes/:id       // Atualizar
DELETE /api/pacientes/:id     // Deletar
POST /api/pacientes/:id/device // Vincular device

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
