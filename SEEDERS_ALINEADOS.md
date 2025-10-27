# ✅ Seeders Alineados con Migraciones

## 📋 Resumen

Se ha creado un **seeder completo y actualizado** (`CompleteDataSeeder.php`) que está perfectamente alineado con todas las migraciones, modelos y controladores del sistema.

---

## 🎯 Datos Creados

### **1. Usuarios (10 total)**

#### Admin (1)
- **Email:** `admin@nutricion.com`
- **Password:** `password`
- **Rol:** Admin

#### Nutricionistas (3)
1. **Dr. Carlos Ramírez**
   - Email: `carlos@nutricion.com`
   - Password: `password`
   - Especialidad: Nutrición Deportiva
   - Teléfono: +1-555-1001

2. **Dra. María González**
   - Email: `maria@nutricion.com`
   - Password: `password`
   - Especialidad: Nutrición Clínica
   - Teléfono: +1-555-1002

3. **Dr. Luis Martínez**
   - Email: `luis@nutricion.com`
   - Password: `password`
   - Especialidad: Nutrición Pediátrica
   - Teléfono: +1-555-1003

#### Pacientes (6)
1. **Juan Pérez** - `juan@example.com` / `password`
2. **Ana Martínez** - `ana@example.com` / `password`
3. **Pedro García** - `pedro@example.com` / `password`
4. **Laura Rodríguez** - `laura@example.com` / `password`
5. **Roberto Fernández** - `roberto@example.com` / `password`
6. **Carmen López** - `carmen@example.com` / `password`

---

### **2. Servicios (5)**

1. **Plan Nutricional Mensual**
   - Tipo: Plan Alimenticio
   - Duración: 30 días
   - Costo: $150.00

2. **Plan Nutricional Trimestral**
   - Tipo: Plan Alimenticio
   - Duración: 90 días
   - Costo: $400.00

3. **Asesoramiento Nutricional Individual**
   - Tipo: Asesoramiento
   - Duración: 15 días
   - Costo: $80.00

4. **Programa Deportivo**
   - Tipo: Plan Alimenticio
   - Duración: 60 días
   - Costo: $250.00

5. **Catering Saludable Semanal**
   - Tipo: Catering
   - Duración: 7 días
   - Costo: $120.00

---

### **3. Contratos (5)**

| Paciente | Servicio | Estado | Fecha Inicio | Fecha Fin |
|----------|----------|--------|--------------|-----------|
| Juan Pérez | Plan Mensual | ACTIVO | Hace 15 días | En 15 días |
| Ana Martínez | Plan Trimestral | ACTIVO | Hace 30 días | En 60 días |
| Pedro García | Programa Deportivo | ACTIVO | Hace 10 días | En 50 días |
| Laura Rodríguez | Asesoramiento | PENDIENTE | En 5 días | En 20 días |
| Roberto Fernández | Plan Mensual | FINALIZADO | Hace 60 días | Hace 30 días |

---

### **4. Alimentos (15)**

Todos los alimentos tienen valores nutricionales por 100g:

#### Proteínas
- Pechuga de Pollo
- Huevo
- Salmón

#### Cereales
- Arroz Integral
- Avena
- Pan Integral (con restricción: Celiaquía)

#### Verduras
- Brócoli
- Espinaca
- Zanahoria

#### Frutas
- Plátano
- Manzana

#### Grasas Saludables
- Aguacate
- Almendras (con restricción: Alergia a frutos secos)

#### Lácteos
- Leche Descremada (con restricción: Intolerancia a la lactosa)
- Yogurt Natural (con restricción: Intolerancia a la lactosa)

---

## 🔧 Estructura de Datos Alineada

### **Columnas de Alimentos**
✅ Alineado con migración `2025_10_20_000003_create_alimentos_table.php`

```php
- nombre (string)
- categoria (enum: fruta, verdura, cereal, proteina, lacteo, grasa, otro)
- calorias_por_100g (decimal)
- proteinas_por_100g (decimal)
- carbohidratos_por_100g (decimal)
- grasas_por_100g (decimal)
- restricciones (string, nullable)
```

### **Relaciones Correctas**
✅ Todas las relaciones de base de datos están correctamente establecidas:

- `Nutricionista` → `belongsTo` → `User`
- `Nutricionista` → `hasMany` → `Pacientes`
- `Paciente` → `belongsTo` → `User`
- `Paciente` → `belongsTo` → `Nutricionista`
- `Servicio` → `hasMany` → `Contratos`
- `Contrato` → `belongsTo` → `Paciente`
- `Contrato` → `belongsTo` → `Servicio`

---

## 🚀 Cómo Usar

### **Resetear y Poblar la Base de Datos**

```bash
php artisan migrate:fresh --seed
```

Este comando:
1. ✅ Elimina todas las tablas
2. ✅ Ejecuta todas las migraciones
3. ✅ Ejecuta el seeder completo
4. ✅ Crea todos los datos de prueba

### **Ejecutar Solo el Seeder**

```bash
php artisan db:seed --class=CompleteDataSeeder
```

---

## 📊 Verificación en las Vistas

Después de ejecutar el seeder, puedes verificar los datos en:

### **Módulo de Nutricionistas** (Admin)
- `/nutricionistas` - Verás 3 nutricionistas con sus especialidades
- Cada nutricionista tiene pacientes asignados

### **Módulo de Pacientes** (Admin/Nutricionista)
- `/pacientes` - Verás 6 pacientes con datos completos
- Cada paciente tiene nutricionista asignado

### **Módulo de Servicios** (Admin/Nutricionista)
- `/servicios` - Verás 5 servicios diferentes
- Con diferentes tipos, duraciones y costos

### **Módulo de Contratos** (Admin/Nutricionista)
- `/contratos` - Verás 5 contratos
- Con diferentes estados: ACTIVO, PENDIENTE, FINALIZADO
- Estadísticas por estado en tarjetas

### **Módulo de Alimentos** (Admin/Nutricionista)
- `/alimentos` - Verás 15 alimentos
- Con categorías correctas y valores nutricionales
- Algunos con restricciones alimentarias

---

## ✨ Características del Seeder

1. **Datos Realistas**: Nombres, emails y datos coherentes
2. **Relaciones Completas**: Todos los vínculos entre tablas están establecidos
3. **Estados Variados**: Contratos en diferentes estados para pruebas
4. **Restricciones Alimentarias**: Alimentos con restricciones para probar filtros
5. **Fechas Dinámicas**: Usa `now()` para fechas relativas
6. **Credenciales Simples**: Todas las contraseñas son `password` para facilitar pruebas

---

## 🔐 Credenciales de Acceso

Todas las contraseñas son: **`password`**

| Rol | Email | Acceso |
|-----|-------|--------|
| Admin | admin@nutricion.com | Todos los módulos |
| Nutricionista | carlos@nutricion.com | Pacientes, Servicios, Contratos, etc. |
| Nutricionista | maria@nutricion.com | Pacientes, Servicios, Contratos, etc. |
| Nutricionista | luis@nutricion.com | Pacientes, Servicios, Contratos, etc. |
| Paciente | juan@example.com | Planes, Ingestas, Mensajes, Perfil |

---

## 📝 Notas Importantes

1. **Migraciones Actualizadas**: La tabla `alimentos` usa columnas `*_por_100g`
2. **Categorías Correctas**: Las categorías de alimentos usan valores en singular (fruta, verdura, etc.)
3. **IDs Correctos**: Usa `id_nutricionista`, `id_paciente`, `id_servicio`, etc.
4. **Sin Conflictos**: El seeder puede ejecutarse múltiples veces con `migrate:fresh`

---

## ✅ Estado Actual

- ✅ Migraciones alineadas
- ✅ Modelos con relaciones correctas
- ✅ Controladores funcionando
- ✅ Seeders con datos coherentes
- ✅ Vistas mostrando datos correctamente

**¡El sistema está completamente funcional con datos de prueba!** 🎉
