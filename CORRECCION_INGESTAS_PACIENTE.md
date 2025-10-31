# ✅ Corrección - Formulario de Ingestas para Pacientes

## 🐛 Problema

Error 403 Forbidden al acceder al formulario de ingestas como paciente:

```
GET /api/planes
Status: 403 Forbidden
Message: "Forbidden access attempt"
```

## 🔍 Causa

El formulario de ingestas estaba llamando a `/planes` para obtener el plan activo, pero los pacientes no tienen permiso para acceder a ese endpoint (es solo para admin/nutricionista).

## ✅ Solución

### Separación por Rol

**Paciente**:
- Usa `/mi-plan` para obtener su plan activo
- Endpoint específico para pacientes
- Ya tiene permisos configurados

**Admin/Nutricionista**:
- Usa `/planes` para obtener planes
- Endpoint de gestión
- Permisos correctos

### Código Corregido

**Antes**:
```javascript
const fetchPlanActual = async () => {
    const response = await api.get('/planes', {...}); // ❌ 403 para pacientes
    // ...
};
```

**Después**:
```javascript
const fetchPlanActual = async () => {
    if (isPaciente()) {
        const response = await api.get('/mi-plan'); // ✅ Endpoint correcto
        const planActivo = response.data.data?.plan_activo;
        // ...
    } else {
        const response = await api.get('/planes', {...}); // ✅ Para admin/nutricionista
        // ...
    }
};
```

### También Corregido: fetchComidasDelDia

**Antes**:
```javascript
const fetchComidasDelDia = async () => {
    const response = await api.get(`/planes/${planActual.id_plan}`); // ❌ 403 para pacientes
    // ...
};
```

**Después**:
```javascript
const fetchComidasDelDia = async () => {
    if (isPaciente()) {
        planDetalle = planActual; // ✅ Ya viene con días y comidas
    } else {
        const response = await api.get(`/planes/${planActual.id_plan}`);
        planDetalle = response.data.data || response.data;
    }
    // ...
};
```

## 📊 Endpoints por Rol

### Paciente
| Acción | Endpoint | Permiso |
|--------|----------|---------|
| Ver mi plan | GET /mi-plan | ✅ Permitido |
| Ver planes (gestión) | GET /planes | ❌ Prohibido (403) |

### Admin/Nutricionista
| Acción | Endpoint | Permiso |
|--------|----------|---------|
| Ver mi plan | GET /mi-plan | ❌ No aplica |
| Ver planes (gestión) | GET /planes | ✅ Permitido |

## 🔧 Archivos Modificados

- ✅ `resources/js/pages/Ingestas/Form.jsx`

## ✅ Resultado

Ahora el formulario de ingestas:
- ✅ Funciona correctamente para pacientes
- ✅ Funciona correctamente para admin/nutricionista
- ✅ Usa los endpoints correctos según el rol
- ✅ Sin errores 403

## 🧪 Prueba

### Como Paciente
1. Login como paciente
2. Ir a "Ingestas" → "Nueva Ingesta"
3. ✅ Debería cargar sin error 403
4. ✅ Muestra el plan activo
5. ✅ Permite registrar comidas

### Como Nutricionista/Admin
1. Login como nutricionista o admin
2. Ir a "Ingestas" → "Nueva Ingesta"
3. ✅ Debería funcionar normalmente
4. ✅ Puede seleccionar paciente
5. ✅ Puede registrar ingestas

## 🎉 Conclusión

✅ **Error 403 corregido**
✅ **Formulario funciona para todos los roles**
✅ **Endpoints correctos según rol**
✅ **Listo para usar**
