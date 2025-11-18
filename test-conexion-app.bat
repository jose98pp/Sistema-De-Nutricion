@echo off
chcp 65001 >nul
echo ========================================
echo 🔍 DIAGNÓSTICO DE CONEXIÓN APP MÓVIL
echo ========================================
echo.

echo 📍 1. Verificando IP actual...
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    echo    IP encontrada: %%a
)
echo.

echo 🌐 2. Verificando servidor Laravel en puerto 8000...
echo.
netstat -ano | findstr :8000
if %errorlevel% equ 0 (
    echo    ✅ Servidor Laravel está corriendo
) else (
    echo    ❌ Servidor Laravel NO está corriendo
    echo    💡 Ejecuta: iniciar-servidor-correcto.bat
)
echo.

echo 🔌 3. Probando conexión local (localhost)...
echo.
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:8000/api/dashboard 2>nul
if %errorlevel% equ 0 (
    echo    ✅ Conexión local funciona
) else (
    echo    ❌ Conexión local falla
)
echo.

echo 📱 4. Probando conexión por IP (192.168.137.193)...
echo.
curl -s -o nul -w "Status: %%{http_code}\n" http://192.168.137.193:8000/api/dashboard 2>nul
if %errorlevel% equ 0 (
    echo    ✅ Conexión por IP funciona
) else (
    echo    ❌ Conexión por IP falla
    echo    💡 Verifica que el servidor use --host=0.0.0.0
)
echo.

echo 📋 5. Verificando configuración de la app...
echo.
if exist "nutrisystem-app\.env" (
    echo    Configuración actual:
    findstr "API_URL" nutrisystem-app\.env
    echo.
) else (
    echo    ❌ Archivo nutrisystem-app\.env no encontrado
)
echo.

echo ========================================
echo 💡 RECOMENDACIONES
echo ========================================
echo.
echo 1. Si la IP cambió, actualiza nutrisystem-app\.env
echo 2. Asegúrate de que el servidor use: php artisan serve --host=0.0.0.0
echo 3. Verifica que tu teléfono esté en la misma red WiFi
echo 4. Reinicia la app móvil después de cambiar configuración
echo.

pause
