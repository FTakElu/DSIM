# Frontend - DSIM

Esta pasta contém o código do frontend da aplicação DSIM desenvolvido em **React + TypeScript + Vite**.

## Tecnologias utilizadas

- React 18
- TypeScript
- Vite (build tool)
- CSS Modules

## Estrutura do projeto

```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/           # Imagens e recursos estáticos
│   ├── components/       # Componentes reutilizáveis
│   │   ├── BannerSlides/
│   │   ├── Funcionalidades/
│   │   ├── Header/
│   │   ├── Historico/
│   │   ├── PatientCard/
│   │   └── Sobre/
│   ├── pages/           # Páginas da aplicação
│   ├── Types/           # Definições de tipos TypeScript
│   ├── App.tsx          # Componente principal
│   ├── main.tsx         # Entry point
│   └── index.css        # Estilos globais
├── index.html
└── README.md
```

## Como executar

Quando for configurar novamente o ambiente de desenvolvimento:

1. Instale as dependências:
```bash
npm install
```

2. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

3. Para build de produção:
```bash
npm run build
```

## Integração com backend

O frontend está preparado para se integrar com o backend Spring Boot que será desenvolvido na pasta `../backend/`.