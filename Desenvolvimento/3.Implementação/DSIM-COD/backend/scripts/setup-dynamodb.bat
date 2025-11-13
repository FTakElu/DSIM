@echo off
REM Script para criar tabelas DynamoDB para o sistema DSIM
REM Execute este script no Windows CMD/PowerShell

echo ================================================
echo Configurando tabelas DynamoDB para o sistema DSIM
echo ================================================
echo.

REM Verificar se AWS CLI está instalado
where aws >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] AWS CLI nao encontrado. Instale: https://aws.amazon.com/cli/
    pause
    exit /b 1
)

REM Verificar credenciais AWS
echo Verificando credenciais AWS...
aws sts get-caller-identity >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Credenciais AWS invalidas. Execute: aws configure
    pause
    exit /b 1
)

echo [OK] Credenciais AWS validas
echo.

echo ================================================
echo Criando Tabela 1/5: DSIM_SensorData
echo ================================================

REM Verificar se tabela já existe
aws dynamodb describe-table --table-name DSIM_SensorData --region us-east-1 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [AVISO] Tabela DSIM_SensorData ja existe
) else (
    echo Criando tabela DSIM_SensorData...
    aws dynamodb create-table ^
      --table-name DSIM_SensorData ^
      --attribute-definitions ^
        AttributeName=deviceId,AttributeType=S ^
        AttributeName=timestamp,AttributeType=N ^
      --key-schema ^
        AttributeName=deviceId,KeyType=HASH ^
        AttributeName=timestamp,KeyType=RANGE ^
      --billing-mode PAY_PER_REQUEST ^
      --stream-specification StreamEnabled=true,StreamViewType=NEW_IMAGE ^
      --region us-east-1 >nul

    echo Aguardando criacao da tabela DSIM_SensorData...
    aws dynamodb wait table-exists --table-name DSIM_SensorData --region us-east-1
    echo [OK] Tabela DSIM_SensorData criada com sucesso
)
echo.

echo ================================================
echo Criando Tabela 2/5: DSIM_Patients
echo ================================================

aws dynamodb describe-table --table-name DSIM_Patients --region us-east-1 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [AVISO] Tabela DSIM_Patients ja existe
) else (
    echo Criando tabela DSIM_Patients...
    aws dynamodb create-table ^
      --table-name DSIM_Patients ^
      --attribute-definitions ^
        AttributeName=id,AttributeType=S ^
        AttributeName=deviceId,AttributeType=S ^
      --key-schema ^
        AttributeName=id,KeyType=HASH ^
      --global-secondary-indexes ^
        "[{\"IndexName\":\"deviceId-index\",\"KeySchema\":[{\"AttributeName\":\"deviceId\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" ^
      --billing-mode PAY_PER_REQUEST ^
      --region us-east-1 >nul

    echo Aguardando criacao da tabela DSIM_Patients...
    aws dynamodb wait table-exists --table-name DSIM_Patients --region us-east-1
    echo [OK] Tabela DSIM_Patients criada com sucesso
)
echo.

echo ================================================
echo Criando Tabela 3/5: DSIM_Users
echo ================================================

aws dynamodb describe-table --table-name DSIM_Users --region us-east-1 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [AVISO] Tabela DSIM_Users ja existe
) else (
    echo Criando tabela DSIM_Users...
    aws dynamodb create-table ^
      --table-name DSIM_Users ^
      --attribute-definitions ^
        AttributeName=email,AttributeType=S ^
      --key-schema ^
        AttributeName=email,KeyType=HASH ^
      --billing-mode PAY_PER_REQUEST ^
      --region us-east-1 >nul

    echo Aguardando criacao da tabela DSIM_Users...
    aws dynamodb wait table-exists --table-name DSIM_Users --region us-east-1
    echo [OK] Tabela DSIM_Users criada com sucesso
)
echo.

echo ================================================
echo Criando Tabela 4/5: DSIM_Alarms
echo ================================================

aws dynamodb describe-table --table-name DSIM_Alarms --region us-east-1 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [AVISO] Tabela DSIM_Alarms ja existe
) else (
    echo Criando tabela DSIM_Alarms...
    aws dynamodb create-table ^
      --table-name DSIM_Alarms ^
      --attribute-definitions ^
        AttributeName=pacienteId,AttributeType=S ^
      --key-schema ^
        AttributeName=pacienteId,KeyType=HASH ^
      --billing-mode PAY_PER_REQUEST ^
      --region us-east-1 >nul

    echo Aguardando criacao da tabela DSIM_Alarms...
    aws dynamodb wait table-exists --table-name DSIM_Alarms --region us-east-1
    echo [OK] Tabela DSIM_Alarms criada com sucesso
)
echo.

echo ================================================
echo Criando Tabela 5/5: DSIM_Connections
echo ================================================

aws dynamodb describe-table --table-name DSIM_Connections --region us-east-1 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [AVISO] Tabela DSIM_Connections ja existe
) else (
    echo Criando tabela DSIM_Connections...
    aws dynamodb create-table ^
      --table-name DSIM_Connections ^
      --attribute-definitions ^
        AttributeName=connectionId,AttributeType=S ^
        AttributeName=pacienteId,AttributeType=S ^
      --key-schema ^
        AttributeName=connectionId,KeyType=HASH ^
      --global-secondary-indexes ^
        "[{\"IndexName\":\"pacienteId-index\",\"KeySchema\":[{\"AttributeName\":\"pacienteId\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" ^
      --billing-mode PAY_PER_REQUEST ^
      --region us-east-1 >nul

    echo Aguardando criacao da tabela DSIM_Connections...
    aws dynamodb wait table-exists --table-name DSIM_Connections --region us-east-1
    
    echo Configurando TTL na tabela DSIM_Connections...
    aws dynamodb update-time-to-live ^
      --table-name DSIM_Connections ^
      --time-to-live-specification "Enabled=true,AttributeName=ttl" ^
      --region us-east-1 >nul
    
    echo [OK] Tabela DSIM_Connections criada com sucesso
)
echo.

echo ================================================
echo CONFIGURACAO CONCLUIDA COM SUCESSO!
echo ================================================
echo.
echo Tabelas criadas:
echo   [OK] DSIM_SensorData (com Stream habilitado)
echo   [OK] DSIM_Patients (com indice deviceId-index)
echo   [OK] DSIM_Users
echo   [OK] DSIM_Alarms
echo   [OK] DSIM_Connections (com indice pacienteId-index e TTL)
echo.
echo Para verificar as tabelas:
echo   aws dynamodb list-tables --region us-east-1
echo.
echo Proximos passos:
echo   1. Configure o arquivo .env
echo   2. Execute: npm run build
echo   3. Execute: npm run dev
echo.
echo Consulte DEPLOYMENT_GUIDE.md para instrucoes detalhadas
echo.

pause
