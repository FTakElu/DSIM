@echo off
chcp 65001 >nul
REM ===============================
REM DSIM - Atualizar Credenciais AWS
REM ===============================
REM Execute este script toda vez que iniciar uma nova sessão AWS Academy

echo ========================================
echo  Atualizando Credenciais AWS
echo ========================================
echo.

REM Ler credenciais do arquivo local
for /f "tokens=2 delims==" %%a in ('findstr "aws_access_key_id" %USERPROFILE%\.aws\credentials') do set ACCESS_KEY=%%a
for /f "tokens=2 delims==" %%a in ('findstr "aws_secret_access_key" %USERPROFILE%\.aws\credentials') do set SECRET_KEY=%%a
for /f "tokens=2 delims==" %%a in ('findstr "aws_session_token" %USERPROFILE%\.aws\credentials') do set SESSION_TOKEN=%%a

REM Remover espaços em branco
set ACCESS_KEY=%ACCESS_KEY: =%
set SECRET_KEY=%SECRET_KEY: =%
set SESSION_TOKEN=%SESSION_TOKEN: =%

echo Credenciais obtidas:
echo Access Key: %ACCESS_KEY:~0,20%...
echo.

REM Criar arquivo .env temporário local
echo PORT=9999> .env.temp
echo NODE_ENV=production>> .env.temp
echo JWT_SECRET=dsim-secret-key-2024-very-secure-random-string>> .env.temp
echo AWS_REGION=us-east-1>> .env.temp
echo AWS_ACCESS_KEY_ID=%ACCESS_KEY%>> .env.temp
echo AWS_SECRET_ACCESS_KEY=%SECRET_KEY%>> .env.temp
echo AWS_SESSION_TOKEN=%SESSION_TOKEN%>> .env.temp

echo 1. Atualizando .env LOCAL...
copy /Y .env.temp "Desenvolvimento\3.Implementação\DSIM-COD\backend\.env" >nul
echo    [OK] .env local atualizado
echo.

echo 2. Enviando para EC2...
scp -i "Desenvolvimento/3.Implementação/CERTIFICADOS/dsim_keypair.pem" .env.temp ec2-user@98.95.251.71:"/home/ec2-user/DSIM/Desenvolvimento/3.Implementação/DSIM-COD/backend/.env"
if errorlevel 1 (
    echo    [ERRO] Falha ao enviar para EC2
    goto cleanup
)
echo    [OK] .env enviado para EC2
echo.

echo 3. Reiniciando backend no EC2...
ssh -i "Desenvolvimento/3.Implementação/CERTIFICADOS/dsim_keypair.pem" ec2-user@98.95.251.71 "pm2 restart dsim-backend"
if errorlevel 1 (
    echo    [ERRO] Falha ao reiniciar backend
    goto cleanup
)
echo    [OK] Backend reiniciado
echo.

:cleanup
del .env.temp >nul 2>&1

echo ========================================
echo  Credenciais Atualizadas!
echo ========================================
echo.
echo Backend rodando em: http://98.95.251.71:9999/health
echo Frontend rodando em: https://main.d2cq9un5umdfmy.amplifyapp.com
echo.
pause
