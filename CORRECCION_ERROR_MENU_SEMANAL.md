# ✅ Corrección - Error 500 en Mi Menú Semanal

## 🐛 Problema

Error 500 (Internal Server Error) al acceder a "Mi Menú Semanal" como paciente.

```
GET /api/mi-menu-semanal
Status: 500 Internal Server Error
```

## 🔍 Causa Probable

1. **Campos faltantes** en el modelo PlanAlimentacion (nombre_plan vs nombre)
2. **Relación planDia** no configurada correctamente
3. **Sin manejo de errores** en el controlador

## ✅ Solución Implementada

### 1. Try/Catch Agregado

Envuelto todo el método en try/catch para capturar errores:

```php
public function getMiMenuSemanal(Request $request)
{
    try {
        // ... código existente ...
    } catch (\Exception $e) {
        \Log::error('Error en getMiMenuSemanal: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Error al obtener el menú semanal',
            'error' => config('app.debug') ? $e->getMessage() : 'Error interno'
        ], 500);
    }
}
```

### 2. Campos con Fallback

Agregado operador null coalescing para campos que pueden no existir:

```php
'nombre_plan' => $plan->nombre_plan ?? $plan->nombre,
'objetivo' => $plan->objetivo ?? 'Sin objetivo definido',
'calorias_objetivo' => $plan->calorias_objetivo ?? 0,
```

### 3. Logging Mejorado

Ahora los errores se guardan en el log con stack trace completo.

## 🧪 Verificación

### Paso 1: Ver el Error Específico

Ahora cuando ocurra el error, se guardará en `storage/logs/laravel.log` con el mensaje exacto.

```bash
Get-Content storage/logs/laravel.log -Tail 50
```

### Paso 2: Verificar Estructura de BD

El error probablemente es por uno de estos problemas:

#### Opción A: Campo nombre_plan no existe
```sql
-- Verificar estructura de la tabla
DESCRIBE planes_alimentacion;
```

Si el campo se llama `nombre` en lugar de `nombre_plan`, el código ahora lo maneja con el fallback.

#### Opción B: Relación planDia no existe

Verificar que el modelo Comida tenga la relación:

```php
// En app/Models/Comida.php
public function planDia()
{
    return $this->belongsTo(PlanDia::class, 'id_dia');
}
```

## 📝 Archivo Modificado

- ✅ `app/Http/Controllers/Api/MenuSemanalController.php`

## 🚀 Próximos Pasos

1. **Prueba nuevamente** acceder a "Mi Menú Semanal"

2. **Si aún da error 500**, revisa el log:
   ```bash
   Get-Content storage/logs/laravel.log -Tail 100
   ```

3. **Busca la línea** que dice "Error en getMiMenuSemanal:"

4. **Comparte el mensaje de error** para solucionarlo específicamente

## 💡 Posibles Soluciones Adicionales

### Si el problema es el nombre del campo:

```sql
-- Opción 1: Renombrar columna en BD
ALTER TABLE planes_alimentacion CHANGE nombre nombre_plan VARCHAR(255);

-- Opción 2: Agregar columna nombre_plan
ALTER TABLE planes_alimentacion ADD COLUMN nombre_plan VARCHAR(255) AFTER nombre;
UPDATE planes_alimentacion SET nombre_plan = nombre WHERE nombre_plan IS NULL;
```

### Si el problema es la relación:

Verificar que exista la tabla `plan_dias` y que tenga:
- `id_dia` (PK)
- `id_plan` (FK)
- `fecha`

## 🎯 Resultado Esperado

Después de esta corrección:
- ✅ Si hay un error, se captura y se muestra mensaje amigable
- ✅ El error se guarda en el log con detalles
- ✅ Los campos faltantes tienen valores por defecto
- ✅ Más fácil de depurar

**Prueba nuevamente y comparte el error del log si persiste.** 🚀
