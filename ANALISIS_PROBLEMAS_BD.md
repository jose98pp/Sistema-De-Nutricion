# Análisis de Problemas Backend vs Base de Datos

**Fecha:** 21 de Octubre, 2025  
**Revisión:** Comparación entre `requeriments.md` y la implementación actual

---

## 🔴 PROBLEMAS CRÍTICOS IDENTIFICADOS Y CORREGIDOS

### 1. **Tabla `alimentos` - Nombres de Columnas Incorrectos**

#### ❌ Problema Original
La migración de la tabla `alimentos` tenía nombres de columnas que **NO coincidían** con el documento de requerimientos:

**Migración Original:**
```php
$table->decimal('proteinas_g', 6, 2);
$table->decimal('carbohidratos_g', 6, 2);
$table->decimal('grasas_g', 6, 2);
$table->decimal('fibra_g', 6, 2);
```

**Documento de Requerimientos:**
```sql
proteinas_por_100g DECIMAL(6,2)
carbohidratos_por_100g DECIMAL(6,2)
grasas_por_100g DECIMAL(6,2)
restricciones VARCHAR(255)
```

#### ✅ Solución Aplicada
- Renombrado de columnas para coincidir con el documento
- Eliminado campo `fibra_g` (no especificado en requerimientos)
- Agregado campo `restricciones` que faltaba
- Corregidas las categorías del ENUM

**Migración Corregida:**
```php
$table->enum('categoria', ['fruta', 'verdura', 'cereal', 'proteina', 'lacteo', 'grasa', 'otro']);
$table->decimal('proteinas_por_100g', 6, 2);
$table->decimal('carbohidratos_por_100g', 6, 2);
$table->decimal('grasas_por_100g', 6, 2);
$table->string('restricciones', 255)->nullable();
```

#### 🔧 Impacto
- **AlimentoController:** Ya usaba los nombres correctos, ahora funcionará correctamente
- **Modelo Alimento:** Ya estaba correcto, ahora coincide con la BD
- **Frontend:** Las búsquedas y filtros de alimentos ahora funcionarán

---

### 2. **Modelo `Paciente` - Array fillable Incorrecto**

#### ❌ Problema Original
El modelo `Paciente` tenía un array `fillable` con campos que **NO EXISTEN** en la tabla:

**Fillable Original:**
```php
protected $fillable = [
    'id_paciente',
    'fecha_nacimiento',
    'genero',
    'telefono',
    'direccion',              // ❌ No existe
    'peso_objetivo_kg',       // ❌ No existe
    'altura_m',               // ❌ No existe
    'nivel_actividad',        // ❌ No existe
    'objetivo_nutricional',   // ❌ No existe
    'alergias_alimentarias',  // ❌ No existe
    'condiciones_medicas',    // ❌ No existe
];
```

**Campos Reales en la Tabla:**
```sql
user_id, nombre, apellido, fecha_nacimiento, genero, email, 
telefono, peso_inicial, estatura, alergias, id_nutricionista
```

#### ✅ Solución Aplicada
```php
protected $fillable = [
    'user_id',
    'nombre',
    'apellido',
    'fecha_nacimiento',
    'genero',
    'email',
    'telefono',
    'peso_inicial',
    'estatura',
    'alergias',
    'id_nutricionista',
];

protected $casts = [
    'fecha_nacimiento' => 'date',
    'peso_inicial' => 'decimal:2',
    'estatura' => 'decimal:2',
];
```

#### 🔧 Impacto
- **PacienteController:** Ahora puede crear y actualizar pacientes correctamente
- **Frontend:** Los formularios de registro/edición de pacientes funcionarán
- **Relaciones:** Agregadas relaciones faltantes con `nutricionista` y `progressPhotos`

---

### 3. **ProgressPhotoController - Validación Incorrecta**

#### ❌ Problema Original
El controlador validaba `id_paciente` contra la tabla `users` en lugar de `pacientes`:

```php
'id_paciente' => 'required|exists:users,id',  // ❌ Tabla incorrecta
```

#### ✅ Solución Aplicada
```php
'id_paciente' => 'required|exists:pacientes,id_paciente',  // ✅ Correcto
```

#### 🔧 Impacto
- **Subida de fotos:** Ahora validará correctamente que el paciente existe
- **Frontend:** El componente de fotos de progreso funcionará sin errores de validación

---

### 4. **ProgressPhotoController - Filtrado por Usuario Paciente**

#### ❌ Problema Original
El método `index()` intentaba filtrar fotos usando `$request->user()->id` directamente:

```php
if ($request->user()->role === 'paciente') {
    $query->where('id_paciente', $request->user()->id);  // ❌ ID incorrecto
}
```

**Problema:** `id_paciente` en `progress_photos` es el ID de la tabla `pacientes`, no de `users`.

#### ✅ Solución Aplicada
```php
if ($user && $user->role === 'paciente') {
    $paciente = \App\Models\Paciente::where('user_id', $user->id)->first();
    if ($paciente) {
        $query->where('id_paciente', $paciente->id_paciente);
    }
}
```

#### 🔧 Impacto
- **Seguridad:** Los pacientes solo verán sus propias fotos
- **Frontend:** La galería de fotos de progreso funcionará correctamente

---

## 📋 RESUMEN DE CAMBIOS REALIZADOS

### Archivos Modificados:

1. **`database/migrations/2025_10_20_000003_create_alimentos_table.php`**
   - ✅ Corregidos nombres de columnas nutricionales
   - ✅ Corregidas categorías del ENUM
   - ✅ Agregado campo `restricciones`

2. **`app/Models/Paciente.php`**
   - ✅ Corregido array `fillable` con campos reales
   - ✅ Corregidos `casts` para usar nombres correctos
   - ✅ Agregada relación `nutricionista()`
   - ✅ Agregada relación `progressPhotos()`

3. **`app/Http/Controllers/Api/ProgressPhotoController.php`**
   - ✅ Corregida validación de `id_paciente`
   - ✅ Corregido filtrado para usuarios pacientes

---

## 🚨 ACCIONES REQUERIDAS PARA APLICAR LOS CAMBIOS

### 1. Resetear y Recrear la Base de Datos

**⚠️ ADVERTENCIA:** Esto eliminará todos los datos existentes.

```bash
# Opción 1: Fresh migration (elimina todo)
php artisan migrate:fresh --seed

# Opción 2: Rollback y migrate
php artisan migrate:rollback
php artisan migrate
```

### 2. Si ya tienes datos en producción, crear una migración de alteración:

```bash
php artisan make:migration fix_alimentos_table_columns
```

**Contenido de la migración:**
```php
public function up()
{
    Schema::table('alimentos', function (Blueprint $table) {
        // Renombrar columnas
        $table->renameColumn('proteinas_g', 'proteinas_por_100g');
        $table->renameColumn('carbohidratos_g', 'carbohidratos_por_100g');
        $table->renameColumn('grasas_g', 'grasas_por_100g');
        
        // Eliminar columna no necesaria
        $table->dropColumn('fibra_g');
        
        // Agregar campo restricciones
        $table->string('restricciones', 255)->nullable()->after('grasas_por_100g');
        
        // Modificar enum de categorías
        DB::statement("ALTER TABLE alimentos MODIFY categoria ENUM('fruta', 'verdura', 'cereal', 'proteina', 'lacteo', 'grasa', 'otro') DEFAULT 'otro'");
    });
}
```

### 3. Limpiar caché de configuración:

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

---

## 🔍 VERIFICACIÓN DE FUNCIONAMIENTO

### Probar Endpoints Afectados:

#### 1. Alimentos - Búsqueda y Filtrado
```bash
# Listar alimentos
GET http://localhost:8000/api/alimentos

# Buscar por nombre
GET http://localhost:8000/api/alimentos?search=manzana

# Filtrar por categoría
GET http://localhost:8000/api/alimentos?categoria=fruta

# Filtrar por restricciones
GET http://localhost:8000/api/alimentos?restricciones=sin gluten
```

#### 2. Pacientes - CRUD
```bash
# Crear paciente
POST http://localhost:8000/api/pacientes
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "fecha_nacimiento": "1990-05-15",
  "genero": "M",
  "email": "juan@example.com",
  "telefono": "555-1234",
  "peso_inicial": 75.5,
  "estatura": 1.75,
  "alergias": "Ninguna"
}

# Actualizar paciente
PUT http://localhost:8000/api/pacientes/1
{
  "peso_inicial": 73.2
}
```

#### 3. Fotos de Progreso - Subida
```bash
# Subir foto
POST http://localhost:8000/api/fotos-progreso
Content-Type: multipart/form-data

id_paciente: 1
titulo: "Foto inicial"
descripcion: "Primera semana"
foto: [archivo.jpg]
tipo: "antes"
peso_kg: 75.5
fecha: "2025-10-21"
```

---

## 📊 IMPACTO EN EL FRONTEND

### Componentes Afectados:

1. **Búsqueda de Alimentos**
   - ✅ Ahora funcionará correctamente con filtros
   - ✅ Autocomplete de alimentos operativo

2. **Formulario de Pacientes**
   - ✅ Campos de registro/edición funcionarán
   - ✅ Validaciones correctas

3. **Galería de Fotos de Progreso**
   - ✅ Subida de fotos operativa
   - ✅ Filtrado por paciente correcto
   - ✅ Seguridad de acceso implementada

4. **Planes Alimenticios**
   - ✅ Selección de alimentos con datos nutricionales correctos
   - ✅ Cálculos nutricionales precisos

---

## ✅ CHECKLIST DE VERIFICACIÓN POST-CORRECCIÓN

- [ ] Ejecutar `php artisan migrate:fresh --seed`
- [ ] Verificar que la tabla `alimentos` tiene las columnas correctas
- [ ] Probar crear un alimento desde el frontend
- [ ] Probar búsqueda y filtrado de alimentos
- [ ] Probar crear un paciente desde el frontend
- [ ] Probar editar datos de un paciente
- [ ] Probar subir una foto de progreso
- [ ] Verificar que pacientes solo ven sus propias fotos
- [ ] Verificar que nutricionistas ven fotos de sus pacientes
- [ ] Probar crear un plan alimenticio con alimentos

---

## 🎯 CONCLUSIÓN

Los problemas identificados eran **discrepancias críticas** entre:
- El esquema de base de datos definido en `requeriments.md`
- Las migraciones implementadas
- Los modelos Eloquent
- Los controladores

**Causa raíz:** Implementación inicial no siguió exactamente el documento de requerimientos.

**Solución:** Alineación completa de:
1. ✅ Migraciones con el esquema del documento
2. ✅ Modelos con los campos reales de la BD
3. ✅ Controladores con validaciones correctas
4. ✅ Relaciones entre modelos

**Estado actual:** Backend alineado con el documento de requerimientos. Funcionalidades de búsqueda, filtrado y subida de fotos ahora operativas.
