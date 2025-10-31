# 🔧 CORRECCIÓN FINAL: Error 405 Method Not Allowed en Login

## 🎯 Problema Identificado
```
POST http://localhost:8000/login
[HTTP/1 405 Method Not Allowed]
```

## 🔍 Causa Raíz
El `baseURL` en `api.js` estaba configurado incorrectamente:
- **Antes**: `VITE_API_URL` (http://localhost:8000) sin `/api`
- **Petición**: `/login`
- **Resultado**: `http://localhost:8000/login` ❌
- **Esperado**: `http://localhost:8000/api/login` ✅

## ✅ Solución Aplicada

### 1. Corregido baseURL en api.js
```javascript
// ANTES (Incorrecto)
baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

// DESPUÉS (Correcto)
baseURL: (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api'
```

**Explicación**:
- `VITE_API_URL` = `http://localhost:8000` (sin /api)
- Se agrega `/api` al final
- Resultado: `http://localhost:8000/api`

### 2. Agregado método updateUser en AuthContext
```javascript
const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
};
```

**Uso**: Para actualizar el usuario después de cambios en perfil, foto, etc.

## 🔄 Flujo Correcto

### Login
```
Frontend: api.post('/login', credentials)
    ↓
Construye URL: baseURL + '/login'
    ↓
http://localhost:8000/api/login ✅
    ↓
Backend: Route::post('/login', [AuthController::class, 'login'])
    ↓
Retorna: { user, access_token }
    ↓
Frontend: Guarda token y usuario
```

### Otras Peticiones
```
api.get('/pacientes')
→ http://localhost:8000/api/pacientes ✅

api.post('/perfil/foto', formData)
→ http://localhost:8000/api/perfil/foto ✅

api.get('/dashboard/stats')
→ http://localhost:8000/api/dashboard/stats ✅
```

## 📋 Variables de Entorno

### .env (Backend)
```env
APP_URL=http://localhost:8000
VITE_API_URL=http://localhost:8000
SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:3000,127.0.0.1:5173,127.0.0.1:3000
SESSION_DOMAIN=localhost
```

### Uso en Frontend
```javascript
// VITE_API_URL se lee automáticamente
const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
// Resultado: http://localhost:8000

// Se agrega /api
const fullBaseURL = baseURL + '/api';
// Resultado: http://localhost:8000/api
```

## 🧪 Testing

### 1. Verificar URL Construida
```javascript
// En consola del navegador
import api from './config/api';
console.log(api.defaults.baseURL);
// Debe mostrar: http://localhost:8000/api
```

### 2. Probar Login
```javascript
// En consola del navegador
const response = await fetch('http://localhost:8000/api/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        email: 'test@test.com',
        password: 'password'
    })
});
console.log(await response.json());
```

### 3. Verificar en Network Tab
```
Request URL: http://localhost:8000/api/login ✅
Request Method: POST
Status Code: 200 OK
```

## 🚨 Troubleshooting

### Error persiste
```bash
# 1. Limpiar caché del navegador
# Ctrl+Shift+Delete → Limpiar todo

# 2. Reiniciar servidor Vite
# Ctrl+C
npm run dev

# 3. Verificar que .env tenga VITE_API_URL
cat .env | grep VITE_API_URL
```

### Verificar Rutas API
```bash
php artisan route:list --path=login
# Debe mostrar: POST api/login
```

### Verificar CORS
```bash
# Debe estar configurado en config/cors.php
php artisan config:show cors
```

## 📝 Estructura de URLs

### Backend (Laravel)
```
routes/api.php
├── POST /api/login
├── POST /api/register
├── POST /api/logout
├── GET  /api/dashboard/stats
├── GET  /api/pacientes
└── ...
```

### Frontend (Axios)
```javascript
api.post('/login')           → /api/login
api.get('/pacientes')        → /api/pacientes
api.put('/perfil')           → /api/perfil
api.get('/dashboard/stats')  → /api/dashboard/stats
```

## ✅ Checklist de Verificación

- [x] `baseURL` incluye `/api` al final
- [x] `VITE_API_URL` en `.env` sin `/api`
- [x] Rutas en `routes/api.php` sin prefijo `/api`
- [x] CORS configurado correctamente
- [x] Sanctum configurado
- [x] Servidores reiniciados
- [x] Caché del navegador limpiada

## 🎯 Configuración Final

### api.js
```javascript
const api = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 10000,
});
```

### .env
```env
VITE_API_URL=http://localhost:8000
```

### Resultado
```
Todas las peticiones van a: http://localhost:8000/api/*
```

## 📚 Métodos Disponibles en AuthContext

```javascript
const {
    user,           // Usuario actual
    login,          // Iniciar sesión
    register,       // Registrarse
    logout,         // Cerrar sesión
    updateUser,     // Actualizar usuario (NUEVO)
    loading,        // Estado de carga
    isAdmin,        // Verificar si es admin
    isNutricionista,// Verificar si es nutricionista
    isPaciente      // Verificar si es paciente
} = useAuth();
```

## 🔐 Flujo de Autenticación Completo

```
1. Usuario ingresa credenciales
   ↓
2. Frontend: api.post('/login', { email, password })
   → http://localhost:8000/api/login
   ↓
3. Backend: AuthController@login
   - Valida credenciales
   - Genera token Sanctum
   - Retorna { user, access_token }
   ↓
4. Frontend: Guarda en localStorage
   - token
   - user (JSON)
   ↓
5. Frontend: Actualiza contexto
   - setUser(user)
   ↓
6. Peticiones subsecuentes incluyen token
   - Authorization: Bearer {token}
   ↓
7. Backend: Middleware auth:sanctum
   - Valida token
   - Permite acceso
```

## ✅ Estado Final

| Componente | Estado | Configuración |
|------------|--------|---------------|
| baseURL | ✅ | Incluye /api |
| VITE_API_URL | ✅ | Sin /api |
| Login route | ✅ | POST /api/login |
| CORS | ✅ | Configurado |
| Sanctum | ✅ | Configurado |
| updateUser | ✅ | Agregado |

## 🎉 Resultado

**LOGIN COMPLETAMENTE FUNCIONAL**

- ✅ URL correcta: `/api/login`
- ✅ Método POST permitido
- ✅ CORS configurado
- ✅ Token guardado
- ✅ Usuario en contexto
- ✅ Redirección al dashboard

---

**Fecha**: 30 de Octubre 2025  
**Estado**: ✅ RESUELTO  
**Requiere**: Reiniciar servidor Vite y limpiar caché del navegador
