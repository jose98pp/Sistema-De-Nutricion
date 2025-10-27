# 📱 Documentación Frontend - Nuevas Vistas React

## ✅ Vistas Implementadas

Se han creado **9 nuevos componentes React** para gestionar los módulos adicionales del sistema.

---

## 📂 Estructura de Archivos Creados

```
resources/js/pages/
├── Direcciones/
│   ├── Index.jsx  ✅ (Lista de direcciones)
│   └── Form.jsx   ✅ (Crear/Editar dirección)
│
├── Recetas/
│   ├── Index.jsx  ✅ (Catálogo de recetas)
│   └── Form.jsx   ✅ (Crear/Editar receta)
│
├── AnalisisClinicos/
│   ├── Index.jsx  ✅ (Lista de análisis)
│   └── Form.jsx   ✅ (Crear/Editar análisis)
│
├── CalendariosEntrega/
│   ├── Index.jsx  ✅ (Gestión de calendarios)
│   └── Form.jsx   ✅ (Crear/Editar calendario)
│
└── Entregas/
    └── Index.jsx  ✅ (Gestión de entregas programadas)
```

---

## 🎯 1. Módulo de Direcciones

### **Index.jsx** - Lista de Direcciones
**Ruta:** `/direcciones`

**Características:**
- ✅ Lista todas las direcciones de pacientes
- ✅ Filtro por paciente
- ✅ Muestra alias, descripción y coordenadas GPS
- ✅ Botones de editar y eliminar
- ✅ Tarjetas con diseño responsivo

**Funcionalidades:**
```javascript
- fetchDirecciones() // Obtiene direcciones desde la API
- fetchPacientes() // Carga lista de pacientes para el filtro
- handleDelete(id) // Elimina una dirección con confirmación
```

**Datos Mostrados:**
- 📍 Alias de la dirección
- 👤 Nombre del paciente
- 📝 Descripción completa
- 🌍 Coordenadas GPS (latitud, longitud)

---

### **Form.jsx** - Formulario de Direcciones
**Rutas:** `/direcciones/nuevo` y `/direcciones/:id/editar`

**Características:**
- ✅ Crear nueva dirección
- ✅ Editar dirección existente
- ✅ Selector de paciente (deshabilitado en edición)
- ✅ Validación de coordenadas GPS (-90 a 90 lat, -180 a 180 lng)
- ✅ Mensajes de error específicos

**Campos del Formulario:**
1. **Paciente** (requerido) - Select con lista de pacientes
2. **Alias** (requerido) - Máximo 50 caracteres
3. **Dirección Completa** (requerido) - Textarea
4. **Latitud** (opcional) - Number con validación de rango
5. **Longitud** (opcional) - Number con validación de rango

---

## 🍽️ 2. Módulo de Recetas

### **Index.jsx** - Catálogo de Recetas
**Ruta:** `/recetas`

**Características:**
- ✅ Lista paginada de recetas (12 por página)
- ✅ Búsqueda por nombre en tiempo real
- ✅ Muestra calorías y restricciones
- ✅ Paginación funcional
- ✅ Diseño en tarjetas con iconos

**Datos Mostrados:**
- 🍽️ Nombre de la receta
- 🔥 Calorías (kcal)
- ⚠️ Restricciones y alérgenos

**Funcionalidades:**
```javascript
- fetchRecetas() // Obtiene recetas con paginación
- handleDelete(id) // Elimina receta
- setCurrentPage() // Controla paginación
```

---

### **Form.jsx** - Formulario de Recetas
**Rutas:** `/recetas/nuevo` y `/recetas/:id/editar`

**Características:**
- ✅ Crear nueva receta
- ✅ Editar receta existente
- ✅ Validación de nombre único
- ✅ Calorías opcionales

**Campos del Formulario:**
1. **Nombre** (requerido) - Único, máximo 100 caracteres
2. **Calorías** (opcional) - Number positivo
3. **Restricciones** (opcional) - Textarea 255 caracteres

**Uso:**
- Las recetas se pueden vincular a comidas desde los planes alimenticios
- Se muestran restricciones para alertar sobre alérgenos

---

## 🔬 3. Módulo de Análisis Clínicos

### **Index.jsx** - Lista de Análisis
**Ruta:** `/analisis-clinicos`

**Características:**
- ✅ Lista de análisis clínicos
- ✅ Búsqueda por tipo de análisis
- ✅ Muestra resultado en formato monospace
- ✅ Indica evaluaciones vinculadas
- ✅ Vista en lista expandida

**Datos Mostrados:**
- 🔬 Tipo de análisis
- 📋 Resultado completo (formato pre)
- 📅 Fecha de creación
- 🔗 Número de evaluaciones vinculadas

**Funcionalidades:**
```javascript
- fetchAnalisis() // Obtiene análisis con filtro
- handleDelete(id) // Elimina análisis
```

---

### **Form.jsx** - Formulario de Análisis
**Rutas:** `/analisis-clinicos/nuevo` y `/analisis-clinicos/:id/editar`

**Características:**
- ✅ Crear nuevo análisis
- ✅ Editar análisis existente
- ✅ Textarea con formato monospace
- ✅ Ejemplo de formato incluido

**Campos del Formulario:**
1. **Tipo de Análisis** (requerido) - Texto 100 caracteres
2. **Resultado** (requerido) - Textarea con formato

**Ejemplo de Resultado:**
```
Glucosa: 95 mg/dL (Normal: 70-100)
Colesterol Total: 180 mg/dL (Normal: <200)
HDL: 55 mg/dL (Normal: >40)
LDL: 110 mg/dL (Normal: <130)
Triglicéridos: 120 mg/dL (Normal: <150)
```

---

## 📆 4. Módulo de Calendarios de Entrega

### **Index.jsx** - Gestión de Calendarios
**Ruta:** `/calendarios-entrega`

**Características:**
- ✅ Lista de calendarios de entrega
- ✅ Indica calendarios activos/inactivos
- ✅ Muestra días restantes
- ✅ Botón para generar entregas automáticamente
- ✅ Contador de entregas programadas
- ✅ Vista en tarjetas

**Datos Mostrados:**
- 📆 ID del calendario
- 👤 Paciente asociado
- ✅ Estado (Activo/Inactivo)
- 📅 Fecha inicio y fin
- 📦 Número de entregas
- ⏰ Días restantes (si está activo)

**Funcionalidades:**
```javascript
- fetchCalendarios() // Obtiene calendarios
- handleGenerarEntregas(id) // Genera entregas automáticas para el calendario
- handleDelete(id) // Elimina calendario y entregas
- isActivo(calendario) // Verifica si el calendario está activo hoy
- getDiasRestantes(calendario) // Calcula días restantes
```

**Acciones Especiales:**
- 🔄 **Generar Entregas Automáticas**: Crea una entrega por cada día del calendario
- 👁️ **Ver Entregas**: Filtra entregas por calendario
- ✏️ **Editar**: Modifica fechas del calendario
- 🗑️ **Eliminar**: Elimina calendario y todas sus entregas

---

### **Form.jsx** - Formulario de Calendarios
**Rutas:** `/calendarios-entrega/nuevo` y `/calendarios-entrega/:id/editar`

**Características:**
- ✅ Crear nuevo calendario
- ✅ Editar calendario existente
- ✅ Solo muestra contratos activos sin calendario
- ✅ Cálculo automático de duración en días
- ✅ Validación de fechas

**Campos del Formulario:**
1. **Contrato** (requerido) - Select (deshabilitado en edición)
2. **Fecha de Inicio** (requerido) - Date picker
3. **Fecha de Fin** (requerido) - Date picker (debe ser >= inicio)

**Características Especiales:**
- 📊 Muestra duración calculada en días
- ℹ️ Indica cuántas entregas se generarán
- 🔒 El contrato no se puede cambiar al editar

---

## 📦 5. Módulo de Entregas Programadas

### **Index.jsx** - Gestión de Entregas
**Ruta:** `/entregas`

**Características:**
- ✅ Lista de entregas programadas
- ✅ 3 vistas rápidas: Todas, Hoy, Pendientes
- ✅ Filtros por estado y fecha
- ✅ Estados con colores e iconos
- ✅ Acciones rápidas (Marcar entregada/omitida)
- ✅ Información completa de cada entrega

**Estados de Entrega:**
- 📅 **PROGRAMADA** - Azul - Entrega programada
- ⏳ **PENDIENTE** - Amarillo - En proceso
- ✅ **ENTREGADA** - Verde - Completada
- ❌ **OMITIDA** - Gris - Cancelada

**Datos Mostrados:**
- 📅 Fecha completa de la entrega
- 👤 Paciente
- 📍 Dirección de entrega
- 🍽️ Comida asignada
- 🏷️ Estado con icono y color

**Vistas Rápidas:**
1. **Todas**: Muestra todas las entregas con filtros
2. **Hoy**: Solo entregas programadas para hoy
3. **Pendientes**: Entregas pendientes vencidas

**Funcionalidades:**
```javascript
- fetchEntregas() // Obtiene entregas según vista y filtros
- handleMarcarEntregada(id) // Marca entrega como completada
- handleMarcarOmitida(id) // Marca entrega como omitida
- getEstadoColor(estado) // Devuelve clase CSS para el estado
- getEstadoIcon(estado) // Devuelve emoji para el estado
```

**Acciones:**
- ✅ Marcar como Entregada
- ❌ Marcar como Omitida
- ✏️ Editar detalles

---

## 🔄 Integración con Backend API

Todas las vistas utilizan el archivo `config/api.js` que maneja:
- ✅ Token de autenticación automático
- ✅ Base URL configurada
- ✅ Manejo de errores
- ✅ Interceptores de respuesta

**Ejemplo de Uso:**
```javascript
import api from '../../config/api';

// GET request
const response = await api.get('/direcciones');
setDirecciones(response.data.data);

// POST request
await api.post('/recetas', formData);

// PUT request
await api.put(`/analisis-clinicos/${id}`, formData);

// DELETE request
await api.delete(`/calendarios-entrega/${id}`);
```

---

## 🎨 Estilos y Componentes

Todas las vistas utilizan **Tailwind CSS** con clases personalizadas:

### Clases Principales
```css
.card - Tarjeta con sombra y padding
.btn-primary - Botón principal azul
.btn-secondary - Botón secundario gris
.btn-danger - Botón rojo para eliminar
.btn-success - Botón verde para acciones positivas
.input-field - Campo de entrada estándar
```

### Colores por Estado
```css
bg-blue-100 text-blue-700 - Programada
bg-yellow-100 text-yellow-700 - Pendiente
bg-green-100 text-green-700 - Entregada/Éxito
bg-red-100 text-red-700 - Error/Restricción
bg-gray-100 text-gray-700 - Inactivo/Omitida
```

---

## 🗺️ Rutas Agregadas

### Rutas Principales
```javascript
/direcciones                       → Lista de direcciones
/direcciones/nuevo                 → Nueva dirección
/direcciones/:id/editar            → Editar dirección

/recetas                           → Catálogo de recetas
/recetas/nuevo                     → Nueva receta
/recetas/:id/editar                → Editar receta

/analisis-clinicos                 → Lista de análisis
/analisis-clinicos/nuevo           → Nuevo análisis
/analisis-clinicos/:id/editar      → Editar análisis

/calendarios-entrega               → Gestión de calendarios
/calendarios-entrega/nuevo         → Nuevo calendario
/calendarios-entrega/:id/editar    → Editar calendario

/entregas                          → Gestión de entregas
```

---

## 📱 Menú de Navegación Actualizado

Se agregaron los siguientes items al sidebar:

| Icono | Texto | Ruta | Roles |
|-------|-------|------|-------|
| 🍽️ | Recetas | `/recetas` | admin, nutricionista |
| 🔬 | Análisis Clínicos | `/analisis-clinicos` | admin, nutricionista |
| 📍 | Direcciones | `/direcciones` | admin, nutricionista |
| 📆 | Calendarios | `/calendarios-entrega` | admin, nutricionista |
| 📦 | Entregas | `/entregas` | admin, nutricionista |

---

## ✨ Características Comunes

Todas las vistas comparten:

### 1. Loading State
```jsx
{loading ? (
    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
) : (
    // Contenido
)}
```

### 2. Empty State
```jsx
{items.length === 0 ? (
    <div className="text-center py-12 text-gray-500">
        <p>No hay items registrados</p>
    </div>
) : (
    // Lista de items
)}
```

### 3. Error Handling
```jsx
{errors.campo && (
    <p className="text-red-500 text-xs mt-1">{errors.campo[0]}</p>
)}
```

### 4. Confirmaciones
```javascript
if (window.confirm('¿Está seguro?')) {
    // Acción destructiva
}
```

---

## 🚀 Cómo Usar las Nuevas Vistas

### 1. Gestionar Direcciones
1. Ir a **Direcciones** en el menú
2. Click en **+ Nueva Dirección**
3. Seleccionar paciente
4. Completar datos de la dirección
5. Opcional: Agregar coordenadas GPS
6. Guardar

### 2. Crear Recetas
1. Ir a **Recetas** en el menú
2. Click en **+ Nueva Receta**
3. Ingresar nombre único
4. Agregar calorías (opcional)
5. Especificar restricciones
6. Guardar

### 3. Registrar Análisis Clínico
1. Ir a **Análisis Clínicos**
2. Click en **+ Nuevo Análisis**
3. Especificar tipo de análisis
4. Copiar/escribir resultados
5. Guardar
6. Vincular a evaluación desde módulo de Evaluaciones

### 4. Crear Calendario y Entregas
1. Ir a **Calendarios** en el menú
2. Click en **+ Nuevo Calendario**
3. Seleccionar contrato activo
4. Establecer fechas de inicio y fin
5. Guardar calendario
6. Click en **🔄 Generar Entregas Automáticas**
7. Ir a **Entregas** para ver y gestionar

### 5. Gestionar Entregas Diarias
1. Ir a **Entregas** en el menú
2. Click en vista **Hoy**
3. Ver entregas del día
4. Marcar como **Entregada** o **Omitida**
5. Editar si es necesario

---

## 📊 Resumen de Completitud

### Vistas Creadas: ✅ 9/9 (100%)
- [x] DireccionesIndex
- [x] DireccionForm
- [x] RecetasIndex
- [x] RecetaForm
- [x] AnalisisClinicosIndex
- [x] AnalisisClinicoForm
- [x] CalendariosEntregaIndex
- [x] CalendarioEntregaForm
- [x] EntregasIndex

### Rutas Configuradas: ✅ 10/10 (100%)
- [x] Todas las rutas agregadas a AppMain.jsx
- [x] Items de menú agregados a Layout.jsx

### Integración Backend: ✅ 100%
- [x] Todos los endpoints consumidos correctamente
- [x] Manejo de errores implementado
- [x] Estados de carga implementados

---

## 🎯 Próximos Pasos Sugeridos

### Frontend
1. **Agregar tests unitarios** con Jest y React Testing Library
2. **Implementar lazy loading** para optimizar rendimiento
3. **Agregar mapa interactivo** para visualizar direcciones con GPS
4. **Crear vista de calendario visual** para entregas
5. **Implementar drag & drop** para reorganizar entregas
6. **Agregar notificaciones push** para entregas del día

### UX/UI
1. **Agregar animaciones** con Framer Motion
2. **Mejorar responsividad** en móviles
3. **Agregar modo oscuro** completo
4. **Implementar tooltips** informativos
5. **Crear wizards** para procesos complejos

---

**Fecha de Completitud:** 23 de Enero, 2025  
**Framework:** React 18 + Vite  
**Estilos:** Tailwind CSS  
**Enrutamiento:** React Router v6
