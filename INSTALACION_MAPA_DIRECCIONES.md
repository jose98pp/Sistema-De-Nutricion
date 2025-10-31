# 📍 Instalación de Mapa Interactivo para Direcciones

## 📦 Dependencias Necesarias

Para implementar el mapa interactivo, necesitas instalar:

```bash
npm install leaflet react-leaflet
```

## 🎨 CSS de Leaflet

Agrega esto en tu archivo `resources/js/app.jsx` o en el `<head>` de `resources/views/app.blade.php`:

```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
```

O en tu `app.css`:

```css
@import 'leaflet/dist/leaflet.css';
```

## 🚀 Comando de Instalación

Ejecuta en la terminal:

```bash
npm install leaflet react-leaflet
```

Luego reinicia el servidor de desarrollo:

```bash
npm run dev
```

## ✅ Verificación

Después de instalar, verifica que no haya errores en la consola del navegador.

## 📝 Nota

Leaflet es completamente gratuito y no requiere API keys, a diferencia de Google Maps.
