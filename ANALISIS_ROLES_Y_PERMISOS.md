# 🔐 Análisis de Roles y Permisos del Sistema

## 📊 Estado Actual del Sistema

### Roles Definidos
El sistema tiene **3 roles principales**:
1. **admin** - Administrador del sistema
2. **nutricionista** - Profesionales de la nutrición
3. **paciente** - Usuarios finales del servicio

---

## ⚠️ PROBLEMAS IDENTIFICADOS

### 1. **Falta de Protección por Roles en Nuevos Endpoints**

Los **5 nuevos módulos** que creamos **NO tienen middleware de roles aplicado**:

```php
// ❌ ACTUAL - Sin protección de roles
Route::apiResource('direcciones', DireccionController::class);
Route::apiResource('recetas', RecetaController::class);
Route::apiResource('analisis-clinicos', AnalisisClinicoController::class);
Route::apiResource('calendarios-entrega', CalendarioEntregaController::class);
Route::apiResource('entregas-programadas', EntregaProgramadaController::class);
```

**Riesgo:** Un paciente podría acceder/modificar direcciones, recetas o entregas de otros pacientes.

---

### 2. **Vistas Frontend No Diferenciadas por Rol**

Las nuevas vistas muestran el mismo contenido para todos los roles:

| Módulo | Admin | Nutricionista | Paciente |
|--------|-------|---------------|----------|
| **Direcciones** | ✅ Todas | ✅ Todas | ❌ Sin acceso |
| **Recetas** | ✅ Todas | ✅ Todas | ❌ Sin acceso |
| **Análisis Clínicos** | ✅ Todos | ✅ Todos | ❌ Sin acceso |
| **Calendarios** | ✅ Todos | ✅ Todos | ❌ Sin acceso |
| **Entregas** | ✅ Todas | ✅ Todas | ❌ Sin acceso |

**Problema:** Los pacientes no tienen vistas para ver sus propias entregas o direcciones.

---

### 3. **Vistas de Paciente Faltantes**

Los pacientes necesitan vistas para:
- ✅ Ver su plan alimenticio actual (existe)
- ✅ Registrar ingestas (existe)
- ✅ Ver fotos de progreso (existe)
- ❌ **Ver sus direcciones de entrega** (FALTA)
- ❌ **Ver calendario de entregas** (FALTA)
- ❌ **Ver próximas entregas** (FALTA)
- ❌ **Ver recetas de su plan** (FALTA)
- ❌ **Ver sus análisis clínicos** (FALTA)

---

## 🎯 RECOMENDACIONES DE IMPLEMENTACIÓN

### Fase 1: Proteger Backend con Middleware de Roles

#### Direcciones
```php
// Solo admin y nutricionistas pueden gestionar todas las direcciones
Route::middleware(['auth:sanctum', 'role:admin,nutricionista'])->group(function () {
    Route::apiResource('direcciones', DireccionController::class);
    Route::get('direcciones/paciente/{id_paciente}', [DireccionController::class, 'byPaciente']);
});

// Pacientes pueden ver solo sus propias direcciones
Route::middleware(['auth:sanctum', 'role:paciente'])->group(function () {
    Route::get('mis-direcciones', [DireccionController::class, 'misDirecciones']);
});
```

#### Recetas
```php
// Admin y nutricionistas gestionan recetas
Route::middleware(['auth:sanctum', 'role:admin,nutricionista'])->group(function () {
    Route::apiResource('recetas', RecetaController::class);
    Route::post('recetas/{id}/agregar-comida', [RecetaController::class, 'attachToComida']);
    Route::delete('recetas/{id}/remover-comida/{id_comida}', [RecetaController::class, 'detachFromComida']);
});

// Pacientes solo pueden ver recetas de su plan
Route::middleware(['auth:sanctum', 'role:paciente'])->group(function () {
    Route::get('mis-recetas', [RecetaController::class, 'misRecetas']);
});
```

#### Análisis Clínicos
```php
// Admin y nutricionistas gestionan análisis
Route::middleware(['auth:sanctum', 'role:admin,nutricionista'])->group(function () {
    Route::apiResource('analisis-clinicos', AnalisisClinicoController::class);
    Route::post('analisis-clinicos/{id}/vincular-evaluacion', [AnalisisClinicoController::class, 'attachToEvaluacion']);
    Route::delete('analisis-clinicos/{id}/desvincular-evaluacion/{id_evaluacion}', [AnalisisClinicoController::class, 'detachFromEvaluacion']);
});

// Pacientes ven solo sus análisis
Route::middleware(['auth:sanctum', 'role:paciente'])->group(function () {
    Route::get('mis-analisis', [AnalisisClinicoController::class, 'misAnalisis']);
});
```

#### Calendarios y Entregas
```php
// Admin y nutricionistas gestionan calendarios
Route::middleware(['auth:sanctum', 'role:admin,nutricionista'])->group(function () {
    Route::apiResource('calendarios-entrega', CalendarioEntregaController::class);
    Route::apiResource('entregas-programadas', EntregaProgramadaController::class);
    Route::post('entregas-programadas/generar/{id_calendario}', [EntregaProgramadaController::class, 'generarEntregas']);
    Route::put('entregas-programadas/{id}/marcar-entregada', [EntregaProgramadaController::class, 'marcarComoEntregada']);
    Route::put('entregas-programadas/{id}/marcar-omitida', [EntregaProgramadaController::class, 'marcarComoOmitida']);
});

// Pacientes ven su calendario y entregas
Route::middleware(['auth:sanctum', 'role:paciente'])->group(function () {
    Route::get('mi-calendario-entrega', [CalendarioEntregaController::class, 'miCalendario']);
    Route::get('mis-entregas', [EntregaProgramadaController::class, 'misEntregas']);
    Route::get('mis-entregas/proximas', [EntregaProgramadaController::class, 'proximasEntregas']);
});
```

---

### Fase 2: Crear Vistas para Pacientes

#### 1. Mis Direcciones (`MisDirecciones/Index.jsx`)
**Ruta:** `/mis-direcciones`

**Características:**
- Ver solo las direcciones del paciente autenticado
- NO puede crear/editar/eliminar (solo el nutricionista)
- Vista simplificada y de solo lectura

```jsx
// Vista solo lectura de direcciones del paciente
- 📍 Lista de direcciones guardadas
- 🗺️ Coordenadas GPS si existen
- ℹ️ Mensaje informativo: "Para cambiar tu dirección, contacta a tu nutricionista"
```

---

#### 2. Mi Calendario de Entregas (`MiCalendario/Index.jsx`)
**Ruta:** `/mi-calendario`

**Características:**
- Ver el calendario de entregas activo
- Próximas entregas programadas
- Historial de entregas

```jsx
// Vista de calendario para paciente
- 📆 Rango de fechas del calendario
- 📦 Próximas 7 entregas
- ✅ Entregas completadas
- 📍 Dirección de cada entrega
- 🍽️ Comida programada
```

---

#### 3. Mis Próximas Entregas (`MisEntregas/Index.jsx`)
**Ruta:** `/mis-entregas`

**Características:**
- Vista de tarjetas con próximas entregas
- Contador de días hasta la entrega
- Información de la comida

```jsx
// Widget de próximas entregas
- 🔔 Entrega de hoy (destacada)
- 📅 Próximas 3 entregas
- 🍽️ Tipo de comida
- 📍 Dirección de entrega
- ⏰ Hora estimada
```

---

#### 4. Recetas de Mi Plan (`MisRecetas/Index.jsx`)
**Ruta:** `/mis-recetas`

**Características:**
- Ver recetas del plan activo
- Información nutricional
- Restricciones

```jsx
// Catálogo de recetas del paciente
- 🍽️ Recetas de mi plan actual
- 🔥 Calorías por porción
- ⚠️ Restricciones y alérgenos
- 📝 Vista de solo lectura
```

---

#### 5. Mis Análisis Clínicos (`MisAnalisis/Index.jsx`)
**Ruta:** `/mis-analisis`

**Características:**
- Ver historial de análisis
- Resultados completos
- Vinculación con evaluaciones

```jsx
// Historial de análisis del paciente
- 🔬 Tipo de análisis
- 📋 Resultados
- 📅 Fecha
- 🔗 Evaluación asociada
- 📊 Gráfica de evolución (opcional)
```

---

### Fase 3: Actualizar Controladores con Métodos para Pacientes

#### DireccionController
```php
public function misDirecciones(Request $request)
{
    $user = $request->user();
    $paciente = $user->paciente;
    
    if (!$paciente) {
        return response()->json(['message' => 'No eres un paciente'], 403);
    }
    
    $direcciones = Direccion::where('id_paciente', $paciente->id_paciente)->get();
    
    return response()->json(['data' => $direcciones]);
}
```

#### RecetaController
```php
public function misRecetas(Request $request)
{
    $user = $request->user();
    $paciente = $user->paciente;
    
    if (!$paciente) {
        return response()->json(['message' => 'No eres un paciente'], 403);
    }
    
    // Obtener plan activo
    $plan = PlanAlimentacion::where('id_paciente', $paciente->id_paciente)
        ->where('fecha_inicio', '<=', now())
        ->where('fecha_fin', '>=', now())
        ->first();
    
    if (!$plan) {
        return response()->json(['data' => []]);
    }
    
    // Obtener recetas de las comidas del plan
    $recetas = Receta::whereHas('comidas.planes', function($query) use ($plan) {
        $query->where('id_plan', $plan->id_plan);
    })->get();
    
    return response()->json(['data' => $recetas]);
}
```

#### AnalisisClinicoController
```php
public function misAnalisis(Request $request)
{
    $user = $request->user();
    $paciente = $user->paciente;
    
    if (!$paciente) {
        return response()->json(['message' => 'No eres un paciente'], 403);
    }
    
    // Obtener análisis vinculados a evaluaciones del paciente
    $analisis = AnalisisClinico::whereHas('evaluaciones', function($query) use ($paciente) {
        $query->where('id_paciente', $paciente->id_paciente);
    })->with('evaluaciones')->get();
    
    return response()->json(['data' => $analisis]);
}
```

#### CalendarioEntregaController
```php
public function miCalendario(Request $request)
{
    $user = $request->user();
    $paciente = $user->paciente;
    
    if (!$paciente) {
        return response()->json(['message' => 'No eres un paciente'], 403);
    }
    
    // Obtener calendario del contrato activo del paciente
    $calendario = CalendarioEntrega::whereHas('contrato', function($query) use ($paciente) {
        $query->where('id_paciente', $paciente->id_paciente)
              ->where('estado', 'ACTIVO');
    })->with(['entregas' => function($query) {
        $query->orderBy('fecha', 'asc');
    }])->first();
    
    return response()->json(['data' => $calendario]);
}
```

#### EntregaProgramadaController
```php
public function misEntregas(Request $request)
{
    $user = $request->user();
    $paciente = $user->paciente;
    
    if (!$paciente) {
        return response()->json(['message' => 'No eres un paciente'], 403);
    }
    
    $entregas = EntregaProgramada::whereHas('calendario.contrato', function($query) use ($paciente) {
        $query->where('id_paciente', $paciente->id_paciente);
    })->with(['direccion', 'comida'])
      ->orderBy('fecha', 'asc')
      ->get();
    
    return response()->json(['data' => $entregas]);
}

public function proximasEntregas(Request $request)
{
    $user = $request->user();
    $paciente = $user->paciente;
    
    if (!$paciente) {
        return response()->json(['message' => 'No eres un paciente'], 403);
    }
    
    $entregas = EntregaProgramada::whereHas('calendario.contrato', function($query) use ($paciente) {
        $query->where('id_paciente', $paciente->id_paciente);
    })->where('fecha', '>=', now())
      ->where('estado', '!=', 'OMITIDA')
      ->with(['direccion', 'comida'])
      ->orderBy('fecha', 'asc')
      ->take(7)
      ->get();
    
    return response()->json(['data' => $entregas]);
}
```

---

## 📋 MATRIZ DE PERMISOS RECOMENDADA

| Funcionalidad | Admin | Nutricionista | Paciente |
|---------------|-------|---------------|----------|
| **Direcciones** |
| Ver todas | ✅ | ✅ | ❌ |
| Ver propias | N/A | N/A | ✅ |
| Crear/Editar/Eliminar | ✅ | ✅ | ❌ |
| **Recetas** |
| Ver catálogo completo | ✅ | ✅ | ❌ |
| Ver recetas de mi plan | N/A | N/A | ✅ |
| Crear/Editar/Eliminar | ✅ | ✅ | ❌ |
| Vincular a comidas | ✅ | ✅ | ❌ |
| **Análisis Clínicos** |
| Ver todos | ✅ | ✅ | ❌ |
| Ver propios | N/A | N/A | ✅ |
| Crear/Editar/Eliminar | ✅ | ✅ | ❌ |
| Vincular a evaluaciones | ✅ | ✅ | ❌ |
| **Calendarios de Entrega** |
| Ver todos | ✅ | ✅ | ❌ |
| Ver propio | N/A | N/A | ✅ |
| Crear/Editar/Eliminar | ✅ | ✅ | ❌ |
| Generar entregas | ✅ | ✅ | ❌ |
| **Entregas Programadas** |
| Ver todas | ✅ | ✅ | ❌ |
| Ver propias | N/A | N/A | ✅ |
| Crear/Editar | ✅ | ✅ | ❌ |
| Marcar entregada/omitida | ✅ | ✅ | ❌ |

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### Paso 1: Registrar Middleware en Kernel

Verificar que `CheckRole` esté registrado en `app/Http/Kernel.php`:

```php
protected $middlewareAliases = [
    // ...
    'role' => \App\Http\Middleware\CheckRole::class,
];
```

### Paso 2: Actualizar routes/api.php

Agrupar rutas por rol y aplicar middleware:

```php
// Rutas para Admin y Nutricionista
Route::middleware(['auth:sanctum', 'role:admin,nutricionista'])->group(function () {
    // Todos los endpoints administrativos aquí
});

// Rutas exclusivas para Pacientes
Route::middleware(['auth:sanctum', 'role:paciente'])->group(function () {
    Route::get('mis-direcciones', [DireccionController::class, 'misDirecciones']);
    Route::get('mis-recetas', [RecetaController::class, 'misRecetas']);
    Route::get('mis-analisis', [AnalisisClinicoController::class, 'misAnalisis']);
    Route::get('mi-calendario', [CalendarioEntregaController::class, 'miCalendario']);
    Route::get('mis-entregas', [EntregaProgramadaController::class, 'misEntregas']);
    Route::get('mis-entregas/proximas', [EntregaProgramadaController::class, 'proximasEntregas']);
});
```

### Paso 3: Actualizar AppMain.jsx

Agregar rutas para pacientes:

```jsx
{/* Vistas para Pacientes */}
<Route element={<ProtectedRoute allowedRoles={['paciente']} />}>
    <Route path="/mis-direcciones" element={<MisDireccionesIndex />} />
    <Route path="/mis-recetas" element={<MisRecetasIndex />} />
    <Route path="/mis-analisis" element={<MisAnalisisIndex />} />
    <Route path="/mi-calendario" element={<MiCalendarioIndex />} />
    <Route path="/mis-entregas" element={<MisEntregasIndex />} />
</Route>
```

### Paso 4: Actualizar Layout.jsx

Diferenciar menú por rol:

```jsx
const menuItems = [
    // ... items comunes
    
    // Solo para Admin y Nutricionista
    ...(isAdmin || isNutricionista ? [
        { path: '/direcciones', label: 'Direcciones', icon: '📍', roles: ['admin', 'nutricionista'] },
        { path: '/recetas', label: 'Recetas', icon: '🍽️', roles: ['admin', 'nutricionista'] },
        { path: '/analisis-clinicos', label: 'Análisis', icon: '🔬', roles: ['admin', 'nutricionista'] },
        { path: '/calendarios-entrega', label: 'Calendarios', icon: '📆', roles: ['admin', 'nutricionista'] },
        { path: '/entregas', label: 'Entregas', icon: '📦', roles: ['admin', 'nutricionista'] },
    ] : []),
    
    // Solo para Pacientes
    ...(isPaciente ? [
        { path: '/mis-direcciones', label: 'Mis Direcciones', icon: '📍', roles: ['paciente'] },
        { path: '/mis-recetas', label: 'Mis Recetas', icon: '🍽️', roles: ['paciente'] },
        { path: '/mis-analisis', label: 'Mis Análisis', icon: '🔬', roles: ['paciente'] },
        { path: '/mi-calendario', label: 'Mi Calendario', icon: '📆', roles: ['paciente'] },
        { path: '/mis-entregas', label: 'Mis Entregas', icon: '📦', roles: ['paciente'] },
    ] : []),
];
```

---

## 📊 RESUMEN DE ARCHIVOS A CREAR/MODIFICAR

### Backend (Modificar)
- ✏️ `routes/api.php` - Agregar middleware de roles
- ✏️ `app/Http/Controllers/Api/DireccionController.php` - Agregar método `misDirecciones()`
- ✏️ `app/Http/Controllers/Api/RecetaController.php` - Agregar método `misRecetas()`
- ✏️ `app/Http/Controllers/Api/AnalisisClinicoController.php` - Agregar método `misAnalisis()`
- ✏️ `app/Http/Controllers/Api/CalendarioEntregaController.php` - Agregar método `miCalendario()`
- ✏️ `app/Http/Controllers/Api/EntregaProgramadaController.php` - Agregar métodos `misEntregas()` y `proximasEntregas()`

### Frontend (Crear)
- ➕ `resources/js/pages/MisDirecciones/Index.jsx`
- ➕ `resources/js/pages/MisRecetas/Index.jsx`
- ➕ `resources/js/pages/MisAnalisis/Index.jsx`
- ➕ `resources/js/pages/MiCalendario/Index.jsx`
- ➕ `resources/js/pages/MisEntregas/Index.jsx`

### Frontend (Modificar)
- ✏️ `resources/js/AppMain.jsx` - Agregar rutas para pacientes
- ✏️ `resources/js/components/Layout.jsx` - Diferenciar menú por rol

### Middleware (Verificar)
- ✅ `app/Http/Kernel.php` - Verificar registro de middleware `role`

---

## 🎯 PRIORIDAD DE IMPLEMENTACIÓN

### 🔴 Alta Prioridad (Seguridad)
1. Aplicar middleware de roles a rutas API
2. Agregar validación de permisos en controladores

### 🟡 Media Prioridad (UX)
3. Crear métodos en controladores para vistas de pacientes
4. Crear vistas frontend para pacientes

### 🟢 Baja Prioridad (Mejoras)
5. Agregar notificaciones de entregas
6. Crear dashboard específico para cada rol

---

## 💡 RECOMENDACIONES ADICIONALES

1. **Testing de Permisos**
   - Crear tests para verificar que pacientes no puedan acceder a datos de otros
   - Verificar que middleware rechace solicitudes no autorizadas

2. **Auditoría**
   - Registrar acciones críticas (crear/editar/eliminar)
   - Log de accesos no autorizados

3. **Notificaciones**
   - Notificar al paciente cuando tiene una entrega próxima
   - Alertar cuando se agregue un nuevo análisis clínico

4. **UI/UX**
   - Las vistas de paciente deben ser más simples y claras
   - Usar colores/iconos diferentes para diferenciar de vistas administrativas
   - Agregar tooltips explicativos

---

**Conclusión:** El sistema necesita **implementación de control de acceso basado en roles** y **vistas específicas para pacientes** para ser completamente funcional y seguro.
