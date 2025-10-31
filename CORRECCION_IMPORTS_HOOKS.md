# ✅ Corrección de Imports de Hooks

## 🐛 Problema Detectado

Error de Vite al intentar importar hooks desde rutas incorrectas:

```
Failed to resolve import "../../hooks/useToast" from "resources/js/pages/Recetas/Index.jsx"
Failed to resolve import "../../hooks/useConfirm" from "resources/js/pages/Recetas/Index.jsx"
```

---

## 🔍 Causa del Error

Los hooks `useToast` y `useConfirm` NO están en la carpeta `hooks/`, sino que se exportan desde sus respectivos componentes de contexto:

- ✅ `useToast` → exportado desde `components/Toast.jsx`
- ✅ `useConfirm` → exportado desde `components/ConfirmDialog.jsx`

---

## 🔧 Archivos Corregidos

### 1. `resources/js/pages/Recetas/Index.jsx`

**Antes**:
```javascript
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';
```

**Después**:
```javascript
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';
```

---

### 2. `resources/js/pages/Nutricionistas/Index.jsx`

**Antes**:
```javascript
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';
```

**Después**:
```javascript
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';
```

---

### 3. `resources/js/pages/Contratos/Index.jsx`

**Antes**:
```javascript
import { useAuth } from '../../hooks/useAuth';
import { useConfirm } from '../../hooks/useConfirm';
```

**Después**:
```javascript
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../components/ConfirmDialog';
```

---

## ✅ Verificación

### Archivos sin errores de diagnóstico:
- ✅ `resources/js/pages/Recetas/Index.jsx`
- ✅ `resources/js/pages/Nutricionistas/Index.jsx`
- ✅ `resources/js/pages/Contratos/Index.jsx`

### Otros archivos verificados (ya correctos):
- ✅ `resources/js/pages/Servicios/Index.jsx`
- ✅ `resources/js/pages/Planes/Index.jsx`
- ✅ `resources/js/pages/Pacientes/Index.jsx`
- ✅ `resources/js/pages/Mensajes/Index.jsx`
- ✅ `resources/js/pages/Ingestas/Index.jsx`
- ✅ `resources/js/pages/FotosProgreso/Index.jsx`
- ✅ `resources/js/pages/Evaluaciones/Index.jsx`
- ✅ `resources/js/pages/Alimentos/Index.jsx`
- ✅ `resources/js/pages/Dashboard.jsx`

---

## 📚 Estructura Correcta de Imports

### Para Toast:
```javascript
import { useToast } from '../../components/Toast';

// Uso:
const toast = useToast();
toast.success('Mensaje de éxito');
toast.error('Mensaje de error');
toast.info('Mensaje informativo');
toast.warning('Mensaje de advertencia');
```

### Para ConfirmDialog:
```javascript
import { useConfirm } from '../../components/ConfirmDialog';

// Uso:
const { confirm } = useConfirm();

const confirmed = await confirm({
    title: 'Confirmar acción',
    message: '¿Estás seguro?',
    confirmText: 'Sí, continuar',
    cancelText: 'Cancelar',
    type: 'danger' // 'danger', 'warning', 'info'
});

if (confirmed) {
    // Realizar acción
}
```

### Para Auth:
```javascript
import { useAuth } from '../../context/AuthContext';

// Uso:
const { user, login, logout } = useAuth();
```

---

## 📝 Notas Importantes

1. **Context Hooks**: `useToast`, `useConfirm` y `useAuth` son hooks de contexto que se exportan desde sus componentes/contextos providers.

2. **Ubicación correcta**:
   - `useToast` → `components/Toast.jsx`
   - `useConfirm` → `components/ConfirmDialog.jsx`
   - `useAuth` → `context/AuthContext.jsx`
   - `usePerformance` → `hooks/usePerformance.js`

3. **Patrón de Imports**:
   - Componentes y sus hooks → `components/`
   - Contextos y sus hooks → `context/`
   - Hooks personalizados → `hooks/`
   - Utilidades → `utils/`
   - Configuración → `config/`

---

## 🎯 Resultado

✅ Error de Vite resuelto  
✅ Todos los imports corregidos  
✅ Sin errores de diagnóstico  
✅ Aplicación lista para ejecutarse

---

**Corregido por**: Kiro AI Assistant  
**Fecha**: 30 de Octubre, 2025  
**Estado**: ✅ Completado
