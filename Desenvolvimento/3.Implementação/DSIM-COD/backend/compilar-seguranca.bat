@echo off
echo Compilando projeto com segurança...
call mvnw clean compile
if %ERRORLEVEL% neq 0 (
    echo ERRO na compilação
    pause
    exit /b 1
)

echo.
echo Gerando JAR...
call mvnw package -DskipTests
if %ERRORLEVEL% neq 0 (
    echo ERRO na geração do JAR  
    pause
    exit /b 1
)

echo.
echo ===== COMPILAÇÃO BEM-SUCEDIDA =====
echo Tamanho do JAR:
dir target\dsim-backend-0.0.1-SNAPSHOT.jar
echo.
echo SEGURANÇA IMPLEMENTADA:
echo - Spring Security configurado
echo - OAuth2 Resource Server ativo
echo - Cognito JWT integrado
echo - Endpoints protegidos por roles
echo.
pause