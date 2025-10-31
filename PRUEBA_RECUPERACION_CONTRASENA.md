# 🧪 Guía de Prueba - Recuperación de Contraseña

## Pasos para Probar la Funcionalidad

### 1. Preparación

```bash
# Asegúrate de que el servidor backend esté corriendo
php artisan serve

# En otra terminal, inicia el frontend
npm run dev
```

### 2. Configurar Email (Opcional pero Recomendado)

#### Opción A: Usar Mailtrap (Recomendado para desarrollo)

1. Ve a [https://mailtrap.io](https://mailtrap.io) y crea una cuenta gratuita
2. Crea un inbox
3. Copia las credenciales SMTP
4. Actualiza tu `.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=tu_username_de_mailtrap
MAIL_PASSWORD=tu_password_de_mailtrap
MAIL_ENCRYPTION=tls
```

5. Reinicia el servidor: `php artisan serve`

#### Opción B: Ver emails en el log

Si no configuras Mailtrap, los emails se guardarán en `storage/logs/laravel.log`

### 3. Probar el Flujo Completo

#### Paso 1: Ir a la página de login
- Abre tu navegador en: `http://localhost:5173/login`
- Verás el link "¿Olvidaste tu contraseña?" debajo del campo de contraseña

#### Paso 2: Solicitar recuperación
- Haz clic en "¿Olvidaste tu contraseña?"
- Ingresa un email de usuario existente (ejemplo: `carlos@nutricion.com`)
- Haz clic en "Enviar Link de Recuperación"
- Deberías ver una pantalla de confirmación

#### Paso 3: Revisar el email
- **Si usas Mailtrap**: Ve a tu inbox en Mailtrap y verás el email
- **Si usas log**: Abre `storage/logs/laravel.log` y busca el email al final del archivo

#### Paso 4: Copiar el link de recuperación
El link tendrá este formato:
```
http://localhost:5173/reset-password?token=XXXXXX&email=carlos@nutricion.com
```

#### Paso 5: Abrir el link
- Copia el link completo del email
- Pégalo en tu navegador
- El sistema verificará automáticamente el token
- Si es válido, verás el formulario para nueva contraseña

#### Paso 6: Establecer nueva contraseña
- Ingresa una nueva contraseña (mínimo 8 caracteres)
- Confirma la contraseña
- Haz clic en "Restablecer Contraseña"
- Verás una pantalla de éxito
- Serás redirigido al login automáticamente

#### Paso 7: Iniciar sesión con la nueva contraseña
- Ingresa tu email
- Ingresa la nueva contraseña
- Haz clic en "Iniciar Sesión"
- ¡Deberías poder acceder!

### 4. Casos de Prueba Adicionales

#### Probar con email no registrado
1. Ve a `/forgot-password`
2. Ingresa un email que no existe: `noexiste@test.com`
3. Deberías ver: "No existe una cuenta con este correo electrónico"

#### Probar con token expirado
1. Solicita un link de recuperación
2. Espera 61 minutos (o modifica manualmente el `created_at` en la BD)
3. Intenta usar el link
4. Deberías ver: "El token ha expirado"

#### Probar con token inválido
1. Copia un link de recuperación válido
2. Modifica el token en la URL
3. Intenta acceder
4. Deberías ver: "Link Inválido"

#### Probar contraseñas que no coinciden
1. Solicita recuperación y abre el link
2. Ingresa contraseña: `password123`
3. Confirma con: `password456`
4. Deberías ver: "Las contraseñas no coinciden"

#### Probar contraseña muy corta
1. Solicita recuperación y abre el link
2. Ingresa contraseña: `123`
3. Deberías ver: "La contraseña debe tener al menos 8 caracteres"

### 5. Verificar en la Base de Datos

```sql
-- Ver tokens de recuperación
SELECT * FROM password_reset_tokens;

-- Ver usuarios
SELECT id, name, email, role FROM users;

-- Limpiar tokens manualmente (si es necesario)
DELETE FROM password_reset_tokens;
```

### 6. Usuarios de Prueba

Puedes probar con estos usuarios (si existen en tu BD):

```
Email: carlos@nutricion.com
Contraseña actual: password

Email: juan@example.com
Contraseña actual: password
```

### 7. Troubleshooting

#### El email no llega
- Verifica que `MAIL_MAILER=smtp` en `.env`
- Verifica las credenciales de Mailtrap
- Reinicia el servidor: `php artisan serve`
- Revisa `storage/logs/laravel.log` para errores

#### Error "Token inválido" inmediatamente
- Verifica que la tabla `password_reset_tokens` existe
- Ejecuta: `php artisan migrate`
- Limpia la caché: `php artisan config:clear`

#### El link no funciona
- Verifica que `APP_FRONTEND_URL` esté en `.env`
- Verifica que el frontend esté corriendo en el puerto correcto
- Revisa la consola del navegador para errores

#### Error CORS
- Verifica `config/cors.php`
- Verifica `SANCTUM_STATEFUL_DOMAINS` en `.env`
- Reinicia ambos servidores

### 8. Comandos Útiles

```bash
# Limpiar caché de configuración
php artisan config:clear

# Ver rutas API
php artisan route:list --path=api

# Limpiar logs
rm storage/logs/laravel.log

# Ver últimas líneas del log
tail -f storage/logs/laravel.log

# Ejecutar migraciones
php artisan migrate

# Limpiar tokens expirados (Laravel lo hace automáticamente)
php artisan auth:clear-resets
```

## ✅ Checklist de Verificación

- [ ] Servidor backend corriendo
- [ ] Servidor frontend corriendo
- [ ] Email configurado (Mailtrap o log)
- [ ] Link "¿Olvidaste tu contraseña?" visible en login
- [ ] Formulario de recuperación funciona
- [ ] Email se envía correctamente
- [ ] Link del email funciona
- [ ] Formulario de nueva contraseña funciona
- [ ] Contraseña se actualiza correctamente
- [ ] Login con nueva contraseña funciona
- [ ] Manejo de errores funciona correctamente

## 🎉 ¡Listo!

Si todos los pasos funcionan correctamente, la implementación está completa y funcionando.
