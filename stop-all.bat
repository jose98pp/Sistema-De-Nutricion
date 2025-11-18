@echo off
cls
echo ========================================
echo   NutriSystem - Detener Todos los Servicios
echo ========================================
echo.
echo Deteniendo servicios...
echo.

REM Detener procesos de PHP (Laravel y WebSocket)
echo [1/4] Deteniendo Laravel API...
taskkill /FI "WINDOWTITLE eq Laravel API*" /T /F 2>nul
if %errorlevel% equ 0 (
    echo   - Laravel API detenido
) else (
    echo   - Laravel API no estaba corriendo
)

echo [2/4] Deteniendo Reverb WebSocket...
taskkill /FI "WINDOWTITLE eq Reverb WebSocket*" /T /F 2>nul
if %errorlevel% equ 0 (
    echo   - Reverb WebSocket detenido
) else (
    echo   - Reverb WebSocket no estaba corriendo
)

REM Detener Node (Vite y Expo)
echo [3/4] Deteniendo Frontend Web...
taskkill /FI "WINDOWTITLE eq Frontend Web*" /T /F 2>nul
if %errorlevel% equ 0 (
    echo   - Frontend Web detenido
) else (
    echo   - Frontend Web no estaba corriendo
)

echo [4/4] Deteniendo App Movil...
taskkill /FI "WINDOWTITLE eq App Movil*" /T /F 2>nul
if %errorlevel% equ 0 (
    echo   - App Movil detenido
) else (
    echo   - App Movil no estaba corriendo
)

echo.
echo ========================================
echo   Todos los servicios detenidos!
echo ========================================
echo.
pause
