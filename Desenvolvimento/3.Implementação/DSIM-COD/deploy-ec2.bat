@echo off
echo ================================================
echo DEPLOY BACKEND NO EC2 - DSIM
echo ================================================
echo.

set KEY_PATH=..\CERTIFICADOS\dsim_keypair.pem
set EC2_HOST=ubuntu@98.95.251.71

echo [1/5] Conectando ao EC2...
echo.

ssh -i "%KEY_PATH%" %EC2_HOST% "echo Conectado com sucesso!"

if errorlevel 1 (
    echo.
    echo ❌ ERRO: Não foi possível conectar ao EC2
    echo.
    echo Possíveis soluções:
    echo 1. Verifique se a instância EC2 está rodando
    echo 2. Verifique as permissões da chave dsim_keypair.pem
    echo 3. Verifique o Security Group permite SSH (porta 22)
    echo.
    echo Para corrigir permissões no Windows:
    echo - Clique direito em dsim_keypair.pem ^> Propriedades ^> Segurança
    echo - Remova todos os usuários exceto seu usuário atual
    echo - Dê permissão de leitura apenas
    echo.
    pause
    exit /b 1
)

echo.
echo [2/5] Atualizando código do GitHub...
ssh -i "%KEY_PATH%" %EC2_HOST% "cd DSIM-COD/backend && git pull"

echo.
echo [3/5] Instalando dependências...
ssh -i "%KEY_PATH%" %EC2_HOST% "cd DSIM-COD/backend && npm install"

echo.
echo [4/5] Compilando TypeScript...
ssh -i "%KEY_PATH%" %EC2_HOST% "cd DSIM-COD/backend && npm run build"

echo.
echo [5/5] Atualizando variáveis de ambiente...
echo.
echo ⚠️  ATENÇÃO: Configure manualmente o SNS_TOPIC_ARN no EC2
echo.
echo Execute este comando no EC2:
echo.
echo ssh -i "%KEY_PATH%" %EC2_HOST%
echo cd DSIM-COD/backend
echo nano .env
echo.
echo Adicione esta linha:
echo SNS_TOPIC_ARN=arn:aws:sns:us-east-1:565757789330:DSIM-Alertas
echo.
echo Depois reinicie o PM2:
echo pm2 restart dsim-backend
echo pm2 logs dsim-backend
echo.
echo ================================================
echo ✅ Código atualizado no EC2!
echo ⚠️  Não esqueça de configurar o SNS_TOPIC_ARN
echo ================================================
echo.
pause
