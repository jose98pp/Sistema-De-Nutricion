# ✅ Gestión de Nutricionistas y Asignación de Pacientes

## 📋 Funcionalidades Implementadas

Se ha implementado la funcionalidad completa para gestionar nutricionistas y asignar pacientes, tanto desde el rol de **Admin** como de **Nutricionista**.

---

## 🎯 Cambios Realizados

### **1. Formulario de Pacientes - Selector de Nutricionista** ✅

**Archivo:** `resources/js/pages/Pacientes/Form.jsx`

#### **Cambios:**
- ✅ Agregado estado `nutricionistas` para almacenar lista de nutricionistas
- ✅ Agregado campo `id_nutricionista` al formulario
- ✅ Función `fetchNutricionistas()` para cargar lista de nutricionistas
- ✅ Select dropdown con lista de nutricionistas disponibles
- ✅ Muestra: Nombre + Apellido + Especialidad
- ✅ Opción "Sin asignar" disponible

#### **Ubicación en el formulario:**
```jsx
<select name="id_nutricionista" value={formData.id_nutricionista || ''}>
    <option value="">Sin asignar</option>
    {nutricionistas.map((nutri) => (
        <option key={nutri.id_nutricionista} value={nutri.id_nutricionista}>
            {nutri.nombre} {nutri.apellido} - {nutri.especialidad || 'General'}
        </option>
    ))}
</select>
```

---

### **2. Vista de Nutricionistas - Botón Ver Pacientes** ✅

**Archivo:** `resources/js/pages/Nutricionistas/Index.jsx`

#### **Cambios:**
- ✅ Agregado import de icono `Eye` de lucide-react
- ✅ Botón verde "Ver Pacientes" en columna de acciones
- ✅ Link a `/nutricionistas/:id/pacientes`
- ✅ Tooltip "Ver Pacientes"

#### **Acciones disponibles:**
1. 👁️ **Ver Pacientes** (verde) - Ver lista de pacientes asignados
2. ✏️ **Editar** (azul) - Editar datos del nutricionista
3. 🗑️ **Eliminar** (rojo) - Eliminar nutricionista

---

### **3. Nueva Vista - Pacientes por Nutricionista** ✨ NUEVO

**Archivo:** `resources/js/pages/Nutricionistas/Pacientes.jsx`

#### **Características:**
- ✅ Muestra información del nutricionista (nombre, especialidad)
- ✅ Tarjetas de estadísticas:
  - Total de pacientes
  - Pacientes masculinos
  - Pacientes femeninos
  - Edad promedio
- ✅ Buscador de pacientes
- ✅ Grid de tarjetas con información detallada de cada paciente:
  - Nombre completo
  - Edad y género
  - Email y teléfono
  - Peso y estatura
  - IMC calculado
  - Alergias (si tiene)
- ✅ Botón "Editar Paciente" en cada tarjeta
- ✅ Botón "Asignar Nuevo Paciente"
- ✅ Botón "Volver a Nutricionistas"
- ✅ Mensaje cuando no hay pacientes asignados

#### **Ruta:**
```
/nutricionistas/:id/pacientes
```

---

### **4. Backend - Filtro por Nutricionista** ✅

**Archivo:** `app/Http/Controllers/Api/PacienteController.php`

#### **Cambios:**
- ✅ Agregado parámetro `nutricionista_id` en el método `index()`
- ✅ Filtro condicional: si viene `nutricionista_id`, filtra por ese nutricionista
- ✅ Mantiene la lógica existente para nutricionistas autenticados

#### **Código:**
```php
// Filtro por nutricionista específico (para la vista de pacientes por nutricionista)
if ($request->has('nutricionista_id')) {
    $query->where('id_nutricionista', $request->nutricionista_id);
}
```

---

### **5. Rutas - Nueva Ruta Agregada** ✅

**Archivo:** `resources/js/AppMain.jsx`

#### **Cambios:**
- ✅ Import de `NutricionistaPacientes`
- ✅ Ruta protegida: `/nutricionistas/:id/pacientes`

```jsx
import NutricionistaPacientes from './pages/Nutricionistas/Pacientes';

// En Routes:
<Route path="/nutricionistas/:id/pacientes" 
       element={<ProtectedRoute><NutricionistaPacientes /></ProtectedRoute>} />
```

---

## 🔄 Flujos de Trabajo

### **Flujo 1: Admin Asigna Paciente a Nutricionista**

1. Admin va a `/pacientes/nuevo` o `/pacientes/:id/editar`
2. Completa el formulario del paciente
3. Selecciona un nutricionista del dropdown
4. Guarda el paciente
5. ✅ Paciente queda asignado al nutricionista seleccionado

---

### **Flujo 2: Nutricionista Crea Paciente (Auto-asignación)**

1. Nutricionista va a `/pacientes/nuevo`
2. Completa el formulario del paciente
3. El sistema automáticamente asigna el paciente al nutricionista autenticado
4. ✅ Paciente queda asignado automáticamente

**Nota:** El `PacienteController` ya tiene esta lógica en el método `store()`:
```php
if ($user->isNutricionista()) {
    $nutricionistaId = $user->nutricionista->id_nutricionista;
}
```

---

### **Flujo 3: Ver Pacientes de un Nutricionista**

1. Admin o Nutricionista va a `/nutricionistas`
2. Click en el botón verde 👁️ "Ver Pacientes"
3. Se muestra la vista con:
   - Información del nutricionista
   - Estadísticas de pacientes
   - Lista de pacientes en tarjetas
   - Opciones para editar cada paciente
4. ✅ Puede buscar, filtrar y gestionar pacientes

---

### **Flujo 4: Reasignar Paciente a Otro Nutricionista**

1. Admin va a `/pacientes/:id/editar`
2. Cambia el nutricionista en el dropdown
3. Guarda los cambios
4. ✅ Paciente ahora está asignado al nuevo nutricionista

---

## 📊 Estructura de Datos

### **Tabla: pacientes**
```sql
id_paciente (PK)
user_id (FK → users.id)
id_nutricionista (FK → nutricionistas.id_nutricionista) -- NULLABLE
nombre
apellido
fecha_nacimiento
genero
email
telefono
peso_inicial
estatura
alergias
```

### **Relaciones:**
- `Paciente` **belongsTo** `Nutricionista` (id_nutricionista)
- `Nutricionista` **hasMany** `Paciente` (id_nutricionista)

---

## 🎨 Interfaz de Usuario

### **Vista de Nutricionistas**
```
┌─────────────────────────────────────────────────────┐
│ Nutricionistas                    [+ Nuevo]         │
├─────────────────────────────────────────────────────┤
│ [Stats Cards: Total, Pacientes, Especialidades]    │
├─────────────────────────────────────────────────────┤
│ [Búsqueda]                                          │
├─────────────────────────────────────────────────────┤
│ Tabla:                                              │
│ Nombre | Contacto | Especialidad | Pacientes       │
│ Carlos | email    | Deportiva    | 4 pacientes     │
│        | tel      |              | [👁️][✏️][🗑️]   │
└─────────────────────────────────────────────────────┘
```

### **Vista de Pacientes por Nutricionista**
```
┌─────────────────────────────────────────────────────┐
│ [← Volver] Pacientes de Carlos Rodríguez           │
│            [Nutrición Deportiva]  [+ Asignar]      │
├─────────────────────────────────────────────────────┤
│ [Stats: Total | Masculino | Femenino | Edad Prom.] │
├─────────────────────────────────────────────────────┤
│ [Búsqueda]                                          │
├─────────────────────────────────────────────────────┤
│ Grid de Tarjetas:                                   │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│ │ JG       │ │ AM       │ │ LP       │            │
│ │ Juan G.  │ │ Ana M.   │ │ Luis P.  │            │
│ │ 28 años  │ │ 35 años  │ │ 42 años  │            │
│ │ 📧 📞    │ │ 📧 📞    │ │ 📧 📞    │            │
│ │ ⚖️ 🎯   │ │ ⚖️ 🎯   │ │ ⚖️ 🎯   │            │
│ │ [Editar] │ │ [Editar] │ │ [Editar] │            │
│ └──────────┘ └──────────┘ └──────────┘            │
└─────────────────────────────────────────────────────┘
```

### **Formulario de Paciente**
```
┌─────────────────────────────────────────────────────┐
│ Nuevo Paciente                                      │
├─────────────────────────────────────────────────────┤
│ Nombre: [___________]  Apellido: [___________]     │
│ Fecha Nac: [___]       Género: [___]               │
│ Email: [___________]   Teléfono: [___________]     │
│ Nutricionista: [Carlos Rodríguez - Deportiva ▼]   │  ← NUEVO
│ Peso: [___]            Estatura: [___]             │
│ Alergias: [_____________________________]          │
│                                                     │
│ [Crear Paciente] [Cancelar]                        │
└─────────────────────────────────────────────────────┘
```

---

## 🔐 Permisos y Roles

### **Admin**
- ✅ Ver todos los nutricionistas
- ✅ Crear/Editar/Eliminar nutricionistas
- ✅ Ver pacientes de cualquier nutricionista
- ✅ Asignar/Reasignar pacientes a nutricionistas
- ✅ Crear pacientes y asignarlos manualmente

### **Nutricionista**
- ✅ Ver su propia información
- ✅ Ver solo sus pacientes asignados
- ✅ Crear nuevos pacientes (auto-asignados)
- ✅ Editar sus pacientes
- ✅ Ver lista de otros nutricionistas (para referencia)
- ❌ No puede ver pacientes de otros nutricionistas
- ❌ No puede reasignar pacientes a otros nutricionistas

### **Paciente**
- ✅ Ver su propio perfil
- ✅ Ver su nutricionista asignado
- ❌ No puede acceder a vistas de gestión

---

## 🧪 Cómo Probar

### **1. Como Admin - Asignar Paciente**
```bash
1. Login: admin@nutricion.com / password
2. Ve a: /pacientes/nuevo
3. Completa el formulario
4. Selecciona "Carlos Rodríguez - Nutrición Deportiva"
5. Guarda
6. Ve a: /nutricionistas
7. Click en 👁️ de Carlos
8. ✅ Verás el nuevo paciente en la lista
```

### **2. Como Admin - Ver Pacientes de Nutricionista**
```bash
1. Login: admin@nutricion.com / password
2. Ve a: /nutricionistas
3. Click en 👁️ "Ver Pacientes" de cualquier nutricionista
4. ✅ Verás todos sus pacientes con estadísticas
```

### **3. Como Nutricionista - Crear Paciente**
```bash
1. Login: carlos@nutricion.com / password
2. Ve a: /pacientes/nuevo
3. Completa el formulario
4. Guarda (se asigna automáticamente a Carlos)
5. Ve a: /pacientes
6. ✅ Verás el nuevo paciente en tu lista
```

### **4. Como Admin - Reasignar Paciente**
```bash
1. Login: admin@nutricion.com / password
2. Ve a: /pacientes
3. Click en "Editar" de un paciente
4. Cambia el nutricionista en el dropdown
5. Guarda
6. ✅ Paciente ahora está con el nuevo nutricionista
```

---

## 📝 Datos de Prueba

### **Nutricionistas Disponibles (del Seeder)**

| ID | Nombre | Especialidad | Pacientes Actuales |
|----|--------|--------------|-------------------|
| 1 | Carlos Rodríguez | Nutrición Deportiva | 4 |
| 2 | María López | Nutrición Clínica | 2 |
| 3 | Luis Martínez | Nutrición Pediátrica | 1 |

### **Credenciales**
```
Admin: admin@nutricion.com / password
Nutricionista 1: carlos@nutricion.com / password
Nutricionista 2: maria@nutricion.com / password
Nutricionista 3: luis@nutricion.com / password
```

---

## ✨ Características Destacadas

1. **Selector Inteligente**: Muestra nombre completo + especialidad
2. **Auto-asignación**: Nutricionistas crean pacientes auto-asignados
3. **Vista Dedicada**: Página completa para ver pacientes por nutricionista
4. **Estadísticas**: Contadores y métricas en tiempo real
5. **Búsqueda**: Filtro rápido de pacientes
6. **Diseño Responsive**: Grid adaptable a diferentes pantallas
7. **Información Completa**: Cada tarjeta muestra datos relevantes
8. **Cálculos Automáticos**: IMC y edad calculados dinámicamente
9. **Alertas Visuales**: Alergias destacadas con ⚠️
10. **Navegación Fluida**: Botones de acción en cada contexto

---

## 🚀 Próximos Pasos Sugeridos

- [ ] Agregar filtro por especialidad en selector de nutricionistas
- [ ] Implementar límite de pacientes por nutricionista
- [ ] Agregar notificación cuando se asigna/reasigna paciente
- [ ] Crear dashboard de nutricionista con sus pacientes
- [ ] Implementar chat entre nutricionista y paciente
- [ ] Agregar gráficos de progreso de pacientes

---

## ✅ Estado Actual

**COMPLETADO:**
- ✅ Selector de nutricionista en formulario de pacientes
- ✅ Botón "Ver Pacientes" en vista de nutricionistas
- ✅ Vista completa de pacientes por nutricionista
- ✅ Filtro por nutricionista en backend
- ✅ Rutas configuradas
- ✅ Permisos por rol implementados
- ✅ Auto-asignación para nutricionistas
- ✅ Estadísticas y métricas
- ✅ Diseño responsive

**RESULTADO:**
El sistema ahora permite gestionar completamente la asignación de pacientes a nutricionistas, con vistas dedicadas y funcionalidades específicas para cada rol. 🎉
