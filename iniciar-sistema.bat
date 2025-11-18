@echo off
chcp 65001 >nul
echo ========================================
echo   Iniciando Sistema NutriSystem
echo ========================================

echo.
echo [1/4] Obteniendo IP local...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do set IP=%%a
set IP=%IP:~1%
echo ✓ Tu IP es: %IP%

echo.
echo [2/4] Iniciando servidor Laravel...
echo    Comando: php artisan serve --host=0.0.0.0 --port=8000
start "Laravel Server" cmd /k "php artisan serve --host=0.0.0.0 --port=8000"
timeout /t 3 /nobreak >nul

echo.
echo [3/4] Iniciando Reverb WebSocket...
echo    Comando: php artisan reverb:start --host=0.0.0.0 --port=8080
start "Reverb WebSocket" cmd /k "php artisan reverb:start --host=0.0.0.0 --port=8080"
timeout /t 3 /nobreak >nul

echo.
echo [4/4] Iniciando app móvil...
echo    Comando: npx expo start
cd nutrisystem-app
start "Expo Dev Server" cmd /k "npx expo start"
cd ..

echo.
echo ========================================
echo   ✓ Sistema iniciado correctamente!
echo ========================================
echo.
echo 📱 Servidor Laravel: http://%IP%:8000
echo 🔌 WebSocket Reverb: ws://%IP%:8080
echo 📲 App Móvil: Escanea el QR en Expo
echo.
echo 💡 IMPORTANTE:
echo    - Asegúrate de que tu móvil esté en la misma red WiFi
echo    - Verifica que el firewall permita conexiones en puertos 8000 y 8080
echo    - Si cambias de red, actualiza la IP en los archivos .env
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
