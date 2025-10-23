@echo off
REM Script para configurar tabelas no DynamoDB Local

echo Configurando DynamoDB Local...

REM Configura endpoint local
set AWS_ACCESS_KEY_ID=local
set AWS_SECRET_ACCESS_KEY=local
set AWS_DEFAULT_REGION=us-east-1
set ENDPOINT=http://localhost:8000

echo Criando tabela DadosPulseira...
aws dynamodb create-table ^
    --table-name DadosPulseira ^
    --attribute-definitions ^
        AttributeName=deviceID,AttributeType=S ^
        AttributeName=timestamp,AttributeType=N ^
    --key-schema ^
        AttributeName=deviceID,KeyType=HASH ^
        AttributeName=timestamp,KeyType=RANGE ^
    --provisioned-throughput ^
        ReadCapacityUnits=5,WriteCapacityUnits=5 ^
    --endpoint-url %ENDPOINT%

echo Criando tabela Pacientes...
aws dynamodb create-table ^
    --table-name Pacientes ^
    --attribute-definitions ^
        AttributeName=pacienteId,AttributeType=S ^
    --key-schema ^
        AttributeName=pacienteId,KeyType=HASH ^
    --provisioned-throughput ^
        ReadCapacityUnits=5,WriteCapacityUnits=5 ^
    --endpoint-url %ENDPOINT%

echo Criando tabela Usuarios...
aws dynamodb create-table ^
    --table-name Usuarios ^
    --attribute-definitions ^
        AttributeName=userId,AttributeType=S ^
    --key-schema ^
        AttributeName=userId,KeyType=HASH ^
    --provisioned-throughput ^
        ReadCapacityUnits=5,WriteCapacityUnits=5 ^
    --endpoint-url %ENDPOINT%

echo Criando tabela Alarmes...
aws dynamodb create-table ^
    --table-name Alarmes ^
    --attribute-definitions ^
        AttributeName=alarmeId,AttributeType=S ^
    --key-schema ^
        AttributeName=alarmeId,KeyType=HASH ^
    --provisioned-throughput ^
        ReadCapacityUnits=5,WriteCapacityUnits=5 ^
    --endpoint-url %ENDPOINT%

echo Aguardando tabelas ficarem ativas...
timeout /t 10

echo Inserindo dados de exemplo...

REM Paciente de exemplo
aws dynamodb put-item ^
    --table-name Pacientes ^
    --item "{\"pacienteId\": {\"S\": \"pac-001\"}, \"nome\": {\"S\": \"João Silva\"}, \"dataNascimento\": {\"S\": \"1985-03-15\"}, \"deviceId\": {\"S\": \"device123\"}, \"cuidadorId\": {\"S\": \"cuidador-001\"}, \"mewsLimits\": {\"M\": {\"hr_min\": {\"N\": \"60\"}, \"hr_max\": {\"N\": \"100\"}, \"temp_max\": {\"N\": \"37.5\"}, \"score_threshold\": {\"N\": \"4\"}}}}" ^
    --endpoint-url %ENDPOINT%

REM Dados da pulseira de exemplo
aws dynamodb put-item ^
    --table-name DadosPulseira ^
    --item "{\"deviceID\": {\"S\": \"device123\"}, \"timestamp\": {\"N\": \"1640995200000\"}, \"heartRate\": {\"N\": \"75\"}, \"temperature\": {\"N\": \"36.8\"}, \"oximetry\": {\"N\": \"98\"}, \"bloodPressureSystolic\": {\"N\": \"120\"}, \"bloodPressureDiastolic\": {\"N\": \"80\"}}" ^
    --endpoint-url %ENDPOINT%

echo Configuração concluída!
echo DynamoDB Local disponível em: http://localhost:8000
echo Para visualizar tabelas, use: aws dynamodb list-tables --endpoint-url http://localhost:8000
pause