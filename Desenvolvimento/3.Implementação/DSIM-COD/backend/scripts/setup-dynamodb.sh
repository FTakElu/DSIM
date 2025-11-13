#!/bin/bash

echo "🚀 Configurando tabelas DynamoDB para o sistema DSIM..."
echo ""

# Verificar se AWS CLI está instalado
if ! command -v aws &> /dev/null
then
    echo "❌ AWS CLI não encontrado. Instale: https://aws.amazon.com/cli/"
    exit 1
fi

# Verificar credenciais AWS
echo "Verificando credenciais AWS..."
if ! aws sts get-caller-identity &> /dev/null
then
    echo "❌ Credenciais AWS inválidas. Execute: aws configure"
    exit 1
fi

echo "✅ Credenciais AWS válidas"
echo ""

# Função para verificar se tabela existe
table_exists() {
    aws dynamodb describe-table --table-name "$1" &> /dev/null
}

# 1. DSIM_SensorData
echo "📊 Criando tabela DSIM_SensorData..."
if table_exists "DSIM_SensorData"; then
    echo "⚠️  Tabela DSIM_SensorData já existe"
else
    aws dynamodb create-table \
      --table-name DSIM_SensorData \
      --attribute-definitions \
        AttributeName=deviceId,AttributeType=S \
        AttributeName=timestamp,AttributeType=N \
      --key-schema \
        AttributeName=deviceId,KeyType=HASH \
        AttributeName=timestamp,KeyType=RANGE \
      --billing-mode PAY_PER_REQUEST \
      --stream-specification StreamEnabled=true,StreamViewType=NEW_IMAGE \
      --region us-east-1

    echo "⏳ Aguardando criação da tabela DSIM_SensorData..."
    aws dynamodb wait table-exists --table-name DSIM_SensorData --region us-east-1
    echo "✅ Tabela DSIM_SensorData criada com sucesso"
fi
echo ""

# 2. DSIM_Patients
echo "📊 Criando tabela DSIM_Patients..."
if table_exists "DSIM_Patients"; then
    echo "⚠️  Tabela DSIM_Patients já existe"
else
    aws dynamodb create-table \
      --table-name DSIM_Patients \
      --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=deviceId,AttributeType=S \
      --key-schema \
        AttributeName=id,KeyType=HASH \
      --global-secondary-indexes \
        "[{\"IndexName\":\"deviceId-index\",\"KeySchema\":[{\"AttributeName\":\"deviceId\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" \
      --billing-mode PAY_PER_REQUEST \
      --region us-east-1

    echo "⏳ Aguardando criação da tabela DSIM_Patients..."
    aws dynamodb wait table-exists --table-name DSIM_Patients --region us-east-1
    echo "✅ Tabela DSIM_Patients criada com sucesso"
fi
echo ""

# 3. DSIM_Users
echo "📊 Criando tabela DSIM_Users..."
if table_exists "DSIM_Users"; then
    echo "⚠️  Tabela DSIM_Users já existe"
else
    aws dynamodb create-table \
      --table-name DSIM_Users \
      --attribute-definitions \
        AttributeName=email,AttributeType=S \
      --key-schema \
        AttributeName=email,KeyType=HASH \
      --billing-mode PAY_PER_REQUEST \
      --region us-east-1

    echo "⏳ Aguardando criação da tabela DSIM_Users..."
    aws dynamodb wait table-exists --table-name DSIM_Users --region us-east-1
    echo "✅ Tabela DSIM_Users criada com sucesso"
fi
echo ""

# 4. DSIM_Alarms
echo "📊 Criando tabela DSIM_Alarms..."
if table_exists "DSIM_Alarms"; then
    echo "⚠️  Tabela DSIM_Alarms já existe"
else
    aws dynamodb create-table \
      --table-name DSIM_Alarms \
      --attribute-definitions \
        AttributeName=pacienteId,AttributeType=S \
      --key-schema \
        AttributeName=pacienteId,KeyType=HASH \
      --billing-mode PAY_PER_REQUEST \
      --region us-east-1

    echo "⏳ Aguardando criação da tabela DSIM_Alarms..."
    aws dynamodb wait table-exists --table-name DSIM_Alarms --region us-east-1
    echo "✅ Tabela DSIM_Alarms criada com sucesso"
fi
echo ""

# 5. DSIM_Connections
echo "📊 Criando tabela DSIM_Connections..."
if table_exists "DSIM_Connections"; then
    echo "⚠️  Tabela DSIM_Connections já existe"
else
    aws dynamodb create-table \
      --table-name DSIM_Connections \
      --attribute-definitions \
        AttributeName=connectionId,AttributeType=S \
        AttributeName=pacienteId,AttributeType=S \
      --key-schema \
        AttributeName=connectionId,KeyType=HASH \
      --global-secondary-indexes \
        "[{\"IndexName\":\"pacienteId-index\",\"KeySchema\":[{\"AttributeName\":\"pacienteId\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" \
      --billing-mode PAY_PER_REQUEST \
      --region us-east-1

    echo "⏳ Aguardando criação da tabela DSIM_Connections..."
    aws dynamodb wait table-exists --table-name DSIM_Connections --region us-east-1
    echo "✅ Tabela DSIM_Connections criada com sucesso"
    
    # Configurar TTL
    echo "⏳ Configurando TTL na tabela DSIM_Connections..."
    aws dynamodb update-time-to-live \
      --table-name DSIM_Connections \
      --time-to-live-specification "Enabled=true,AttributeName=ttl" \
      --region us-east-1
    echo "✅ TTL configurado com sucesso"
fi
echo ""

echo "🎉 Configuração do DynamoDB concluída com sucesso!"
echo ""
echo "📋 Tabelas criadas:"
echo "  ✅ DSIM_SensorData (com Stream habilitado)"
echo "  ✅ DSIM_Patients (com índice deviceId-index)"
echo "  ✅ DSIM_Users"
echo "  ✅ DSIM_Alarms"
echo "  ✅ DSIM_Connections (com índice pacienteId-index e TTL)"
echo ""
echo "🔍 Para verificar as tabelas:"
echo "  aws dynamodb list-tables --region us-east-1"
echo ""
echo "📚 Próximos passos:"
echo "  1. Configure o AWS IoT Core"
echo "  2. Deploy da função Lambda"
echo "  3. Configure o API Gateway"
echo "  4. Deploy do backend no EC2"
echo ""
echo "📖 Consulte DEPLOYMENT_GUIDE.md para instruções detalhadas"
