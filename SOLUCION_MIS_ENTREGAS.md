# ⚠️ MIS ENTREGAS - Tablas No Existen

## 🎯 Problema Identificado

La vista "Mis Entregas" no muestra datos porque **las tablas de la base de datos no existen**:
- ❌ `calendario_entregas`
- ❌ `entregas_programadas`

## 🔍 Diagnóstico

### API Funciona
```
✅ GET /mis-entregas → 200 OK
✅ GET /mis-entregas/proximas → 200 OK
```

### Pero Retorna Vacío
```json
{
  "success": true,
  "data": []  ← Sin datos porque no hay tablas
}
```

## 📊 Estructura Necesaria

### Tablas Requeridas

#### 1. `calendario_entregas`
```sql
CREATE TABLE calendario_entregas (
    id_calendario BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_plan BIGINT UNSIGNED NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    frecuencia ENUM('DIARIA', 'SEMANAL', 'QUINCENAL') DEFAULT 'SEMANAL',
    dias_entrega JSON,  -- ['LUNES', 'MIERCOLES', 'VIERNES']
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (id_plan) REFERENCES plan_alimentacion(id_plan) ON DELETE CASCADE
);
```

#### 2. `entregas_programadas`
```sql
CREATE TABLE entregas_programadas (
    id_entrega BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_calendario BIGINT UNSIGNED NOT NULL,
    id_direccion BIGINT UNSIGNED,
    id_comida BIGINT UNSIGNED,
    fecha DATE NOT NULL,
    estado ENUM('PROGRAMADA', 'PENDIENTE', 'ENTREGADA', 'OMITIDA') DEFAULT 'PROGRAMADA',
    notas TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (id_calendario) REFERENCES calendario_entregas(id_calendario) ON DELETE CASCADE,
    FOREIGN KEY (id_direccion) REFERENCES direcciones(id_direccion),
    FOREIGN KEY (id_comida) REFERENCES comidas(id_comida)
);
```

## ✅ Solución: Crear Migraciones

### Paso 1: Crear Migración de Calendario
```bash
php artisan make:migration create_calendario_entregas_table
```

### Paso 2: Crear Migración de Entregas
```bash
php artisan make:migration create_entregas_programadas_table
```

### Paso 3: Ejecutar Migraciones
```bash
php artisan migrate
```

### Paso 4: Generar Entregas
```bash
php artisan plan:generar-entregas
```

## 📝 Contenido de las Migraciones

### Migration: `create_calendario_entregas_table.php`
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calendario_entregas', function (Blueprint $table) {
            $table->id('id_calendario');
            $table->unsignedBigInteger('id_plan');
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->enum('frecuencia', ['DIARIA', 'SEMANAL', 'QUINCENAL'])->default('SEMANAL');
            $table->json('dias_entrega')->nullable();
            $table->timestamps();

            $table->foreign('id_plan')
                  ->references('id_plan')
                  ->on('plan_alimentacion')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendario_entregas');
    }
};
```

### Migration: `create_entregas_programadas_table.php`
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('entregas_programadas', function (Blueprint $table) {
            $table->id('id_entrega');
            $table->unsignedBigInteger('id_calendario');
            $table->unsignedBigInteger('id_direccion')->nullable();
            $table->unsignedBigInteger('id_comida')->nullable();
            $table->date('fecha');
            $table->enum('estado', ['PROGRAMADA', 'PENDIENTE', 'ENTREGADA', 'OMITIDA'])->default('PROGRAMADA');
            $table->text('notas')->nullable();
            $table->timestamps();

            $table->foreign('id_calendario')
                  ->references('id_calendario')
                  ->on('calendario_entregas')
                  ->onDelete('cascade');
                  
            $table->foreign('id_direccion')
                  ->references('id_direccion')
                  ->on('direcciones')
                  ->onDelete('set null');
                  
            $table->foreign('id_comida')
                  ->references('id_comida')
                  ->on('comidas')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entregas_programadas');
    }
};
```

## 🚀 Alternativa Rápida: SQL Directo

Si prefieres crear las tablas directamente:

```sql
-- 1. Crear tabla calendario_entregas
CREATE TABLE calendario_entregas (
    id_calendario BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_plan BIGINT UNSIGNED NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    frecuencia ENUM('DIARIA', 'SEMANAL', 'QUINCENAL') DEFAULT 'SEMANAL',
    dias_entrega JSON,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (id_plan) REFERENCES plan_alimentacion(id_plan) ON DELETE CASCADE
);

-- 2. Crear tabla entregas_programadas
CREATE TABLE entregas_programadas (
    id_entrega BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    id_calendario BIGINT UNSIGNED NOT NULL,
    id_direccion BIGINT UNSIGNED,
    id_comida BIGINT UNSIGNED,
    fecha DATE NOT NULL,
    estado ENUM('PROGRAMADA', 'PENDIENTE', 'ENTREGADA', 'OMITIDA') DEFAULT 'PROGRAMADA',
    notas TEXT,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (id_calendario) REFERENCES calendario_entregas(id_calendario) ON DELETE CASCADE,
    FOREIGN KEY (id_direccion) REFERENCES direcciones(id_direccion) ON DELETE SET NULL,
    FOREIGN KEY (id_comida) REFERENCES comidas(id_comida) ON DELETE SET NULL
);

-- 3. Generar datos de ejemplo
-- Obtener el plan activo
SET @id_plan = (SELECT id_plan FROM plan_alimentacion WHERE estado = 'ACTIVO' LIMIT 1);

-- Crear calendario
INSERT INTO calendario_entregas (id_plan, fecha_inicio, fecha_fin, frecuencia, dias_entrega, created_at, updated_at)
VALUES (@id_plan, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'SEMANAL', '["LUNES", "MIERCOLES", "VIERNES"]', NOW(), NOW());

SET @id_calendario = LAST_INSERT_ID();

-- Obtener dirección del paciente
SET @id_direccion = (
    SELECT d.id_direccion 
    FROM direcciones d
    JOIN plan_alimentacion p ON d.id_paciente = p.id_paciente
    WHERE p.id_plan = @id_plan
    LIMIT 1
);

-- Generar entregas para las próximas 4 semanas (Lunes, Miércoles, Viernes)
INSERT INTO entregas_programadas (id_calendario, id_direccion, fecha, estado, created_at, updated_at)
SELECT 
    @id_calendario,
    @id_direccion,
    DATE_ADD(CURDATE(), INTERVAL n DAY) as fecha,
    'PROGRAMADA',
    NOW(),
    NOW()
FROM (
    SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION
    SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION
    SELECT 14 UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION
    SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION SELECT 26 UNION SELECT 27
) numbers
WHERE DAYOFWEEK(DATE_ADD(CURDATE(), INTERVAL n DAY)) IN (2, 4, 6)  -- Lunes=2, Miércoles=4, Viernes=6
LIMIT 12;  -- 12 entregas (4 semanas x 3 días)
```

## 📋 Pasos Recomendados

### Opción 1: Migraciones Laravel (Recomendado)
```bash
# 1. Crear migraciones
php artisan make:migration create_calendario_entregas_table
php artisan make:migration create_entregas_programadas_table

# 2. Copiar el código de arriba en las migraciones

# 3. Ejecutar migraciones
php artisan migrate

# 4. Generar entregas
php artisan plan:generar-entregas
```

### Opción 2: SQL Directo (Más Rápido)
```bash
# 1. Ejecutar el SQL de arriba en tu base de datos
mysql -u root nutricion < crear_entregas.sql

# 2. Refrescar la página "Mis Entregas"
```

## 🎯 Resultado Esperado

Después de crear las tablas y generar datos:

```
Mis Entregas
├─ Próximas (12)
│   ├─ Lunes 28/10/2025 - PROGRAMADA
│   ├─ Miércoles 30/10/2025 - PROGRAMADA
│   ├─ Viernes 01/11/2025 - PROGRAMADA
│   └─ ... (9 más)
└─ Todas (12)
    └─ Mismas entregas
```

## ✅ Checklist

- [ ] Crear tabla `calendario_entregas`
- [ ] Crear tabla `entregas_programadas`
- [ ] Ejecutar migraciones
- [ ] Generar calendario para el plan
- [ ] Generar entregas programadas
- [ ] Refrescar página "Mis Entregas"
- [ ] Verificar que aparecen las entregas

## 🚨 Nota Importante

**Esta funcionalidad requiere que las tablas existan en la base de datos.**

Sin las tablas:
- ❌ No se pueden crear entregas
- ❌ No se pueden mostrar entregas
- ❌ La vista aparece vacía

Con las tablas:
- ✅ Se pueden crear entregas
- ✅ Se pueden mostrar entregas
- ✅ La vista funciona correctamente

---

**Fecha**: 31 de Octubre 2025  
**Estado**: ⚠️ REQUIERE MIGRACIONES  
**Acción**: Crear tablas de calendario y entregas
