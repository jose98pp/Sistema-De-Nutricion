@echo off
cls
echo ========================================
echo   NutriSystem - Verificacion del Sistema
echo ========================================
echo.

REM Verificar PHP
echo [1/8] Verificando PHP...
php --version >nul 2>&1
if %errorlevel% equ 0 (
    php --version | findstr /C:"PHP"
    echo   - OK
) else (
    echo   - ERROR: PHP no encontrado
)
echo.

REM Verificar Composer
echo [2/8] Verificando Composer...
composer --version >nul 2>&1
if %errorlevel% equ 0 (
    composer --version | findstr /C:"Composer"
    echo   - OK
) else (
    echo   - ERROR: Composer no encontrado
)
echo.

REM Verificar Node
echo [3/8] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    node --version
    echo   - OK
) else (
    echo   - ERROR: Node.js no encontrado
)
echo.

REM Verificar NPM
echo [4/8] Verificando NPM...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    npm --version
    echo   - OK
) else (
    echo   - ERROR: NPM no encontrado
)
echo.

REM Verificar MySQL
echo [5/8] Verificando MySQL...
mysql --version >nul 2>&1
if %errorlevel% equ 0 (
    mysql --version
    echo   - OK
) else (
    echo   - ADVERTENCIA: MySQL no encontrado en PATH
)
echo.

REM Verificar archivo .env
echo [6/8] Verificando archivo .env...
if exist ".env" (
    echo   - Archivo .env existe
    echo   - Verificando configuracion...
    findstr /C:"DB_DATABASE" .env >nul 2>&1
    if %errorlevel% equ 0 (
        echo   - Configuracion de base de datos: OK
    )
    findstr /C:"PUSHER_APP_KEY" .env >nul 2>&1
    if %errorlevel% equ 0 (
        echo   - Configuracion de WebSocket: OK
    )
) else (
    echo   - ERROR: Archivo .env no encontrado
    echo   - Copia .env.example a .env y configuralo
)
echo.

REM Verificar vendor
echo [7/8] Verificando dependencias de Laravel...
if exist "vendor" (
    echo   - Directorio vendor existe
    echo   - OK
) else (
    echo   - ERROR: Directorio vendor no encontrado
    echo   - Ejecuta: composer install
)
echo.

REM Verificar node_modules
echo [8/8] Verificando dependencias de Node...
if exist "node_modules" (
    echo   - Directorio node_modules existe
    echo   - OK
) else (
    echo   - ERROR: Directorio node_modules no encontrado
    echo   - Ejecuta: npm install
)
echo.

REM Verificar app movil
echo.
echo ========================================
echo   Verificando App Movil
echo ========================================
echo.

if exist "nutrisystem-app" (
    echo App movil encontrada
    if exist "nutrisystem-app\node_modules" (
        echo   - Dependencias instaladas: OK
    ) else (
        echo   - ADVERTENCIA: Dependencias no instaladas
        echo   - Ejecuta: cd nutrisystem-app && npm install
    )
) else (
    echo   - ADVERTENCIA: Directorio nutrisystem-app no encontrado
)

echo.
echo ========================================
echo   Resumen de Verificacion
echo ========================================
echo.
echo Si todos los checks muestran OK, puedes ejecutar:
echo   start-all.bat
echo.
echo Si hay errores, revisa la documentacion en:
echo   GUIA_PRUEBA_COMPLETA_SISTEMA.md
echo.
pause