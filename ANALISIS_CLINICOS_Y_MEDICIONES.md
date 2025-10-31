# 📊 Análisis Clínicos y Mediciones - Documentación Completa

## 🎯 Resumen

El sistema tiene **dos conceptos diferentes** pero relacionados:
1. **Mediciones**: Medidas antropométricas (peso, altura, % grasa, etc.)
2. **Análisis Clínicos**: Estudios de laboratorio (glucosa, colesterol, etc.)

Ambos se vinculan a **Evaluaciones** de pacientes.

---

## 📋 1. MEDICIONES (Antropométricas)

### Definición
Medidas físicas del paciente tomadas durante una evaluación nutricional.

### Tabla: `mediciones`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_medicion` | BIGINT | ID único |
| `id_evaluacion` | BIGINT | FK a evaluaciones |
| `peso_kg` | DECIMAL(5,2) | Peso en kilogramos |
| `altura_m` | DECIMAL(4,2) | Altura en metros |
| `porc_grasa` | DECIMAL(5,2) | Porcentaje de grasa corporal |
| `masa_magra_kg` | DECIMAL(5,2) | Masa magra en kg |
| `cintura_cm` | DECIMAL(5,2) | Circunferencia de cintura |
| `cadera_cm` | DECIMAL(5,2) | Circunferencia de cadera |
| `brazo_cm` | DECIMAL(5,2) | Circunferencia de brazo |
| `pierna_cm` | DECIMAL(5,2) | Circunferencia de pierna |

### Relación
```
Evaluacion (1) -----> (1) Medicion
```

Una evaluación tiene UNA medición antropométrica.

### Cálculos Automáticos

#### IMC (Índice de Masa Corporal)
```php
$imc = $peso_kg / ($altura_m ** 2);
```

#### Clasificación de IMC
- **< 18.5**: Bajo peso
- **18.5 - 24.9**: Normal
- **25 - 29.9**: Sobrepeso
- **≥ 30**: Obesidad

### Ejemplo de Uso
```json
{
  "id_evaluacion": 1,
  "peso_kg": 75.5,
  "altura_m": 1.75,
  "porc_grasa": 22.5,
  "masa_magra_kg": 58.5,
  "cintura_cm": 85.0,
  "cadera_cm": 95.0
}
```

**Resultado**:
- IMC: 24.65
- Clasificación: Normal

---

## 🧪 2. ANÁLISIS CLÍNICOS (Laboratorio)

### Definición
Estudios de laboratorio (sangre, orina, etc.) que complementan la evaluación nutricional.

### Tabla: `analisis_clinicos`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_analisis` | BIGINT | ID único |
| `tipo` | VARCHAR | Tipo de análisis (glucosa, colesterol, etc.) |
| `resultado` | TEXT | Resultado del análisis |

### Relación
```
Evaluacion (N) <-----> (M) AnalisisClinico
```

Una evaluación puede tener MÚLTIPLES análisis clínicos.
Un análisis clínico puede estar en MÚLTIPLES evaluaciones.

### Tabla Pivot: `evaluacion_analisis_clinico`

| Campo | Tipo |
|-------|------|
| `id_evaluacion` | BIGINT |
| `id_analisis` | BIGINT |

### Tipos Comunes de Análisis

1. **Glucosa en ayunas**
   - Normal: 70-100 mg/dL
   - Prediabetes: 100-125 mg/dL
   - Diabetes: ≥126 mg/dL

2. **Colesterol Total**
   - Deseable: <200 mg/dL
   - Límite alto: 200-239 mg/dL
   - Alto: ≥240 mg/dL

3. **Triglicéridos**
   - Normal: <150 mg/dL
   - Límite alto: 150-199 mg/dL
   - Alto: ≥200 mg/dL

4. **Hemoglobina**
   - Hombres: 13.5-17.5 g/dL
   - Mujeres: 12.0-15.5 g/dL

5. **Creatinina**
   - Hombres: 0.7-1.3 mg/dL
   - Mujeres: 0.6-1.1 mg/dL

### Ejemplo de Uso
```json
{
  "tipo": "Glucosa en ayunas",
  "resultado": "95 mg/dL - Normal"
}
```

---

## 🔧 3. PERMISOS ACTUALIZADOS

### ✅ Corrección Aplicada

**Archivo**: `routes/api.php`

**Antes** (Solo Admin):
```php
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::apiResource('analisis-clinicos', AnalisisClinicoController::class);
});
```

**Después** (Admin y Nutricionista):
```php
Route::middleware(['auth:sanctum', 'role:admin,nutricionista'])->group(function () {
    // Análisis Clínicos - Admin y Nutricionista
    Route::apiResource('analisis-clinicos', AnalisisClinicoController::class);
    Route::post('analisis-clinicos/{id}/vincular-evaluacion', [AnalisisClinicoController::class, 'attachToEvaluacion']);
    Route::delete('analisis-clinicos/{id}/desvincular-evaluacion/{id_evaluacion}', [AnalisisClinicoController::class, 'detachFromEvaluacion']);
});
```

### Matriz de Permisos

| Acción | Admin | Nutricionista | Paciente |
|--------|-------|---------------|----------|
| **Listar análisis** | ✅ | ✅ | ❌ |
| **Ver detalle** | ✅ | ✅ | ❌ |
| **Crear** | ✅ | ✅ | ❌ |
| **Editar** | ✅ | ✅ | ❌ |
| **Eliminar** | ✅ | ✅ | ❌ |
| **Vincular a evaluación** | ✅ | ✅ | ❌ |
| **Desvincular** | ✅ | ✅ | ❌ |
| **Ver mis análisis** | ✅ | ✅ | ✅ |

---

## 🛣️ 4. RUTAS API

### Análisis Clínicos (Admin y Nutricionista)

| Método | Endpoint | Acción |
|--------|----------|--------|
| GET | `/api/analisis-clinicos` | Listar todos |
| POST | `/api/analisis-clinicos` | Crear |
| GET | `/api/analisis-clinicos/{id}` | Ver detalle |
| PUT/PATCH | `/api/analisis-clinicos/{id}` | Actualizar |
| DELETE | `/api/analisis-clinicos/{id}` | Eliminar |
| POST | `/api/analisis-clinicos/{id}/vincular-evaluacion` | Vincular a evaluación |
| DELETE | `/api/analisis-clinicos/{id}/desvincular-evaluacion/{id_eval}` | Desvincular |

### Mis Análisis (Paciente)

| Método | Endpoint | Acción |
|--------|----------|--------|
| GET | `/api/mis-analisis` | Ver mis análisis clínicos |

---

## 📊 5. FLUJO DE TRABAJO

### Escenario Completo: Evaluación Nutricional

#### Paso 1: Crear Evaluación
```http
POST /api/evaluaciones
{
  "id_paciente": 1,
  "id_nutricionista": 2,
  "tipo": "PERIODICA",
  "fecha": "2025-10-30",
  "observaciones": "Control mensual"
}
```

#### Paso 2: Registrar Mediciones
```http
POST /api/mediciones (o incluir en evaluación)
{
  "id_evaluacion": 5,
  "peso_kg": 75.5,
  "altura_m": 1.75,
  "porc_grasa": 22.5,
  "masa_magra_kg": 58.5,
  "cintura_cm": 85.0,
  "cadera_cm": 95.0
}
```

**Sistema calcula automáticamente**:
- IMC: 24.65
- Clasificación: Normal
- Relación cintura/cadera: 0.89

#### Paso 3: Crear Análisis Clínicos
```http
POST /api/analisis-clinicos
{
  "tipo": "Glucosa en ayunas",
  "resultado": "95 mg/dL - Normal"
}
```

```http
POST /api/analisis-clinicos
{
  "tipo": "Colesterol Total",
  "resultado": "185 mg/dL - Deseable"
}
```

#### Paso 4: Vincular Análisis a Evaluación
```http
POST /api/analisis-clinicos/1/vincular-evaluacion
{
  "id_evaluacion": 5
}
```

```http
POST /api/analisis-clinicos/2/vincular-evaluacion
{
  "id_evaluacion": 5
}
```

#### Resultado Final
```json
{
  "id_evaluacion": 5,
  "paciente": "Juan Pérez",
  "fecha": "2025-10-30",
  "medicion": {
    "peso_kg": 75.5,
    "altura_m": 1.75,
    "imc": 24.65,
    "clasificacion_imc": "Normal",
    "porc_grasa": 22.5
  },
  "analisis_clinicos": [
    {
      "tipo": "Glucosa en ayunas",
      "resultado": "95 mg/dL - Normal"
    },
    {
      "tipo": "Colesterol Total",
      "resultado": "185 mg/dL - Deseable"
    }
  ]
}
```

---

## 🎨 6. MEJORAS SUGERIDAS PARA EL FORMULARIO

### Formulario de Evaluación Mejorado

#### Sección 1: Datos Básicos
```jsx
<div className="grid grid-cols-2 gap-4">
  <div>
    <label>Paciente</label>
    <select name="id_paciente">
      <option>Seleccionar paciente</option>
    </select>
  </div>
  <div>
    <label>Tipo de Evaluación</label>
    <select name="tipo">
      <option value="INICIAL">Inicial</option>
      <option value="PERIODICA">Periódica</option>
      <option value="FINAL">Final</option>
    </select>
  </div>
</div>
```

#### Sección 2: Mediciones Antropométricas
```jsx
<div className="bg-blue-50 p-4 rounded-lg">
  <h3>Mediciones Antropométricas</h3>
  
  <div className="grid grid-cols-3 gap-4">
    <div>
      <label>Peso (kg)</label>
      <input type="number" step="0.1" name="peso_kg" />
    </div>
    <div>
      <label>Altura (m)</label>
      <input type="number" step="0.01" name="altura_m" />
    </div>
    <div>
      <label>IMC</label>
      <input type="text" value={imc} disabled />
      <span className="text-sm">{clasificacionIMC}</span>
    </div>
  </div>
  
  <div className="grid grid-cols-4 gap-4 mt-4">
    <div>
      <label>% Grasa</label>
      <input type="number" step="0.1" name="porc_grasa" />
    </div>
    <div>
      <label>Masa Magra (kg)</label>
      <input type="number" step="0.1" name="masa_magra_kg" />
    </div>
    <div>
      <label>Cintura (cm)</label>
      <input type="number" step="0.1" name="cintura_cm" />
    </div>
    <div>
      <label>Cadera (cm)</label>
      <input type="number" step="0.1" name="cadera_cm" />
    </div>
  </div>
</div>
```

#### Sección 3: Análisis Clínicos
```jsx
<div className="bg-green-50 p-4 rounded-lg">
  <h3>Análisis Clínicos</h3>
  
  <button onClick={agregarAnalisis}>
    + Agregar Análisis
  </button>
  
  {analisisClinic os.map((analisis, index) => (
    <div key={index} className="grid grid-cols-3 gap-4 mt-2">
      <div>
        <label>Tipo</label>
        <select name={`analisis[${index}].tipo`}>
          <option value="Glucosa">Glucosa en ayunas</option>
          <option value="Colesterol">Colesterol Total</option>
          <option value="Trigliceridos">Triglicéridos</option>
          <option value="Hemoglobina">Hemoglobina</option>
          <option value="Creatinina">Creatinina</option>
        </select>
      </div>
      <div>
        <label>Resultado</label>
        <input type="text" name={`analisis[${index}].resultado`} />
      </div>
      <div>
        <button onClick={() => eliminarAnalisis(index)}>
          Eliminar
        </button>
      </div>
    </div>
  ))}
</div>
```

---

## ⚠️ 7. IMPORTANTE: REFRESCAR SESIÓN

Al igual que con otros recursos, el nutricionista necesita **cerrar sesión y volver a iniciar** para que los nuevos permisos de análisis clínicos surtan efecto.

---

## ✅ 8. VERIFICACIÓN

### Rutas cargadas:
```bash
php artisan route:list --path=analisis

✅ GET|HEAD  api/analisis-clinicos
✅ POST      api/analisis-clinicos
✅ GET|HEAD  api/analisis-clinicos/{id}
✅ PUT|PATCH api/analisis-clinicos/{id}
✅ DELETE    api/analisis-clinicos/{id}
✅ POST      api/analisis-clinicos/{id}/vincular-evaluacion
✅ DELETE    api/analisis-clinicos/{id}/desvincular-evaluacion/{id_eval}
✅ GET|HEAD  api/mis-analisis
```

### Archivos sin errores:
- ✅ `routes/api.php`
- ✅ `app/Models/Medicion.php`
- ✅ `app/Models/AnalisisClinico.php`

---

## 📝 9. RESUMEN

### Diferencias Clave

| Aspecto | Mediciones | Análisis Clínicos |
|---------|------------|-------------------|
| **Qué son** | Medidas físicas | Estudios de laboratorio |
| **Ejemplos** | Peso, altura, % grasa | Glucosa, colesterol |
| **Relación** | 1:1 con Evaluación | N:M con Evaluación |
| **Quién toma** | Nutricionista | Laboratorio externo |
| **Frecuencia** | Cada evaluación | Según necesidad |
| **Cálculos** | IMC automático | Interpretación manual |

### Permisos Actualizados

✅ **Admin**: Acceso completo a todo  
✅ **Nutricionista**: Puede gestionar análisis clínicos y mediciones  
✅ **Paciente**: Solo puede ver sus propios análisis

---

**Documentado por**: Kiro AI Assistant  
**Fecha**: 30 de Octubre, 2025  
**Estado**: ✅ Completado - Requiere logout/login del usuario
