@echo off
echo ==========================================
echo COMANDOS PARA CONFIGURAR SERVIÇO SYSTEMD
echo ==========================================
echo.
echo 1. Primeiro, execute na EC2:
echo    chmod +x setup-service.sh
echo    ./setup-service.sh
echo.
echo 2. Depois execute os comandos sudo:
echo    sudo cp /tmp/dsim.service /etc/systemd/system/dsim.service
echo    sudo systemctl daemon-reload
echo    sudo systemctl enable dsim
echo    sudo systemctl start dsim
echo.
echo 3. Verificar se funcionou:
echo    sudo systemctl status dsim
echo    sudo journalctl -u dsim -f
echo.
echo ==========================================
echo COMANDOS ÚTEIS PARA GERENCIAR O SERVIÇO:
echo ==========================================
echo.
echo Parar serviço:      sudo systemctl stop dsim
echo Iniciar serviço:    sudo systemctl start dsim
echo Reiniciar serviço:  sudo systemctl restart dsim
echo Status:             sudo systemctl status dsim
echo Logs em tempo real: sudo journalctl -u dsim -f
echo Desabilitar:        sudo systemctl disable dsim
echo.
pause