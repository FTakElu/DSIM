#!/bin/bash

# Script para configurar DSIM Backend como serviço systemd
# Execute este script na EC2 para garantir persistência do backend

echo "=========================================="
echo "CONFIGURANDO DSIM BACKEND COMO SERVIÇO"
echo "=========================================="

# Verificar se está rodando como ec2-user
if [ "$USER" != "ec2-user" ]; then
    echo "❌ Execute este script como ec2-user"
    exit 1
fi

# Parar aplicação atual se estiver rodando
echo "🛑 Parando aplicação atual..."
pkill -f "dsim-backend" || echo "Nenhuma instância rodando"

# Obter caminho completo do JAR
JAR_PATH="/home/ec2-user/app/DSIM/Desenvolvimento/3.Implementação/DSIM-COD/backend/target/dsim-backend-0.0.1-SNAPSHOT.jar"
WORK_DIR="/home/ec2-user/app/DSIM/Desenvolvimento/3.Implementação/DSIM-COD/backend"

# Verificar se JAR existe
if [ ! -f "$JAR_PATH" ]; then
    echo "❌ JAR não encontrado: $JAR_PATH"
    echo "Execute mvnw clean package antes deste script"
    exit 1
fi

echo "✅ JAR encontrado: $JAR_PATH"

# Criar arquivo de serviço temporário
SERVICE_FILE="/tmp/dsim.service"

cat > $SERVICE_FILE << EOF
[Unit]
Description=DSIM Backend - Sistema de Monitoramento
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
User=ec2-user
Group=ec2-user
WorkingDirectory=$WORK_DIR
ExecStart=/usr/bin/java -jar $JAR_PATH
Restart=always
RestartSec=10
Environment=AWS_REGION=us-east-1
Environment=JAVA_OPTS=-Xmx512m

# Logs
StandardOutput=journal
StandardError=journal
SyslogIdentifier=dsim-backend

[Install]
WantedBy=multi-user.target
EOF

echo "✅ Arquivo de serviço criado em $SERVICE_FILE"

# Mostrar conteúdo do arquivo
echo ""
echo "📋 Conteúdo do arquivo de serviço:"
echo "=================================="
cat $SERVICE_FILE
echo "=================================="

echo ""
echo "🔧 Agora execute os comandos sudo manualmente:"
echo ""
echo "sudo cp $SERVICE_FILE /etc/systemd/system/dsim.service"
echo "sudo systemctl daemon-reload"
echo "sudo systemctl enable dsim"
echo "sudo systemctl start dsim"
echo ""
echo "Para verificar status:"
echo "sudo systemctl status dsim"
echo ""
echo "Para ver logs:"
echo "sudo journalctl -u dsim -f"
echo ""
echo "Para parar:"
echo "sudo systemctl stop dsim"

echo ""
echo "=========================================="
echo "✅ Script preparado! Execute os comandos sudo acima."
echo "=========================================="