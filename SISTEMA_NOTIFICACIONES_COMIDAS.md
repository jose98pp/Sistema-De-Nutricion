# Sistema de Notificaciones de Comidas

## Correcciones Aplicadas

### 1. Problema: Las comidas del plan no aparecen para el paciente

**Causa:** El método `progresoDelDia()` buscaba días del plan por fecha exacta, pero si el plan fue creado con fechas diferentes a la fecha actual, no encontraba coincidencias.

**Solución:**
- Modificado para buscar primero por fecha exacta
- Si no encuentra, busca por día de la semana (LUNES, MARTES, etc.)
- Cambiado para buscar el plan ACTIVO más reciente en lugar de por rango de fechas

**Archivo:** `app/Http/Controllers/Api/IngestaController.php`

```php
// Ahora busca por día de la semana si no encuentra por fecha exacta
$diaSemana = strtoupper($fechaCarbon->locale('es')->dayName);

$dia = $plan->planDias()
    ->whereDate('fecha', $fecha)
    ->with(['comidas' => function($query) {
        $query->orderBy('hora_recomendada');
    }, 'comidas.alimentos'])
    ->first();

// Si no encuentra por fecha exacta, buscar por día de la semana
if (!$dia) {
    $dia = $plan->planDias()
        ->where('dia_semana', $diaSemana)
        ->with(['comidas' => function($query) {
            $query->orderBy('hora_recomendada');
        }, 'comidas.alimentos'])
        ->first();
}
```

### 2. Sistema de Notificaciones Automáticas

**Implementación:**
Se creó un comando de Laravel que envía notificaciones automáticas a los pacientes cuando es hora de sus comidas.

**Archivo:** `app/Console/Commands/EnviarNotificacionesComidas.php`

**Características:**
- Se ejecuta cada 15 minutos automáticamente
- Verifica las comidas programadas para los próximos 15 minutos
- Solo envía notificación si el paciente NO ha consumido esa comida
- Envía notificación con enlace directo a "Mis Comidas de Hoy"

**Programación:** `routes/console.php`
```php
Schedule::command('notificaciones:comidas')
    ->everyFifteenMinutes()
    ->withoutOverlapping()
    ->runInBackground();
```

### 3. Optimización de Notificaciones

**Problema:** Timeout en el endpoint `/notificaciones/no-leidas/contar`

**Solución:**
- Agregado try-catch para manejar errores gracefully
- Devuelve 0 si hay algún problema (tabla no existe, etc.)

**Archivo:** `app/Http/Controllers/Api/NotificationController.php`

## Cómo Funciona el Sistema

### Para el Paciente:

1. **Vista "Mis Comidas de Hoy":**
   - Muestra todas las comidas programadas para el día actual
   - Permite registrar rápidamente cada comida
   - Muestra progreso nutricional del día

2. **Notificaciones Automáticas:**
   - Recibe notificación 15 minutos antes de cada comida
   - La notificación incluye el nombre de la comida
   - Al hacer clic, va directo a "Mis Comidas de Hoy"

### Para Activar las Notificaciones:

En el servidor, ejecutar el scheduler de Laravel:

**Opción 1 - Cron Job (Producción):**
```bash
* * * * * cd /ruta/al/proyecto && php artisan schedule:run >> /dev/null 2>&1
```

**Opción 2 - Desarrollo:**
```bash
php artisan schedule:work
```

**Opción 3 - Ejecutar manualmente:**
```bash
php artisan notificaciones:comidas
```

## Estructura de Notificación

```json
{
  "id_usuario": 123,
  "tipo": "info",
  "titulo": "🍽️ Hora de tu DESAYUNO",
  "mensaje": "Es hora de tu Desayuno Energético. Recuerda registrar tu ingesta.",
  "link": "/mis-comidas-hoy",
  "leida": false
}
```

## Verificación

Para verificar que todo funciona:

1. Crear un plan con comidas para hoy
2. Verificar que aparecen en `/mis-comidas-hoy`
3. Ejecutar `php artisan notificaciones:comidas` manualmente
4. Verificar que se crean notificaciones en la base de datos

## Notas Importantes

- Las notificaciones solo se envían si el paciente NO ha consumido la comida
- El sistema verifica comidas en los próximos 15 minutos
- Se ejecuta sin solapamiento (withoutOverlapping)
- Funciona en segundo plano (runInBackground)
