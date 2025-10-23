@echo off
echo ========================================
echo TESTE DE SEGURANÇA - DSIM BACKEND
echo ========================================

REM Primeiro, vamos compilar e construir o projeto
echo [1/4] Compilando projeto...
call mvnw clean compile -q
if %ERRORLEVEL% neq 0 (
    echo ERRO: Falha na compilação
    pause
    exit /b 1
)

echo [2/4] Gerando JAR...
call mvnw package -DskipTests -q
if %ERRORLEVEL% neq 0 (
    echo ERRO: Falha na geração do JAR
    pause
    exit /b 1
)

echo [3/4] Iniciando aplicação (aguarde 15 segundos)...
start /B java -jar target\dsim-backend-0.0.1-SNAPSHOT.jar
timeout /t 15 /nobreak >nul

echo [4/4] Testando endpoints de segurança...

echo.
echo --- Testando endpoint público (health) ---
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:8080/api/health

echo.
echo --- Testando endpoint protegido sem token (deve retornar 401) ---
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:8080/api/v1/usuarios/me

echo.
echo --- Testando endpoint protegido sem token (deve retornar 401) ---
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:8080/api/v1/pacientes/device/test123

echo.
echo --- Testando endpoint de pulseira sem token (deve retornar 401) ---
curl -s -o nul -w "Status: %%{http_code}\n" -X POST http://localhost:8080/api/v1/pulseira/dados -H "Content-Type: application/json" -d "{\"deviceId\":\"test\",\"temperatura\":36.5}"

echo.
echo ========================================
echo RESULTADOS ESPERADOS:
echo - Endpoint público: Status 200 ou 404
echo - Endpoints protegidos: Status 401 (Unauthorized)
echo ========================================

echo.
echo Pressione qualquer tecla para parar a aplicação...
pause >nul

echo.
echo Parando aplicação...
taskkill /F /IM java.exe >nul 2>&1

echo Teste concluído!
pause