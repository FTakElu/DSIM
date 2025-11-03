@echo off
echo ========================================
echo      DSIM Backend - Teste Rapido
echo ========================================

cd /d "c:\Users\flavi\OneDrive\Área de Trabalho\DSIM\Desenvolvimento\3.Implementação\backend"

echo [1/3] Verificando estrutura de arquivos...
if exist "src\main\java\com\example\dsim\DsimApplication.java" (
    echo ✅ DsimApplication.java encontrado
) else (
    echo ❌ DsimApplication.java NAO encontrado
    pause
    exit /b 1
)

echo [2/3] Testando compilacao rapida...
call mvnw.cmd compile -q
if %ERRORLEVEL% EQU 0 (
    echo ✅ Compilacao bem-sucedida!
) else (
    echo ❌ Erro na compilacao
    echo Executando compilacao com detalhes...
    call mvnw.cmd compile
    pause
    exit /b 1
)

echo [3/3] Verificando classes compiladas...
if exist "target\classes\com\example\dsim" (
    echo ✅ Classes Java compiladas!
    dir "target\classes\com\example\dsim" /s /b
) else (
    echo ⚠️ Classes nao encontradas em target\classes
)

echo.
echo ========================================
echo ✅ PROJETO PRONTO PARA EXECUCAO!
echo ========================================
echo.
echo Para executar:
echo 1. mvnw.cmd spring-boot:run
echo 2. java -jar target\dsim-backend-0.0.1-SNAPSHOT.jar  
echo 3. docker-compose up --build
echo.
pause