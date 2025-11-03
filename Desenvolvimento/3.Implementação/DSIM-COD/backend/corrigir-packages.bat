@echo off
echo ========================================
echo   Corrigindo packages dos arquivos Java
echo ========================================

echo Corrigindo models...
powershell -Command "(Get-Content 'src\main\java\com\example\dsim\model\Usuario.java') -replace 'package main\.java\.com\.example\.dsim\.model;', 'package com.example.dsim.model;' | Set-Content 'src\main\java\com\example\dsim\model\Usuario.java'"

powershell -Command "(Get-Content 'src\main\java\com\example\dsim\model\Alarme.java') -replace 'package main\.java\.com\.example\.dsim\.model;', 'package com.example.dsim.model;' | Set-Content 'src\main\java\com\example\dsim\model\Alarme.java'"

echo Corrigindo repositories...
powershell -Command "(Get-Content 'src\main\java\com\example\dsim\repository\DadosPulseiraRepository.java') -replace 'package main\.java\.com\.example\.dsim\.repository;', 'package com.example.dsim.repository;' | Set-Content 'src\main\java\com\example\dsim\repository\DadosPulseiraRepository.java'"

powershell -Command "(Get-Content 'src\main\java\com\example\dsim\repository\PacienteRepository.java') -replace 'package main\.java\.com\.example\.dsim\.repository;', 'package com.example.dsim.repository;' | Set-Content 'src\main\java\com\example\dsim\repository\PacienteRepository.java'"

echo Corrigindo controllers...
powershell -Command "(Get-Content 'src\main\java\com\example\dsim\controller\PacienteController.java') -replace 'package main\.java\.com\.example\.dsim\.controller;', 'package com.example.dsim.controller;' | Set-Content 'src\main\java\com\example\dsim\controller\PacienteController.java'"

echo ✅ Packages corrigidos!
echo.
echo Testando compilacao...
call mvnw.cmd clean compile

if %ERRORLEVEL% EQU 0 (
    echo ✅ SUCESSO! Projeto compilado sem erros!
) else (
    echo ❌ Ainda há erros de compilação
)

pause