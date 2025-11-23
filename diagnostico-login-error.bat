@echo off
echo ========================================
echo DIAGNOSTICO DE ERROR DE LOGIN
echo ========================================
echo.

echo [1/5] Verificando servidor Laravel...
curl -s -o nul -w "Status: %%{http_code}\n" http://127.0.0.1:8000/api/login

echo.
echo [2/5] Verificando CORS...
curl -s -I http://127.0.0.1:8000/api/login | findstr "Access-Control"

echo.
echo [3/5] Probando login con credenciales de prueba...
curl -X POST http://127.0.0.1:8000/api/login ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  -H "Accept: application/json" ^
  -d "email=carlos@nutricion.com&password=password"

echo.
echo [4/5] Verificando logs de Laravel...
if exist "storage\logs\laravel.log" (
    echo Ultimas 10 lineas del log:
    powershell -Command "Get-Content storage\logs\laravel.log -Tail 10"
) else (
    echo No se encontro archivo de log
)

echo.
echo [5/5] Verificando configuracion de API...
echo VITE_API_URL desde .env:
findstr "VITE_API_URL" .env

echo.
echo ========================================
echo DIAGNOSTICO COMPLETADO
echo ========================================
pause
