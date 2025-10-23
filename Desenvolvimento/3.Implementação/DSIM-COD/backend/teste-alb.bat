@echo off
echo ========================================
echo TESTE DE ENDPOINTS - ALB HEALTH CHECK
echo ========================================

echo [1/3] Compilando projeto...
call mvnw clean package -DskipTests -q
if %ERRORLEVEL% neq 0 (
    echo ERRO: Falha na compilação
    pause
    exit /b 1
)

echo [2/3] Iniciando aplicação (aguarde 10 segundos)...
start /B java -jar target\dsim-backend-0.0.1-SNAPSHOT.jar
timeout /t 10 /nobreak >nul

echo [3/3] Testando endpoints...

echo.
echo --- Testando /status (ALB Health Check) ---
curl -s -w "Status: %%{http_code}\n" http://localhost:8080/status

echo.
echo --- Testando /api/health (Monitoramento detalhado) ---
curl -s -w "Status: %%{http_code}\n" http://localhost:8080/api/health

echo.
echo --- Testando endpoint protegido (deve retornar 401) ---
curl -s -w "Status: %%{http_code}\n" http://localhost:8080/api/v1/usuarios/me

echo.
echo ========================================
echo RESULTADOS ESPERADOS:
echo - /status: Status 200 (ALB OK!)
echo - /api/health: Status 200 (Monitoramento OK!)
echo - Endpoints protegidos: Status 401 (Segurança OK!)
echo ========================================

echo.
echo Pressione qualquer tecla para parar a aplicação...
pause >nul

echo.
echo Parando aplicação...
taskkill /F /IM java.exe >nul 2>&1

echo Teste concluído!
pause