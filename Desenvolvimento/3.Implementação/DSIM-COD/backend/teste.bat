@echo off
echo ========================================
echo      DSIM Backend - Teste Completo
echo ========================================
echo.

echo [1/5] Verificando Java...
java -version
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERRO: Java nao encontrado!
    echo 💡 Baixe Java 17 de: https://adoptium.net/
    pause
    exit /b 1
)

echo.
echo [2/5] Verificando Maven Wrapper...
call mvnw.cmd --version
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERRO: Maven Wrapper nao funciona!
    pause
    exit /b 1
)

echo.
echo [3/5] Limpando projeto anterior...
call mvnw.cmd clean
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ AVISO: Erro na limpeza, continuando...
)

echo.
echo [4/5] Compilando projeto...
call mvnw.cmd compile
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERRO: Falha na compilacao!
    echo 💡 Verifique erros acima
    pause
    exit /b 1
)

echo.
echo [5/5] Gerando JAR...
call mvnw.cmd package -DskipTests
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERRO: Falha ao gerar JAR!
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ SUCESSO! Projeto compilado!
echo ========================================
echo.
echo JAR gerado em: target\dsim-backend-0.0.1-SNAPSHOT.jar
echo.
echo Opcoes para executar:
echo 1. mvnw.cmd spring-boot:run
echo 2. java -jar target\dsim-backend-0.0.1-SNAPSHOT.jar
echo 3. docker-compose up --build
echo.
pause