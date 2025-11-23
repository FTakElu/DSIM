# SOLUÇÃO TEMPORÁRIA: Frontend Local

**Problema:** Amplify HTTPS não pode fazer requisições HTTP (Mixed Content)

## Opções:

### 1. ✅ **Usar frontend localmente** (RECOMENDADO POR ENQUANTO)
```bash
cd "Desenvolvimento/3.Implementação/DSIM-COD/frontend"
npm run dev
```
Acesse: `http://localhost:5173` (funciona com HTTP backend)

### 2. 🔧 **Configurar HTTPS no EC2** (solução permanente)
Instalar certificado SSL no EC2 com nginx como proxy reverso.
**Tempo:** ~30-60 minutos
**Dificuldade:** Média

### 3. 🔄 **Configurar API Gateway corretamente**
Fazer API Gateway rotear para EC2 com VPC Link ou HTTP Proxy.
**Tempo:** ~20-40 minutos  
**Dificuldade:** Média

### 4. ❌ **Desabilitar Mixed Content** (NÃO RECOMENDADO)
Configurar navegador para aceitar mixed content.
**Segurança:** Ruim

## Decisão recomendada:

**Para desenvolver agora:** Use opção 1 (frontend local)
**Para produção:** Configure opção 2 ou 3

O que você prefere fazer?
