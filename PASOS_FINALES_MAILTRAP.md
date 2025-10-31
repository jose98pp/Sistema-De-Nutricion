# ✅ Configuración de Mailtrap Completada

## 🎉 ¡Ya está configurado!

He actualizado tu archivo `.env` con las credenciales de Mailtrap.

## 🚀 Pasos Finales (IMPORTANTE)

### 1. Detener el Servidor Backend
En la terminal donde está corriendo `php artisan serve`, presiona:
```
Ctrl + C
```

### 2. Limpiar Cachés
Ejecuta estos comandos:
```bash
php artisan config:clear
php artisan cache:clear
```

O usa el script que creé:
```bash
reiniciar-servidor.bat
```

### 3. Reiniciar el Servidor
```bash
php artisan serve
```

## 🧪 Probar la Recuperación de Contraseña

### Paso 1: Solicitar Recuperación
1. Ve a: `http://localhost:5173/login`
2. Haz clic en: **"¿Olvidaste tu contraseña?"**
3. Ingresa un email válido: `carlos@nutricion.com`
4. Haz clic en: **"Enviar Link de Recuperación"**
5. ✅ Deberías ver: "¡Correo Enviado!"

### Paso 2: Ver el Email en Mailtrap
1. Ve a tu cuenta de Mailtrap: https://mailtrap.io/inboxes
2. Abre tu inbox
3. Verás el email de "Recuperación de Contraseña - NutriSystem"
4. Abre el email
5. Haz clic en el botón **"Restablecer Contraseña"**

### Paso 3: Establecer Nueva Contraseña
1. Se abrirá la página de reset en tu navegador
2. Ingresa una nueva contraseña (mínimo 8 caracteres)
3. Confirma la contraseña
4. Haz clic en **"Restablecer Contraseña"**
5. ✅ Verás: "¡Contraseña Restablecida!"
6. Serás redirigido al login automáticamente

### Paso 4: Iniciar Sesión
1. Ingresa tu email
2. Ingresa la **nueva contraseña**
3. Haz clic en **"Iniciar Sesión"**
4. ✅ ¡Deberías poder acceder!

## 📧 Configuración Aplicada

```env
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=c02060749d3c0690717d42e328c6e80f
MAIL_PASSWORD=c02060749d3c0690717d42e328c6e80f
MAIL_ENCRYPTION=tls
```

## ✅ Checklist

- [ ] Servidor backend detenido (Ctrl+C)
- [ ] Cachés limpiadas (`php artisan config:clear`)
- [ ] Servidor reiniciado (`php artisan serve`)
- [ ] Frontend corriendo (`npm run dev`)
- [ ] Probado solicitar recuperación
- [ ] Email recibido en Mailtrap
- [ ] Link del email funciona
- [ ] Nueva contraseña establecida
- [ ] Login con nueva contraseña exitoso

## 🎯 Usuarios de Prueba

Puedes probar con estos usuarios:

```
Email: carlos@nutricion.com
Contraseña actual: password

Email: juan@example.com
Contraseña actual: password
```

## 🐛 Si Algo Sale Mal

### El email no llega a Mailtrap
```bash
# Verifica que el servidor esté reiniciado
# Revisa los logs
Get-Content storage/logs/laravel.log -Tail 50
```

### Error de conexión
```bash
# Limpia cachés nuevamente
php artisan config:clear
php artisan cache:clear

# Reinicia servidor
php artisan serve
```

### Token inválido
```bash
# El token expira en 60 minutos
# Solicita un nuevo link de recuperación
```

## 🎉 ¡Listo!

Una vez que sigas estos pasos, la recuperación de contraseña funcionará perfectamente con Mailtrap.

**Recuerda**: Siempre que cambies el `.env`, debes limpiar cachés y reiniciar el servidor.
