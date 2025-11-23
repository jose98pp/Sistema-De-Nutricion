@echo off
echo ========================================
echo FIX AUTOMATICO - ERROR DE LOGIN
echo ========================================
echo.

echo Este script va a:
echo 1. Actualizar VITE_API_URL a http://127.0.0.1:8000
echo 2. Limpiar cache de Laravel
echo 3. Reiniciar el servidor
echo.
echo Presiona cualquier tecla para continuar o Ctrl+C para cancelar...
pause >nul

echo.
echo [1/4] Creando backup de .env...
copy .env .env.backup.%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2% >nul 2>&1
echo ✅ Backup creado

echo.
echo [2/4] Actualizando VITE_API_URL en .env...
powershell -Command "(Get-Content .env) -replace 'VITE_API_URL=http://172.30.1.49:8000', 'VITE_API_URL=http://127.0.0.1:8000' | Set-Content .env"
echo ✅ VITE_API_URL actualizado

echo.
echo [3/4] Limpiando cache de Laravel...
php artisan config:clear >nul 2>&1
php artisan cache:clear >nul 2>&1
php artisan route:clear >nul 2>&1
echo ✅ Cache limpiado

echo.
echo [4/4] Verificando configuracion...
echo.
echo Configuracion actual:
findstr "VITE_API_URL" .env
echo.

echo ========================================
echo ✅ CONFIGURACION ACTUALIZADA
echo ========================================
echo.
echo IMPORTANTE: Ahora debes:
echo.
echo 1. Si tienes npm run dev corriendo:
echo    - Presiona Ctrl+C en esa terminal
echo    - Ejecuta: npm run dev
echo.
echo 2. Si tienes el servidor Laravel corriendo:
echo    - Deberia seguir funcionando
echo    - Si no, ejecuta: php artisan serve
echo.
echo 3. Abre el navegador en: http://localhost:5173
echo    - Intenta hacer login
echo    - Deberia funcionar correctamente
echo.
echo ========================================
echo.
echo ¿Quieres iniciar el servidor Laravel ahora? (S/N)
set /p respuesta=

if /i "%respuesta%"=="S" (
    echo.
    echo Iniciando servidor Laravel...
    echo.
    echo ========================================
    echo SERVIDOR INICIADO - NO CIERRES ESTA VENTANA
    echo ========================================
    echo.
    php artisan serve --host=127.0.0.1 --port=8000
) else (
    echo.
    echo OK. Recuerda iniciar el servidor con: php artisan serve
    echo.
    pause
)
