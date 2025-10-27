# 🎲 Datos de Prueba - Seeders

## ✅ Seeders Creados

Se han creado **seeders completos con datos realistas** para probar todas las funcionalidades del sistema.

---

## 📊 Datos que se Crearán

### 👥 Usuarios (11 usuarios totales)

#### **1 Administrador:**
- **Email:** admin@nutricion.com
- **Password:** password123
- **Rol:** Admin

#### **2 Nutricionistas:**
1. **Dr. Carlos Ramírez**
   - Email: carlos@nutricion.com
   - Password: password123
   - Rol: Nutricionista

2. **Dra. María González**
   - Email: maria@nutricion.com
   - Password: password123
   - Rol: Nutricionista

#### **8 Pacientes con datos completos:**

1. **Juan Pérez**
   - Email: juan@example.com
   - Password: password123
   - Objetivo: Pérdida de peso y salud cardiovascular
   - Alergias: Intolerancia a la lactosa
   - Condiciones: Hipertensión leve

2. **Ana Martínez**
   - Email: ana@example.com
   - Password: password123
   - Objetivo: Mantenimiento de peso y energía
   - Alergias: Alergia al maní

3. **Pedro García**
   - Email: pedro@example.com
   - Password: password123
   - Objetivo: Ganancia de masa muscular
   - Actividad: Alta

4. **Laura Rodríguez**
   - Email: laura@example.com
   - Password: password123
   - Objetivo: Pérdida de peso gradual
   - Condiciones: Hipotiroidismo controlado

5. **Roberto Fernández**
   - Email: roberto@example.com
   - Password: password123
   - Objetivo: Control de diabetes tipo 2
   - Condiciones: Diabetes tipo 2, Colesterol alto

6. **Carmen López**
   - Email: carmen@example.com
   - Password: password123
   - Objetivo: Alimentación saludable
   - Alergias: Gluten (Celiaquía)

7. **Miguel Torres**
   - Email: miguel@example.com
   - Password: password123
   - Objetivo: Rendimiento deportivo
   - Actividad: Alta

8. **Sofía Jiménez**
   - Email: sofia@example.com
   - Password: password123
   - Objetivo: Nutrición vegetariana balanceada
   - Condiciones: Anemia leve

---

### 🍎 Alimentos (45 alimentos)

**Categorías:**
- ✅ Frutas (7): Manzana, Plátano, Naranja, Fresa, Uva, Sandía, Piña
- ✅ Verduras (7): Lechuga, Tomate, Zanahoria, Brócoli, Espinaca, Cebolla, Pepino
- ✅ Proteínas (7): Pollo, Salmón, Atún, Huevo, Carne de Res, Pavo, Tofu
- ✅ Cereales (7): Arroz Integral, Avena, Pan Integral, Pasta Integral, Quinoa, Papa, Batata
- ✅ Lácteos (4): Leche Descremada, Yogur Natural, Queso Fresco, Yogur Griego
- ✅ Legumbres (4): Lentejas, Garbanzos, Frijoles Negros, Soja
- ✅ Frutos Secos (4): Almendras, Nueces, Pistachos, Cacahuates
- ✅ Grasas Saludables (3): Aguacate, Aceite de Oliva, Semillas de Chía
- ✅ Bebidas (3): Té Verde, Café Negro, Agua

**Información nutricional completa:** Calorías, Proteínas, Carbohidratos, Grasas, Fibra

---

### 📋 Planes de Alimentación (8 planes)

**Características:**
- ✅ Un plan activo por paciente
- ✅ Calorías personalizadas según:
  - Nivel de actividad (bajo: 1600, moderado: 2000, alto: 2400)
  - Objetivo nutricional
- ✅ 5 comidas al día:
  - Desayuno (08:00) - 25% calorías
  - Media Mañana (11:00) - 10% calorías
  - Almuerzo (14:00) - 35% calorías
  - Merienda (17:00) - 10% calorías
  - Cena (20:00) - 20% calorías
- ✅ Adaptados a alergias/restricciones:
  - Sin lactosa para Juan
  - Sin gluten para Carmen
  - Vegetariano para Sofía
- ✅ Distribución de macros personalizada
- ✅ Vigencia: 6 meses (2 meses atrás, 4 meses adelante)

---

### 📊 Evaluaciones (48 evaluaciones)

**Características:**
- ✅ 6 evaluaciones por paciente (últimos 6 meses)
- ✅ Datos incluidos:
  - Peso progresivo (pérdida gradual hacia objetivo)
  - Altura
  - Circunferencia cintura y cadera
  - Presión arterial
  - Observaciones del nutricionista
- ✅ Permite ver evolución de peso en gráficos
- ✅ Progreso realista hacia objetivos

---

### 🍽️ Ingestas (336+ ingestas)

**Características:**
- ✅ Últimos 14 días de cada paciente
- ✅ 2-3 ingestas diarias (desayuno, almuerzo, cena)
- ✅ Alimentos variados y realistas
- ✅ Calorías calculadas automáticamente
- ✅ Permite probar:
  - Historial de ingestas
  - Gráficos de calorías
  - Adherencia al plan

---

### 🔔 Notificaciones (52+ notificaciones)

**Características:**
- ✅ 6 notificaciones por paciente:
  - Bienvenida al sistema
  - Plan asignado
  - Recordatorios de evaluación
  - Metas alcanzadas
  - Nuevos mensajes
  - Tips de hidratación
- ✅ 4 notificaciones para nutricionista:
  - Nuevos pacientes
  - Evaluaciones pendientes
  - Mensajes de pacientes
  - Planes completados
- ✅ Mix de leídas y no leídas
- ✅ Diferentes tipos: info, success, warning, error
- ✅ Links a páginas relevantes

---

### 💬 Mensajes (80+ mensajes)

**Características:**
- ✅ Conversación completa entre cada paciente y nutricionista
- ✅ 10 mensajes por conversación
- ✅ Mensajes realistas y contextuales:
  - Bienvenida
  - Consultas sobre el plan
  - Seguimiento de progreso
  - Dudas nutricionales
  - Motivación
- ✅ Mix de leídos y no leídos
- ✅ Fechas distribuidas en últimos 20 días
- ✅ Permite probar sistema de chat completo

---

## 🚀 Cómo Ejecutar los Seeders

### Opción 1: Fresh Migration + Seeders (RECOMENDADO)

**⚠️ ADVERTENCIA:** Esto eliminará TODOS los datos existentes.

```bash
php artisan migrate:fresh --seed
```

Este comando:
1. Elimina todas las tablas
2. Ejecuta todas las migraciones
3. Ejecuta todos los seeders

### Opción 2: Solo Seeders (si ya tienes las tablas vacías)

```bash
php artisan db:seed
```

### Opción 3: Seeder Específico

```bash
# Solo usuarios
php artisan db:seed --class=UsersTableSeeder

# Solo alimentos
php artisan db:seed --class=AlimentosTableSeeder

# Solo planes y evaluaciones
php artisan db:seed --class=PlanesEvaluacionesSeeder

# Solo notificaciones y mensajes
php artisan db:seed --class=NotificacionesMensajesSeeder
```

---

## 📁 Archivos Seeder Creados

1. **UsersTableSeeder.php** - Usuarios y pacientes
2. **AlimentosTableSeeder.php** - Catálogo de alimentos
3. **PlanesEvaluacionesSeeder.php** - Planes, evaluaciones e ingestas
4. **NotificacionesMensajesSeeder.php** - Notificaciones y mensajes
5. **DatabaseSeeder.php** - Orquestador principal (actualizado)

---

## 🧪 Probar Funcionalidades

### 1. **Dashboard**
- Login como **carlos@nutricion.com**
- Ver KPIs de todos los pacientes
- Gráfico de tendencia de peso
- Distribución de IMC
- Top 5 pacientes con mejor progreso

### 2. **Dashboard Paciente**
- Login como **juan@example.com**
- Ver progreso hacia objetivo
- Gráfico de evolución personal
- Plan actual
- Última evaluación

### 3. **Planes de Alimentación**
- Ver plan personalizado con 5 comidas
- Calorías y macros
- Alimentos adaptados a alergias

### 4. **Ingestas**
- Ver historial de 14 días
- Gráfico de calorías diarias
- Adherencia al plan

### 5. **Evaluaciones**
- Historial de 6 meses
- Gráfico de evolución de peso
- Observaciones del nutricionista

### 6. **Notificaciones**
- Campana con contador
- Notificaciones leídas/no leídas
- Diferentes tipos y colores
- Enlaces a secciones

### 7. **Mensajes**
- Conversaciones completas
- Mensajes en tiempo real
- Contador de no leídos
- Búsqueda de usuarios

### 8. **Reportes**
- Datos suficientes para gráficos
- Comparación de períodos
- Análisis nutricional

---

## 📊 Estadísticas de Datos Generados

| Entidad | Cantidad |
|---------|----------|
| Usuarios | 11 |
| Pacientes (datos completos) | 8 |
| Nutricionistas | 2 |
| Alimentos | 45 |
| Planes de Alimentación | 8 |
| Evaluaciones | 48 |
| Ingestas | 336+ |
| Notificaciones | 52+ |
| Mensajes | 80+ |

---

## 🔐 Credenciales de Acceso Rápido

### Administrador:
```
Email: admin@nutricion.com
Password: password123
```

### Nutricionista Principal:
```
Email: carlos@nutricion.com
Password: password123
```

### Paciente para Pruebas:
```
Email: juan@example.com
Password: password123
```

**Todos los usuarios tienen el mismo password:** `password123`

---

## ✅ Características Especiales de los Datos

### Realismo:
- ✅ Nombres y perfiles variados
- ✅ Objetivos nutricionales diferentes
- ✅ Alergias y condiciones médicas
- ✅ Niveles de actividad variados
- ✅ Progreso gradual y realista

### Diversidad:
- ✅ Pacientes con diferentes objetivos:
  - Pérdida de peso
  - Ganancia muscular
  - Mantenimiento
  - Control de enfermedades
  - Rendimiento deportivo
- ✅ Restricciones alimentarias:
  - Intolerancia a lactosa
  - Celiaquía
  - Vegetariano
  - Alergias

### Historiales Completos:
- ✅ 6 meses de evaluaciones
- ✅ 2 semanas de ingestas
- ✅ 3 semanas de conversaciones
- ✅ Notificaciones desde el inicio

---

## 🎯 Casos de Uso para Probar

### Caso 1: Nutricionista Revisando Progreso
1. Login: carlos@nutricion.com
2. Dashboard → Ver Top 5 pacientes
3. Click en Juan Pérez
4. Ver evaluaciones (6 meses de historial)
5. Ver adherencia al plan
6. Enviar mensaje de felicitación

### Caso 2: Paciente Siguiendo su Plan
1. Login: juan@example.com
2. Ver progreso hacia objetivo (barra visual)
3. Planes → Ver plan personalizado
4. Ingestas → Registrar nueva ingesta
5. Ver gráfico de calorías
6. Mensajes → Responder al nutricionista

### Caso 3: Análisis con Reportes
1. Login: carlos@nutricion.com
2. Reportes → Seleccionar paciente
3. Ver gráficos de evolución
4. Analizar adherencia
5. Comparar períodos

### Caso 4: Notificaciones y Comunicación
1. Login: juan@example.com
2. Ver campana con notificaciones
3. Leer notificaciones importantes
4. Ir a mensajes desde notificación
5. Responder consulta del nutricionista

---

## 🐛 Solución de Problemas

### Error: "Class not found"
```bash
composer dump-autoload
```

### Error: "Table doesn't exist"
```bash
php artisan migrate:fresh --seed
```

### Error: "Duplicate entry"
```bash
# Limpiar base de datos primero
php artisan migrate:fresh
# Luego ejecutar seeders
php artisan db:seed
```

---

## 💡 Próximos Pasos

Después de ejecutar los seeders:

1. ✅ **Probar Dashboard** con datos reales
2. ✅ **Ver Gráficos** funcionando con datos de 6 meses
3. ✅ **Probar Mensajería** con conversaciones completas
4. ✅ **Verificar Notificaciones** con diferentes tipos
5. ✅ **Analizar Reportes** con datos históricos
6. ✅ **Probar Fotos de Progreso** (subir fotos manualmente)
7. ✅ **Decidir siguiente funcionalidad** a implementar

---

**¡Los datos están listos para probar todo el sistema!** 🎉

Ejecuta: `php artisan migrate:fresh --seed` y empieza a explorar.

---

**Versión:** 2.3  
**Fecha:** Octubre 2025  
**Total de Datos:** 500+ registros  
**Estado:** ✅ Listo para usar
