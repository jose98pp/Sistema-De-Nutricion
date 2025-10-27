### Requerimientos para el Sistema de Nutrición: Fusión de Esquemas y Desarrollo Full-Stack

A continuación, presento una **fusión optimizada de los dos esquemas SQL** (`nutricion_sistema.sql` y `NUTRICION.sql`), seleccionando **lo mejor de cada uno** para alinearse con la plantilla de casos de uso (UC) del diagrama inicial. El objetivo es mantener la simplicidad y enfoque nutricional del primero (usuarios con roles, catálogo de alimentos, planes e ingestas), mientras incorporo robustez del segundo (evaluaciones clínicas, medidas antropométricas, planes detallados por días/recetas y contratos básicos con estados). 

Evito complejidades innecesarias como logística completa (paquetes, repartidores) para no desalinear con los UC, pero agrego herencia ligera para servicios (e.g., planes vs. catering) si se expande. El esquema resultante es escalable, normalizado y soporta todos los UC (e.g., UC-05 para crear planes, UC-07 para ingestas, UC-08 para seguimiento via evaluaciones).

Posteriormente, detallo los **requerimientos funcionales y técnicos** para:
- **Backend**: API REST con Laravel (autenticación, endpoints CRUD alineados a UC).
- **Frontend**: App web con React (páginas y componentes para actores: Admin, Nutricionista, Paciente).

#### 1. Esquema de Base de Datos Fusionado (SQL)
El esquema usa MySQL con UTF8mb4, IDs auto-incrementales (INT para simplicidad, con opción a UUID si escala), timestamps automáticos y enums para estados. Total: ~15 tablas (balance entre ambos).

```sql
-- FUSIÓN: SISTEMA DE NUTRICIÓN - MODELO FÍSICO (DDL)
DROP DATABASE IF EXISTS nutricion_fusion;
CREATE DATABASE nutricion_fusion CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nutricion_fusion;

-- Usuarios base (de nutricion_sistema: roles y auth)
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  role ENUM('admin', 'nutricionista', 'paciente') NOT NULL DEFAULT 'paciente',
  email_verified_at TIMESTAMP NULL,
  password VARCHAR(255) NOT NULL,
  remember_token VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Nutricionistas (de nutricion_sistema, + especialidad de NUTRICION)
CREATE TABLE nutricionistas (
  id_nutricionista INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  telefono VARCHAR(20),
  especialidad VARCHAR(255),
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_nutricionista_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Pacientes (de nutricion_sistema, + fecha_nac, genero, medidas iniciales de NUTRICION)
CREATE TABLE pacientes (
  id_paciente INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  genero ENUM('M', 'F', 'Otro') NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  telefono VARCHAR(20),
  peso_inicial DECIMAL(5,2),
  estatura DECIMAL(4,2),  -- en metros (de NUTRICION)
  alergias TEXT,
  id_nutricionista INT UNSIGNED,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_paciente_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_paciente_nutricionista FOREIGN KEY (id_nutricionista) REFERENCES nutricionistas(id_nutricionista) ON DELETE SET NULL
);

-- Alimentos (de nutricion_sistema: catálogo básico con nutrientes)
CREATE TABLE alimentos (
  id_alimento INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  categoria ENUM('fruta', 'verdura', 'cereal', 'proteina', 'lacteo', 'grasa', 'otro') DEFAULT 'otro',
  calorias_por_100g DECIMAL(6,2),
  proteinas_por_100g DECIMAL(6,2),
  carbohidratos_por_100g DECIMAL(6,2),
  grasas_por_100g DECIMAL(6,2),
  restricciones VARCHAR(255),  -- e.g., 'sin gluten' (de NUTRICION en Receta)
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Servicios (herencia ligera de NUTRICION: base para planes/asesoramiento)
CREATE TABLE servicios (
  id_servicio INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  tipo_servicio ENUM('plan_alimenticio', 'asesoramiento', 'catering') NOT NULL,
  duracion_dias INT NOT NULL,
  costo DECIMAL(10,4) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Contratos (de NUTRICION: vincula paciente a servicio con estados)
CREATE TABLE contratos (
  id_contrato INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_paciente INT UNSIGNED NOT NULL,
  id_servicio INT UNSIGNED NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  costo_contratado DECIMAL(10,4) NOT NULL,
  estado ENUM('PENDIENTE', 'ACTIVO', 'FINALIZADO', 'CANCELADO') NOT NULL DEFAULT 'PENDIENTE',
  observaciones TEXT,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_contrato_paciente FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente) ON DELETE RESTRICT,
  CONSTRAINT fk_contrato_servicio FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio) ON DELETE RESTRICT
);

-- Planes Alimentarios (fusión: de ambos, con detalles por día de NUTRICION)
CREATE TABLE planes_alimentacion (
  id_plan INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_contrato INT UNSIGNED,  -- Vinculado a contrato (opcional)
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  fecha_inicio DATE,
  fecha_fin DATE,
  id_paciente INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_plan_contrato FOREIGN KEY (id_contrato) REFERENCES contratos(id_contrato) ON DELETE SET NULL,
  CONSTRAINT fk_plan_paciente FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente) ON DELETE CASCADE
);

-- Días de Plan (de NUTRICION: estructura por día)
CREATE TABLE plan_dias (
  id_dia INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_plan INT UNSIGNED NOT NULL,
  dia_index INT NOT NULL,  -- 1,2,3...
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_plan_dia (id_plan, dia_index),
  CONSTRAINT fk_dia_plan FOREIGN KEY (id_plan) REFERENCES planes_alimentacion(id_plan) ON DELETE CASCADE
);

-- Comidas (fusión: tipos y alimentos de nutricion_sistema)
CREATE TABLE comidas (
  id_comida INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_dia INT UNSIGNED NOT NULL,
  tipo_comida ENUM('desayuno', 'almuerzo', 'cena', 'snack') NOT NULL,
  orden INT NOT NULL,  -- Para secuencia en el día
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_comida_dia (id_dia, tipo_comida),
  CONSTRAINT fk_comida_dia FOREIGN KEY (id_dia) REFERENCES plan_dias(id_dia) ON DELETE CASCADE
);

-- Alimentos en Comida (muchos-a-muchos de nutricion_sistema)
CREATE TABLE alimento_comida (
  id_alimento_comida INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_comida INT UNSIGNED NOT NULL,
  id_alimento INT UNSIGNED NOT NULL,
  cantidad_gramos DECIMAL(6,2) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_alimento_comida_comida FOREIGN KEY (id_comida) REFERENCES comidas(id_comida) ON DELETE CASCADE,
  CONSTRAINT fk_alimento_comida_alimento FOREIGN KEY (id_alimento) REFERENCES alimentos(id_alimento) ON DELETE CASCADE
);

-- Ingestas (de nutricion_sistema: tracking paciente)
CREATE TABLE ingestas (
  id_ingesta INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  fecha_hora DATETIME NOT NULL,
  id_paciente INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ingesta_paciente FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente) ON DELETE CASCADE
);

-- Alimentos en Ingesta (de nutricion_sistema)
CREATE TABLE alimento_ingesta (
  id_alimento_ingesta INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_ingesta INT UNSIGNED NOT NULL,
  id_alimento INT UNSIGNED NOT NULL,
  cantidad_gramos DECIMAL(6,2) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_alimento_ingesta_ingesta FOREIGN KEY (id_ingesta) REFERENCES ingestas(id_ingesta) ON DELETE CASCADE,
  CONSTRAINT fk_alimento_ingesta_alimento FOREIGN KEY (id_alimento) REFERENCES alimentos(id_alimento) ON DELETE CASCADE
);

-- Evaluaciones (de NUTRICION: para UC-08 seguimiento)
CREATE TABLE evaluaciones (
  id_evaluacion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_paciente INT UNSIGNED NOT NULL,
  id_nutricionista INT UNSIGNED NOT NULL,
  tipo ENUM('INICIAL', 'PERIODICA', 'FINAL') NOT NULL,
  fecha DATETIME NOT NULL,
  observaciones TEXT,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_evaluacion_paciente FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente) ON DELETE RESTRICT,
  CONSTRAINT fk_evaluacion_nutricionista FOREIGN KEY (id_nutricionista) REFERENCES nutricionistas(id_nutricionista) ON DELETE RESTRICT
);

-- Mediciones (de NUTRICION: antropométricas)
CREATE TABLE mediciones (
  id_medicion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_evaluacion INT UNSIGNED NOT NULL,
  peso_kg DECIMAL(5,2) NOT NULL,
  altura_m DECIMAL(4,2) NOT NULL,
  porc_grasa DECIMAL(5,2),
  masa_magra_kg DECIMAL(5,2),
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_medicion_evaluacion FOREIGN KEY (id_evaluacion) REFERENCES evaluaciones(id_evaluacion) ON DELETE CASCADE
);

-- Índices recomendados para performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_pacientes_nutricionista ON pacientes(id_nutricionista);
CREATE INDEX idx_ingestas_fecha ON ingestas(fecha_hora);
CREATE INDEX idx_evaluaciones_paciente ON evaluaciones(id_paciente);
```

**Justificación de la Fusión**:
- **De nutricion_sistema**: Usuarios/roles (esencial para UC-01/02), alimentos/ingestas (para UC-04/07), planes/comidas (UC-05/06).
- **De NUTRICION**: Evaluaciones/mediciones (mejora UC-08), contratos/estados (agrega valor sin complejidad), estructura por días/recetas (enriquecimiento de planes).
- **Mejoras**: Enums consistentes, restricciones FK para integridad, campos como `restricciones` en alimentos.

#### 2. Requerimientos para Backend: API REST con Laravel
**Versión**: Laravel 11.x (octubre 2025). Usa Sanctum para auth, Eloquent para ORM, y migraciones para el esquema fusionado.

##### Requerimientos Funcionales (Alineados a UC)
- **Autenticación (UC-01/02/10)**: Registro/login con roles (JWT/Sanctum). Middleware para roles (e.g., solo nutricionista en UC-03).
- **Gestión Pacientes (UC-03)**: CRUD pacientes, asignar nutricionista.
- **Catálogo Alimentos (UC-04)**: CRUD alimentos con filtros por categoría/restricciones.
- **Planes/Contratos (UC-05/06)**: Crear/editar planes (incluyendo días/comidas/alimentos), vincular a contratos/estados.
- **Ingestas (UC-07)**: Registrar ingestas diarias por paciente (con validación de cantidades).
- **Seguimiento/Historial (UC-08/09)**: Listar evaluaciones/mediciones, historial ingestas/planes por fecha/paciente.
- **Reportes (UC-11)**: Generar PDF/JSON resúmenes (e.g., progreso peso, nutrientes totales) para admin.
- **General**: Paginación, validaciones (e.g., email único), logs de auditoría.

##### Requerimientos Técnicos
- **Estructura Proyecto**:
  - `composer create-project laravel/laravel backend-nutricion`.
  - Instalar: `sanctum`, `maatwebsite/excel` (para reportes), `barryvdh/laravel-dompdf`.
  - Migraciones: Una por tabla (e.g., `php artisan make:migration create_users_table`), con el esquema arriba.
  - Modelos: Eloquent con relaciones (e.g., `Paciente` hasMany `Ingestas`, belongsTo `Nutricionista`).
- **Endpoints API (v1)**:
  | Método | Endpoint | Descripción | Autenticación/Rol | Ejemplo Body |
  |--------|----------|-------------|-------------------|--------------|
  | POST | `/api/register` | Registrar usuario | Público | `{ "name": "...", "email": "...", "password": "...", "role": "paciente" }` |
  | POST | `/api/login` | Iniciar sesión | Público | `{ "email": "...", "password": "..." }` → Token |
  | GET/POST | `/api/pacientes` | Listar/crear pacientes | Bearer + Nutricionista | `{ "nombre": "...", "peso_inicial": 70.5 }` |
  | PUT | `/api/pacientes/{id}` | Editar paciente (UC-10) | Bearer + Nutricionista | `{ "peso_inicial": 72.0 }` |
  | POST | `/api/alimentos` | Registrar alimento | Bearer + Admin | `{ "nombre": "Manzana", "calorias_por_100g": 52 }` |
  | POST | `/api/planes` | Crear plan (UC-05) | Bearer + Nutricionista | `{ "nombre": "...", "dias": [{ "dia_index": 1, "comidas": [...] }] }` |
  | POST | `/api/ingestas` | Registrar ingesta (UC-07) | Bearer + Paciente | `{ "fecha_hora": "2025-10-20 12:00", "alimentos": [{ "id_alimento": 1, "cantidad_gramos": 100 }] }` |
  | GET | `/api/evaluaciones/{paciente_id}` | Historial evaluaciones (UC-09) | Bearer + Nutricionista/Paciente | - |
  | GET | `/api/reportes/{paciente_id}` | Generar reporte (UC-11) | Bearer + Admin | Query params: `?tipo=progreso&fecha_inicio=...` |
- **Mejores Prácticas**: CORS habilitado para React, rate limiting, validación con Form Requests, seeds para datos de prueba.
- **Testing**: PHPUnit para unitarios (e.g., auth), Pest para feature tests (endpoints).
- **Despliegue**: Docker para dev, env vars para DB/prod (e.g., .env con DB_CONNECTION=mysql).

#### 3. Requerimientos para Frontend: App Web con React
**Versión**: React 18.x con Vite (para build rápido). Usa Axios para API, React Router para rutas, Zustand para state global (simple vs. Redux).

##### Requerimientos Funcionales (Alineados a Actores/UC)
- **Layout General**: Header con login/logout, sidebar por rol (e.g., Paciente ve dashboard ingestas; Nutricionista ve pacientes).
- **Autenticación (UC-01/02/10)**: Formularios login/registro, guardado de token en localStorage.
- **Dashboard Paciente**: Registrar ingestas (UC-07), ver historial (UC-09), editar perfil.
- **Dashboard Nutricionista**: Gestionar pacientes (UC-03), crear planes/comidas (UC-05/06), seguimiento evaluaciones (UC-08).
- **Admin**: Reportes (UC-11), gestión alimentos (UC-04).
- **General**: Formularios reactivos (Formik + Yup), tablas paginadas (React Table), gráficos de progreso (Recharts para peso/nutrientes).

##### Requerimientos Técnicos
- **Estructura Proyecto**:
  - `npm create vite@latest frontend-nutricion -- --template react`.
  - Instalar: `axios`, `react-router-dom`, `zustand`, `@hookform/resolvers`, `yup`, `recharts`, `react-toastify` (notificaciones).
  - Carpetas: `src/components/` (e.g., IngestaForm), `src/pages/` (e.g., PlanesPage), `src/services/` (API calls), `src/store/` (Zustand stores para auth/user).
- **Rutas Principales** (React Router):
  | Ruta | Componente | Descripción | Acceso |
  |------|------------|-------------|--------|
  | `/` | LoginPage | Form login/registro | Público |
  | `/dashboard` | Dashboard | Resumen por rol | Autenticado |
  | `/pacientes` | PacientesList | Listar/editar (UC-03) | Nutricionista |
  | `/planes/nuevo` | PlanForm | Crear plan con días/comidas (UC-05) | Nutricionista |
  | `/ingestas` | IngestasForm/List | Registrar/ver (UC-07/09) | Paciente |
  | `/evaluaciones/:idPaciente` | EvaluacionesPage | Seguimiento (UC-08) | Nutricionista/Paciente |
  | `/reportes` | ReportesPage | Generar/descargar (UC-11) | Admin |
- **Componentes Clave**:
  - `AuthGuard`: Protege rutas por rol (usa store para token/role).
  - `AlimentoSelector`: Autocomplete para seleccionar alimentos en ingestas/planes.
  - `NutrientesChart`: Gráfico lineal de ingestas vs. plan (usa datos de API).
- **Mejores Prácticas**: Hooks personalizados (e.g., `useApi` para fetches), responsive (Tailwind CSS o Material-UI), error handling con toasts, lazy loading para rutas.
- **Testing**: Jest + React Testing Library para componentes, Cypress para E2E (e.g., flujo login → ingesta).
- **Despliegue**: Build con Vite (`npm run build`), servir con Nginx/Apache, proxy a Laravel en `/api`.

**Próximos Pasos**: Ejecuta las migraciones en Laravel (`php artisan migrate`), prueba endpoints con Postman, y conecta React via Axios (baseURL: `http://localhost:8000/api`). Si necesitas código de ejemplo (e.g., un modelo Laravel o componente React), ¡avísame! Este setup cubre el 100% de los UC con escalabilidad.

---

## 4. Requerimientos Funcionales Detallados (RF)

### 4.1 Módulo de Autenticación y Usuarios

**RF-01: Registro de Usuarios**
- **Prioridad**: Alta
- **Descripción**: El sistema debe permitir el registro de nuevos usuarios con roles específicos.
- **Entradas**: Nombre completo, email, contraseña, confirmación de contraseña, rol (paciente por defecto).
- **Salidas**: Confirmación de registro exitoso, email de verificación.
- **Validaciones**:
  - Email único en el sistema
  - Contraseña mínimo 8 caracteres con al menos 1 mayúscula, 1 número y 1 carácter especial
  - Campos obligatorios completos
- **Actor**: Usuario no autenticado
- **Relacionado**: UC-01

**RF-02: Inicio de Sesión**
- **Prioridad**: Alta
- **Descripción**: Los usuarios registrados deben poder autenticarse en el sistema.
- **Entradas**: Email, contraseña.
- **Salidas**: Token de autenticación (JWT/Sanctum), datos del usuario, redirección según rol.
- **Validaciones**:
  - Credenciales válidas
  - Cuenta verificada (opcional)
  - Máximo 5 intentos fallidos antes de bloqueo temporal (15 min)
- **Actor**: Usuario registrado
- **Relacionado**: UC-02

**RF-03: Cierre de Sesión**
- **Prioridad**: Media
- **Descripción**: Los usuarios autenticados pueden cerrar su sesión de forma segura.
- **Entradas**: Token de sesión.
- **Salidas**: Token invalidado, redirección a página de login.
- **Actor**: Usuario autenticado
- **Relacionado**: UC-10

**RF-04: Gestión de Perfiles**
- **Prioridad**: Media
- **Descripción**: Los usuarios pueden ver y editar su información personal.
- **Entradas**: Datos personales (nombre, teléfono, foto de perfil).
- **Salidas**: Confirmación de actualización, datos actualizados.
- **Validaciones**: Solo el propio usuario o admin puede editar
- **Actor**: Usuario autenticado
- **Relacionado**: UC-10

### 4.2 Módulo de Gestión de Pacientes

**RF-05: Registro de Pacientes**
- **Prioridad**: Alta
- **Descripción**: Los nutricionistas deben poder registrar nuevos pacientes en el sistema.
- **Entradas**: Nombre, apellido, fecha de nacimiento, género, email, teléfono, peso inicial, estatura, alergias.
- **Salidas**: ID de paciente, confirmación de registro.
- **Validaciones**:
  - Email único
  - Fecha de nacimiento válida (mayor a 1900, menor a hoy)
  - Peso entre 20-300 kg, Estatura entre 0.50-2.50 m
- **Actor**: Nutricionista
- **Relacionado**: UC-03

**RF-06: Consulta de Pacientes**
- **Prioridad**: Alta
- **Descripción**: Los nutricionistas pueden listar y buscar pacientes asignados.
- **Entradas**: Filtros opcionales (nombre, email, nutricionista).
- **Salidas**: Lista paginada de pacientes con datos básicos.
- **Validaciones**: Nutricionistas solo ven sus pacientes asignados, Admins ven todos
- **Actor**: Nutricionista, Admin
- **Relacionado**: UC-03

**RF-07: Edición de Pacientes**
- **Prioridad**: Media
- **Descripción**: Actualizar información de pacientes existentes.
- **Entradas**: ID del paciente, campos a actualizar.
- **Salidas**: Datos actualizados, registro de auditoría.
- **Validaciones**: Solo el nutricionista asignado o admin puede editar
- **Actor**: Nutricionista, Admin
- **Relacionado**: UC-03

### 4.3 Módulo de Alimentos

**RF-08: Registro de Alimentos**
- **Prioridad**: Alta
- **Descripción**: Administradores pueden agregar alimentos al catálogo.
- **Entradas**: Nombre, categoría, información nutricional por 100g (calorías, proteínas, carbohidratos, grasas), restricciones.
- **Salidas**: ID de alimento, confirmación de registro.
- **Validaciones**: Nombre único por categoría, valores nutricionales >= 0
- **Actor**: Admin, Nutricionista
- **Relacionado**: UC-04

**RF-09: Búsqueda de Alimentos**
- **Prioridad**: Alta
- **Descripción**: Buscar alimentos en el catálogo con filtros.
- **Entradas**: Término de búsqueda, filtros (categoría, restricciones).
- **Salidas**: Lista de alimentos coincidentes con información nutricional.
- **Validaciones**: Búsqueda case-insensitive
- **Actor**: Todos los usuarios autenticados
- **Relacionado**: UC-04

### 4.4 Módulo de Planes Alimentarios

**RF-10: Creación de Planes**
- **Prioridad**: Alta
- **Descripción**: Nutricionistas crean planes alimentarios personalizados para pacientes.
- **Entradas**: Datos del plan (nombre, descripción, fechas), estructura por días con comidas y alimentos.
- **Salidas**: ID del plan, plan completo con cálculos nutricionales totales.
- **Validaciones**: Nutricionista debe ser el asignado al paciente, al menos 1 día con 1 comida
- **Actor**: Nutricionista
- **Relacionado**: UC-05

**RF-11: Visualización de Planes**
- **Prioridad**: Alta
- **Descripción**: Pacientes y nutricionistas pueden ver planes activos y pasados.
- **Entradas**: ID paciente, filtros de fecha.
- **Salidas**: Lista de planes con detalles completos, resumen nutricional por día.
- **Validaciones**: Pacientes solo ven sus propios planes, nutricionistas ven planes de sus pacientes
- **Actor**: Paciente, Nutricionista
- **Relacionado**: UC-06, UC-09

### 4.5 Módulo de Ingestas

**RF-12: Registro de Ingestas**
- **Prioridad**: Alta
- **Descripción**: Pacientes registran sus ingestas diarias reales.
- **Entradas**: Fecha y hora, lista de alimentos con cantidades.
- **Salidas**: ID ingesta, cálculo nutricional total, comparación con plan del día.
- **Validaciones**: Fecha no futura, cantidades > 0, al menos 1 alimento
- **Actor**: Paciente
- **Relacionado**: UC-07

**RF-13: Historial de Ingestas**
- **Prioridad**: Alta
- **Descripción**: Consultar ingestas registradas por rango de fechas.
- **Entradas**: ID paciente, fechas inicio/fin.
- **Salidas**: Lista de ingestas con totales nutricionales por día, gráficos de tendencias.
- **Validaciones**: Pacientes solo su historial, nutricionistas el de sus pacientes
- **Actor**: Paciente, Nutricionista
- **Relacionado**: UC-09

### 4.6 Módulo de Evaluaciones y Seguimiento

**RF-14: Registro de Evaluaciones**
- **Prioridad**: Alta
- **Descripción**: Nutricionistas registran evaluaciones clínicas de pacientes.
- **Entradas**: Tipo (INICIAL, PERIODICA, FINAL), fecha, mediciones (peso, altura, % grasa, masa magra), observaciones.
- **Salidas**: ID evaluación, cálculos automáticos (IMC, variación de peso).
- **Validaciones**: Solo nutricionista asignado, una evaluación INICIAL por paciente
- **Actor**: Nutricionista
- **Relacionado**: UC-08

**RF-15: Historial de Evaluaciones**
- **Prioridad**: Alta
- **Descripción**: Consultar evolución del paciente mediante evaluaciones.
- **Entradas**: ID paciente.
- **Salidas**: Línea de tiempo de evaluaciones, gráficos de progreso (peso, IMC, % grasa).
- **Validaciones**: Acceso según rol
- **Actor**: Paciente, Nutricionista
- **Relacionado**: UC-08, UC-09

### 4.7 Módulo de Reportes

**RF-16: Reporte de Progreso Individual**
- **Prioridad**: Alta
- **Descripción**: Generar reporte PDF/Excel del progreso de un paciente.
- **Entradas**: ID paciente, rango de fechas.
- **Salidas**: Documento con gráficos de peso, IMC, adherencia al plan, tabla de evaluaciones, resumen nutricional.
- **Validaciones**: Solo nutricionista/admin
- **Actor**: Nutricionista, Admin
- **Relacionado**: UC-11

**RF-17: Dashboard Estadístico**
- **Prioridad**: Media
- **Descripción**: Panel con estadísticas generales para admin.
- **Salidas**: Total de pacientes activos, planes creados en el mes, tasa de adherencia promedio.
- **Actor**: Admin
- **Relacionado**: UC-11

---

## 5. Requerimientos No Funcionales (RNF)

### 5.1 Rendimiento

**RNF-01: Tiempo de Respuesta**
- Las consultas a la base de datos deben responder en menos de 500ms para el 95% de las peticiones.
- La carga de páginas principales no debe exceder 2 segundos en conexiones de banda ancha.
- **Métrica**: Tiempo promedio de respuesta de API < 300ms

**RNF-02: Concurrencia**
- El sistema debe soportar al menos 100 usuarios concurrentes sin degradación de rendimiento.
- Las APIs deben manejar 1000 peticiones por minuto.
- **Métrica**: 95% de requests exitosos bajo carga de 100 usuarios simultáneos

**RNF-03: Escalabilidad**
- La arquitectura debe permitir escalado horizontal (múltiples instancias del backend).
- La base de datos debe soportar crecimiento a 100,000 registros de ingestas sin impacto significativo.
- **Métrica**: Tiempo de respuesta no aumenta más del 10% al duplicar volumen de datos

### 5.2 Seguridad

**RNF-04: Autenticación y Autorización**
- Tokens de sesión deben expirar después de 24 horas de inactividad.
- Implementar HTTPS obligatorio para todas las comunicaciones.
- Contraseñas deben almacenarse con hashing bcrypt (factor 10+).
- **Estándar**: OWASP Top 10 compliance

**RNF-05: Protección de Datos**
- Cumplir con principios de protección de datos personales (GDPR/LOPD).
- Datos sensibles (mediciones, evaluaciones) solo accesibles por usuarios autorizados.
- Logs de auditoría para acciones críticas (eliminaciones, cambios de permisos).
- **Estándar**: ISO 27001 recomendaciones básicas

**RNF-06: Validación de Entrada**
- Todas las entradas de usuario deben validarse en frontend y backend.
- Protección contra inyección SQL mediante ORM (Eloquent).
- Sanitización de inputs para prevenir XSS.
- **Estándar**: OWASP Input Validation Cheat Sheet

**RNF-07: Rate Limiting**
- Limitar intentos de login a 5 por IP cada 15 minutos.
- APIs públicas limitadas a 60 peticiones por minuto por usuario.
- **Implementación**: Laravel Throttle Middleware

### 5.3 Disponibilidad

**RNF-08: Uptime**
- Disponibilidad del 99.5% mensual (máximo 3.6 horas de downtime).
- Ventanas de mantenimiento planificado fuera de horario laboral.
- **Métrica**: SLA 99.5% uptime

**RNF-09: Recuperación ante Fallos**
- Backups automáticos de la base de datos diarios (retención de 30 días).
- Sistema de logs para debugging y auditoría (rotación de 90 días).
- RTO (Recovery Time Objective): 2 horas
- RPO (Recovery Point Objective): 24 horas

### 5.4 Usabilidad

**RNF-10: Interfaz de Usuario**
- Diseño responsive compatible con dispositivos móviles (viewport 320px+).
- Accesibilidad nivel AA según WCAG 2.1 (contraste, navegación por teclado).
- Interfaz en español con opción a inglés (i18n).
- **Estándar**: Material Design o Bootstrap guidelines

**RNF-11: Experiencia de Usuario**
- Formularios con validación en tiempo real y mensajes de error claros.
- Tiempos de carga indicados con loaders/skeletons.
- Notificaciones toast para confirmaciones/errores (no invasivas).
- **Métrica**: SUS (System Usability Scale) > 70

**RNF-12: Curva de Aprendizaje**
- Usuarios nuevos deben poder registrar su primera ingesta en menos de 5 minutos.
- Tutorial interactivo opcional para nutricionistas nuevos.
- **Métrica**: 90% de usuarios completan tarea básica sin ayuda

### 5.5 Mantenibilidad

**RNF-13: Código**
- Cobertura de tests unitarios mínima del 70%.
- Seguir estándares PSR-12 para PHP, ESLint para JavaScript.
- Documentación de API con Swagger/OpenAPI.
- **Herramientas**: PHPUnit, Jest, PHPStan

**RNF-14: Modularidad**
- Arquitectura en capas (Presentación, Lógica de Negocio, Datos).
- Modelos de negocio desacoplados del framework.
- **Patrón**: Repository Pattern para acceso a datos

**RNF-15: Versionamiento**
- Control de versiones con Git (GitFlow).
- Versionamiento semántico de API (v1, v2).
- **Convención**: Conventional Commits

### 5.6 Compatibilidad

**RNF-16: Navegadores**
- Soportar últimas 2 versiones de Chrome, Firefox, Safari, Edge.
- Degradación elegante en navegadores antiguos (IE11 no soportado).
- **Herramienta**: Browserslist configuration

**RNF-17: Dispositivos**
- Responsive design para móviles (iOS 14+, Android 10+).
- Touch-friendly interfaces (botones mínimo 44x44px).
- **Framework**: TailwindCSS o Material-UI

### 5.7 Portabilidad

**RNF-18: Despliegue**
- Contenerización con Docker para entornos reproducibles.
- Variables de entorno para configuración (sin hardcoding).
- **Stack**: Docker Compose, nginx, MySQL, Redis

**RNF-19: Integraciones**
- Capacidad de integrar bases de datos nutricionales externas (USDA, Bedca).
- Webhooks para notificaciones (email, SMS).
- **Formato**: RESTful APIs, JSON

### 5.8 Documentación

**RNF-20: Documentación Técnica**
- Manual de instalación y configuración.
- Documentación de API (Swagger/Postman Collection).
- Guía de contribución para desarrolladores.
- **Ubicación**: README.md, /docs folder

**RNF-21: Documentación de Usuario**
- Manual de usuario por rol (Admin, Nutricionista, Paciente).
- FAQs y troubleshooting común.
- Videos tutoriales opcionales.
- **Formato**: PDF, Wiki o centro de ayuda online

---

## 6. Casos de Uso Expandidos

### UC-01: Registro de Usuario

**ID**: UC-01  
**Actor Principal**: Usuario no registrado  
**Objetivo**: Crear una cuenta en el sistema  
**Precondiciones**: Ninguna  
**Postcondiciones**: Usuario registrado con rol paciente por defecto  
**Prioridad**: Alta

**Flujo Principal**:
1. El usuario accede a la página de registro (`/register`)
2. El sistema muestra formulario con campos: nombre, email, contraseña, confirmar contraseña
3. El usuario completa los campos y hace clic en "Registrar"
4. El sistema valida:
   - Email no registrado previamente
   - Contraseña cumple requisitos (min 8 caracteres, 1 mayúscula, 1 número, 1 especial)
   - Las contraseñas coinciden
5. El sistema crea la cuenta con rol "paciente"
6. El sistema envía email de verificación al correo proporcionado
7. El sistema muestra mensaje "Cuenta creada. Revisa tu email para verificar"
8. **Fin del caso de uso**

**Flujos Alternos**:
- **4a. Email ya registrado**:
  - 4a1. Sistema muestra error "Este email ya está registrado"
  - 4a2. Usuario puede intentar login o usar otro email
  - 4a3. Retornar al paso 3
- **4b. Contraseña débil**:
  - 4b1. Sistema muestra "La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial"
  - 4b2. Retornar al paso 3
- **6a. Error al enviar email**:
  - 6a1. Sistema registra error en logs pero permite el registro
  - 6a2. Usuario puede reenviar email desde su perfil posteriormente

**Requerimientos Relacionados**: RF-01  
**Frecuencia de Uso**: Alta (nuevos usuarios)

---

### UC-02: Iniciar Sesión

**ID**: UC-02  
**Actor Principal**: Usuario registrado  
**Objetivo**: Autenticarse en el sistema  
**Precondiciones**: Usuario debe estar registrado  
**Postcondiciones**: Usuario autenticado con sesión activa  
**Prioridad**: Alta

**Flujo Principal**:
1. El usuario accede a la página de login (`/login`)
2. El sistema muestra formulario con campos: email, contraseña
3. El usuario ingresa sus credenciales y hace clic en "Iniciar Sesión"
4. El sistema valida credenciales contra la base de datos
5. El sistema genera token de autenticación (JWT/Sanctum)
6. El sistema almacena el token en localStorage del navegador
7. El sistema redirige al usuario según su rol:
   - **Admin** → `/dashboard/admin` (estadísticas generales)
   - **Nutricionista** → `/pacientes` (lista de pacientes)
   - **Paciente** → `/ingestas` (registro de comidas)
8. **Fin del caso de uso**

**Flujos Alternos**:
- **4a. Credenciales inválidas**:
  - 4a1. Sistema incrementa contador de intentos fallidos para esa IP
  - 4a2. Sistema muestra error "Email o contraseña incorrectos"
  - 4a3. Si intentos >= 5, bloquear IP por 15 minutos
  - 4a4. Retornar al paso 3 (si no está bloqueado)
- **4b. Cuenta no verificada**:
  - 4b1. Sistema muestra "Por favor verifica tu email antes de iniciar sesión"
  - 4b2. Sistema ofrece botón "Reenviar email de verificación"
  - 4b3. Usuario puede verificar y retornar al paso 1

**Requerimientos Relacionados**: RF-02  
**Frecuencia de Uso**: Muy alta (diaria por usuario)

---

### UC-03: Gestionar Pacientes

**ID**: UC-03  
**Actor Principal**: Nutricionista  
**Objetivo**: Registrar y administrar información de pacientes  
**Precondiciones**: Usuario autenticado como nutricionista  
**Postcondiciones**: Paciente creado/actualizado en el sistema  
**Prioridad**: Alta

**Flujo Principal (Registro de Paciente)**:
1. El nutricionista accede a `/pacientes` y hace clic en "Nuevo Paciente"
2. El sistema muestra formulario con campos:
   - Datos personales: nombre, apellido, fecha nacimiento, género, email, teléfono
   - Datos clínicos: peso inicial (kg), estatura (m), alergias/restricciones alimentarias
3. El nutricionista completa todos los campos obligatorios
4. El sistema valida:
   - Email único (no existe otro paciente con ese email)
   - Fecha de nacimiento válida (entre 1900 y fecha actual)
   - Peso entre 20-300 kg, Estatura entre 0.50-2.50 m
5. El sistema asigna automáticamente al nutricionista actual como responsable
6. El sistema crea el registro del paciente en la base de datos
7. El sistema envía email de invitación al paciente para crear su cuenta
8. El sistema muestra mensaje "Paciente registrado exitosamente" con ID asignado
9. El sistema redirige a la vista de detalles del paciente
10. **Fin del caso de uso**

**Flujo Alterno (Consulta de Pacientes)**:
1. El nutricionista accede a `/pacientes`
2. El sistema muestra tabla paginada con pacientes asignados (nombre, edad, peso actual, último plan)
3. El nutricionista puede:
   - Buscar por nombre/email en barra de búsqueda
   - Filtrar por características (rango de edad, IMC, etc.)
   - Ordenar por columnas (nombre, fecha registro)
4. El nutricionista hace clic en una fila para ver detalles completos
5. **Fin del caso de uso**

**Flujo Alterno (Edición de Paciente)**:
1. Desde la lista de pacientes, el nutricionista hace clic en botón "Editar" (ícono lápiz)
2. El sistema muestra formulario prellenado con datos actuales
3. El nutricionista modifica campos necesarios
4. El nutricionista hace clic en "Guardar Cambios"
5. El sistema valida datos (mismas reglas que registro)
6. El sistema actualiza el registro
7. El sistema registra auditoría (quién, cuándo, qué cambió)
8. El sistema muestra confirmación "Paciente actualizado"
9. **Fin del caso de uso**

**Flujos de Excepción**:
- **4a. Email duplicado**:
  - 4a1. Sistema muestra "Ya existe un paciente con este email"
  - 4a2. Retornar al paso 3
- **4b. Datos antropométricos fuera de rango**:
  - 4b1. Sistema muestra advertencia "Revisa los valores de peso/estatura"
  - 4b2. Nutricionista puede confirmar si los datos son correctos o corregir

**Requerimientos Relacionados**: RF-05, RF-06, RF-07  
**Frecuencia de Uso**: Alta (varias veces al día)

---

### UC-05: Crear Plan Alimentario

**ID**: UC-05  
**Actor Principal**: Nutricionista  
**Objetivo**: Diseñar un plan nutricional personalizado para un paciente  
**Precondiciones**: 
- Nutricionista autenticado
- Paciente asignado al nutricionista
- Catálogo de alimentos disponible  
**Postcondiciones**: Plan activo asociado al paciente  
**Prioridad**: Alta

**Flujo Principal**:
1. El nutricionista accede al perfil del paciente
2. El nutricionista hace clic en pestaña "Planes" → botón "Nuevo Plan"
3. El sistema muestra formulario de datos generales:
   - Nombre del plan (ej: "Plan Hiperproteico Semana 1")
   - Descripción/objetivos
   - Fecha inicio y fecha fin
4. El nutricionista completa datos generales y hace clic en "Siguiente"
5. El sistema muestra editor de estructura del plan con interfaz de días
6. El nutricionista hace clic en "Agregar Día" (se crea Día 1)
7. Por cada día, el nutricionista:
   - 7a. Hace clic en "Agregar Comida"
   - 7b. Selecciona tipo (desayuno, almuerzo, cena, snack)
   - 7c. En la comida, hace clic en "Agregar Alimento"
   - 7d. Busca alimento en catálogo (autocomplete)
   - 7e. Ingresa cantidad en gramos
   - 7f. Sistema muestra cálculo nutricional en tiempo real
   - 7g. Repite 7c-7f para más alimentos en la misma comida
8. El nutricionista repite pasos 6-7 para crear más días (ej: Día 2, Día 3...)
9. El sistema calcula automáticamente:
   - Totales por comida (calorías, proteínas, carbohidratos, grasas)
   - Totales por día
   - Promedios del plan completo
10. El nutricionista revisa el plan en vista resumen (muestra todos los días/comidas)
11. El nutricionista hace clic en "Guardar Plan"
12. El sistema valida:
    - Al menos 1 día con 1 comida configurada
    - Todas las cantidades > 0
    - Fecha inicio < fecha fin
    - Nutricionista es el asignado al paciente
13. El sistema guarda el plan en la base de datos
14. El sistema envía notificación al paciente (email + notificación in-app)
15. El sistema muestra confirmación "Plan creado exitosamente" con link al plan
16. **Fin del caso de uso**

**Flujos Alternos**:
- **7d. Alimento no encontrado en catálogo**:
  - 7d1. Nutricionista puede hacer clic en "Solicitar nuevo alimento"
  - 7d2. Sistema envía solicitud a admin
  - 7d3. Nutricionista continúa con otros alimentos
- **12a. Plan incompleto (sin días o comidas)**:
  - 12a1. Sistema muestra error "El plan debe tener al menos 1 día con 1 comida"
  - 12a2. Retornar al paso 6
- **Duplicar plan existente**:
  - Usuario selecciona "Duplicar" desde un plan anterior
  - Sistema copia estructura completa
  - Nutricionista ajusta según necesidad

**Requerimientos Relacionados**: RF-10  
**Frecuencia de Uso**: Media-Alta (1-2 veces por paciente al mes)

---

### UC-07: Registrar Ingesta

**ID**: UC-07  
**Actor Principal**: Paciente  
**Objetivo**: Registrar alimentos consumidos en el día  
**Precondiciones**: Paciente autenticado  
**Postcondiciones**: Ingesta guardada y comparada con plan del día  
**Prioridad**: Alta

**Flujo Principal**:
1. El paciente accede a `/ingestas`
2. El sistema muestra interfaz de registro con fecha/hora actual
3. El paciente hace clic en "Registrar Nueva Ingesta"
4. El sistema muestra formulario:
   - Campo fecha/hora (prellenado con ahora)
   - Sección "Alimentos consumidos" (vacía inicialmente)
5. El paciente hace clic en "Agregar Alimento"
6. El sistema muestra buscador de alimentos
7. El paciente busca y selecciona un alimento (ej: "Pollo pechuga")
8. El sistema solicita cantidad en gramos
9. El paciente ingresa cantidad (ej: 150g)
10. El sistema agrega el alimento a la lista y muestra cálculo nutricional parcial
11. El paciente repite pasos 5-10 para todos los alimentos de esa comida
12. El sistema muestra totales calculados (calorías, macros)
13. El paciente hace clic en "Guardar Ingesta"
14. El sistema valida:
    - Fecha no es futura
    - Al menos 1 alimento agregado
    - Cantidades > 0
15. El sistema guarda la ingesta
16. El sistema compara con el plan del día (si existe):
    - Muestra % de adherencia
    - Diferencias en calorías y macros
17. El sistema muestra confirmación "Ingesta registrada"
18. **Fin del caso de uso**

**Flujos Alternos**:
- **16a. Paciente no tiene plan activo**:
  - 16a1. Sistema solo muestra totales, sin comparación
- **Editar ingesta reciente**:
  - Usuario selecciona ingesta del día
  - Sistema permite modificar si han pasado < 24 horas
- **Foto de comida** (opcional):
  - Paciente puede adjuntar foto antes de guardar
  - Sistema almacena imagen y asocia a ingesta

**Requerimientos Relacionados**: RF-12  
**Frecuencia de Uso**: Muy alta (3-5 veces al día por paciente)

---

## 7. Reglas de Negocio (RN)

### 7.1 Gestión de Usuarios y Roles

**RN-01: Jerarquía de Roles**
- Los roles siguen la jerarquía: Admin > Nutricionista > Paciente
- Un admin puede realizar todas las operaciones de nutricionista y paciente
- Un nutricionista solo puede gestionar sus pacientes asignados
- Un paciente solo puede ver y modificar su propia información

**RN-02: Asignación de Nutricionista**
- Un paciente debe tener asignado exactamente un nutricionista responsable
- Un nutricionista puede tener múltiples pacientes asignados
- Solo un admin puede reasignar pacientes entre nutricionistas
- Al crear un paciente, se asigna automáticamente al nutricionista que lo registra

**RN-03: Verificación de Email**
- La verificación de email es opcional pero recomendada
- Usuarios no verificados pueden acceder al sistema con funcionalidad limitada
- El sistema permite reenviar email de verificación hasta 3 veces por día

### 7.2 Planes Alimentarios

**RN-04: Vigencia de Planes**
- Un plan tiene fecha de inicio y fecha de fin
- Solo puede haber un plan ACTIVO por paciente a la vez
- Un plan se considera ACTIVO si: fecha_actual >= fecha_inicio AND fecha_actual <= fecha_fin
- Planes pasados quedan como histórico (no se eliminan)

**RN-05: Estructura de Planes**
- Un plan debe tener al menos 1 día configurado
- Cada día debe tener al menos 1 comida
- Las comidas permitidas son: desayuno, almuerzo, cena, snack
- Puede haber solo 1 comida de cada tipo por día
- Cada comida debe tener al menos 1 alimento con cantidad > 0

**RN-06: Modificación de Planes**
- Solo el nutricionista asignado puede modificar planes de un paciente
- Un admin puede modificar cualquier plan
- Planes finalizados (fecha_fin < fecha_actual) no pueden modificarse
- Al modificar un plan activo, el paciente recibe notificación

**RN-07: Cálculos Nutricionales**
- Los valores nutricionales se calculan proporcionalmente: (valor_por_100g * cantidad_gramos) / 100
- Los totales por día son la suma de todas las comidas
- El promedio del plan es la media de todos los días

### 7.3 Ingestas

**RN-08: Registro de Ingestas**
- Un paciente puede registrar múltiples ingestas por día
- No hay límite de ingestas diarias
- La fecha/hora de ingesta no puede ser futura
- Las ingestas se pueden registrar retroactivamente (hasta 7 días atrás)

**RN-09: Edición de Ingestas**
- Solo el paciente dueño puede editar sus ingestas
- El nutricionista asignado puede ver pero no editar ingestas
- Las ingestas solo pueden editarse dentro de las 24 horas posteriores al registro
- Después de 24 horas, solo se pueden eliminar (no editar)

**RN-10: Adherencia al Plan**
- La adherencia se calcula comparando ingestas reales vs. plan del día
- Fórmula: adherencia = 100 - (|calorías_plan - calorías_ingesta| / calorías_plan * 100)
- Rango aceptable: ±10% de las calorías planificadas
- Si no hay plan activo, no se calcula adherencia

### 7.4 Evaluaciones y Mediciones

**RN-11: Evaluación Inicial**
- Todo paciente debe tener una evaluación INICIAL antes de cualquier otra
- Solo puede haber una evaluación INICIAL por paciente
- La evaluación INICIAL registra el estado basal del paciente

**RN-12: Evaluaciones Periódicas**
- Se recomienda una evaluación PERIODICA cada 15-30 días
- No hay límite de evaluaciones periódicas
- Las evaluaciones periódicas permiten seguimiento de progreso

**RN-13: Evaluación Final**
- Una evaluación FINAL marca el cierre de un ciclo de tratamiento
- Puede haber múltiples evaluaciones FINAL (si el paciente regresa)
- Después de una evaluación FINAL, el siguiente debe ser INICIAL o PERIODICA

**RN-14: Cálculos Antropométricos**
- IMC = peso_kg / (altura_m²)
- Clasificación IMC: <18.5 Bajo peso, 18.5-24.9 Normal, 25-29.9 Sobrepeso, ≥30 Obesidad
- Variación de peso = peso_actual - peso_evaluación_anterior
- El sistema calcula y almacena estos valores automáticamente

### 7.5 Catálogo de Alimentos

**RN-15: Información Nutricional**
- Los valores nutricionales se expresan por 100 gramos
- Los valores deben ser >= 0 (no negativos)
- Suma teórica: (proteínas * 4) + (carbohidratos * 4) + (grasas * 9) ≈ calorías (±10%)
- El sistema advierte pero no impide inconsistencias (datos de fuentes externas)

**RN-16: Restricciones Alimentarias**
- Los alimentos pueden tener múltiples restricciones (gluten, lactosa, etc.)
- Al crear planes, el sistema advierte si hay alimentos con restricciones que el paciente tiene
- El nutricionista puede ignorar la advertencia si es apropiado

**RN-17: Categorización**
- Cada alimento pertenece a una única categoría
- Categorías: fruta, verdura, cereal, proteína, lácteo, grasa, otro
- Los alimentos nuevos deben ser aprobados por un admin antes de estar disponibles

### 7.6 Contratos y Servicios

**RN-18: Estados de Contrato**
- Flujo de estados: PENDIENTE → ACTIVO → FINALIZADO/CANCELADO
- Un contrato PENDIENTE está esperando confirmación o pago
- Un contrato ACTIVO está en ejecución
- FINALIZADO: completado exitosamente
- CANCELADO: terminado antes de tiempo

**RN-19: Vinculación Plan-Contrato**
- Un plan puede estar vinculado a un contrato (opcional)
- Un contrato puede tener múltiples planes asociados
- Si un contrato se CANCELA, sus planes asociados quedan inactivos

**RN-20: Duración de Servicios**
- La duración del servicio (en días) es informativa
- Los contratos pueden extenderse modificando fecha_fin
- El costo contratado se mantiene fijo (no se recalcula automáticamente)

---

## 8. Restricciones y Suposiciones

### 8.1 Restricciones Técnicas

**RT-01: Tecnologías Obligatorias**
- Backend: Laravel 11.x con PHP 8.2+
- Frontend: React 18.x con Vite
- Base de datos: MySQL 8.0+ o MariaDB 10.6+
- Autenticación: Laravel Sanctum

**RT-02: Infraestructura**
- El sistema debe poder ejecutarse en XAMPP/WAMP para desarrollo local
- Producción: Linux con nginx o Apache
- Mínimo: 2GB RAM, 10GB disco para el servidor
- Base de datos en el mismo servidor (puede separarse después)

**RT-03: Dependencias Externas**
- Requiere conexión a internet para envío de emails (SMTP)
- Librerías de terceros: instalables via Composer (PHP) y npm (JS)
- No depende de APIs externas para funcionalidad básica

### 8.2 Restricciones de Negocio

**RB-01: Privacidad**
- Los datos de pacientes son confidenciales
- No se pueden compartir datos entre nutricionistas sin autorización
- El sistema debe cumplir con regulaciones locales de protección de datos

**RB-02: Límites Operacionales**
- Máximo 1000 pacientes activos por nutricionista (recomendado: 50-100)
- Máximo 365 días de duración por plan alimentario
- Máximo 50 alimentos por comida
- Máximo 30 días configurables en un plan (puede extenderse con días duplicados)

**RB-03: Costos**
- El sistema no procesa pagos (fuera del alcance)
- Los contratos registran costos pero no integran pasarelas de pago
- La facturación se gestiona externamente

### 8.3 Suposiciones

**S-01: Usuarios**
- Los usuarios tienen conocimientos básicos de navegación web
- Los nutricionistas conocen conceptos nutricionales (calorías, macros)
- Los pacientes pueden leer y escribir

**S-02: Datos**
- La información nutricional ingresada es precisa
- Los pacientes registran sus ingestas honestamente
- Las mediciones antropométricas son tomadas correctamente

**S-03: Ambiente**
- Conexión a internet estable
- Navegadores modernos (últimas 2 versiones)
- JavaScript habilitado en el navegador

**S-04: Operación**
- El sistema estará disponible 24/7 excepto mantenimientos
- Habrá soporte técnico para usuarios
- Se realizarán backups regulares

---

## 9. Glosario de Términos

**Adherencia**: Porcentaje de cumplimiento del paciente respecto a su plan alimentario. Se calcula comparando ingestas reales vs. planificadas.

**Admin/Administrador**: Usuario con máximos privilegios en el sistema. Gestiona usuarios, alimentos y reportes globales.

**Alimento**: Item del catálogo con información nutricional por 100g (calorías, proteínas, carbohidratos, grasas).

**API REST**: Interfaz de programación que permite comunicación entre frontend y backend usando protocolo HTTP.

**Bearer Token**: Token de autenticación que se envía en el header de las peticiones HTTP para identificar al usuario.

**Comida**: Tiempo de alimentación dentro de un día (desayuno, almuerzo, cena, snack). Contiene uno o más alimentos.

**Contrato**: Acuerdo formal entre paciente y servicio nutricional. Define servicio, duración y costo.

**Eloquent ORM**: Herramienta de Laravel para interactuar con la base de datos usando modelos en lugar de SQL directo.

**Evaluación**: Registro clínico realizado por el nutricionista. Incluye mediciones antropométricas y observaciones.

**IMC (Índice de Masa Corporal)**: Cálculo: peso(kg) / altura(m)². Indicador de peso saludable.

**Ingesta**: Registro de alimentos consumidos por el paciente en un momento específico. Incluye fecha/hora y lista de alimentos con cantidades.

**JWT (JSON Web Token)**: Estándar para tokens de autenticación. Usado por Sanctum.

**Macronutrientes (Macros)**: Proteínas, carbohidratos y grasas. Principales nutrientes que aportan energía.

**Middleware**: Filtro en Laravel que se ejecuta antes de procesar una petición (ej: verificar autenticación).

**Migración**: Archivo de Laravel que define estructura de tablas de base de datos. Permite versionamiento del esquema.

**Nutricionista**: Usuario profesional que gestiona pacientes, crea planes alimentarios y realiza seguimiento.

**Paciente**: Usuario que recibe servicios nutricionales. Registra ingestas y visualiza su progreso.

**Plan Alimentario**: Programa nutricional personalizado. Estructura: días → comidas → alimentos con cantidades.

**Restricción Alimentaria**: Limitación dietética del paciente (ej: intolerancia a lactosa, celiaquía). Los alimentos pueden tener tags de restricciones.

**Sanctum**: Sistema de autenticación de Laravel para SPAs (Single Page Applications).

**Seed**: Archivo de Laravel que puebla la base de datos con datos de prueba o iniciales.

**SPA (Single Page Application)**: Aplicación web que carga una sola página HTML y actualiza contenido dinámicamente (como React).

**Validación**: Proceso de verificar que los datos ingresados cumplen reglas de negocio antes de guardarlos.

---

## 10. Matriz de Trazabilidad

Relación entre Casos de Uso, Requerimientos Funcionales y Módulos del Sistema:

| Caso de Uso | Requerimientos Funcionales | Módulos Involucrados | Prioridad |
|-------------|---------------------------|----------------------|-----------|
| UC-01: Registro | RF-01 | Autenticación | Alta |
| UC-02: Login | RF-02 | Autenticación | Alta |
| UC-03: Gestionar Pacientes | RF-05, RF-06, RF-07 | Pacientes, Usuarios | Alta |
| UC-04: Gestionar Alimentos | RF-08, RF-09 | Alimentos | Alta |
| UC-05: Crear Plan | RF-10 | Planes, Alimentos | Alta |
| UC-06: Ver Plan | RF-11 | Planes | Alta |
| UC-07: Registrar Ingesta | RF-12 | Ingestas, Alimentos | Alta |
| UC-08: Evaluaciones | RF-14, RF-15 | Evaluaciones, Mediciones | Alta |
| UC-09: Historial | RF-13, RF-15 | Ingestas, Evaluaciones | Alta |
| UC-10: Gestionar Perfil | RF-03, RF-04 | Usuarios | Media |
| UC-11: Reportes | RF-16, RF-17 | Reportes, Todas | Media |

### Matriz de Requerimientos No Funcionales

| RNF | Categoría | Prioridad | Verificación |
|-----|-----------|-----------|--------------|
| RNF-01 | Rendimiento | Alta | Testing de carga, monitoreo APM |
| RNF-02 | Rendimiento | Alta | Testing de concurrencia |
| RNF-03 | Escalabilidad | Media | Pruebas con volumen creciente |
| RNF-04 | Seguridad | Alta | Auditoría de seguridad, penetration testing |
| RNF-05 | Seguridad | Alta | Revisión legal, logs de auditoría |
| RNF-06 | Seguridad | Alta | Testing de inyección, XSS |
| RNF-07 | Seguridad | Media | Pruebas de rate limiting |
| RNF-08 | Disponibilidad | Media | Monitoreo uptime, SLA tracking |
| RNF-09 | Disponibilidad | Alta | Pruebas de recuperación, backups |
| RNF-10 | Usabilidad | Alta | Testing responsive, WCAG validator |
| RNF-11 | Usabilidad | Media | Testing UX, feedback usuarios |
| RNF-12 | Usabilidad | Media | Testing con usuarios reales |
| RNF-13 | Mantenibilidad | Alta | Code coverage, linters |
| RNF-14 | Mantenibilidad | Media | Revisión arquitectura |
| RNF-15 | Mantenibilidad | Media | Audit de commits, versiones |
| RNF-16 | Compatibilidad | Alta | Testing cross-browser |
| RNF-17 | Compatibilidad | Alta | Testing en dispositivos móviles |
| RNF-18 | Portabilidad | Media | Testing de deployment |
| RNF-19 | Integraciones | Baja | Testing de APIs externas |
| RNF-20 | Documentación | Media | Revisión de docs |
| RNF-21 | Documentación | Media | Revisión de manuales |

---

## 11. Resumen Ejecutivo

### Alcance del Sistema

El **Sistema de Gestión Nutricional** es una aplicación web full-stack diseñada para facilitar la gestión de pacientes, planes alimentarios y seguimiento nutricional. El sistema soporta tres roles principales:

1. **Administradores**: Gestión global del sistema
2. **Nutricionistas**: Manejo de pacientes y planes
3. **Pacientes**: Registro de ingestas y visualización de progreso

### Características Principales

- ✅ Gestión completa de usuarios con roles diferenciados
- ✅ Catálogo extensible de alimentos con información nutricional
- ✅ Creador de planes alimentarios día por día
- ✅ Registro de ingestas con cálculo automático de nutrientes
- ✅ Sistema de evaluaciones y mediciones antropométricas
- ✅ Cálculo de adherencia al plan
- ✅ Generación de reportes y gráficos de progreso
- ✅ Contratos y servicios nutricionales

### Stack Tecnológico

**Backend**:
- Laravel 11.x (PHP 8.2+)
- MySQL 8.0+
- Laravel Sanctum (autenticación)
- RESTful API

**Frontend**:
- React 18.x
- Vite (build tool)
- React Router (navegación)
- Axios (HTTP client)
- TailwindCSS o Material-UI (estilos)

### Métricas Clave

- **Total de Requerimientos Funcionales**: 17
- **Total de Requerimientos No Funcionales**: 21
- **Casos de Uso Principales**: 11
- **Reglas de Negocio**: 20
- **Módulos del Sistema**: 7

### Cronograma Estimado

| Fase | Duración | Entregables |
|------|----------|-------------|
| **Fase 1: Setup y Autenticación** | 2 semanas | Backend base, API auth, Login/Register |
| **Fase 2: Gestión Base** | 3 semanas | CRUD Pacientes, Alimentos, Usuarios |
| **Fase 3: Planes Alimentarios** | 3 semanas | Creador de planes, visualización |
| **Fase 4: Ingestas y Seguimiento** | 2 semanas | Registro ingestas, evaluaciones |
| **Fase 5: Reportes y Optimización** | 2 semanas | Reportes, gráficos, optimización |
| **Fase 6: Testing y Deploy** | 2 semanas | Tests, correcciones, deployment |
| **TOTAL** | **14 semanas** | Sistema completo en producción |

### Próximos Pasos

1. ✅ **Aprobación de Requerimientos**: Revisar y aprobar este documento
2. 🔄 **Diseño de Base de Datos**: Ejecutar migraciones del esquema fusionado
3. 🔄 **Desarrollo Backend**: Implementar modelos, controladores y API
4. 🔄 **Desarrollo Frontend**: Crear componentes y páginas React
5. 🔄 **Integración**: Conectar frontend con backend
6. 🔄 **Testing**: Pruebas unitarias, integración y E2E
7. 🔄 **Deployment**: Desplegar en servidor de producción

---

**Documento preparado para**: Sistema de Nutrición Full-Stack  
**Versión**: 1.0  
**Fecha**: Octubre 2025  
**Estado**: ✅ Completo y listo para desarrollo