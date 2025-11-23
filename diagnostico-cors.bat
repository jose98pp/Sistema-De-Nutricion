@echo off
echo ========================================
echo DIAGNOSTICO DE CORS - NutriSystem
echo ========================================
echo.

echo 1. Verificando configuracion de CORS...
php artisan config:show cors
echo.

echo 2. Verificando IP del servidor...
ipconfig | findstr "IPv4"
echo.

echo 3. Verificando archivo .env...
findstr "APP_URL" .env
findstr "SANCTUM_STATEFUL_DOMAINS" .env
echo.

echo 4. Limpiando cache...
php artisan config:clear
php artisan cache:clear
echo.

echo ========================================
echo DIAGNOSTICO COMPLETADO
echo ========================================
echo.
echo Para iniciar el servidor en la IP correcta, usa:
echo php artisan serve --host=172.30.1.49 --port=8000
echo.
pause
