# 🚀 Guía Rápida de Inicio

## ✅ Pasos para Iniciar el Sistema

### 1. Abrir Dos Terminales

Necesitas **2 terminales** abiertas en la carpeta del proyecto:

---

### 2. Terminal 1 - Backend Laravel

```bash
php artisan serve
```

✅ Backend corriendo en: **http://127.0.0.1:8000**

---

### 3. Terminal 2 - Frontend React + Vite

```bash
npm run dev
```

✅ Frontend corriendo en: **http://localhost:5173**

---

### 4. Acceder a la Aplicación

🌐 Abre tu navegador en: **http://localhost:5173**

**⚠️ IMPORTANTE:** NO uses `http://127.0.0.1:8000`, ese es el backend. El frontend está en `localhost:5173`

---

## 🔐 Credenciales de Prueba

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@nutricion.com | password123 |
| Nutricionista | carlos@nutricion.com | password123 |
| Paciente | juan@example.com | password123 |

---

## ❌ Solución de Problemas

### Error: "Cannot connect to API"
- ✅ Verifica que Laravel esté corriendo en `http://127.0.0.1:8000`
- ✅ Ejecuta: `php artisan serve`

### Error: "Vite no carga"
- ✅ Instala dependencias: `npm install`
- ✅ Ejecuta: `npm run dev`

### Error 500 en login
- ✅ Ejecuta: `php artisan migrate`
- ✅ Verifica que la base de datos esté configurada

### Pantalla en blanco
- ✅ Abre la consola del navegador (F12)
- ✅ Verifica errores en la pestaña Console
- ✅ Asegúrate de estar en `localhost:5173` no en `127.0.0.1:8000`

---

## 📊 Arquitectura

```
┌─────────────────────────────────────┐
│   Frontend React + Vite             │
│   http://localhost:5173             │
│   - Login/Register                  │
│   - Dashboard                       │
│   - Gestión de Pacientes            │
│   - Catálogo de Alimentos           │
└──────────────┬──────────────────────┘
               │ API Calls
               │ (Axios)
               ▼
┌─────────────────────────────────────┐
│   Backend Laravel API               │
│   http://127.0.0.1:8000/api        │
│   - Autenticación (Sanctum)         │
│   - Endpoints REST                  │
│   - Base de Datos MySQL             │
└─────────────────────────────────────┘
```

---

## ✅ Checklist Antes de Empezar

- [ ] MySQL corriendo (XAMPP)
- [ ] Base de datos `nutricion_fusion` creada
- [ ] Dependencias instaladas: `composer install`
- [ ] Dependencias instaladas: `npm install`
- [ ] Migraciones ejecutadas: `php artisan migrate`
- [ ] Seeders ejecutados: `php artisan db:seed`
- [ ] Archivo `.env` configurado con datos de BD

---

## 🎯 Flujo de Trabajo

1. **Iniciar Backend**: `php artisan serve` (Terminal 1)
2. **Iniciar Frontend**: `npm run dev` (Terminal 2)
3. **Abrir navegador**: `http://localhost:5173`
4. **Login** con credenciales de prueba
5. **¡Listo para usar!** 🎉

---

**Fecha:** Octubre 2025  
**Stack:** Laravel 11 + React 18 + Tailwind CSS 3 + MySQL 8
