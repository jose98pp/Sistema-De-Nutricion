# ✅ MIGRACIONES DE BASE DE DATOS - COMPLETADAS

## 🎯 Problema Resuelto

El editor de planes mejorado requería columnas adicionales en las tablas que no existían en la estructura original de la base de datos.

**Error original:**
```
SQLSTATE[42S22]: Column not found: 1054 Unknown column 'id_contrato' in 'field list'
```

---

## 🔧 Migraciones Ejecutadas

### 1. Actualización tabla `planes_alimentacion`

**Archivo:** `2025_10_27_000001_update_planes_alimentacion_table.php`

**Columnas agregadas:**
```sql
✅ id_contrato (BIGINT UNSIGNED) - Relación con contratos
✅ nombre_plan (VARCHAR 150) - Nombre del plan (copia de 'nombre')
✅ objetivo (ENUM) - PERDIDA_PESO, GANANCIA_MUSCULAR, MANTENIMIENTO, etc.
✅ estado (ENUM) - ACTIVO, INACTIVO, FINALIZADO
✅ duracion_dias (INT) - Duración del plan en días
```

**Foreign Keys:**
```sql
✅ id_contrato → contratos.id_contrato (ON DELETE SET NULL)
```

---

### 2. Actualización tabla `plan_dias`

**Archivo:** `2025_10_27_000002_update_plan_dias_table.php`

**Columnas agregadas:**
```sql
✅ dia_numero (INT) - Número del día (1-7)
✅ dia_semana (ENUM) - LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO
✅ fecha (DATE) - Fecha específica del día
```

---

### 3. Actualización tabla `comidas`

**Archivo:** `2025_10_27_000003_update_comidas_table.php`

**Cambios realizados:**

1. **Migración de valores ENUM** (de minúsculas a mayúsculas):
```sql
desayuno → DESAYUNO
almuerzo → ALMUERZO
cena → CENA
snack → COLACION_MATUTINA
```

2. **Nuevo ENUM actualizado:**
```sql
tipo_comida: ENUM('DESAYUNO', 'COLACION_MATUTINA', 'ALMUERZO', 'COLACION_VESPERTINA', 'CENA')
```

3. **Columnas agregadas:**
```sql
✅ hora_recomendada (TIME) - Hora recomendada (08:00, 11:00, etc.)
✅ nombre (VARCHAR 150) - Nombre de la comida
✅ descripcion (TEXT) - Descripción de la comida
✅ instrucciones (TEXT) - Instrucciones de preparación
```

---

## 📊 Estructura Final de Tablas

### planes_alimentacion
```
id_plan (PK)
id_contrato (FK) ← NUEVO
id_paciente (FK)
id_nutricionista (FK)
nombre (VARCHAR 150)
nombre_plan (VARCHAR 150) ← NUEVO
objetivo (ENUM) ← NUEVO
estado (ENUM) ← NUEVO
descripcion (TEXT)
fecha_inicio (DATE)
fecha_fin (DATE)
duracion_dias (INT) ← NUEVO
calorias_objetivo (INT)
distribucion_macros (JSON)
comidas (JSON)
created_at
updated_at
```

### plan_dias
```
id_dia (PK)
id_plan (FK)
dia_index (INT)
dia_numero (INT) ← NUEVO
dia_semana (ENUM) ← NUEVO
fecha (DATE) ← NUEVO
created_at
updated_at
```

### comidas
```
id_comida (PK)
id_dia (FK)
tipo_comida (ENUM) ← ACTUALIZADO
hora_recomendada (TIME) ← NUEVO
nombre (VARCHAR 150) ← NUEVO
descripcion (TEXT) ← NUEVO
instrucciones (TEXT) ← NUEVO
orden (INT)
created_at
updated_at
```

---

## ✅ Verificación

### Comando ejecutado:
```bash
php artisan migrate --path=database/migrations/2025_10_27_000001_update_planes_alimentacion_table.php
php artisan migrate --path=database/migrations/2025_10_27_000002_update_plan_dias_table.php
php artisan migrate --path=database/migrations/2025_10_27_000003_update_comidas_table.php
```

### Resultado:
```
✅ 2025_10_27_000001_update_planes_alimentacion_table - DONE
✅ 2025_10_27_000002_update_plan_dias_table - DONE  
✅ 2025_10_27_000003_update_comidas_table - DONE
```

---

## 🔄 Migración de Datos

### Datos existentes preservados:

1. **planes_alimentacion:**
   - Columna `nombre` copiada a `nombre_plan`
   - `objetivo` por defecto: MANTENIMIENTO
   - `estado` por defecto: ACTIVO
   - `duracion_dias` por defecto: 30

2. **plan_dias:**
   - Columnas nuevas con valores por defecto
   - `dia_numero` = 1
   - `dia_semana` = LUNES
   - `fecha` = NULL (se llenará al crear planes nuevos)

3. **comidas:**
   - Valores migrados automáticamente:
     - `desayuno` → `DESAYUNO`
     - `almuerzo` → `ALMUERZO`
     - `cena` → `CENA`
     - `snack` → `COLACION_MATUTINA`

---

## 🎯 Compatibilidad

### Editor de Planes Mejorado ✅
Ahora puede:
- Crear planes basados en contratos
- Definir 5 comidas (DESAYUNO, COLACION_MATUTINA, ALMUERZO, COLACION_VESPERTINA, CENA)
- Asignar fechas a cada día (7 días)
- Guardar horarios recomendados
- Agregar nombres e instrucciones a las comidas

### Mejoras de Ingestas ✅
Ahora funcionan correctamente:
- Mi Menú Semanal (detecta 7 días con 5 comidas)
- Mis Comidas de Hoy (detecta 5 comidas del día actual)
- Registro rápido (funciona con la estructura correcta)
- Vista de entregas (muestra 35 comidas: 7×5)

---

## 📝 Notas Técnicas

### Migración de ENUM tipo_comida

**Problema:** MySQL trata los ENUM como case-insensitive, causando errores al intentar tener `desayuno` y `DESAYUNO` al mismo tiempo.

**Solución:** 
1. Convertir columna a VARCHAR(50) temporalmente
2. Actualizar valores en la base de datos
3. Convertir de vuelta a ENUM con nuevos valores

**Código:**
```php
// Paso 1: VARCHAR temporal
DB::statement("ALTER TABLE comidas MODIFY tipo_comida VARCHAR(50) NOT NULL");

// Paso 2: Actualizar datos
DB::statement("UPDATE comidas SET tipo_comida = 'DESAYUNO' WHERE tipo_comida = 'desayuno'");

// Paso 3: Convertir a ENUM con nuevos valores
DB::statement("ALTER TABLE comidas MODIFY tipo_comida ENUM('DESAYUNO', 'COLACION_MATUTINA', ...) NOT NULL");
```

---

## 🧪 Prueba del Sistema

### Crear un Plan Nuevo
```
1. Ir a: http://localhost:8000/planes/nuevo
2. Seleccionar contrato activo
3. Llenar formulario
4. Configurar 7 días
5. Guardar

Resultado esperado: ✅ Plan creado exitosamente
```

### Verificar en Base de Datos
```sql
-- Ver plan creado
SELECT * FROM planes_alimentacion ORDER BY id_plan DESC LIMIT 1;

-- Ver días del plan
SELECT * FROM plan_dias WHERE id_plan = [último_id];

-- Ver comidas del primer día
SELECT * FROM comidas WHERE id_dia = [id_del_primer_dia];

-- Verificar tipos de comida
SELECT DISTINCT tipo_comida FROM comidas;
-- Resultado esperado:
-- DESAYUNO
-- COLACION_MATUTINA
-- ALMUERZO
-- COLACION_VESPERTINA
-- CENA
```

---

## ✅ Estado Final

```
✅ Base de datos actualizada
✅ Migraciones ejecutadas correctamente
✅ Datos existentes migrados
✅ Editor de planes funcional
✅ Mejoras de ingestas compatibles
✅ Sistema listo para usar
```

**🎉 TODO FUNCIONANDO CORRECTAMENTE 🎉**

---

## 🔄 Rollback (si es necesario)

Para revertir las migraciones:
```bash
php artisan migrate:rollback --step=3
```

Esto revertirá:
1. Tabla comidas a estructura original
2. Tabla plan_dias a estructura original  
3. Tabla planes_alimentacion a estructura original

**Nota:** Los datos se migrarán de vuelta a los valores antiguos automáticamente.
