@echo off
echo ========================================
echo SOLUCION RAPIDA - ERROR DE LOGIN
echo ========================================
echo.

echo [Paso 1/5] Deteniendo procesos existentes...
taskkill /F /IM php.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [Paso 2/5] Limpiando cache de Laravel...
php artisan config:clear
php artisan cache:clear
php artisan route:clear

echo.
echo [Paso 3/5] Verificando configuracion...
echo Verificando VITE_API_URL en .env:
findstr "VITE_API_URL" .env
echo.
echo Verificando APP_URL en .env:
findstr "APP_URL" .env

echo.
echo [Paso 4/5] Iniciando servidor Laravel...
echo El servidor se iniciara en http://127.0.0.1:8000
echo.
echo IMPORTANTE: Deja esta ventana abierta mientras usas la aplicacion
echo Para detener el servidor, presiona Ctrl+C
echo.
echo ========================================
echo SERVIDOR INICIADO - NO CIERRES ESTA VENTANA
echo ========================================
echo.

php artisan serve --host=127.0.0.1 --port=8000
