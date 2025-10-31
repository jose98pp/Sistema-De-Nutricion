# ✅ Corrección de Permisos - Direcciones

## 🐛 Problema Identificado

**Error 403 Forbidden** al intentar guardar una dirección:

```
POST /api/direcciones
Status: 403 Forbidden
Message: "Forbidden access attempt"
```

### Causa

Las rutas de direcciones estaban en el grupo de **solo admin**, pero los **nutricionistas** también necesitan crear direcciones para sus pacientes.

## 🔧 Solución

### Antes (Incorrecto)

```php
// Rutas exclusivas para Admin
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // ...
    
    // Direcciones (gestión completa) ❌ Solo admin
    Route::apiResource('direcciones', DireccionController::class);
    Route::get('direcciones/paciente/{id_paciente}', [DireccionController::class, 'byPaciente']);
});
```

### Después (Correcto)

```php
// Rutas exclusivas para Admin y Nutricionista
Route::middleware(['auth:sanctum', 'role:admin,nutricionista'])->group(function () {
    // ...
    
    // Direcciones - Admin y Nutricionista ✅
    Route::apiResource('direcciones', DireccionController::class);
    Route::get('direcciones/paciente/{id_paciente}', [DireccionController::class, 'byPaciente']);
});
```

## 📊 Permisos Actualizados

### Direcciones - CRUD Completo

| Acción | Ruta | Admin | Nutricionista | Paciente |
|--------|------|-------|---------------|----------|
| Listar | GET /direcciones | ✅ | ✅ | ❌ |
| Ver | GET /direcciones/{id} | ✅ | ✅ | ❌ |
| Crear | POST /direcciones | ✅ | ✅ | ❌ |
| Actualizar | PUT /direcciones/{id} | ✅ | ✅ | ❌ |
| Eliminar | DELETE /direcciones/{id} | ✅ | ✅ | ❌ |
| Por Paciente | GET /direcciones/paciente/{id} | ✅ | ✅ | ❌ |

### Paciente - Solo Lectura

| Acción | Ruta | Paciente |
|--------|------|----------|
| Mis Direcciones | GET /mis-direcciones | ✅ |

## 🎯 Flujo Correcto

### Nutricionista
1. ✅ Puede crear direcciones para sus pacientes
2. ✅ Puede editar direcciones existentes
3. ✅ Puede eliminar direcciones
4. ✅ Puede ver todas las direcciones de un paciente

### Admin
1. ✅ Tiene todos los permisos de nutricionista
2. ✅ Puede gestionar direcciones de cualquier paciente

### Paciente
1. ✅ Puede ver sus propias direcciones (GET /mis-direcciones)
2. ❌ No puede crear/editar/eliminar directamente

## 📝 Archivo Modificado

- ✅ `routes/api.php` - Movidas las rutas de direcciones al grupo correcto

## ✅ Resultado

Ahora los **nutricionistas** pueden:
- ✅ Crear direcciones para sus pacientes
- ✅ Editar direcciones existentes
- ✅ Eliminar direcciones
- ✅ Ver direcciones de pacientes

Esto permite que:
- ✅ El formulario de direcciones funcione correctamente
- ✅ Se puedan generar entregas automáticas (requiere dirección)
- ✅ Los nutricionistas gestionen las direcciones de entrega

## 🧪 Prueba

1. Login como nutricionista
2. Ir a Direcciones → Nueva Dirección
3. Seleccionar un paciente
4. Llenar el formulario
5. Click en "Guardar Dirección"
6. ✅ Debería guardar exitosamente

## 🎉 Problema Resuelto

✅ **Error 403 corregido**
✅ **Nutricionistas pueden crear direcciones**
✅ **Formulario mejorado funcionando**
✅ **Generación de entregas ahora posible**
