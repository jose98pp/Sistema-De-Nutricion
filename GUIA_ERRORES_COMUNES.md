# 🔧 Guía de Errores Comunes - Sistema de Nutrición

## 📋 Índice
1. [Error de Conexión MySQL](#error-conexion-mysql)
2. [Tablas Faltantes](#tablas-faltantes)
3. [Permisos de Archivos](#permisos)
4. [Modo Oscuro no Funciona](#modo-oscuro)

---

## 🔴 Error de Conexión MySQL

### Error:
```
SQLSTATE[HY000] [2002] No se puede establecer una conexión
Connection refused
```

### ❌ Causa:
**MySQL no está corriendo**

### ✅ Solución:

#### 1. Iniciar MySQL en XAMPP

```
1. Abre XAMPP Control Panel
2. Click en "Start" en la fila de MySQL
3. Verifica que diga "Running"
```

**Panel esperado:**
```
Module    Port    Status
Apache    80      Running
MySQL     3306    Running  ← Debe decir esto
```

#### 2. Verificar .env

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nutricion
DB_USERNAME=root
DB_PASSWORD=
```

#### 3. Limpiar Caché

```bash
php artisan config:clear
php artisan cache:clear
php artisan view:clear
```

#### 4. Probar Conexión

```bash
php test_connection.php
```

**Salida esperada:**
```
✅ CONEXIÓN EXITOSA!
📊 Base de datos: nutricion
📋 Total de tablas: 32
```

---

## 🔴 Tablas Faltantes

### Error:
```
SQLSTATE[42S02]: Base table or view not found
Table 'nutricion.calendario_entrega' doesn't exist
```

### ❌ Causa:
Tablas no fueron creadas durante las migraciones

### ✅ Solución:

```bash
# Crear tablas faltantes
php fix_missing_tables.php
```

**Tablas que deben existir:**
```
✓ direcciones
✓ calendario_entrega
✓ entrega_programada
✓ comida_receta
```

### Verificar Tablas

```bash
php artisan db:table --table=direcciones
php artisan db:table --table=calendario_entrega
```

---

## 🔴 Error: Storage No Escribible

### Error:
```
UnexpectedValueException
The stream or file "storage/logs/laravel.log" could not be opened
```

### ❌ Causa:
Permisos incorrectos en carpeta storage

### ✅ Solución:

#### Windows:
```powershell
# En PowerShell como Administrador
icacls "c:\xampp\htdocs\Nutricion\storage" /grant Everyone:(OI)(CI)F /T
icacls "c:\xampp\htdocs\Nutricion\bootstrap\cache" /grant Everyone:(OI)(CI)F /T
```

#### O manualmente:
```
1. Click derecho en carpeta "storage"
2. Propiedades → Seguridad → Editar
3. Agregar "Todos" con Control total
4. Aplicar
```

---

## 🔴 Error 419: Page Expired (CSRF)

### Error:
```
419 | PAGE EXPIRED
```

### ❌ Causa:
Token CSRF expirado

### ✅ Solución:

```bash
# Limpiar sesiones
php artisan session:clear

# Limpiar caché
php artisan cache:clear

# Recargar página con Ctrl+F5
```

---

## 🔴 Modo Oscuro No Funciona

### Error:
El botón de modo oscuro no cambia el tema

### ✅ Solución:

#### 1. Verificar ThemeContext

```jsx
// En resources/js/AppMain.jsx
import { ThemeProvider } from './context/ThemeContext';

<ThemeProvider>
    <Routes>
        ...
    </Routes>
</ThemeProvider>
```

#### 2. Verificar tailwind.config.js

```js
export default {
  darkMode: 'class', // ← Debe estar en 'class'
  content: [
    "./resources/**/*.{js,jsx,ts,tsx}",
  ],
}
```

#### 3. Recompilar Frontend

```bash
npm run dev
```

---

## 🔴 Rutas API No Funcionan

### Error:
```
404 Not Found
Route [api/pacientes] not defined
```

### ✅ Solución:

#### 1. Verificar routes/api.php

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('pacientes', PacienteController::class);
});
```

#### 2. Limpiar Caché de Rutas

```bash
php artisan route:clear
php artisan route:cache
```

#### 3. Listar Rutas

```bash
php artisan route:list
```

---

## 🔴 npm run dev No Funciona

### Error:
```
'vite' is not recognized as an internal or external command
```

### ✅ Solución:

```bash
# Instalar dependencias
npm install

# Si hay conflictos
rm -rf node_modules
rm package-lock.json
npm install

# Ejecutar
npm run dev
```

---

## 🔴 Error de Autenticación

### Error:
```
401 Unauthorized
Unauthenticated
```

### ✅ Solución:

#### 1. Verificar Token

```js
// En resources/js/api/axios.js
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;
```

#### 2. Verificar Sesión

```bash
php artisan session:clear
```

#### 3. Login Nuevamente

```
1. Cerrar sesión
2. Limpiar cookies del navegador
3. Iniciar sesión de nuevo
```

---

## 🔴 Migraciones Fallidas

### Error:
```
SQLSTATE[42000]: Syntax error or access violation
```

### ✅ Solución:

```bash
# Rollback
php artisan migrate:rollback

# Limpiar y migrar
php artisan migrate:fresh

# Si hay datos, solo migrar pendientes
php artisan migrate
```

---

## 🧰 Comandos Útiles

### Limpiar Todo

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan session:clear
```

### Optimizar

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Ver Información

```bash
# Información de BD
php artisan db:show

# Listar tablas
php artisan db:table

# Listar rutas
php artisan route:list

# Listar migraciones
php artisan migrate:status
```

---

## 🔍 Diagnóstico Rápido

### Script de Diagnóstico

Crea `diagnostico.php`:

```php
<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "🔍 DIAGNÓSTICO DEL SISTEMA\n\n";

// 1. Conexión MySQL
try {
    DB::connection()->getPdo();
    echo "✅ MySQL: Conectado\n";
    echo "   Base de datos: " . DB::connection()->getDatabaseName() . "\n";
} catch (\Exception $e) {
    echo "❌ MySQL: No conectado\n";
    echo "   Error: " . $e->getMessage() . "\n";
}

// 2. Tablas
$tables = DB::select('SHOW TABLES');
echo "\n✅ Tablas: " . count($tables) . " encontradas\n";

// 3. Usuarios
$users = DB::table('users')->count();
echo "✅ Usuarios: $users registrados\n";

// 4. Permisos
$storageWritable = is_writable(__DIR__ . '/storage');
echo $storageWritable ? "✅" : "❌";
echo " Storage: " . ($storageWritable ? "Escribible" : "No escribible") . "\n";

echo "\n✅ Diagnóstico completado\n";
```

Ejecutar:
```bash
php diagnostico.php
```

---

## 📞 Soporte Rápido

### Antes de Buscar Ayuda

1. ✅ MySQL está corriendo?
2. ✅ Archivo .env está correcto?
3. ✅ Caché limpiada?
4. ✅ Migraciones ejecutadas?
5. ✅ npm run dev corriendo?

### Logs Útiles

```bash
# Ver últimos errores
tail -f storage/logs/laravel.log

# Ver errores de Laravel
php artisan log:view

# Ver errores de npm
cat npm-debug.log
```

---

## 🎯 Checklist de Inicio

Cada vez que inicies el proyecto:

```bash
# 1. Iniciar XAMPP
# - Apache
# - MySQL

# 2. Limpiar caché
php artisan config:clear

# 3. Iniciar frontend
npm run dev

# 4. Iniciar backend (opcional)
php artisan serve

# 5. Abrir navegador
# http://localhost:8000
```

---

**¡Mantén esta guía a mano para resolver problemas rápidamente!** 🚀
