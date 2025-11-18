@echo off
echo ========================================
echo   PRUEBA RAPIDA DE NOTIFICACIONES
echo   Sistema de Sincronizacion en Tiempo Real
echo ========================================
echo.

echo Selecciona el tipo de prueba:
echo.
echo 1. Notificacion basica (Sistema)
echo 2. Notificacion de comida
echo 3. Notificacion de sesion
echo 4. Actualizar plan
echo 5. Crear 3 notificaciones (Badge test)
echo 6. Salir
echo.

set /p opcion="Ingresa tu opcion (1-6): "

if "%opcion%"=="1" goto notif_basica
if "%opcion%"=="2" goto notif_comida
if "%opcion%"=="3" goto notif_sesion
if "%opcion%"=="4" goto actualizar_plan
if "%opcion%"=="5" goto badge_test
if "%opcion%"=="6" goto salir

:notif_basica
echo.
echo Creando notificacion basica...
php artisan tinker --execute="$user = \App\Models\User::first(); $notif = \App\Models\Notificacion::create(['id_usuario' => $user->id, 'tipo' => 'sistema', 'titulo' => 'Prueba Sistema', 'mensaje' => 'Esta es una notificacion de prueba del sistema', 'leida' => false]); event(new \App\Events\NotificationCreated($notif)); echo 'Notificacion creada con ID: ' . $notif->id_notificacion;"
echo.
echo Notificacion enviada!
pause
goto menu

:notif_comida
echo.
echo Creando notificacion de comida...
php artisan tinker --execute="$user = \App\Models\User::first(); $notif = \App\Models\Notificacion::create(['id_usuario' => $user->id, 'tipo' => 'comida', 'titulo' => 'Recordatorio de Comida', 'mensaje' => 'Es hora de tu almuerzo', 'leida' => false]); event(new \App\Events\NotificationCreated($notif)); echo 'Notificacion creada!';"
echo.
echo Notificacion enviada!
pause
goto menu

:notif_sesion
echo.
echo Creando notificacion de sesion...
php artisan tinker --execute="$user = \App\Models\User::first(); $sesion = \App\Models\Sesion::first(); $notif = \App\Models\Notificacion::create(['id_usuario' => $user->id, 'tipo' => 'sesion', 'titulo' => 'Sesion Proxima', 'mensaje' => 'Tienes una sesion en 30 minutos', 'link' => 'nutrisystem://sesiones/' . ($sesion ? $sesion->id_sesion : '1'), 'leida' => false]); event(new \App\Events\NotificationCreated($notif)); echo 'Notificacion creada!';"
echo.
echo Notificacion enviada!
pause
goto menu

:actualizar_plan
echo.
echo Actualizando plan...
php artisan tinker --execute="$plan = \App\Models\PlanAlimentacion::first(); if($plan) { event(new \App\Events\PlanUpdated($plan->id_plan, $plan->id_paciente, ['tipo' => 'comida_agregada', 'detalle' => 'Nueva comida anadida'])); echo 'Evento de plan enviado!'; } else { echo 'No se encontro plan'; }"
echo.
echo Evento enviado!
pause
goto menu

:badge_test
echo.
echo Creando 3 notificaciones para probar badge...
php artisan tinker --execute="$user = \App\Models\User::first(); for($i=1; $i<=3; $i++) { $notif = \App\Models\Notificacion::create(['id_usuario' => $user->id, 'tipo' => 'sistema', 'titulo' => 'Notificacion ' . $i, 'mensaje' => 'Mensaje de prueba ' . $i, 'leida' => false]); event(new \App\Events\NotificationCreated($notif)); sleep(1); } echo '3 notificaciones creadas!';"
echo.
echo 3 notificaciones enviadas!
echo Verifica que el badge muestre "3"
pause
goto menu

:salir
echo.
echo Saliendo...
exit

:menu
echo.
echo ========================================
goto :eof
