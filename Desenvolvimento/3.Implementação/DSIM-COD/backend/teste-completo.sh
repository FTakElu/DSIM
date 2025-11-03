#!/bin/bash

# Script de teste completo para DSIM Backend
# Execute na EC2 via SSH

echo "=========================================="
echo "TESTE COMPLETO - DSIM BACKEND"
echo "=========================================="

# Obter IP da instância
INSTANCE_IP=$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4)
echo "IP da Instância: $INSTANCE_IP"

echo ""
echo "--- Teste 1: Health Check ALB (/status) ---"
curl -s -w "\nStatus HTTP: %{http_code}\nTempo: %{time_total}s\n" \
     http://localhost:8080/status

echo ""
echo "--- Teste 2: Health Check Detalhado (/api/health) ---"
curl -s -w "\nStatus HTTP: %{http_code}\nTempo: %{time_total}s\n" \
     http://localhost:8080/api/health

echo ""
echo "--- Teste 3: Endpoint Protegido (deve retornar 401) ---"
curl -s -w "\nStatus HTTP: %{http_code}\nTempo: %{time_total}s\n" \
     http://localhost:8080/api/v1/usuarios/me

echo ""
echo "--- Teste 4: Verificar se Java está rodando ---"
ps aux | grep java | grep -v grep

echo ""
echo "--- Teste 5: Verificar porta 8080 ---"
netstat -tlnp | grep :8080

echo ""
echo "=========================================="
echo "RESULTADOS ESPERADOS:"
echo "✅ /status: HTTP 200 + JSON com status UP"
echo "✅ /api/health: HTTP 200 + JSON detalhado"
echo "✅ Endpoint protegido: HTTP 401 (Unauthorized)"
echo "✅ Java rodando na porta 8080"
echo "=========================================="