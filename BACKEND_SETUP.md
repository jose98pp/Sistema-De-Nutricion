# Guía de Configuración del Backend - Sistema de Nutrición

## 🚀 Instalación y Configuración

### 1. Requisitos Previos
- PHP 8.2 o superior
- MySQL 8.0 o superior
- Composer instalado
- XAMPP (para desarrollo local)

### 2. Configurar Base de Datos

Edita el archivo `.env` (copia `.env.example` si no existe):

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nutricion_fusion
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Crear Base de Datos

Accede a MySQL y ejecuta:

```sql
CREATE DATABASE nutricion_fusion CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Instalar Dependencias

```bash
composer install
```

### 5. Instalar Laravel Sanctum

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### 6. Ejecutar Migraciones

```bash
php artisan migrate
```

Esto creará las siguientes tablas:
- ✅ users
- ✅ nutricionistas
- ✅ pacientes
- ✅ alimentos
- ✅ servicios
- ✅ contratos
- ✅ planes_alimentacion
- ✅ plan_dias
- ✅ comidas
- ✅ alimento_comida
- ✅ ingestas
- ✅ alimento_ingesta
- ✅ evaluaciones
- ✅ mediciones

### 7. Poblar Base de Datos con Datos de Prueba

```bash
php artisan db:seed
```

Esto creará:
- 1 Admin: `admin@nutricion.com` / `password123`
- 2 Nutricionistas: `carlos@nutricion.com` / `password123`, `maria@nutricion.com` / `password123`
- 3 Pacientes: `juan@example.com`, `ana@example.com`, `luis@example.com` / `password123`
- 30 Alimentos en catálogo
- 5 Servicios disponibles

### 8. Iniciar Servidor de Desarrollo

```bash
php artisan serve
```

El backend estará disponible en: `http://127.0.0.1:8000`

---

## 📡 API Endpoints

### Base URL
```
http://127.0.0.1:8000/api
```

### Autenticación (Públicas)

#### Registro
```http
POST /api/register
Content-Type: application/json

{
  "name": "Usuario Nuevo",
  "email": "usuario@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "paciente"
}
```

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "admin@nutricion.com",
  "password": "password123"
}
```

**Respuesta:**
```json
{
  "message": "Inicio de sesión exitoso",
  "user": { ... },
  "access_token": "1|token_generado_aqui",
  "token_type": "Bearer"
}
```

### Endpoints Protegidos (Requieren Token)

Incluye el token en todos los requests:
```http
Authorization: Bearer 1|token_generado_aqui
```

#### Pacientes
```http
GET    /api/pacientes          # Listar pacientes
POST   /api/pacientes          # Crear paciente
GET    /api/pacientes/{id}     # Ver detalle
PUT    /api/pacientes/{id}     # Actualizar
DELETE /api/pacientes/{id}     # Eliminar
```

#### Alimentos
```http
GET    /api/alimentos          # Listar (con búsqueda: ?search=manzana)
POST   /api/alimentos          # Crear
GET    /api/alimentos/{id}     # Ver detalle
PUT    /api/alimentos/{id}     # Actualizar
DELETE /api/alimentos/{id}     # Eliminar
```

#### Planes de Alimentación
```http
GET    /api/planes             # Listar (?paciente_id=1&activo=1)
POST   /api/planes             # Crear
GET    /api/planes/{id}        # Ver detalle con días y comidas
PUT    /api/planes/{id}        # Actualizar
DELETE /api/planes/{id}        # Eliminar
```

#### Ingestas
```http
GET    /api/ingestas           # Listar (?paciente_id=1&fecha_inicio=...&fecha_fin=...)
POST   /api/ingestas           # Registrar
GET    /api/ingestas/{id}      # Ver detalle
PUT    /api/ingestas/{id}      # Actualizar (< 24 horas)
DELETE /api/ingestas/{id}      # Eliminar
GET    /api/ingestas/historial/{paciente_id}  # Historial agrupado por día
```

#### Evaluaciones
```http
GET    /api/evaluaciones       # Listar (?paciente_id=1&tipo=INICIAL)
POST   /api/evaluaciones       # Crear con medición
GET    /api/evaluaciones/{id}  # Ver detalle
PUT    /api/evaluaciones/{id}  # Actualizar
DELETE /api/evaluaciones/{id}  # Eliminar
GET    /api/evaluaciones/historial/{paciente_id}  # Historial con progreso
```

---

## 🧪 Testing con Postman

### 1. Crear Colección
Importa los endpoints en Postman

### 2. Configurar Variables de Entorno
- `base_url`: `http://127.0.0.1:8000/api`
- `token`: (se llena después del login)

### 3. Flujo de Prueba Básico

1. **Login** → Copiar token de la respuesta
2. **Configurar Authorization** → Bearer Token con el token obtenido
3. **Listar Pacientes** → Verificar que funciona
4. **Crear Plan** → Usar estructura completa con días/comidas/alimentos
5. **Registrar Ingesta** → Asociar alimentos con cantidades
6. **Crear Evaluación** → Incluir mediciones antropométricas

---

## 📊 Estructura del Proyecto

```
app/
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       ├── AuthController.php
│   │       ├── PacienteController.php
│   │       ├── AlimentoController.php
│   │       ├── PlanAlimentacionController.php
│   │       ├── IngestaController.php
│   │       └── EvaluacionController.php
│   └── Middleware/
│       └── CheckRole.php
└── Models/
    ├── User.php
    ├── Nutricionista.php
    ├── Paciente.php
    ├── Alimento.php
    ├── Servicio.php
    ├── Contrato.php
    ├── PlanAlimentacion.php
    ├── PlanDia.php
    ├── Comida.php
    ├── Ingesta.php
    ├── Evaluacion.php
    └── Medicion.php

database/
├── migrations/        # 13 migraciones de tablas
└── seeders/           # UserSeeder, AlimentoSeeder, ServicioSeeder

routes/
└── api.php           # Todas las rutas de la API
```

---

## 🔐 Seguridad

- ✅ Autenticación con Laravel Sanctum
- ✅ Passwords hasheadas con bcrypt
- ✅ Validación de datos en todos los endpoints
- ✅ Middleware de roles (admin, nutricionista, paciente)
- ✅ Protección CSRF deshabilitada para API
- ✅ Rate limiting configurado

---

## 🐛 Troubleshooting

### Error: "SQLSTATE[HY000] [1049] Unknown database"
Asegúrate de crear la base de datos primero:
```sql
CREATE DATABASE nutricion_fusion;
```

### Error: "Class 'Laravel\Sanctum\...' not found"
Instala Sanctum:
```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### Error 500 en endpoints
Verifica logs:
```bash
tail -f storage/logs/laravel.log
```

### Token no funciona
1. Verifica que estés usando `Authorization: Bearer {token}`
2. Asegúrate de que el token no haya expirado
3. Revisa que la tabla `personal_access_tokens` exista

---

## 📝 Notas de Desarrollo

### Relaciones entre Modelos

- `User` → `hasOne` → `Nutricionista` / `Paciente`
- `Nutricionista` → `hasMany` → `Paciente`
- `Paciente` → `hasMany` → `PlanAlimentacion`, `Ingesta`, `Evaluacion`
- `PlanAlimentacion` → `hasMany` → `PlanDia`
- `PlanDia` → `hasMany` → `Comida`
- `Comida` → `belongsToMany` → `Alimento` (pivot: alimento_comida)
- `Ingesta` → `belongsToMany` → `Alimento` (pivot: alimento_ingesta)
- `Evaluacion` → `hasOne` → `Medicion`

### Cálculos Nutricionales

Los modelos `Comida` e `Ingesta` tienen métodos `calcularTotales()` que automáticamente suman los nutrientes de todos los alimentos según sus cantidades:

```php
$comida->calcularTotales();
// Retorna: ['calorias' => X, 'proteinas' => Y, 'carbohidratos' => Z, 'grasas' => W]
```

---

## ✅ Próximos Pasos

1. ✅ Backend completado
2. 🔄 Desarrollar Frontend con React
3. 🔄 Integrar Frontend con API
4. 🔄 Implementar reportes en PDF
5. 🔄 Agregar notificaciones
6. 🔄 Deploy en producción

---

**Versión:** 1.0  
**Última actualización:** Octubre 2025
