# 📚 Documentación API REST - Sistema de Nutrición

## ✅ Backend Completo Implementado

### 📊 Modelos Eloquent Creados

#### Nuevos Modelos (Tablas Adicionales)
1. **Direccion** - `app/Models/Direccion.php`
   - Gestión de direcciones de pacientes con geolocalización
   - Relaciones: Paciente, EntregaProgramada

2. **Receta** - `app/Models/Receta.php`
   - Catálogo de recetas con información nutricional
   - Relaciones: Comidas (muchos a muchos)

3. **AnalisisClinico** - `app/Models/AnalisisClinico.php`
   - Registro de análisis clínicos
   - Relaciones: Evaluaciones (muchos a muchos)

4. **CalendarioEntrega** - `app/Models/CalendarioEntrega.php`
   - Calendario de entregas vinculado a contratos
   - Relaciones: Contrato, EntregaProgramada

5. **EntregaProgramada** - `app/Models/EntregaProgramada.php`
   - Gestión de entregas programadas con estados
   - Relaciones: CalendarioEntrega, Direccion, Comida

6. **AsesoramientoNutricional** - `app/Models/AsesoramientoNutricional.php`
   - Tipo especializado de servicio
   - Relaciones: Servicio

7. **Catering** - `app/Models/Catering.php`
   - Tipo especializado de servicio
   - Relaciones: Servicio

### 🎯 Controladores API Creados

#### 1. DireccionController
**Base URL:** `/api/direcciones`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/direcciones` | Listar todas las direcciones |
| GET | `/direcciones/{id}` | Obtener una dirección específica |
| POST | `/direcciones` | Crear nueva dirección |
| PUT | `/direcciones/{id}` | Actualizar dirección |
| DELETE | `/direcciones/{id}` | Eliminar dirección |
| GET | `/direcciones/paciente/{id_paciente}` | Obtener direcciones por paciente |

**Ejemplo de Petición POST:**
```json
{
  "id_paciente": 1,
  "alias": "Casa",
  "descripcion": "Calle 123, Ciudad",
  "geo_lat": -34.603722,
  "geo_lng": -58.381592
}
```

---

#### 2. RecetaController
**Base URL:** `/api/recetas`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/recetas` | Listar todas las recetas (con paginación) |
| GET | `/recetas/{id}` | Obtener una receta específica |
| POST | `/recetas` | Crear nueva receta |
| PUT | `/recetas/{id}` | Actualizar receta |
| DELETE | `/recetas/{id}` | Eliminar receta |
| POST | `/recetas/{id}/agregar-comida` | Agregar receta a una comida |
| DELETE | `/recetas/{id}/remover-comida/{id_comida}` | Remover receta de una comida |

**Ejemplo de Petición POST:**
```json
{
  "nombre": "Ensalada César",
  "kcal": 350,
  "restricciones": "Contiene gluten, huevo"
}
```

**Agregar receta a comida:**
```json
{
  "id_comida": 1,
  "porciones": 2
}
```

---

#### 3. AnalisisClinicoController
**Base URL:** `/api/analisis-clinicos`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/analisis-clinicos` | Listar análisis clínicos |
| GET | `/analisis-clinicos/{id}` | Obtener análisis específico |
| POST | `/analisis-clinicos` | Crear nuevo análisis |
| PUT | `/analisis-clinicos/{id}` | Actualizar análisis |
| DELETE | `/analisis-clinicos/{id}` | Eliminar análisis |
| POST | `/analisis-clinicos/{id}/vincular-evaluacion` | Vincular a evaluación |
| DELETE | `/analisis-clinicos/{id}/desvincular-evaluacion/{id_evaluacion}` | Desvincular de evaluación |

**Ejemplo de Petición POST:**
```json
{
  "tipo": "Análisis de Sangre",
  "resultado": "Glucosa: 95 mg/dL, Colesterol: 180 mg/dL"
}
```

---

#### 4. CalendarioEntregaController
**Base URL:** `/api/calendarios-entrega`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/calendarios-entrega` | Listar calendarios |
| GET | `/calendarios-entrega/{id}` | Obtener calendario específico |
| POST | `/calendarios-entrega` | Crear nuevo calendario |
| PUT | `/calendarios-entrega/{id}` | Actualizar calendario |
| DELETE | `/calendarios-entrega/{id}` | Eliminar calendario |
| GET | `/calendarios-entrega/contrato/{id_contrato}` | Obtener por contrato |
| GET | `/calendarios-entrega-activos` | Obtener calendarios activos |

**Ejemplo de Petición POST:**
```json
{
  "id_contrato": 1,
  "fecha_inicio": "2025-01-01",
  "fecha_fin": "2025-01-30"
}
```

---

#### 5. EntregaProgramadaController
**Base URL:** `/api/entregas-programadas`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/entregas-programadas` | Listar entregas |
| GET | `/entregas-programadas/{id}` | Obtener entrega específica |
| POST | `/entregas-programadas` | Crear nueva entrega |
| PUT | `/entregas-programadas/{id}` | Actualizar entrega |
| DELETE | `/entregas-programadas/{id}` | Eliminar entrega |
| PUT | `/entregas-programadas/{id}/marcar-entregada` | Marcar como entregada |
| PUT | `/entregas-programadas/{id}/marcar-omitida` | Marcar como omitida |
| GET | `/entregas-del-dia` | Obtener entregas del día |
| GET | `/entregas-pendientes` | Obtener entregas pendientes |
| POST | `/entregas-programadas/generar/{id_calendario}` | Generar entregas automáticamente |

**Ejemplo de Petición POST:**
```json
{
  "id_calendario": 1,
  "id_direccion": 1,
  "id_comida": 5,
  "fecha": "2025-01-15",
  "estado": "PROGRAMADA"
}
```

**Estados Disponibles:**
- `PROGRAMADA` - Entrega programada
- `PENDIENTE` - Entrega pendiente
- `ENTREGADA` - Entrega completada
- `OMITIDA` - Entrega omitida

---

### 🔗 Relaciones Actualizadas en Modelos Existentes

#### Paciente
```php
$paciente->direcciones // Obtener todas las direcciones
```

#### Comida
```php
$comida->recetas // Obtener recetas asociadas
$comida->entregas // Obtener entregas programadas
```

#### Evaluacion
```php
$evaluacion->analisisClinicos // Obtener análisis clínicos
```

#### Contrato
```php
$contrato->calendarioEntrega // Obtener calendario de entrega
```

#### Servicio
```php
$servicio->asesoramientoNutricional // Si es tipo asesoramiento
$servicio->catering // Si es tipo catering
$servicio->getServicioEspecifico() // Método helper
```

---

### 📈 Vista SQL Creada

#### comida_nutricion
Vista que calcula automáticamente los valores nutricionales totales de cada comida:

```sql
SELECT
    ac.id_comida,
    SUM(a.calorias_por_100g * ac.cantidad_gramos / 100) AS total_calorias,
    SUM(a.proteinas_por_100g * ac.cantidad_gramos / 100) AS total_proteinas,
    SUM(a.carbohidratos_por_100g * ac.cantidad_gramos / 100) AS total_carbohidratos,
    SUM(a.grasas_por_100g * ac.cantidad_gramos / 100) AS total_grasas
FROM alimento_comida ac
JOIN alimentos a ON ac.id_alimento = a.id_alimento
GROUP BY ac.id_comida
```

**Uso en Laravel:**
```php
$nutricion = DB::table('comida_nutricion')->where('id_comida', 1)->first();
```

---

### 🔐 Autenticación

Todas las rutas API (excepto `/register` y `/login`) están protegidas con **Laravel Sanctum**.

**Headers requeridos:**
```
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

---

### ✨ Características Especiales

#### 1. Generación Automática de Entregas
```php
POST /api/entregas-programadas/generar/{id_calendario}
```
Genera automáticamente entregas para todos los días del calendario.

#### 2. Filtros y Búsquedas
- **Direcciones:** Por paciente
- **Recetas:** Por nombre, restricciones
- **Entregas:** Por estado, fecha, calendario
- **Análisis:** Por tipo

#### 3. Paginación
La mayoría de endpoints soportan paginación:
```
GET /api/recetas?per_page=20&page=1
```

#### 4. Eager Loading
Los controladores usan `with()` para cargar relaciones y evitar el problema N+1:
```php
$entregas = EntregaProgramada::with([
    'calendario.contrato.paciente',
    'direccion',
    'comida'
])->get();
```

---

### 📝 Respuestas Estándar

#### Éxito (200/201)
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... }
}
```

#### Error de Validación (422)
```json
{
  "success": false,
  "errors": {
    "campo": ["Mensaje de error"]
  }
}
```

#### No Encontrado (404)
```json
{
  "success": false,
  "message": "Recurso no encontrado"
}
```

---

### 🧪 Testing con Postman/Thunder Client

**Base URL:** `http://127.0.0.1:8000/api`

#### 1. Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "admin@nutricion.com",
  "password": "password"
}
```

#### 2. Crear Dirección
```http
POST /api/direcciones
Authorization: Bearer {token}
Content-Type: application/json

{
  "id_paciente": 1,
  "alias": "Casa Principal",
  "descripcion": "Av. Siempre Viva 123",
  "geo_lat": -34.603722,
  "geo_lng": -58.381592
}
```

#### 3. Crear Receta
```http
POST /api/recetas
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "Pollo al Horno",
  "kcal": 450,
  "restricciones": "Sin gluten"
}
```

#### 4. Crear Calendario de Entrega
```http
POST /api/calendarios-entrega
Authorization: Bearer {token}
Content-Type: application/json

{
  "id_contrato": 1,
  "fecha_inicio": "2025-02-01",
  "fecha_fin": "2025-02-28"
}
```

#### 5. Generar Entregas Automáticamente
```http
POST /api/entregas-programadas/generar/1
Authorization: Bearer {token}
```

---

### 📊 Índices Creados

Para optimizar el rendimiento:
- `idx_paciente_email` en tabla `pacientes`
- `idx_evaluacion_paciente_id` en tabla `evaluaciones`
- `idx_entrega_fecha` en tabla `entrega_programada`

---

### 🎯 Próximos Pasos Sugeridos

1. **Implementar validaciones personalizadas** en FormRequest
2. **Agregar tests unitarios** para cada controlador
3. **Documentar con Swagger/OpenAPI**
4. **Implementar caché** para consultas frecuentes
5. **Agregar logging** para auditoría
6. **Implementar rate limiting** personalizado
7. **Agregar webhooks** para notificaciones en tiempo real

---

### 🐛 Troubleshooting

#### Error: "Unauthenticated"
- Verificar que el token esté en el header `Authorization: Bearer {token}`
- Verificar que el token sea válido

#### Error: "Column not found"
- Ejecutar `php artisan migrate` para crear las tablas
- Verificar que todas las migraciones se hayan ejecutado correctamente

#### Error: "Foreign key constraint"
- Asegurarse de que los registros relacionados existan
- Verificar el orden de creación de registros

---

## ✅ Resumen de Completitud

### Modelos: ✅ 100% Completo
- [x] Direccion
- [x] Receta
- [x] AnalisisClinico
- [x] CalendarioEntrega
- [x] EntregaProgramada
- [x] AsesoramientoNutricional
- [x] Catering

### Controladores: ✅ 100% Completo
- [x] DireccionController
- [x] RecetaController
- [x] AnalisisClinicoController
- [x] CalendarioEntregaController
- [x] EntregaProgramadaController

### Rutas API: ✅ 100% Completo
- [x] Todas las rutas CRUD implementadas
- [x] Rutas personalizadas agregadas
- [x] Autenticación con Sanctum

### Migraciones: ✅ 100% Completo
- [x] Todas las tablas creadas
- [x] Foreign keys configuradas
- [x] Índices optimizados
- [x] Vista SQL creada

---

**Fecha de última actualización:** 23 de Enero, 2025
**Versión del Sistema:** 1.0.0
**Laravel Version:** 10.x
