# 🔧 Solución - Error en Recuperación de Contraseña

## Problema Detectado

El error que estás experimentando es causado por una **configuración de base de datos cacheada** que está usando credenciales antiguas (`ultimahora58tv`).

## ✅ Solución Paso a Paso

### 1. Detener el Servidor Backend

En la terminal donde está corriendo `php artisan serve`, presiona:
```
Ctrl + C
```

### 2. Limpiar Todas las Cachés

Ejecuta estos comandos en orden:

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### 3. Verificar Configuración de Base de Datos

Abre tu archivo `.env` y verifica que tenga:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nutricion
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Reiniciar el Servidor Backend

```bash
php artisan serve
```

### 5. Probar la Recuperación de Contraseña

1. Ve a: `http://localhost:5173/login`
2. Haz clic en "¿Olvidaste tu contraseña?"
3. Ingresa un email válido (ejemplo: `carlos@nutricion.com`)
4. Haz clic en "Enviar Link de Recuperación"

## 🧪 Verificar que Funciona

### Opción A: Probar desde el Frontend

1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Network"
3. Intenta solicitar recuperación de contraseña
4. Deberías ver una respuesta 200 OK

### Opción B: Probar con PowerShell

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/forgot-password" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"; "Accept"="application/json"} `
  -Body '{"email":"carlos@nutricion.com"}' `
  -TimeoutSec 30
```

Deberías ver:
```
StatusCode        : 200
StatusDescription : OK
```

## 📧 Configurar Email (Importante)

Por defecto, los emails se guardan en el log. Para verlos:

### Ver Email en el Log

```bash
# Ver las últimas líneas del log
Get-Content storage/logs/laravel.log -Tail 50
```

Busca algo como:
```
To: carlos@nutricion.com
Subject: Recuperación de Contraseña - NutriSystem
```

### Configurar Mailtrap (Recomendado)

1. Ve a [https://mailtrap.io](https://mailtrap.io)
2. Crea una cuenta gratuita
3. Crea un inbox
4. Copia las credenciales SMTP
5. Actualiza tu `.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=tu_username_aqui
MAIL_PASSWORD=tu_password_aqui
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@nutrisystem.com"
MAIL_FROM_NAME="NutriSystem"
```

6. Reinicia el servidor:
```bash
# Detener con Ctrl+C
php artisan serve
```

## 🔍 Si Aún No Funciona

### Verificar que MySQL esté corriendo

```powershell
# Verificar si MySQL está corriendo
Get-Service | Where-Object {$_.Name -like "*mysql*"}
```

Si no está corriendo, inícialo desde XAMPP Control Panel.

### Verificar conexión a la base de datos

```bash
php artisan tinker
```

Luego ejecuta:
```php
DB::connection()->getPdo();
```

Si ves un error, verifica tus credenciales de MySQL.

### Ver logs en tiempo real

```bash
Get-Content storage/logs/laravel.log -Wait -Tail 20
```

Esto mostrará los logs en tiempo real mientras pruebas.

## 📝 Resumen de Comandos

```bash
# 1. Detener servidor (Ctrl+C en la terminal del servidor)

# 2. Limpiar cachés
php artisan config:clear
php artisan cache:clear
php artisan route:clear

# 3. Reiniciar servidor
php artisan serve

# 4. En otra terminal, iniciar frontend
npm run dev
```

## ✨ Después de Aplicar la Solución

Una vez que hayas reiniciado el servidor con la caché limpia:

1. El endpoint `/api/forgot-password` debería responder correctamente
2. El email se enviará (a Mailtrap o al log)
3. Podrás completar el flujo de recuperación de contraseña

## 🎯 Próximos Pasos

Después de que funcione:

1. Configura Mailtrap para ver los emails en un inbox real
2. Prueba el flujo completo de recuperación
3. Verifica que puedas cambiar la contraseña
4. Confirma que puedas iniciar sesión con la nueva contraseña

## ⚠️ Nota Importante

Este error ocurrió porque Laravel tenía una configuración cacheada de un proyecto anterior. Siempre que cambies el `.env`, es buena práctica ejecutar:

```bash
php artisan config:clear
```

Y reiniciar el servidor.
