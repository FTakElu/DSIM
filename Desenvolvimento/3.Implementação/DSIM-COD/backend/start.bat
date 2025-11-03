@echo off
echo ========================================
echo      DSIM Backend - Spring Boot
echo ========================================
echo.

echo Verificando Java...
java -version
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Java nao encontrado. Instale Java 17 ou superior.
    pause
    exit /b 1
)

echo.
echo Verificando Maven...
call mvn -version
if %ERRORLEVEL% NEQ 0 (
    echo AVISO: Maven nao encontrado. Usando Maven Wrapper...
    echo.
)

echo.
echo ========================================
echo       Configuracao de Ambiente
echo ========================================
echo.
echo Configure as variaveis de ambiente AWS:
echo.
echo set AWS_ACCESS_KEY_ID=sua_access_key
echo set AWS_SECRET_ACCESS_KEY=sua_secret_key
echo set AWS_REGION=us-east-1
echo.
echo Pressione qualquer tecla para continuar...
pause > nul

echo.
echo ========================================
echo      Iniciando aplicacao...
echo ========================================
echo.

if exist mvnw.cmd (
    call mvnw.cmd spring-boot:run
) else (
    call mvn spring-boot:run
)

echo.
echo Aplicacao finalizada.
pause