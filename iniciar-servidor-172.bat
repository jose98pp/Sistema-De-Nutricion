@echo off
echo ========================================
echo Iniciando Servidor Laravel
echo IP: 172.30.1.49
echo Puerto: 8000
echo ========================================
echo.

echo Limpiando cache...
call php artisan config:clear
call php artisan cache:clear
call php artisan route:clear
echo.

echo Iniciando servidor...
echo.
echo IMPORTANTE: Deja esta ventana abierta
echo El servidor estara disponible en: http://172.30.1.49:8000
echo.
echo Para detener el servidor, presiona Ctrl+C
echo.

php artisan serve --host=172.30.1.49 --port=8000
