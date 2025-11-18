@echo off
cls
echo ========================================
echo   NutriSystem - Iniciar Todos los Servicios
echo ========================================
echo.
echo Iniciando servicios...
echo.

REM Verificar que estamos en el directorio correcto
if not exist "artisan" (
    echo ERROR: No se encuentra el archivo artisan
    echo Por favor ejecuta este script desde la raiz del proyecto
    pause
    exit /b 1
)

REM Iniciar Laravel API
echo [1/4] Iniciando Laravel API en puerto 8000...
start "Laravel API" cmd /k "php artisan serve"
timeout /t 3 /nobreak >nul

REM Iniciar Reverb (WebSocket Server)
echo [2/4] Iniciando Reverb (WebSocket) en puerto 8080...
start "Reverb WebSocket" cmd /k "php artisan reverb:start"
timeout /t 3 /nobreak >nul

REM Iniciar Frontend Web (Vite)
echo [3/4] Iniciando Frontend Web en puerto 5173...
start "Frontend Web (Vite)" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

REM Iniciar App Movil (Expo)
echo [4/4] Iniciando App Movil (Expo)...
start "App Movil (Expo)" cmd /k "cd nutrisystem-app && npx expo start"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   Todos los servicios iniciados!
echo ========================================
echo.
echo URLs de acceso:
echo.
echo   Laravel API:        http://localhost:8000
echo   Reverb WebSocket:   ws://127.0.0.1:8080
echo   Frontend Web:       http://localhost:5173
echo   App Movil (Expo):   Escanea el QR en la terminal
echo.
echo ========================================
echo.
echo Presiona cualquier tecla para abrir el navegador...
pause >nul

REM Abrir navegador con la URL principal
start http://localhost:5173

echo.
echo Navegadores abiertos!
echo.
echo Para detener todos los servicios, cierra las ventanas de terminal.
echo.
pause
