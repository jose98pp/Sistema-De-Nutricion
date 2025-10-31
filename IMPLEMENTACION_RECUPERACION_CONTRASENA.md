# Implementación de Recuperación de Contraseña

## 📋 Resumen

Se ha implementado un sistema completo de recuperación de contraseña para usuarios que olvidan sus credenciales.

## ✅ Componentes Implementados

### 1. Backend (Laravel)

#### Controller
- **Archivo**: `app/Http/Controllers/Api/PasswordResetController.php`
- **Métodos**:
  - `forgotPassword()`: Envía el email con el link de recuperación
  - `resetPassword()`: Restablece la contraseña con el token
  - `verifyToken()`: Verifica si un token es válido

#### Rutas API
- **Archivo**: `routes/api.php`
- **Rutas públicas**:
  ```php
  POST /api/forgot-password
  POST /api/reset-password
  POST /api/verify-reset-token
  ```

#### Base de Datos
- **Tabla**: `password_reset_tokens`
- **Campos**:
  - `email` (primary key)
  - `token` (hashed)
  - `created_at`
- **Migración**: `database/migrations/2025_10_31_041211_create_password_reset_tokens_table.php`

#### Notificación de Email
- **Archivo**: `app/Notifications/ResetPasswordNotification.php`
- **Características**:
  - Email personalizado en español
  - Link con token y email
  - Expiración de 60 minutos
  - Diseño profesional

#### Modelo User
- **Archivo**: `app/Models/User.php`
- **Método agregado**: `sendPasswordResetNotification()`

### 2. Frontend (React)

#### Componente ForgotPassword
- **Archivo**: `resources/js/pages/Auth/ForgotPassword.jsx`
- **Características**:
  - Formulario para solicitar recuperación
  - Validación de email
  - Pantalla de confirmación
  - Diseño moderno con modo oscuro

#### Componente ResetPassword
- **Archivo**: `resources/js/pages/Auth/ResetPassword.jsx`
- **Características**:
  - Verificación automática del token
  - Formulario para nueva contraseña
  - Validación de contraseñas coincidentes
  - Redirección automática al login
  - Manejo de errores (token expirado/inválido)

#### Rutas Frontend
- **Archivo**: `resources/js/AppMain.jsx`
- **Rutas agregadas**:
  ```jsx
  /forgot-password
  /reset-password?token=xxx&email=xxx
  ```

#### Login Actualizado
- **Archivo**: `resources/js/pages/Auth/Login.jsx`
- **Cambio**: Link "¿Olvidaste tu contraseña?" agregado

### 3. Configuración

#### Variables de Entorno (.env)
```env
APP_NAME=NutriSystem
APP_URL=http://localhost:8000
APP_FRONTEND_URL=http://localhost:5173

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@nutrisystem.com"
MAIL_FROM_NAME="${APP_NAME}"
```

## 🔄 Flujo de Recuperación

1. **Usuario olvida contraseña**
   - Hace clic en "¿Olvidaste tu contraseña?" en el login
   - Ingresa su email
   - Sistema envía email con link de recuperación

2. **Usuario recibe email**
   - Email contiene link con token único
   - Link válido por 60 minutos
   - Formato: `http://localhost:5173/reset-password?token=xxx&email=xxx`

3. **Usuario hace clic en el link**
   - Sistema verifica automáticamente el token
   - Si es válido, muestra formulario para nueva contraseña
   - Si es inválido/expirado, muestra error y opción de solicitar nuevo link

4. **Usuario establece nueva contraseña**
   - Ingresa nueva contraseña (mínimo 8 caracteres)
   - Confirma la contraseña
   - Sistema actualiza la contraseña
   - Redirección automática al login

## 🔒 Seguridad

- ✅ Tokens hasheados en base de datos
- ✅ Expiración de tokens (60 minutos)
- ✅ Validación de email existente
- ✅ Validación de contraseña (mínimo 8 caracteres)
- ✅ Confirmación de contraseña
- ✅ Tokens de un solo uso
- ✅ Rutas públicas sin autenticación

## 📧 Configuración de Email

### Para Desarrollo (Mailtrap)
1. Crear cuenta en [Mailtrap.io](https://mailtrap.io)
2. Obtener credenciales SMTP
3. Actualizar `.env`:
   ```env
   MAIL_MAILER=smtp
   MAIL_HOST=smtp.mailtrap.io
   MAIL_PORT=2525
   MAIL_USERNAME=tu_username
   MAIL_PASSWORD=tu_password
   MAIL_ENCRYPTION=tls
   ```

### Para Producción (Gmail, SendGrid, etc.)
Actualizar `.env` con las credenciales del servicio elegido.

## 🧪 Pruebas

### Probar el Flujo Completo

1. **Iniciar servidor backend**:
   ```bash
   php artisan serve
   ```

2. **Iniciar servidor frontend**:
   ```bash
   npm run dev
   ```

3. **Probar recuperación**:
   - Ir a http://localhost:5173/login
   - Hacer clic en "¿Olvidaste tu contraseña?"
   - Ingresar email de usuario existente
   - Revisar email en Mailtrap
   - Hacer clic en el link del email
   - Establecer nueva contraseña
   - Iniciar sesión con nueva contraseña

### Casos de Prueba

- ✅ Email no registrado → Error "No existe cuenta"
- ✅ Token expirado → Error "Token ha expirado"
- ✅ Token inválido → Error "Token inválido"
- ✅ Contraseñas no coinciden → Error de validación
- ✅ Contraseña muy corta → Error de validación
- ✅ Flujo exitoso → Contraseña actualizada

## 📱 UI/UX

### Características de Diseño
- ✅ Diseño moderno y profesional
- ✅ Modo oscuro completo
- ✅ Animaciones suaves
- ✅ Iconos descriptivos (Lucide React)
- ✅ Mensajes de error claros
- ✅ Estados de carga
- ✅ Responsive design
- ✅ Feedback visual inmediato

### Pantallas
1. **Forgot Password**: Formulario simple con email
2. **Email Sent**: Confirmación con instrucciones
3. **Reset Password**: Formulario para nueva contraseña
4. **Success**: Confirmación de cambio exitoso
5. **Error**: Manejo de tokens inválidos/expirados

## 🚀 Próximos Pasos (Opcional)

- [ ] Agregar límite de intentos (rate limiting)
- [ ] Historial de cambios de contraseña
- [ ] Notificación de cambio de contraseña exitoso
- [ ] Opción de "Recordar este dispositivo"
- [ ] Autenticación de dos factores (2FA)

## 📝 Notas Importantes

1. **Email en desarrollo**: Por defecto usa `MAIL_MAILER=log` que guarda emails en `storage/logs/laravel.log`
2. **Configurar Mailtrap**: Para ver emails reales en desarrollo
3. **Producción**: Configurar servicio de email real (Gmail, SendGrid, AWS SES, etc.)
4. **Tokens**: Se limpian automáticamente después de usarse
5. **Expiración**: Los tokens expiran en 60 minutos (configurable en `config/auth.php`)

## ✨ Implementación Completada

El sistema de recuperación de contraseña está completamente funcional y listo para usar.
