# 🔧 SOLUCIÓN: Mis Comidas de Hoy - No Muestra Comidas del Plan

## 🎯 Problema Identificado
La vista "Mis Comidas de Hoy" no muestra las comidas del plan ni registra el progreso correctamente.

## 🔍 Causa Raíz

### Estructura de Datos
```
plan_alimentacion
    ↓
plan_dias (días de la semana)
    ↓
comidas (desayuno, almuerzo, cena, etc.)
    ↓
comida_alimento (alimentos de cada comida)
```

### Problema
El plan necesita tener:
1. ✅ Un plan activo
2. ❌ **Días del plan** (`plan_dias`) con fechas o días de la semana
3. ❌ **Comidas** asociadas a esos días
4. ❌ **Alimentos** asociados a esas comidas

## ✅ Verificación de Datos

### 1. Verificar si tienes un plan activo
```sql
SELECT * FROM plan_alimentacion 
WHERE id_paciente = [TU_ID_PACIENTE] 
AND estado = 'ACTIVO';
```

### 2. Verificar si el plan tiene días
```sql
SELECT * FROM plan_dias 
WHERE id_plan = [ID_DEL_PLAN];
```

### 3. Verificar si los días tienen comidas
```sql
SELECT c.* FROM comidas c
JOIN plan_dias pd ON c.id_dia = pd.id_dia
WHERE pd.id_plan = [ID_DEL_PLAN];
```

### 4. Verificar si las comidas tienen alimentos
```sql
SELECT ca.* FROM comida_alimento ca
JOIN comidas c ON ca.id_comida = c.id_comida
JOIN plan_dias pd ON c.id_dia = pd.id_dia
WHERE pd.id_plan = [ID_DEL_PLAN];
```

## 🛠️ Solución: Crear Datos de Prueba

Voy a crear un script para poblar datos de prueba:

### Script SQL para Datos de Prueba
```sql
-- 1. Obtener el plan activo del paciente
SET @id_plan = (SELECT id_plan FROM plan_alimentacion WHERE estado = 'ACTIVO' LIMIT 1);
SET @id_paciente = (SELECT id_paciente FROM plan_alimentacion WHERE id_plan = @id_plan);

-- 2. Crear días de la semana para el plan
INSERT INTO plan_dias (id_plan, dia_semana, fecha, created_at, updated_at) VALUES
(@id_plan, 'LUNES', CURDATE(), NOW(), NOW()),
(@id_plan, 'MARTES', DATE_ADD(CURDATE(), INTERVAL 1 DAY), NOW(), NOW()),
(@id_plan, 'MIERCOLES', DATE_ADD(CURDATE(), INTERVAL 2 DAY), NOW(), NOW()),
(@id_plan, 'JUEVES', DATE_ADD(CURDATE(), INTERVAL 3 DAY), NOW(), NOW()),
(@id_plan, 'VIERNES', DATE_ADD(CURDATE(), INTERVAL 4 DAY), NOW(), NOW()),
(@id_plan, 'SABADO', DATE_ADD(CURDATE(), INTERVAL 5 DAY), NOW(), NOW()),
(@id_plan, 'DOMINGO', DATE_ADD(CURDATE(), INTERVAL 6 DAY), NOW(), NOW());

-- 3. Obtener el ID del día de hoy
SET @id_dia_hoy = (SELECT id_dia FROM plan_dias WHERE id_plan = @id_plan AND fecha = CURDATE());

-- 4. Crear comidas para hoy
INSERT INTO comidas (id_dia, tipo_comida, nombre, hora_recomendada, instrucciones, orden, created_at, updated_at) VALUES
(@id_dia_hoy, 'DESAYUNO', 'Desayuno Proteico', '08:00:00', 'Preparar con leche descremada', 1, NOW(), NOW()),
(@id_dia_hoy, 'COLACION_MATUTINA', 'Snack Matutino', '10:30:00', 'Fruta fresca', 2, NOW(), NOW()),
(@id_dia_hoy, 'ALMUERZO', 'Almuerzo Balanceado', '13:00:00', 'Proteína + vegetales + carbohidrato', 3, NOW(), NOW()),
(@id_dia_hoy, 'COLACION_VESPERTINA', 'Snack Vespertino', '16:00:00', 'Frutos secos', 4, NOW(), NOW()),
(@id_dia_hoy, 'CENA', 'Cena Ligera', '19:00:00', 'Proteína + ensalada', 5, NOW(), NOW());

-- 5. Obtener IDs de las comidas creadas
SET @id_desayuno = (SELECT id_comida FROM comidas WHERE id_dia = @id_dia_hoy AND tipo_comida = 'DESAYUNO');
SET @id_almuerzo = (SELECT id_comida FROM comidas WHERE id_dia = @id_dia_hoy AND tipo_comida = 'ALMUERZO');
SET @id_cena = (SELECT id_comida FROM comidas WHERE id_dia = @id_dia_hoy AND tipo_comida = 'CENA');

-- 6. Obtener algunos alimentos de ejemplo
SET @id_avena = (SELECT id_alimento FROM alimentos WHERE nombre LIKE '%avena%' LIMIT 1);
SET @id_pollo = (SELECT id_alimento FROM alimentos WHERE nombre LIKE '%pollo%' LIMIT 1);
SET @id_arroz = (SELECT id_alimento FROM alimentos WHERE nombre LIKE '%arroz%' LIMIT 1);

-- 7. Asociar alimentos a las comidas
INSERT INTO comida_alimento (id_comida, id_alimento, cantidad_gramos) VALUES
(@id_desayuno, @id_avena, 50),
(@id_almuerzo, @id_pollo, 150),
(@id_almuerzo, @id_arroz, 100),
(@id_cena, @id_pollo, 120);
```

## 🚀 Solución Rápida con PHP

Voy a crear un comando Artisan para poblar datos:

```php
php artisan make:command PoblarComidasPlan
```

### Contenido del Comando
```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\PlanAlimentacion;
use App\Models\PlanDia;
use App\Models\Comida;
use App\Models\Alimento;
use Carbon\Carbon;

class PoblarComidasPlan extends Command
{
    protected $signature = 'plan:poblar-comidas {plan_id?}';
    protected $description = 'Poblar comidas de ejemplo para un plan';

    public function handle()
    {
        $planId = $this->argument('plan_id');
        
        if (!$planId) {
            $plan = PlanAlimentacion::where('estado', 'ACTIVO')->first();
            if (!$plan) {
                $this->error('No hay planes activos');
                return 1;
            }
            $planId = $plan->id_plan;
        }

        $plan = PlanAlimentacion::findOrFail($planId);
        $this->info("Poblando comidas para plan: {$plan->nombre_plan}");

        // Crear días de la semana
        $diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
        $fechaInicio = Carbon::today()->startOfWeek();

        foreach ($diasSemana as $index => $dia) {
            $fecha = $fechaInicio->copy()->addDays($index);
            
            $planDia = PlanDia::firstOrCreate([
                'id_plan' => $plan->id_plan,
                'dia_semana' => $dia,
            ], [
                'fecha' => $fecha,
            ]);

            // Crear comidas para este día
            $comidas = [
                ['tipo' => 'DESAYUNO', 'nombre' => 'Desayuno Proteico', 'hora' => '08:00:00', 'orden' => 1],
                ['tipo' => 'COLACION_MATUTINA', 'nombre' => 'Snack Matutino', 'hora' => '10:30:00', 'orden' => 2],
                ['tipo' => 'ALMUERZO', 'nombre' => 'Almuerzo Balanceado', 'hora' => '13:00:00', 'orden' => 3],
                ['tipo' => 'COLACION_VESPERTINA', 'nombre' => 'Snack Vespertino', 'hora' => '16:00:00', 'orden' => 4],
                ['tipo' => 'CENA', 'nombre' => 'Cena Ligera', 'hora' => '19:00:00', 'orden' => 5],
            ];

            foreach ($comidas as $comidaData) {
                $comida = Comida::firstOrCreate([
                    'id_dia' => $planDia->id_dia,
                    'tipo_comida' => $comidaData['tipo'],
                ], [
                    'nombre' => $comidaData['nombre'],
                    'hora_recomendada' => $comidaData['hora'],
                    'orden' => $comidaData['orden'],
                    'instrucciones' => 'Comida de ejemplo',
                ]);

                // Agregar alimentos de ejemplo
                $alimentos = Alimento::inRandomOrder()->limit(3)->get();
                foreach ($alimentos as $alimento) {
                    $comida->alimentos()->syncWithoutDetaching([
                        $alimento->id_alimento => ['cantidad_gramos' => rand(50, 200)]
                    ]);
                }
            }

            $this->info("✓ Día {$dia} creado con comidas");
        }

        $this->info('✅ Comidas pobladas exitosamente');
        return 0;
    }
}
```

## 📋 Pasos para Solucionar

### Opción 1: Usar el Comando (Recomendado)
```bash
# Crear el comando
php artisan make:command PoblarComidasPlan

# Copiar el código del comando arriba

# Ejecutar
php artisan plan:poblar-comidas
```

### Opción 2: SQL Directo
```bash
# Ejecutar el script SQL de arriba en tu base de datos
mysql -u root nutricion < poblar_comidas.sql
```

### Opción 3: Desde la Interfaz
1. Ir a "Planes de Alimentación"
2. Editar un plan existente
3. Agregar días de la semana
4. Agregar comidas a cada día
5. Agregar alimentos a cada comida

## 🧪 Verificar que Funciona

### 1. Verificar en Base de Datos
```sql
-- Ver días del plan
SELECT * FROM plan_dias WHERE id_plan = [ID_PLAN];

-- Ver comidas de hoy
SELECT c.*, pd.dia_semana, pd.fecha 
FROM comidas c
JOIN plan_dias pd ON c.id_dia = pd.id_dia
WHERE pd.fecha = CURDATE();

-- Ver alimentos de las comidas
SELECT c.nombre as comida, a.nombre as alimento, ca.cantidad_gramos
FROM comidas c
JOIN comida_alimento ca ON c.id_comida = ca.id_comida
JOIN alimentos a ON ca.id_alimento = a.id_alimento
JOIN plan_dias pd ON c.id_dia = pd.id_dia
WHERE pd.fecha = CURDATE();
```

### 2. Verificar en la Aplicación
1. Ir a "Mis Comidas de Hoy"
2. Deberías ver las comidas del día
3. Click en "Ya comí esto" para registrar
4. Ver el progreso actualizado

## 🎯 Estructura Correcta

```
Plan Alimentación (id_plan: 1)
  ├─ Plan Día (LUNES, 2025-10-30)
  │   ├─ Comida (DESAYUNO, 08:00)
  │   │   ├─ Alimento: Avena (50g)
  │   │   └─ Alimento: Leche (200ml)
  │   ├─ Comida (ALMUERZO, 13:00)
  │   │   ├─ Alimento: Pollo (150g)
  │   │   └─ Alimento: Arroz (100g)
  │   └─ Comida (CENA, 19:00)
  │       └─ Alimento: Pescado (120g)
  └─ Plan Día (MARTES, 2025-10-31)
      └─ ... (más comidas)
```

## ✅ Checklist

- [ ] Verificar que existe un plan activo
- [ ] Verificar que el plan tiene días (`plan_dias`)
- [ ] Verificar que los días tienen comidas
- [ ] Verificar que las comidas tienen alimentos
- [ ] Ejecutar comando o script SQL
- [ ] Refrescar la página "Mis Comidas de Hoy"
- [ ] Probar registrar una comida
- [ ] Verificar que el progreso se actualiza

## 🚨 Troubleshooting

### No aparecen comidas
```
1. Verificar que hay un plan activo
2. Verificar que el plan tiene días
3. Verificar que hay comidas para HOY
4. Verificar que las comidas tienen alimentos
```

### Error al registrar comida
```
1. Verificar que la comida existe
2. Verificar que la comida tiene alimentos
3. Ver logs en consola del navegador
4. Ver logs de Laravel: storage/logs/laravel.log
```

### Progreso no se actualiza
```
1. Refrescar la página
2. Verificar que la ingesta se creó en la BD
3. Verificar que la fecha de la ingesta es hoy
```

## 📝 Notas Importantes

1. **Las comidas deben tener fecha de HOY** para aparecer
2. **El plan debe estar ACTIVO**
3. **Las comidas deben tener alimentos** asociados
4. **El usuario debe ser un paciente** con plan asignado

---

**Fecha**: 30 de Octubre 2025  
**Estado**: ⚠️ REQUIERE DATOS  
**Acción**: Poblar comidas del plan con el comando o SQL
