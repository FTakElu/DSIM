# Cenário 1: Monolítica 

Este diretório contém os artefatos e scripts utilizados para validar a arquitetura monolítica do projeto DSIM.

O objetivo desta etapa foi simular um ambiente centralizado e identificar suas limitações (Ponto Único de Falha e escalabilidade ) e então justificar a nossa arquiteura distribuída.

##  Conteúdo

* **`server.js`**: Script Node.js que executou as funções de Backend, Broker MQTT (Mosquitto) e Banco de Dados (em memória) dentro da instância EC2.
* **`simulador.js`**: Script executado localmente para injetar dados de sensores simulados via MQTT na instância EC2.

---

## ⚠️ Status do Ambiente

> **Nota:** O ambiente AWS (VPC Personalizada e Instância EC2) está ainda está estruturado, já que o ambiente do cenário 2 foi construído em outra conta aws foi possível deixar o cenário 1 

---


## Procedimentos de Execução

Abaixo estão os passos realizados para colocar o monolito em funcionamento.

### 1. Execução do Backend (AWS EC2)

O código contido em `server.js` foi implantado na instância EC2 e executado com o seguinte comando:

```bash
node server.js
```

> *O servidor inicia escutando na porta 3000 (HTTP) e conectando ao Broker local na porta 1883.*

### 2. Configuração do Cliente (Simulador Local)

Na máquina local (computador do desenvolvedor), usei a utilização de um script para simular a pulseira enviando dados.

#### Instalação das dependências
```bash
npm install mqtt
```

#### Execução
No script `simulador.js`, o IP Público da EC2 foi configurado e o script executado:

```bash
node simulador.js
```

---

## ✅ Validação e Resultados

Para validar o funcionamento, o acesso foi feito via navegador através do endereço:

```
http://*{IP-PUBLICO-EC2}*:3000
```

### Resultados Observados:
1.  **Visualização:** O Frontend simples exibiu os dados recebidos em tempo real.
2.  **Prova de Falha:** Foi comprovado o acoplamento crítico. Ao desligar a instância EC2, tanto a visualização (Web) quanto a ingestão de dados (MQTT) falharam simultaneamente, confirmando a fragilidade da arquitetura monolítica para este caso de uso em saúde.

---

DSIM - Sistemas Distribuídos

