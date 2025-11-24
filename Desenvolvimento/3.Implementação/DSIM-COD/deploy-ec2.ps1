# Deploy Backend DSIM no EC2
# Execute com: PowerShell -ExecutionPolicy Bypass -File deploy-ec2.ps1

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "DEPLOY BACKEND NO EC2 - DSIM" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$keyPath = "..\CERTIFICADOS\dsim_keypair.pem"
$ec2Host = "ubuntu@98.95.251.71"

# Verificar se a chave existe
if (-Not (Test-Path $keyPath)) {
    Write-Host "❌ ERRO: Chave SSH não encontrada em $keyPath" -ForegroundColor Red
    exit 1
}

Write-Host "🔑 Chave SSH encontrada" -ForegroundColor Green
Write-Host ""

# Instruções para o usuário
Write-Host "================================================" -ForegroundColor Yellow
Write-Host "INSTRUÇÕES DE DEPLOY MANUAL" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Abra um terminal SSH (PuTTY ou Windows Terminal)" -ForegroundColor White
Write-Host ""
Write-Host "2. Execute os seguintes comandos:" -ForegroundColor White
Write-Host ""
Write-Host "   cd `"c:\Users\flavi\OneDrive\Área de Trabalho\DSIM\Desenvolvimento\3.Implementação\CERTIFICADOS`"" -ForegroundColor Cyan
Write-Host "   ssh -i dsim_keypair.pem ubuntu@98.95.251.71" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. No servidor EC2, execute:" -ForegroundColor White
Write-Host ""
Write-Host "   cd DSIM-COD/backend" -ForegroundColor Cyan
Write-Host "   git pull origin main" -ForegroundColor Cyan
Write-Host "   npm install" -ForegroundColor Cyan
Write-Host "   npm run build" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Configure o SNS_TOPIC_ARN:" -ForegroundColor White
Write-Host ""
Write-Host "   nano .env" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Adicione esta linha ao final:" -ForegroundColor White
Write-Host "   SNS_TOPIC_ARN=arn:aws:sns:us-east-1:565757789330:DSIM-Alertas" -ForegroundColor Green
Write-Host ""
Write-Host "   Salve com: Ctrl+O, Enter, Ctrl+X" -ForegroundColor White
Write-Host ""
Write-Host "5. Reinicie o servidor:" -ForegroundColor White
Write-Host ""
Write-Host "   pm2 restart dsim-backend" -ForegroundColor Cyan
Write-Host "   pm2 logs dsim-backend" -ForegroundColor Cyan
Write-Host ""
Write-Host "================================================" -ForegroundColor Yellow
Write-Host ""

# Tentar conexão SSH (pode não funcionar no Windows sem configuração)
Write-Host "Tentando conectar ao EC2..." -ForegroundColor Yellow

$commands = @(
    "cd DSIM-COD/backend",
    "git pull origin main",
    "npm install",
    "npm run build",
    "echo '✅ Deploy concluído! Agora configure o SNS_TOPIC_ARN no .env e reinicie o PM2'"
)

$commandString = $commands -join " && "

try {
    ssh -i $keyPath $ec2Host $commandString
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "✅ DEPLOY CONCLUÍDO!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  AÇÃO NECESSÁRIA:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Configure o SNS_TOPIC_ARN no EC2:" -ForegroundColor White
    Write-Host ""
    Write-Host "1. Conecte ao EC2:" -ForegroundColor White
    Write-Host "   ssh -i $keyPath $ec2Host" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Edite o .env:" -ForegroundColor White
    Write-Host "   cd DSIM-COD/backend && nano .env" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "3. Adicione:" -ForegroundColor White
    Write-Host "   SNS_TOPIC_ARN=arn:aws:sns:us-east-1:565757789330:DSIM-Alertas" -ForegroundColor Green
    Write-Host ""
    Write-Host "4. Reinicie:" -ForegroundColor White
    Write-Host "   pm2 restart dsim-backend" -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Red
    Write-Host "❌ ERRO NA CONEXÃO SSH" -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Siga as instruções de deploy manual acima." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Para corrigir permissões da chave:" -ForegroundColor White
    Write-Host "1. Clique direito em dsim_keypair.pem" -ForegroundColor White
    Write-Host "2. Propriedades → Segurança → Avançado" -ForegroundColor White
    Write-Host "3. Desabilite herança e remova todos os usuários" -ForegroundColor White
    Write-Host "4. Adicione apenas seu usuário com permissão de leitura" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📚 Documentação completa em:" -ForegroundColor Cyan
Write-Host "DEPLOY_EC2_GUIDE.md" -ForegroundColor White
Write-Host "WEBSOCKET_SNS_GUIDE.md" -ForegroundColor White
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Read-Host "Pressione Enter para sair"
