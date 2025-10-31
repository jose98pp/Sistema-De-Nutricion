@echo off
echo ========================================
echo   Reiniciando Servidor Laravel
echo ========================================
echo.

echo [1/4] Limpiando cache de configuracion...
php artisan config:clear

echo.
echo [2/4] Limpiando cache de aplicacion...
php artisan cache:clear

echo.
echo [3/4] Limpiando cache de rutas...
php artisan route:clear

echo.
echo [4/4] Limpiando cache de vistas...
php artisan view:clear

echo.
echo ========================================
echo   Caches limpiadas exitosamente!
echo ========================================
echo.
echo Ahora puedes iniciar el servidor con:
echo   php artisan serve
echo.
pause
