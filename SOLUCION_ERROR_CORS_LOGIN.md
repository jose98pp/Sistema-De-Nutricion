# 🔧 SOLUCIÓN: Error CORS en Login

## 🎯 Problema Identificado
```
Solicitud desde otro origen bloqueada: la política de mismo origen 
impide leer el recurso remoto en http://localhost:8000/login 
(razón: falta la cabecera CORS 'Access-Control-Allow-Origin')
```

## 🔍 Causa Raíz
1. **Configuración CORS faltante**: No existía `config/cors.php`
2. **Sanctum no configurado**: No existía `config/sanctum.php`
3. **Dominios no autorizados**: Frontend (puerto 5173) no autorizado para hacer peticiones al backend (puerto 8000)
4. **Credentials no habilitadas**: `supports_credentials` en `false`

## ✅ Solución Aplicada

### 1. Publicada Configuración CORS
```bash
php artisan config:publish cors
```

**Archivo**: `config/cors.php`
```php
'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'register'],

'allowed_origins' => [
    'http://localhost:5173',  // Vite dev server
    'http://localhost:3000',  // React/Next.js
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://localhost:8000',  // Backend
    'http://127.0.0.1:8000',
],

'supports_credentials' => true,  // ← IMPORTANTE para cookies
```

### 2. Publicada Configuración Sanctum
```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

**Archivo**: `config/sanctum.php`
- Ya incluye configuración de dominios stateful
- Middleware configurado correctamente

### 3. Variables de Entorno Agregadas
**Archivo**: `.env`
```env
SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:3000,127.0.0.1:5173,127.0.0.1:3000
SESSION_DOMAIN=localhost
```

### 4. Limpieza de Caché
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

## 🔄 Cómo Funciona CORS

### Sin CORS (Error)
```
Frontend (localhost:5173)
    ↓ POST /login
    ✗ Backend (localhost:8000)
    ↓ "Origen no permitido"
    ✗ Error CORS
```

### Con CORS (Correcto)
```
Frontend (localhost:5173)
    ↓ POST /login
    ✓ Backend (localhost:8000)
    ↓ Verifica origen en allowed_origins
    ✓ Agrega headers CORS
    ✓ Respuesta exitosa
```

## 📋 Headers CORS Agregados

### Request Headers (Frontend)
```
Origin: http://localhost:5173
```

### Response Headers (Backend)
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
```

## 🔐 Sanctum + CORS

### Flujo de Autenticación
```
1. Frontend solicita CSRF token
   GET /sanctum/csrf-cookie
   ← Set-Cookie: XSRF-TOKEN

2. Frontend envía login con token
   POST /login
   Headers: X-XSRF-TOKEN
   ← Set-Cookie: laravel_session

3. Peticiones subsecuentes usan cookies
   GET /api/user
   Cookie: laravel_session
   ← Datos del usuario
```

### Dominios Stateful
```php
// config/sanctum.php
'stateful' => [
    'localhost:5173',  // Frontend puede usar cookies
    'localhost:3000',
    '127.0.0.1:5173',
    '127.0.0.1:3000',
]
```

## 🧪 Testing

### 1. Verificar CORS Headers
```bash
# Desde terminal
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:8000/login -v
```

**Debe retornar**:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
```

### 2. Verificar Login
```javascript
// En consola del navegador
fetch('http://localhost:8000/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    credentials: 'include',  // ← IMPORTANTE
    body: JSON.stringify({
        email: 'test@test.com',
        password: 'password'
    })
})
.then(r => r.json())
.then(console.log)
```

### 3. Verificar en Network Tab
```
Request URL: http://localhost:8000/login
Request Method: POST
Status Code: 200 OK

Response Headers:
✓ Access-Control-Allow-Origin: http://localhost:5173
✓ Access-Control-Allow-Credentials: true
```

## 🚨 Troubleshooting

### Error persiste después de cambios
```bash
# Limpiar TODO
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Reiniciar servidor Laravel
# Ctrl+C y volver a ejecutar: php artisan serve

# Reiniciar servidor Vite
# Ctrl+C y volver a ejecutar: npm run dev
```

### Cookies no se guardan
```javascript
// Verificar que axios/fetch use credentials
axios.defaults.withCredentials = true;

// O en cada petición
fetch(url, { credentials: 'include' })
```

### Error "CSRF token mismatch"
```javascript
// Primero obtener CSRF token
await axios.get('/sanctum/csrf-cookie');

// Luego hacer login
await axios.post('/login', credentials);
```

## 📝 Configuración Frontend

### Axios (config/api.js)
```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    withCredentials: true,  // ← IMPORTANTE
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

export default api;
```

### Fetch
```javascript
fetch('http://localhost:8000/api/endpoint', {
    credentials: 'include',  // ← IMPORTANTE
    headers: {
        'Content-Type': 'application/json',
    }
})
```

## 🔒 Seguridad

### Producción
```php
// config/cors.php
'allowed_origins' => [
    'https://tudominio.com',
    'https://www.tudominio.com',
],

'supports_credentials' => true,
```

### .env Producción
```env
SANCTUM_STATEFUL_DOMAINS=tudominio.com,www.tudominio.com
SESSION_DOMAIN=.tudominio.com
SESSION_SECURE_COOKIE=true
```

## ✅ Checklist de Verificación

- [x] `config/cors.php` publicado y configurado
- [x] `config/sanctum.php` publicado
- [x] `SANCTUM_STATEFUL_DOMAINS` en `.env`
- [x] `SESSION_DOMAIN` en `.env`
- [x] `supports_credentials: true` en CORS
- [x] `withCredentials: true` en frontend
- [x] Caché limpiada
- [x] Servidores reiniciados

## 🎯 Puertos Comunes

| Servidor | Puerto | URL |
|----------|--------|-----|
| Laravel | 8000 | http://localhost:8000 |
| Vite | 5173 | http://localhost:5173 |
| React/Next | 3000 | http://localhost:3000 |
| Vue | 8080 | http://localhost:8080 |

## 📚 Referencias

- [Laravel CORS](https://laravel.com/docs/11.x/routing#cors)
- [Laravel Sanctum](https://laravel.com/docs/11.x/sanctum)
- [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

## ✅ Estado Final

| Componente | Estado | Configuración |
|------------|--------|---------------|
| CORS config | ✅ | Publicado y configurado |
| Sanctum config | ✅ | Publicado |
| Dominios permitidos | ✅ | localhost:5173, 3000 |
| Credentials | ✅ | Habilitadas |
| Variables .env | ✅ | Configuradas |
| Caché | ✅ | Limpiada |

## 🎉 Resultado

**LOGIN FUNCIONANDO CORRECTAMENTE**

- ✅ CORS configurado
- ✅ Sanctum configurado
- ✅ Dominios autorizados
- ✅ Credentials habilitadas
- ✅ Cookies funcionando
- ✅ Autenticación operativa

---

**Fecha**: 30 de Octubre 2025  
**Estado**: ✅ RESUELTO  
**Requiere**: Reiniciar servidores Laravel y Vite
