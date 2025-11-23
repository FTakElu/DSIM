@echo off
REM ===============================
REM DSIM - Atualizar Credenciais AWS na EC2
REM ===============================
REM Execute este script toda vez que iniciar uma nova sessão AWS Academy

set EC2_IP=98.95.251.71
set KEY_PATH=Desenvolvimento\3.Implementação\CERTIFICADOS\dsim_keypair.pem

echo ========================================
echo  Atualizando Credenciais AWS na EC2
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

echo Conectando na EC2 e atualizando .env...
echo.

REM Criar comando SSH para atualizar .env
ssh -i "%KEY_PATH%" ec2-user@%EC2_IP% "sed -i 's/^AWS_ACCESS_KEY_ID=.*/AWS_ACCESS_KEY_ID=%ACCESS_KEY%/' /home/ec2-user/DSIM/Desenvolvimento/3.Implementação/DSIM-COD/backend/.env && sed -i 's/^AWS_SECRET_ACCESS_KEY=.*/AWS_SECRET_ACCESS_KEY=%SECRET_KEY%/' /home/ec2-user/DSIM/Desenvolvimento/3.Implementação/DSIM-COD/backend/.env && sed -i 's|^AWS_SESSION_TOKEN=.*|AWS_SESSION_TOKEN=%SESSION_TOKEN%|' /home/ec2-user/DSIM/Desenvolvimento/3.Implementação/DSIM-COD/backend/.env && pm2 restart dsim-backend && echo 'Credenciais atualizadas e backend reiniciado!'"

echo.
echo ========================================
echo  Credenciais Atualizadas!
echo ========================================
echo.
echo Backend reiniciado automaticamente.
echo Teste: curl http://%EC2_IP%:9999/health
echo.
pause
