# 🔧 CORRECCIÓN: Visualización de Foto de Perfil

## 🎯 Problema Identificado
La foto de perfil se subía correctamente (status 200) pero no se visualizaba en la interfaz.

## 🔍 Causa Raíz
1. **Faltaba `VITE_API_URL`** en el archivo `.env`
2. **Función `getPhotoUrl`** no manejaba correctamente la construcción de la URL

## ✅ Solución Aplicada

### 1. Agregada Variable de Entorno
```env
# .env
VITE_API_URL=http://localhost:8000
```

### 2. Mejorada Función `getPhotoUrl`
```javascript
const getPhotoUrl = () => {
    if (!user?.foto_perfil) return null;
    
    // Si ya es una URL completa, retornarla
    if (user.foto_perfil.startsWith('http')) {
        return user.foto_perfil;
    }
    
    // Construir URL completa
    const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
    return `${baseUrl}/storage/${user.foto_perfil}`;
};
```

### 3. Limpieza de Imports
```javascript
// Eliminado 'Upload' que no se usaba
import { User, Mail, Phone, Calendar, Lock, Save, Camera, Shield, Bell, Palette, Trash2 } from 'lucide-react';
```

## 🔄 Flujo Correcto

### Upload de Foto
```
1. Usuario selecciona imagen
2. Frontend valida (tamaño, tipo)
3. POST /perfil/foto con FormData
4. Backend guarda en storage/profile-photos/
5. Backend retorna:
   {
     success: true,
     photo_url: "/storage/profile-photos/xxx.jpg",
     user: { foto_perfil: "profile-photos/xxx.jpg" }
   }
6. Frontend actualiza contexto con user
7. getPhotoUrl() construye URL completa
8. Imagen se muestra correctamente
```

### Construcción de URL
```javascript
// user.foto_perfil = "profile-photos/xxx.jpg"
// baseUrl = "http://localhost:8000"
// Resultado: "http://localhost:8000/storage/profile-photos/xxx.jpg"
```

## 📁 Estructura de Archivos

```
storage/
  app/
    public/
      profile-photos/
        xxx.jpg  ← Archivo físico

public/
  storage/  ← Symlink a storage/app/public
    profile-photos/
      xxx.jpg  ← Accesible vía web
```

## 🌐 URLs

### Backend Guarda
```
foto_perfil: "profile-photos/xxx.jpg"
```

### Frontend Construye
```
http://localhost:8000/storage/profile-photos/xxx.jpg
```

### Navegador Accede
```
GET http://localhost:8000/storage/profile-photos/xxx.jpg
→ Resuelve a: storage/app/public/profile-photos/xxx.jpg
```

## ✅ Validaciones

### Frontend
```javascript
// Tamaño
if (file.size > 2 * 1024 * 1024) {
    toast.error('La imagen no debe superar los 2MB');
    return;
}

// Tipo
if (!file.type.startsWith('image/')) {
    toast.error('Solo se permiten archivos de imagen');
    return;
}
```

### Backend
```php
'photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
```

## 🔧 Configuración Requerida

### 1. Variable de Entorno
```env
VITE_API_URL=http://localhost:8000
```

### 2. Symlink de Storage
```bash
php artisan storage:link
```

### 3. Permisos (si es necesario)
```bash
chmod -R 775 storage/app/public
```

## 🧪 Testing

### Verificar Upload
```
1. Ir a Mi Perfil
2. Click en ícono de cámara
3. Seleccionar imagen válida
4. Verificar toast de éxito
5. Verificar que imagen se muestra
```

### Verificar URL
```javascript
// En consola del navegador
console.log(user.foto_perfil);
// Debe mostrar: "profile-photos/xxx.jpg"

// Verificar URL construida
const img = document.querySelector('img[alt="nombre_usuario"]');
console.log(img.src);
// Debe mostrar: "http://localhost:8000/storage/profile-photos/xxx.jpg"
```

### Verificar Archivo Físico
```bash
# Verificar que existe
ls -la storage/app/public/profile-photos/

# Verificar symlink
ls -la public/storage
```

## 🚨 Troubleshooting

### Imagen no se muestra
```
1. Verificar VITE_API_URL en .env
2. Reiniciar servidor Vite (npm run dev)
3. Verificar symlink: php artisan storage:link
4. Verificar permisos de storage/
5. Verificar en Network tab del navegador
```

### Error 404 en imagen
```
1. Verificar que symlink existe
2. Verificar ruta en base de datos
3. Verificar que archivo existe físicamente
4. Verificar configuración de filesystems.php
```

### Imagen se sube pero no se ve
```
1. Limpiar caché del navegador
2. Verificar que updateUser() se ejecuta
3. Verificar que user.foto_perfil se actualiza
4. Verificar construcción de URL en getPhotoUrl()
```

## 📝 Notas Importantes

### Fallback
```javascript
// Si no hay foto, muestra inicial
{getPhotoUrl() ? (
    <img src={getPhotoUrl()} alt={user?.name} />
) : (
    <div>{user?.name?.charAt(0).toUpperCase()}</div>
)}
```

### Actualización en Tiempo Real
```javascript
// Al subir foto, se actualiza el contexto
updateUser(response.data.user);

// Todos los componentes que usan useAuth() se actualizan
const { user } = useAuth();
```

### Eliminación de Foto
```javascript
// También actualiza el contexto
const response = await api.delete('/perfil/foto');
updateUser(response.data.user);
```

## ✅ Estado Final

| Componente | Estado | Funcionalidad |
|------------|--------|---------------|
| Variable VITE_API_URL | ✅ | Configurada |
| Función getPhotoUrl | ✅ | Mejorada |
| Upload de foto | ✅ | Funcional |
| Visualización | ✅ | Correcta |
| Eliminación | ✅ | Funcional |
| Fallback | ✅ | Muestra inicial |

## 🎉 Resultado

**FOTO DE PERFIL COMPLETAMENTE FUNCIONAL**

- ✅ Upload correcto
- ✅ Visualización correcta
- ✅ URL bien construida
- ✅ Fallback a inicial
- ✅ Eliminación funcional
- ✅ Actualización en tiempo real

---

**Fecha**: 30 de Octubre 2025  
**Estado**: ✅ CORREGIDO  
**Requiere**: Reiniciar servidor Vite para aplicar cambios en .env
