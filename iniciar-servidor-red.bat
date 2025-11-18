@echo off
echo ========================================
echo   Iniciando Servidor Laravel en Red
echo ========================================
echo.
echo Servidor escuchando en: http://192.168.0.88:8000
echo.
echo IMPORTANTE: Deja esta ventana abierta
echo Presiona Ctrl+C para detener el servidor
echo.
echo ========================================
echo.

php artisan serve --host=0.0.0.0 --port=8000
