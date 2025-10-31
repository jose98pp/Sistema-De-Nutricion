# ✅ Permisos de Recetas para Nutricionistas

## 🎯 Cambio Implementado

Se han otorgado permisos completos de **CRUD de recetas** a los nutricionistas.

---

## 📋 Estado Anterior

### ❌ Solo Admin
Las recetas estaban en el grupo `role:admin`:

```php
// ❌ Solo admin podía gestionar recetas
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::apiResource('recetas', RecetaController::class);
    Route::post('recetas/{id}/agregar-comida', [RecetaController::class, 'attachToComida']);
    Route::delete('recetas/{id}/remover-comida/{id_comida}', [RecetaController::class, 'detachFromComida']);
});
```

---

## 📋 Estado Actual

### ✅ Admin y Nutricionista
Las recetas ahora están en el grupo `role:admin,nutricionista`:

```php
// ✅ Admin y nutricionista pueden gestionar recetas
Route::middleware(['auth:sanctum', 'role:admin,nutricionista'])->group(function () {
    // ... otras rutas ...
    
    // Recetas - Admin y Nutricionista
    Route::apiResource('recetas', RecetaController::class);
    Route::post('recetas/{id}/agregar-comida', [RecetaController::class, 'attachToComida']);
    Route::delete('recetas/{id}/remover-comida/{id_comida}', [RecetaController::class, 'detachFromComida']);
});
```

---

## 📊 Matriz de Permisos de Recetas

| Acción | Admin | Nutricionista | Paciente |
|--------|-------|---------------|----------|
| **Listar todas** | ✅ | ✅ | ❌ |
| **Ver detalle** | ✅ | ✅ | ❌ |
| **Crear** | ✅ | ✅ | ❌ |
| **Editar** | ✅ | ✅ | ❌ |
| **Eliminar** | ✅ | ✅ | ❌ |
| **Agregar a comida** | ✅ | ✅ | ❌ |
| **Remover de comida** | ✅ | ✅ | ❌ |
| **Ver mis recetas** | ✅ | ✅ | ✅ |

---

## 🛣️ Rutas de Recetas

### Rutas CRUD (Admin y Nutricionista)

| Método | Endpoint | Acción | Permisos |
|--------|----------|--------|----------|
| GET | `/api/recetas` | Listar todas | Admin, Nutricionista |
| POST | `/api/recetas` | Crear | Admin, Nutricionista |
| GET | `/api/recetas/{id}` | Ver detalle | Admin, Nutricionista |
| PUT/PATCH | `/api/recetas/{id}` | Actualizar | Admin, Nutricionista |
| DELETE | `/api/recetas/{id}` | Eliminar | Admin, Nutricionista |
| POST | `/api/recetas/{id}/agregar-comida` | Agregar a comida | Admin, Nutricionista |
| DELETE | `/api/recetas/{id}/remover-comida/{id_comida}` | Remover de comida | Admin, Nutricionista |

### Rutas de Paciente

| Método | Endpoint | Acción | Permisos |
|--------|----------|--------|----------|
| GET | `/api/mis-recetas` | Ver mis recetas del plan activo | Paciente |

---

## ✅ Verificación

### Rutas cargadas:
```bash
php artisan route:list --path=recetas

✅ GET|HEAD  api/mis-recetas
✅ GET|HEAD  api/recetas
✅ POST      api/recetas
✅ POST      api/recetas/{id}/agregar-comida
✅ DELETE    api/recetas/{id}/remover-comida/{id_comida}
✅ GET|HEAD  api/recetas/{receta}
✅ PUT|PATCH api/recetas/{receta}
✅ DELETE    api/recetas/{receta}
```

**Total**: 8 rutas

---

## 🎯 Casos de Uso

### Como Nutricionista:

#### 1. Listar Recetas
```http
GET /api/recetas
Authorization: Bearer {token_nutricionista}
```

**Respuesta**:
```json
{
  "success": true,
  "data": [
    {
      "id_receta": 1,
      "nombre": "Ensalada César",
      "kcal": 350,
      "descripcion": "Ensalada con pollo y aderezo césar"
    }
  ]
}
```

---

#### 2. Crear Receta
```http
POST /api/recetas
Authorization: Bearer {token_nutricionista}
Content-Type: application/json

{
  "nombre": "Smoothie Verde",
  "kcal": 180,
  "descripcion": "Smoothie de espinaca, plátano y manzana"
}
```

**Respuesta**:
```json
{
  "success": true,
  "message": "Receta creada exitosamente",
  "data": {
    "id_receta": 5,
    "nombre": "Smoothie Verde",
    "kcal": 180,
    "descripcion": "Smoothie de espinaca, plátano y manzana"
  }
}
```

---

#### 3. Editar Receta
```http
PUT /api/recetas/5
Authorization: Bearer {token_nutricionista}
Content-Type: application/json

{
  "nombre": "Smoothie Verde Detox",
  "kcal": 200,
  "descripcion": "Smoothie de espinaca, plátano, manzana y jengibre"
}
```

---

#### 4. Eliminar Receta
```http
DELETE /api/recetas/5
Authorization: Bearer {token_nutricionista}
```

**Respuesta**:
```json
{
  "success": true,
  "message": "Receta eliminada exitosamente"
}
```

---

#### 5. Agregar Receta a Comida
```http
POST /api/recetas/1/agregar-comida
Authorization: Bearer {token_nutricionista}
Content-Type: application/json

{
  "id_comida": 10
}
```

---

#### 6. Remover Receta de Comida
```http
DELETE /api/recetas/1/remover-comida/10
Authorization: Bearer {token_nutricionista}
```

---

### Como Paciente:

#### Ver Mis Recetas (del plan activo)
```http
GET /api/mis-recetas
Authorization: Bearer {token_paciente}
```

**Respuesta**:
```json
{
  "success": true,
  "data": [
    {
      "id_receta": 1,
      "nombre": "Ensalada César",
      "kcal": 350,
      "descripcion": "Ensalada con pollo y aderezo césar"
    },
    {
      "id_receta": 3,
      "nombre": "Pollo a la Plancha",
      "kcal": 280,
      "descripcion": "Pechuga de pollo con especias"
    }
  ]
}
```

---

## 🔄 Flujo de Trabajo del Nutricionista

### Crear Plan con Recetas:

1. **Crear recetas personalizadas**
   ```
   POST /api/recetas
   → Receta "Desayuno Proteico" creada
   ```

2. **Crear plan de alimentación**
   ```
   POST /api/planes-mejorados
   → Plan creado con días y comidas
   ```

3. **Agregar recetas a comidas del plan**
   ```
   POST /api/recetas/1/agregar-comida
   → Receta agregada a desayuno del día 1
   ```

4. **Paciente ve sus recetas**
   ```
   GET /api/mis-recetas (como paciente)
   → Ve "Desayuno Proteico" en su plan
   ```

---

## ⚠️ Importante: Refrescar Sesión

Al igual que con calendarios y entregas, el nutricionista necesita **cerrar sesión y volver a iniciar** para que los nuevos permisos surtan efecto.

### Pasos:
1. Cerrar sesión
2. Iniciar sesión nuevamente
3. Intentar crear/editar recetas
4. ✅ Debería funcionar sin error 403

---

## 📊 Resumen de Permisos Actualizados

### Recursos con CRUD Completo para Nutricionistas:

| Recurso | Admin | Nutricionista | Paciente |
|---------|-------|---------------|----------|
| **Pacientes** | ✅ | ✅ | ❌ |
| **Contratos** | ✅ | ✅ | ❌ |
| **Planes** | ✅ | ✅ | Ver solo los suyos |
| **Evaluaciones** | ✅ | ✅ | Ver solo las suyas |
| **Calendarios** | ✅ | ✅ | ❌ |
| **Entregas** | ✅ | ✅ | Ver solo las suyas |
| **Recetas** | ✅ | ✅ | Ver solo las de su plan |
| **Ingestas** | ✅ | ✅ | ✅ |
| **Fotos Progreso** | ✅ | ✅ | ✅ |

### Recursos Solo Admin:

| Recurso | Admin | Nutricionista | Paciente |
|---------|-------|---------------|----------|
| **Nutricionistas** | ✅ | ❌ | ❌ |
| **Servicios** | ✅ | ❌ | ❌ |
| **Direcciones** | ✅ | ❌ | Ver solo las suyas |
| **Análisis Clínicos** | ✅ | ❌ | Ver solo los suyos |

---

## 🎨 Beneficios para Nutricionistas

### Antes (❌):
- No podían crear recetas personalizadas
- Dependían del admin para agregar recetas
- Flujo de trabajo interrumpido
- Menos autonomía profesional

### Ahora (✅):
- Crean recetas personalizadas para cada paciente
- Gestionan su propio catálogo de recetas
- Flujo de trabajo completo y autónomo
- Mayor profesionalización del servicio

---

## 🧪 Pruebas Recomendadas

### Como Nutricionista:

1. **Cerrar sesión y volver a iniciar**
2. **Ir a sección de recetas**
3. **Crear nueva receta**:
   - Nombre: "Desayuno Energético"
   - Calorías: 400
   - Descripción: "Avena con frutas y frutos secos"
4. **Verificar que se crea sin error 403**
5. **Editar la receta**
6. **Eliminar la receta**
7. **Verificar todas las operaciones funcionan**

---

## ✅ Estado Final

### Archivos modificados:
- ✅ `routes/api.php`

### Funcionalidades verificadas:
- ✅ Rutas movidas al grupo correcto
- ✅ 8 rutas de recetas disponibles
- ✅ Middleware `CheckRole:admin,nutricionista` aplicado
- ✅ Sin errores de diagnóstico

### Permisos correctos:
- ✅ Admin puede gestionar recetas
- ✅ Nutricionista puede gestionar recetas
- ✅ Paciente solo puede ver sus recetas del plan activo

---

**Implementado por**: Kiro AI Assistant  
**Fecha**: 30 de Octubre, 2025  
**Estado**: ✅ Completado - Requiere logout/login del usuario
