@echo off
chcp 65001 >nul
echo ========================================
echo   Iniciando Servidor Laravel
echo ========================================

echo.
echo [1/3] Obteniendo IP local...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do set IP=%%a
set IP=%IP:~1%
echo ✓ Tu IP es: %IP%

echo.
echo [2/3] Deteniendo procesos PHP anteriores...
taskkill /F /IM php.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo ✓ Procesos anteriores detenidos

echo.
echo [3/3] Iniciando servidor Laravel en 0.0.0.0:8000...
echo    IMPORTANTE: El servidor escuchará en TODAS las interfaces de red
echo    Esto permite que tu móvil se conecte desde la misma WiFi
echo.

start "Laravel Server - %IP%:8000" cmd /k "php artisan serve --host=0.0.0.0 --port=8000"

timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   ✓ Servidor iniciado correctamente!
echo ========================================
echo.
echo 📱 URL del servidor: http://%IP%:8000
echo 🌐 Accesible desde: Cualquier dispositivo en la misma WiFi
echo.
echo 💡 Verifica desde tu móvil:
echo    Abre el navegador y ve a: http://%IP%:8000/api/servicios/disponibles
echo.
echo Presiona cualquier tecla para cerrar...
pause >nul
