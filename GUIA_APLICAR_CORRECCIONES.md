# Guía para Aplicar las Correcciones del Backend

**Fecha:** 21 de Octubre, 2025  
**Objetivo:** Aplicar las correcciones identificadas en el análisis de problemas

---

## 🎯 RESUMEN DE CORRECCIONES REALIZADAS

Se han corregido **discrepancias críticas** entre el documento `requeriments.md` y la implementación:

1. ✅ **Tabla alimentos:** Nombres de columnas corregidos
2. ✅ **Modelo Paciente:** Array fillable actualizado con campos reales
3. ✅ **ProgressPhotoController:** Validaciones y filtros corregidos
4. ✅ **Migraciones:** Creadas para actualizar sin perder datos

---

## 📋 OPCIÓN 1: Base de Datos Nueva (SIN DATOS)

**Usar si:** Estás en desarrollo y no tienes datos importantes.

### Paso 1: Resetear la base de datos

```bash
cd c:\xampp\htdocs\Nutricion

# Eliminar todas las tablas y recrear
php artisan migrate:fresh

# O con seeders si los tienes
php artisan migrate:fresh --seed
```

### Paso 2: Verificar las tablas

```bash
# Conectar a MySQL
mysql -u root -p

USE nutricion_fusion;

# Verificar estructura de alimentos
DESCRIBE alimentos;

# Deberías ver:
# - proteinas_por_100g
# - carbohidratos_por_100g
# - grasas_por_100g
# - restricciones
# - categoria ENUM('fruta', 'verdura', 'cereal', 'proteina', 'lacteo', 'grasa', 'otro')
```

### Paso 3: Limpiar caché

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

---

## 📋 OPCIÓN 2: Base de Datos con Datos Existentes

**Usar si:** Ya tienes datos en producción o desarrollo que quieres conservar.

### Paso 1: Hacer backup de la base de datos

```bash
# Desde la línea de comandos
mysqldump -u root -p nutricion_fusion > backup_antes_correccion.sql

# O desde phpMyAdmin: Exportar > SQL
```

### Paso 2: Ejecutar la migración de corrección

```bash
cd c:\xampp\htdocs\Nutricion

# Ejecutar solo la nueva migración
php artisan migrate

# Deberías ver:
# Running: 2025_10_21_221038_fix_alimentos_table_columns_to_match_requirements
```

### Paso 3: Verificar los cambios

```bash
mysql -u root -p

USE nutricion_fusion;

# Verificar que las columnas fueron renombradas
DESCRIBE alimentos;

# Verificar que los datos se mantuvieron
SELECT id_alimento, nombre, categoria, proteinas_por_100g, carbohidratos_por_100g 
FROM alimentos 
LIMIT 5;
```

### Paso 4: Limpiar caché

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

---

## 🧪 PRUEBAS DE VERIFICACIÓN

### 1. Probar API de Alimentos

```bash
# Iniciar el servidor si no está corriendo
php artisan serve

# En otra terminal o Postman:

# GET - Listar alimentos
curl http://localhost:8000/api/alimentos \
  -H "Authorization: Bearer TU_TOKEN"

# POST - Crear alimento
curl -X POST http://localhost:8000/api/alimentos \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Manzana Verde",
    "categoria": "fruta",
    "calorias_por_100g": 52,
    "proteinas_por_100g": 0.3,
    "carbohidratos_por_100g": 14,
    "grasas_por_100g": 0.2,
    "restricciones": "sin gluten"
  }'

# GET - Buscar alimentos
curl "http://localhost:8000/api/alimentos?search=manzana" \
  -H "Authorization: Bearer TU_TOKEN"

# GET - Filtrar por categoría
curl "http://localhost:8000/api/alimentos?categoria=fruta" \
  -H "Authorization: Bearer TU_TOKEN"
```

### 2. Probar API de Pacientes

```bash
# POST - Crear paciente
curl -X POST http://localhost:8000/api/pacientes \
  -H "Authorization: Bearer TU_TOKEN_NUTRICIONISTA" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María",
    "apellido": "González",
    "fecha_nacimiento": "1995-03-20",
    "genero": "F",
    "email": "maria@example.com",
    "telefono": "555-9876",
    "peso_inicial": 65.5,
    "estatura": 1.65,
    "alergias": "Lactosa"
  }'

# GET - Listar pacientes
curl http://localhost:8000/api/pacientes \
  -H "Authorization: Bearer TU_TOKEN_NUTRICIONISTA"

# PUT - Actualizar paciente
curl -X PUT http://localhost:8000/api/pacientes/1 \
  -H "Authorization: Bearer TU_TOKEN_NUTRICIONISTA" \
  -H "Content-Type: application/json" \
  -d '{
    "peso_inicial": 63.2
  }'
```

### 3. Probar API de Fotos de Progreso

```bash
# POST - Subir foto (usar Postman o similar para multipart/form-data)
# Endpoint: POST http://localhost:8000/api/fotos-progreso
# Headers: Authorization: Bearer TU_TOKEN
# Body (form-data):
#   id_paciente: 1
#   titulo: "Foto inicial"
#   descripcion: "Primera semana del plan"
#   foto: [seleccionar archivo .jpg]
#   tipo: "antes"
#   peso_kg: 65.5
#   fecha: "2025-10-21"

# GET - Listar fotos de un paciente
curl http://localhost:8000/api/fotos-progreso/paciente/1 \
  -H "Authorization: Bearer TU_TOKEN"

# GET - Comparación antes/después
curl http://localhost:8000/api/fotos-progreso/comparacion/1 \
  -H "Authorization: Bearer TU_TOKEN"
```

---

## 🔍 VERIFICACIÓN DE ERRORES COMUNES

### Error: "Column not found: proteinas_por_100g"

**Causa:** La migración no se ejecutó correctamente.

**Solución:**
```bash
# Verificar estado de migraciones
php artisan migrate:status

# Si la migración no aparece como ejecutada:
php artisan migrate

# Si sigue fallando, verificar manualmente en MySQL:
mysql -u root -p
USE nutricion_fusion;
SHOW COLUMNS FROM alimentos;
```

### Error: "Mass assignment exception for [nombre]"

**Causa:** El modelo Paciente no tiene el campo en fillable.

**Solución:** Ya está corregido en `app/Models/Paciente.php`. Verificar que el archivo tiene:
```php
protected $fillable = [
    'user_id', 'nombre', 'apellido', 'fecha_nacimiento', 
    'genero', 'email', 'telefono', 'peso_inicial', 
    'estatura', 'alergias', 'id_nutricionista',
];
```

### Error: "Validation failed: id_paciente does not exist"

**Causa:** El ProgressPhotoController validaba contra la tabla incorrecta.

**Solución:** Ya está corregido. Verificar que en `ProgressPhotoController.php` línea 69:
```php
'id_paciente' => 'required|exists:pacientes,id_paciente',
```

### Error: Fotos no se filtran correctamente para pacientes

**Causa:** El método index() usaba el ID incorrecto.

**Solución:** Ya está corregido. El método ahora busca el `id_paciente` desde la tabla `pacientes`.

---

## 📊 CHECKLIST POST-IMPLEMENTACIÓN

### Backend
- [ ] Migraciones ejecutadas sin errores
- [ ] Tabla `alimentos` tiene columnas correctas
- [ ] Modelo `Paciente` tiene fillable correcto
- [ ] API de alimentos responde correctamente
- [ ] API de pacientes crea/actualiza sin errores
- [ ] API de fotos valida correctamente
- [ ] Búsqueda de alimentos funciona
- [ ] Filtros de alimentos funcionan

### Frontend (verificar después)
- [ ] Formulario de alimentos guarda correctamente
- [ ] Búsqueda de alimentos muestra resultados
- [ ] Filtros de categoría funcionan
- [ ] Formulario de pacientes guarda correctamente
- [ ] Edición de pacientes funciona
- [ ] Subida de fotos funciona
- [ ] Galería de fotos muestra imágenes
- [ ] Pacientes solo ven sus propias fotos

---

## 🚀 PRÓXIMOS PASOS

### 1. Actualizar el Frontend

Si el frontend tiene referencias a los nombres antiguos de columnas:

**Buscar en el código frontend:**
```javascript
// Buscar referencias a:
- proteinas_g
- carbohidratos_g
- grasas_g

// Reemplazar por:
- proteinas_por_100g
- carbohidratos_por_100g
- grasas_por_100g
```

### 2. Actualizar Seeders (si existen)

Si tienes seeders para alimentos, actualizar los nombres de columnas:

```php
// database/seeders/AlimentoSeeder.php
Alimento::create([
    'nombre' => 'Manzana',
    'categoria' => 'fruta',  // singular, no 'frutas'
    'calorias_por_100g' => 52,
    'proteinas_por_100g' => 0.3,  // no 'proteinas_g'
    'carbohidratos_por_100g' => 14,
    'grasas_por_100g' => 0.2,
    'restricciones' => 'sin gluten'
]);
```

### 3. Actualizar Tests (si existen)

```php
// tests/Feature/AlimentoTest.php
$response = $this->post('/api/alimentos', [
    'nombre' => 'Test',
    'categoria' => 'fruta',  // singular
    'proteinas_por_100g' => 1.0,  // nombre correcto
    // ...
]);
```

---

## 📞 SOPORTE

Si encuentras errores después de aplicar las correcciones:

1. **Verificar logs de Laravel:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

2. **Verificar logs de MySQL:**
   - En XAMPP: `C:\xampp\mysql\data\mysql_error.log`

3. **Revisar el documento:**
   - `ANALISIS_PROBLEMAS_BD.md` - Análisis detallado de problemas

---

## ✅ CONFIRMACIÓN DE ÉXITO

Cuando todo funcione correctamente, deberías poder:

1. ✅ Crear alimentos con información nutricional
2. ✅ Buscar alimentos por nombre
3. ✅ Filtrar alimentos por categoría y restricciones
4. ✅ Crear y editar pacientes
5. ✅ Subir fotos de progreso
6. ✅ Ver fotos filtradas por paciente
7. ✅ Crear planes alimenticios con alimentos

**Estado esperado:** Backend completamente alineado con `requeriments.md` ✅
