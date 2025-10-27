# 🔄 Flujo Completo del Paciente - Sistema de Nutrición

## 📋 Resumen del Flujo

```
REGISTRO → EVALUACIÓN → CONTRATO → PLAN → ENTREGAS → SEGUIMIENTO
```

---

## 1️⃣ REGISTRO DEL PACIENTE

### Opción A: Auto-registro
```
Paciente → /register → Completa formulario → Usuario creado
```

### Opción B: Registro por Nutricionista  
```
Nutricionista → /pacientes/nuevo → Datos completos → Paciente creado
```

**Tablas involucradas:**
- `users` (credenciales)
- `pacientes` (información personal)

---

## 2️⃣ EVALUACIÓN INICIAL

### El nutricionista realiza evaluación antropométrica

```
📍 /evaluaciones/nueva

Registra:
✓ Peso, altura, IMC
✓ Grasa corporal, masa muscular
✓ Circunferencias (cintura, cadera, etc.)
✓ Pliegues cutáneos
✓ Metabolismo basal
```

**Tablas involucradas:**
- `evaluaciones`
- `mediciones`
- `analisis_clinicos` (opcional)

---

## 3️⃣ CREACIÓN DE CONTRATO

### Se selecciona el servicio y se crea contrato

```
📍 /contratos/nuevo

Servicios disponibles:
1. Plan Nutricional Mensual ($1,500)
2. Preparación de Comidas ($2,500/semana)  
3. Plan Integral ($8,000/mes)

Contrato incluye:
✓ Servicio seleccionado
✓ Fechas (inicio - fin)
✓ Costo
✓ Estado: ACTIVO
```

**Tablas involucradas:**
- `servicios`
- `contratos`

---

## 4️⃣ PLAN DE ALIMENTACIÓN

### El nutricionista crea plan personalizado

```
📍 /planes/nuevo

Plan incluye:
✓ Objetivo (pérdida/ganancia peso, mantenimiento)
✓ Calorías diarias objetivo
✓ Distribución de macronutrientes
✓ Número de comidas al día

Estructura:
Plan (30 días)
  └── Semana 1-4
      └── Día 1-7
          └── 5 Comidas/día
              ├── Desayuno
              ├── Colación matutina
              ├── Almuerzo
              ├── Colación vespertina
              └── Cena
```

### Cada comida contiene:
```
Comida
  ├── Alimentos individuales
  │   └── alimento_comida (cantidad, calorías, macros)
  └── Recetas (opcional)
      └── comida_receta (recetas predefinidas)
```

**Tablas involucradas:**
- `planes_alimentacion`
- `plan_dias`
- `comidas`
- `alimento_comida`
- `recetas`
- `comida_receta`

---

## 5️⃣ CALENDARIO Y ENTREGAS

### 5.1 Programación de Entregas

```
📍 /calendarios-entrega/nuevo

Calendario:
✓ Frecuencia (semanal, quincenal)
✓ Día de entrega (ej: domingos)
✓ Hora de entrega (ej: 18:00)
✓ Dirección de entrega
```

### 5.2 Entregas Programadas

```
Sistema genera automáticamente:
- Entrega 1: Domingo 26/01 → Comidas Semana 1
- Entrega 2: Domingo 02/02 → Comidas Semana 2  
- Entrega 3: Domingo 09/02 → Comidas Semana 3
- Entrega 4: Domingo 16/02 → Comidas Semana 4
```

### 5.3 Estados de Entrega

```
PENDIENTE
    ↓
EN_PREPARACION (Chef preparando)
    ↓
EN_TRANSITO (Repartidor en camino)
    ↓
ENTREGADO (Paciente recibió)
```

**Cada entrega incluye:**
- 35 comidas (7 días × 5 comidas)
- Empacadas individualmente
- Etiquetadas con:
  - Nombre paciente
  - Día de consumo
  - Tipo de comida
  - Instrucciones

**Tablas involucradas:**
- `calendarios_entrega`
- `direcciones`
- `entregas_programadas`

---

## 6️⃣ SEGUIMIENTO CONTINUO

### 6.1 Registro de Ingestas (Paciente)

```
📍 /ingestas

Paciente registra:
✓ Qué comió
✓ Cuándo (fecha y hora)
✓ Cómo se sintió (estado de ánimo, hambre, saciedad)
✓ Observaciones
```

### 6.2 Fotos de Progreso (Paciente)

```
📍 /fotos-progreso

Paciente sube fotos:
✓ Frontales
✓ Laterales  
✓ De espalda
✓ Con peso actual
```

### 6.3 Evaluaciones Periódicas (Nutricionista)

```
📍 /evaluaciones/nueva

Cada 7-15 días:
✓ Nueva evaluación antropométrica
✓ Comparación con evaluación anterior
✓ Análisis de progreso
✓ Ajuste del plan (si es necesario)
```

### 6.4 Comunicación

```
📍 /mensajes

✓ Chat nutricionista-paciente
✓ Consultas y respuestas
✓ Recomendaciones
```

### 6.5 Notificaciones

```
Sistema envía automáticamente:
✓ "Tu entrega llega mañana"
✓ "Hora de comer" (recordatorios)
✓ "Evaluación programada"
✓ "Nuevo mensaje del nutricionista"
```

**Tablas involucradas:**
- `ingestas`
- `alimento_ingesta`
- `fotos_progreso`
- `evaluaciones`
- `mensajes`
- `notificaciones`

---

## 🎯 FLUJO VISUAL COMPLETO

```
┌──────────────┐
│   REGISTRO   │ Paciente se registra (auto o por nutricionista)
└──────┬───────┘
       ↓
┌──────────────┐
│  EVALUACIÓN  │ Antropométrica + Análisis clínicos
└──────┬───────┘
       ↓
┌──────────────┐
│   CONTRATO   │ Selecciona servicio (Plan/Comidas/Integral)
└──────┬───────┘
       ↓
┌──────────────┐
│     PLAN     │ Nutricionista crea plan personalizado
│              │ → 30 días, 5 comidas/día
└──────┬───────┘
       ↓
┌──────────────┐
│  CALENDARIO  │ Programa entregas (semanal/quincenal)
└──────┬───────┘
       ↓
┌──────────────┐
│   ENTREGAS   │ PENDIENTE → PREPARACIÓN → TRÁNSITO → ENTREGADO
│              │ (35 comidas empacadas y etiquetadas)
└──────┬───────┘
       ↓
┌──────────────┐
│ SEGUIMIENTO  │ • Paciente registra ingestas
│   CONTINUO   │ • Sube fotos de progreso
│              │ • Evaluaciones cada 7-15 días
│              │ • Chat con nutricionista
│              │ • Notificaciones automáticas
└──────────────┘
```

---

## 📊 EJEMPLO PRÁCTICO: Juan Pérez

### Día 1: Registro
```
Juan se registra → Usuario creado → Paciente ID: 1
```

### Día 2: Evaluación
```
Nutricionista evalúa:
- Peso: 85.5 kg
- Altura: 175 cm
- IMC: 27.9 (Sobrepeso)
- Objetivo: Perder 10 kg en 3 meses
```

### Día 3: Contrato
```
Juan contrata: Plan Integral ($8,000/mes)
- Duración: 30 días
- Incluye: Plan + Comidas + Seguimiento
- Contrato ID: 1 (ACTIVO)
```

### Día 4-5: Plan
```
Nutricionista crea:
- Plan ID: 1
- 1,800 calorías/día
- 5 comidas/día
- 30 días completos
- Total: 150 comidas programadas
```

### Día 6: Calendario
```
Entregas programadas:
- Domingo 26/01 → Semana 1 (35 comidas)
- Domingo 02/02 → Semana 2 (35 comidas)
- Domingo 09/02 → Semana 3 (35 comidas)
- Domingo 16/02 → Semana 4 (35 comidas)
```

### Domingo 26/01: Primera Entrega
```
18:00 → Repartidor entrega 35 comidas
Juan firma recepción → Estado: ENTREGADO ✓
```

### Lunes 27/01: Primer Día
```
08:15 → Juan come desayuno del plan
10:30 → Registra ingesta en app
11:00 → Come colación matutina
14:00 → Almuerzo
17:00 → Colación vespertina
20:00 → Cena
```

### Lunes 03/02: Evaluación Seguimiento
```
Nueva evaluación:
- Peso: 83.2 kg → ¡Bajó 2.3 kg! ✓
- IMC: 27.2
- Nutricionista: "Excelente progreso"
- Plan: Continúa sin cambios
```

### Domingo 23/02: Fin del Contrato
```
- Juan completó 30 días
- Peso final: 79.8 kg → ¡Perdió 5.7 kg! ✓
- Objetivo cumplido parcialmente
- Opción: Renovar contrato para siguientes 30 días
```

---

## 📈 BASES DE DATOS PRINCIPALES

```sql
users → Credenciales de acceso
  └─→ pacientes → Información personal

evaluaciones → Medidas antropométricas
  └─→ mediciones → Histórico

servicios → Tipos de servicio
  └─→ contratos → Contrato activo del paciente

planes_alimentacion → Plan personalizado
  └─→ plan_dias → Días del plan (1-30)
      └─→ comidas → 5 comidas por día
          ├─→ alimento_comida → Alimentos
          └─→ comida_receta → Recetas

calendarios_entrega → Programación
  └─→ entregas_programadas → Entregas semanales

ingestas → Lo que comió el paciente
  └─→ alimento_ingesta → Detalle

fotos_progreso → Fotos del paciente
mensajes → Chat nutricionista-paciente
notificaciones → Alertas y recordatorios
```

---

## ✅ CHECKLIST DEL FLUJO

### Para el ADMIN/NUTRICIONISTA:
- [ ] Registrar paciente
- [ ] Realizar evaluación inicial
- [ ] Crear contrato con servicio
- [ ] Diseñar plan de alimentación  
- [ ] Programar calendario de entregas
- [ ] Hacer evaluaciones de seguimiento
- [ ] Ajustar plan según progreso
- [ ] Responder mensajes del paciente

### Para el PACIENTE:
- [ ] Registrarse en el sistema
- [ ] Asistir a evaluación inicial
- [ ] Contratar servicio
- [ ] Recibir entregas de comidas
- [ ] Seguir el plan alimentación
- [ ] Registrar ingestas diarias
- [ ] Subir fotos de progreso
- [ ] Asistir a evaluaciones de seguimiento
- [ ] Comunicarse con nutricionista

---

**¡Este es el flujo completo del sistema de nutrición!** 🎯✨
