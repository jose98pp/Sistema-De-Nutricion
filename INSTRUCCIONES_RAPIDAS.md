# ⚡ Instrucciones Rápidas - Recuperación de Contraseña

## 🚀 Para Hacer que Funcione AHORA

### Opción 1: Usar el Script (Más Fácil)

1. **Detén el servidor** (Ctrl+C en la terminal donde corre)
2. **Ejecuta**: `reiniciar-servidor.bat`
3. **Inicia el servidor**: `php artisan serve`
4. **¡Listo!** Prueba en `http://localhost:5173/login`

### Opción 2: Comandos Manuales

```bash
# 1. Detener servidor (Ctrl+C)

# 2. Limpiar cachés
php artisan config:clear
php artisan cache:clear

# 3. Reiniciar
php artisan serve
```

## 🧪 Probar que Funciona

1. Ve a: `http://localhost:5173/login`
2. Clic en: **"¿Olvidaste tu contraseña?"**
3. Ingresa: `carlos@nutricion.com`
4. Clic en: **"Enviar Link de Recuperación"**
5. ✅ Deberías ver pantalla de confirmación

## 📧 Ver el Email

### Opción A: En el Log
```bash
Get-Content storage/logs/laravel.log -Tail 50
```

Busca el link que empieza con:
```
http://localhost:5173/reset-password?token=...
```

### Opción B: Configurar Mailtrap (Recomendado)

1. Crea cuenta en: https://mailtrap.io
2. Copia credenciales SMTP
3. Actualiza `.env`:
```env
MAIL_USERNAME=tu_username
MAIL_PASSWORD=tu_password
```
4. Reinicia servidor

## ❓ Si Algo Sale Mal

### Error de Conexión
```bash
# Verifica que MySQL esté corriendo en XAMPP
# Verifica credenciales en .env
```

### Email no llega
```bash
# Revisa el log
Get-Content storage/logs/laravel.log -Tail 50
```

### Token inválido
```bash
# Limpia tokens viejos
php artisan tinker
# Luego: DB::table('password_reset_tokens')->truncate();
```

## 📚 Documentación Completa

- `RESUMEN_RECUPERACION_CONTRASENA.md` - Resumen general
- `IMPLEMENTACION_RECUPERACION_CONTRASENA.md` - Detalles técnicos
- `PRUEBA_RECUPERACION_CONTRASENA.md` - Guía de pruebas
- `SOLUCION_ERROR_RECUPERACION_CONTRASENA.md` - Troubleshooting

## ✅ Checklist

- [ ] Servidor backend detenido
- [ ] Cachés limpiadas
- [ ] Servidor reiniciado
- [ ] Frontend corriendo
- [ ] Probado flujo completo
- [ ] Email configurado (opcional)

## 🎯 Lo Más Importante

**El código está completo y funcional.**

**Solo necesitas reiniciar el servidor con cachés limpias.**

**Usa el archivo `reiniciar-servidor.bat` para hacerlo fácil.**
