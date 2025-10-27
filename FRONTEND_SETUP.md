# Guía de Configuración del Frontend - Sistema de Nutrición

## 🎨 Stack Tecnológico

- **React 18.3** - Biblioteca UI
- **React Router DOM 6** - Enrutamiento SPA
- **Tailwind CSS 3** - Framework CSS utility-first
- **Axios** - Cliente HTTP
- **Vite 7** - Build tool y dev server

---

## 🚀 Instalación y Configuración

### 1. Instalar Dependencias de Node

```bash
npm install
```

Esto instalará:
- React y React DOM
- React Router DOM
- Axios
- Tailwind CSS y plugins
- Vite con plugin de React

### 2. Iniciar Servidor de Desarrollo

Abre **dos terminales**:

**Terminal 1 - Backend Laravel:**
```bash
php artisan serve
```
Backend disponible en: `http://127.0.0.1:8000`

**Terminal 2 - Frontend Vite:**
```bash
npm run dev
```
Frontend disponible en: `http://localhost:5173`

### 3. Acceder a la Aplicación

Abre tu navegador en: `http://localhost:5173`

---

## 📁 Estructura del Proyecto Frontend

```
resources/
├── css/
│   └── app.css                    # Estilos Tailwind + Custom
├── js/
│   ├── app.jsx                    # Punto de entrada React
│   ├── AppMain.jsx                # Componente principal con rutas
│   ├── config/
│   │   └── api.js                 # Configuración Axios + interceptors
│   ├── context/
│   │   └── AuthContext.jsx        # Contexto de autenticación
│   ├── components/
│   │   ├── Layout.jsx             # Layout principal con sidebar
│   │   └── ProtectedRoute.jsx    # HOC para rutas protegidas
│   └── pages/
│       ├── Auth/
│       │   ├── Login.jsx          # Página de login
│       │   └── Register.jsx       # Página de registro
│       ├── Dashboard.jsx          # Dashboard principal
│       ├── Pacientes/
│       │   ├── Index.jsx          # Lista de pacientes
│       │   └── Form.jsx           # Formulario crear/editar
│       ├── Alimentos/
│       │   ├── Index.jsx          # Catálogo de alimentos
│       │   └── Form.jsx           # Formulario crear/editar
│       ├── Planes/
│       │   ├── Index.jsx          # Lista de planes
│       │   ├── Form.jsx           # Crear plan
│       │   └── View.jsx           # Ver detalle del plan
│       ├── Ingestas/
│       │   ├── Index.jsx          # Historial de ingestas
│       │   └── Form.jsx           # Registrar ingesta
│       └── Evaluaciones/
│           ├── Index.jsx          # Lista de evaluaciones
│           └── Form.jsx           # Nueva evaluación

resources/views/
└── app.blade.php                  # Template HTML base

```

---

## 🎯 Características Implementadas

### ✅ Sistema de Autenticación
- Login con email y contraseña
- Registro de nuevos usuarios
- Persistencia de sesión con localStorage
- Logout y revocación de token
- Context API para estado global de auth

### ✅ Layout Responsivo
- Sidebar colapsable con navegación
- Header con información de usuario
- Menú dinámico según rol (admin, nutricionista, paciente)
- Diseño adaptativo para móvil/tablet/desktop

### ✅ Gestión de Pacientes
- Lista con búsqueda y filtros
- Crear nuevo paciente con validaciones
- Editar información de paciente
- Eliminar paciente
- Cálculo automático de IMC

### ✅ Catálogo de Alimentos
- Grid de tarjetas con información nutricional
- Búsqueda por nombre
- Filtro por categoría
- CRUD completo de alimentos
- Indicadores de restricciones alimentarias

### ✅ Dashboard
- Estadísticas generales por rol
- Tarjetas de resumen (pacientes, planes, ingestas)
- Actividad reciente
- Accesos rápidos a funcionalidades principales

### 🚧 En Desarrollo
- Creador de planes alimentarios completo
- Registro detallado de ingestas
- Sistema de evaluaciones y mediciones
- Reportes y gráficos de progreso
- Historial de adherencia al plan

---

## 🔧 Configuración

### API Base URL

Edita `resources/js/config/api.js`:

```javascript
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',  // Cambiar en producción
    // ...
});
```

### Tailwind Custom Classes

En `resources/css/app.css` hay clases personalizadas:

- `.btn-primary` - Botón primario verde
- `.btn-secondary` - Botón secundario gris
- `.card` - Tarjeta con sombra
- `.input-field` - Campo de formulario estilizado

### Colores del Tema

Configurados en `tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#22c55e',  // Verde principal
    600: '#16a34a',
    700: '#15803d',
    // ...
  }
}
```

---

## 🔐 Autenticación y Context

### Uso del AuthContext

```jsx
import { useAuth } from '../context/AuthContext';

function MiComponente() {
    const { user, login, logout, isAdmin, isNutricionista, isPaciente } = useAuth();
    
    if (isAdmin()) {
        // Lógica para admin
    }
}
```

### Rutas Protegidas

```jsx
<Route 
    path="/admin" 
    element={
        <ProtectedRoute roles={['admin']}>
            <AdminPage />
        </ProtectedRoute>
    } 
/>
```

---

## 📡 Consumo de API

### Ejemplo de Peticiones

```javascript
import api from '../config/api';

// GET con parámetros
const response = await api.get('/pacientes', {
    params: { search: 'Juan' }
});

// POST
const response = await api.post('/pacientes', {
    nombre: 'Juan',
    email: 'juan@example.com'
});

// PUT
await api.put(`/pacientes/${id}`, formData);

// DELETE
await api.delete(`/pacientes/${id}`);
```

El token se agrega automáticamente desde localStorage gracias al interceptor.

---

## 🎨 Estilos y Componentes

### Botones

```jsx
<button className="btn-primary">Guardar</button>
<button className="btn-secondary">Cancelar</button>
```

### Formularios

```jsx
<input 
    type="text"
    className="input-field"
    placeholder="Nombre..."
/>
```

### Tarjetas

```jsx
<div className="card">
    <h3>Título</h3>
    <p>Contenido...</p>
</div>
```

---

## 🚀 Build para Producción

```bash
npm run build
```

Esto genera los archivos optimizados en `public/build/`

Para servir en producción, Laravel automáticamente cargará los assets compilados.

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'react'"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Vite no se conecta al backend
Verifica que Laravel esté corriendo en `http://127.0.0.1:8000`

### CORS errors
Asegúrate de que Laravel tenga configurado CORS para `localhost:5173`

### Tailwind no aplica estilos
```bash
npm run dev
# Reinicia el servidor
```

### Token expirado / 401 Unauthorized
El interceptor automáticamente redirecciona al login. Verifica que el backend de Sanctum esté funcionando.

---

## 📚 Usuarios de Prueba

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@nutricion.com | password123 |
| Nutricionista | carlos@nutricion.com | password123 |
| Nutricionista | maria@nutricion.com | password123 |
| Paciente | juan@example.com | password123 |
| Paciente | ana@example.com | password123 |
| Paciente | luis@example.com | password123 |

---

## ✅ Checklist de Implementación

- [x] Configuración de Vite + React
- [x] Configuración de Tailwind CSS
- [x] Sistema de autenticación completo
- [x] Context API para auth
- [x] Layout con sidebar responsivo
- [x] Rutas protegidas por rol
- [x] CRUD de Pacientes
- [x] CRUD de Alimentos
- [x] Dashboard con estadísticas
- [x] **Módulo de Planes de Alimentación completo**
  - [x] Lista de planes con filtros
  - [x] Vista detallada con días y comidas
  - [x] Cálculos nutricionales por comida y día
  - [x] Indicadores de planes activos
- [x] **Módulo de Ingestas completo**
  - [x] Historial agrupado por día
  - [x] Formulario con selector de alimentos
  - [x] Cálculo de totales nutricionales en tiempo real
  - [x] Filtros por fecha y paciente
- [x] **Módulo de Evaluaciones completo**
  - [x] Lista de evaluaciones con mediciones
  - [x] Formulario con cálculo automático de IMC
  - [x] Clasificación de IMC en tiempo real
  - [x] Tipos de evaluación (Inicial, Periódica, Final)
- [x] **Reportes y gráficos de progreso**
  - [x] Página de reportes con gráficos interactivos (Recharts)
  - [x] Gráfico de evolución de peso e IMC
  - [x] Gráfico de calorías diarias
  - [x] Distribución de macronutrientes (pie chart)
  - [x] Indicador visual de adherencia
  - [x] Filtros por rango de fechas
- [x] **Creador de Planes completo**
  - [x] Formulario interactivo día por día
  - [x] Agregar/eliminar alimentos por comida
  - [x] Función copiar día completo
  - [x] Cálculo de totales por comida en tiempo real
  - [x] Vista previa nutricional
- [x] **Cálculo de adherencia al plan**
  - [x] Porcentaje basado en días con registro
  - [x] Visualización circular de progreso
  - [x] Integrado en reportes

---

## 🔄 Próximos Pasos Opcionales

1. **Sistema de Notificaciones**: Notificaciones push para recordatorios de comidas y evaluaciones
2. **PWA (Progressive Web App)**: Convertir en app instalable en dispositivos móviles
3. **Tests Automatizados**: Jest + React Testing Library para cobertura de pruebas
4. **Exportación PDF**: Generar reportes e informes descargables en PDF
5. **Sistema de Mensajería**: Chat en tiempo real entre nutricionista y paciente
6. **Carga de Imágenes**: Subir fotos de comidas y progreso físico
7. **Integración con Wearables**: Sincronización con dispositivos fitness
8. **Modo Oscuro**: Tema dark mode para mejor experiencia nocturna
9. **Recordatorios por Email**: Sistema de emails automatizados
10. **Multi-idioma**: Soporte para múltiples idiomas (i18n)

---

**Versión:** 2.0  
**Última actualización:** Octubre 2025  
**Estado:** ✅ Sistema Completo - Todas las funcionalidades core implementadas
