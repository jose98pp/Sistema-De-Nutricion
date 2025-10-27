# Búsqueda de Planes Actualizada

## Cambios Implementados

### Backend (API)

Se actualizaron ambos controladores de planes para soportar búsqueda avanzada:

#### 1. PlanAlimentacionController.php
#### 2. PlanAlimentacionMejoradoController.php

**Nuevo parámetro `search`:**
- Busca en nombre del paciente
- Busca en apellido del paciente
- Busca en correo electrónico del paciente
- Busca en número de celular del paciente

**Ejemplo de uso:**
```
GET /api/planes?search=Juan
GET /api/planes?search=garcia@email.com
GET /api/planes?search=555-1234
GET /api/planes?search=García&activo=1
```

### Frontend (Vista)

**Archivo:** `resources/js/pages/Planes/Index.jsx`

**Cambios realizados:**

1. **Campo de búsqueda mejorado:**
   - Reemplazó el campo "Filtrar por Paciente ID" por un campo de búsqueda más intuitivo
   - Placeholder descriptivo: "Buscar por nombre, apellido, correo o celular..."
   - Texto de ayuda con ejemplos

2. **Debounce implementado:**
   - La búsqueda espera 500ms después de que el usuario deja de escribir
   - Evita hacer múltiples peticiones mientras se escribe
   - Mejora el rendimiento

3. **Botón de limpiar búsqueda:**
   - Aparece cuando hay texto en el campo de búsqueda
   - Permite limpiar rápidamente el filtro

4. **Diseño responsive:**
   - Grid de 3 columnas en pantallas medianas/grandes
   - Campo de búsqueda ocupa 2 columnas
   - Checkbox y botón limpiar en la tercera columna

## Características

### Búsqueda Inteligente
- **Case-insensitive:** No importa si escribes en mayúsculas o minúsculas
- **Coincidencias parciales:** "Gar" encontrará "García", "Garza", etc.
- **Múltiples campos:** Busca simultáneamente en nombre, apellido, email y celular

### Filtros Combinables
Puedes combinar la búsqueda con otros filtros:
- ✅ Búsqueda + Solo activos
- ✅ Búsqueda + Paciente ID específico
- ✅ Búsqueda + Estado del plan

### Experiencia de Usuario

**Antes:**
```
[Filtrar por Paciente ID: ____]  [☐ Solo planes activos]
```

**Después:**
```
[🔍 Buscar Paciente: Buscar por nombre, apellido, correo o celular...]
Ejemplo: Juan, García, juan@email.com, 555-1234

[☐ Solo planes activos]
[Limpiar búsqueda] (si hay búsqueda activa)
```

## Ejemplos de Búsqueda

### Por Nombre
```
Búsqueda: "Juan"
Encuentra: Juan Pérez, María Juana, Juan Carlos García
```

### Por Apellido
```
Búsqueda: "García"
Encuentra: Juan García, María García López, Pedro García
```

### Por Email
```
Búsqueda: "@gmail"
Encuentra: Todos los pacientes con correo Gmail
```

### Por Celular
```
Búsqueda: "555"
Encuentra: Todos los celulares que contengan "555"
```

### Búsqueda Combinada
```
Búsqueda: "García" + ☑ Solo planes activos
Encuentra: Solo planes activos de pacientes con apellido García
```

## Ventajas

1. **Más intuitivo:** No necesitas saber el ID del paciente
2. **Más rápido:** Busca por cualquier dato que recuerdes
3. **Más flexible:** Combina múltiples filtros
4. **Mejor rendimiento:** Debounce evita peticiones innecesarias
5. **Mejor UX:** Feedback visual y ayuda contextual

## Compatibilidad

- ✅ Funciona con `/api/planes`
- ✅ Funciona con `/api/planes-mejorados`
- ✅ Compatible con filtros existentes
- ✅ No rompe funcionalidad anterior
- ✅ Responsive (móvil, tablet, desktop)
- ✅ Dark mode compatible
