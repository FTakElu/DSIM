@echo off
echo Testando endpoint /status...
curl -w "Status: %%{http_code}\n" http://localhost:8080/status

echo.
echo Testando endpoint /api/health...
curl -w "Status: %%{http_code}\n" http://localhost:8080/api/health

echo.
echo Pressione qualquer tecla para continuar...
pause