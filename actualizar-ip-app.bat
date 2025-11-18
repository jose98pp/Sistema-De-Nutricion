@echo off
chcp 65001 >nul
cls
echo ========================================
echo 🔧 ACTUALIZAR IP DE LA APP MÓVIL
echo ========================================
echo.

echo 📍 Tu IP actual es:
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do (
    set IP_ACTUAL=%%a
    set IP_ACTUAL=!IP_ACTUAL: =!
    echo    !IP_ACTUAL!
)
echo.

set /p NUEVA_IP="Ingresa la IP a usar (o Enter para usar la detectada): "

if "%NUEVA_IP%"=="" (
    set NUEVA_IP=%IP_ACTUAL%
)

echo.
echo 📝 Actualizando configuración con IP: %NUEVA_IP%
echo.

(
echo API_URL=http://%NUEVA_IP%:8000/api
echo ENVIRONMENT=development
echo.
echo # Pusher/Reverb WebSocket Configuration
echo PUSHER_KEY=7b5sxmaaowzskckuk50f
echo PUSHER_CLUSTER=mt1
echo PUSHER_HOST=%NUEVA_IP%
echo PUSHER_PORT=8080
echo PUSHER_SCHEME=http
echo.
) > nutrisystem-app\.env

echo ✅ Configuración actualizada en nutrisystem-app\.env
echo.

echo 📋 Contenido del archivo:
type nutrisystem-app\.env
echo.

echo ========================================
echo 🚀 PRÓXIMOS PASOS
echo ========================================
echo.
echo 1. Detén todos los servicios:
echo    stop-all.bat
echo.
echo 2. Inicia el servidor Laravel:
echo    iniciar-servidor-correcto.bat
echo.
echo 3. En otra terminal, inicia la app:
echo    cd nutrisystem-app
echo    npx expo start -c
echo.
echo 4. Escanea el QR con Expo Go
echo.

pause
