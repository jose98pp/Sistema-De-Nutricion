# 🎨 Diagrama Visual del Flujo Completo

## 🔄 FLUJO DETALLADO CON TABLAS

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      FASE 1: REGISTRO DEL PACIENTE                      │
└─────────────────────────────────────────────────────────────────────────┘

[USUARIO]                     [SISTEMA]                      [BD]
    │                             │                            │
    │─── /register ─────────────→ │                            │
    │    (email, password)        │                            │
    │                             │──── INSERT ───────────────→│ users
    │                             │                            │  - id: 1
    │                             │                            │  - email
    │                             │                            │  - password
    │                             │                            │  - role: paciente
    │                             │                            │
    │                             │──── INSERT ───────────────→│ pacientes  
    │                             │                            │  - id_paciente: 1
    │                             │                            │  - user_id: 1
    │                             │                            │  - nombre
    │                             │                            │  - apellido
    │                             │                            │
    │←─── Usuario creado ─────────│                            │
    │←─── Redirigir a /login ────│                            │


┌─────────────────────────────────────────────────────────────────────────┐
│                    FASE 2: EVALUACIÓN INICIAL                           │
└─────────────────────────────────────────────────────────────────────────┘

[NUTRICIONISTA]               [SISTEMA]                      [BD]
    │                             │                            │
    │─ /evaluaciones/nueva ─────→ │                            │
    │  Datos antropométricos:     │                            │
    │  - Peso: 85.5 kg            │                            │
    │  - Altura: 175 cm           │                            │
    │  - IMC: 27.9                │                            │
    │  - Grasa: 28.5%             │                            │
    │  - Masa muscular: 35.2 kg   │                            │
    │                             │                            │
    │                             │──── INSERT ───────────────→│ evaluaciones
    │                             │                            │  - id_evaluacion: 1
    │                             │                            │  - id_paciente: 1
    │                             │                            │  - peso_kg: 85.5
    │                             │                            │  - altura_cm: 175
    │                             │                            │  - imc: 27.9
    │                             │                            │
    │                             │──── INSERT (múltiple) ────→│ mediciones
    │                             │                            │  (peso, grasa,
    │                             │                            │   masa muscular, etc)
    │                             │                            │
    │←─ Evaluación guardada ─────│                            │


┌─────────────────────────────────────────────────────────────────────────┐
│                     FASE 3: CREACIÓN DE CONTRATO                        │
└─────────────────────────────────────────────────────────────────────────┘

[NUTRICIONISTA]               [SISTEMA]                      [BD]
    │                             │                            │
    │─── /contratos/nuevo ──────→ │                            │
    │  - id_paciente: 1           │                            │
    │  - id_servicio: 3           │                            │
    │    (Plan Integral)          │                            │
    │  - fecha_inicio: 25/01      │                            │
    │  - costo: $8,000            │                            │
    │                             │                            │
    │                             │──── SELECT ───────────────→│ servicios
    │                             │←─── Servicio #3 ──────────│  WHERE id=3
    │                             │     duracion: 30 días      │
    │                             │                            │
    │                             │──── INSERT ───────────────→│ contratos
    │                             │                            │  - id_contrato: 1
    │                             │                            │  - id_paciente: 1
    │                             │                            │  - id_servicio: 3
    │                             │                            │  - fecha_inicio: 25/01
    │                             │                            │  - fecha_fin: 25/02
    │                             │                            │  - costo: 8000.00
    │                             │                            │  - estado: ACTIVO
    │                             │                            │
    │←─── Contrato creado ───────│                            │


┌─────────────────────────────────────────────────────────────────────────┐
│                   FASE 4: PLAN DE ALIMENTACIÓN                          │
└─────────────────────────────────────────────────────────────────────────┘

[NUTRICIONISTA]               [SISTEMA]                      [BD]
    │                             │                            │
    │─── /planes/nuevo ─────────→ │                            │
    │  Plan para contrato #1:     │                            │
    │  - Objetivo: PERDIDA_PESO   │                            │
    │  - Calorías: 1,800/día      │                            │
    │  - Comidas: 5/día           │                            │
    │  - Duración: 30 días        │                            │
    │                             │                            │
    │                             │──── INSERT ───────────────→│ planes_alimentacion
    │                             │                            │  - id_plan: 1
    │                             │                            │  - id_contrato: 1
    │                             │                            │  - calorias_objetivo: 1800
    │                             │                            │  - estado: ACTIVO
    │                             │                            │
    │─── Planificar Día 1 ──────→ │                            │
    │  Lunes, 27/01               │                            │
    │                             │                            │
    │                             │──── INSERT ───────────────→│ plan_dias
    │                             │                            │  - id_plan_dia: 1
    │                             │                            │  - id_plan: 1
    │                             │                            │  - dia_numero: 1
    │                             │                            │  - dia_semana: LUNES
    │                             │                            │
    │─── Agregar Desayuno ──────→ │                            │
    │  08:00 - Desayuno Proteico  │                            │
    │                             │                            │
    │                             │──── INSERT ───────────────→│ comidas
    │                             │                            │  - id_comida: 1
    │                             │                            │  - id_plan_dia: 1
    │                             │                            │  - tipo_comida: DESAYUNO
    │                             │                            │  - hora_recomendada: 08:00
    │                             │                            │
    │─── Agregar Alimentos ─────→ │                            │
    │  • Huevos (2 unidades)      │                            │
    │  • Pan integral (2 reb.)    │                            │
    │  • Aguacate (50g)           │                            │
    │                             │                            │
    │                             │──── INSERT (3x) ──────────→│ alimento_comida
    │                             │                            │  - id_comida: 1
    │                             │                            │  - id_alimento: X
    │                             │                            │  - cantidad: Y
    │                             │                            │  - calorias: Z
    │                             │                            │
    │                             │                            │
    │  [Repetir para 4 comidas más del día 1]                 │
    │  [Repetir para días 2-30]                                │
    │                                                          │
    │  Total final: 150 comidas (30 días × 5 comidas)         │


┌─────────────────────────────────────────────────────────────────────────┐
│                 FASE 5: CALENDARIO Y ENTREGAS                           │
└─────────────────────────────────────────────────────────────────────────┘

[NUTRICIONISTA]               [SISTEMA]                      [BD]
    │                             │                            │
    │─ /calendarios-entrega/nuevo │                            │
    │  - Contrato #1              │                            │
    │  - Frecuencia: SEMANAL      │                            │
    │  - Día: DOMINGO             │                            │
    │  - Hora: 18:00              │                            │
    │  - Dirección #1             │                            │
    │                             │                            │
    │                             │──── INSERT ───────────────→│ calendarios_entrega
    │                             │                            │  - id_calendario: 1
    │                             │                            │  - id_contrato: 1
    │                             │                            │  - tipo_frecuencia: SEMANAL
    │                             │                            │  - dias_entrega: [DOMINGO]
    │                             │                            │
    │                             │                            │
    │                             │─ GENERAR ENTREGAS ────────→│
    │                             │  (automático)              │
    │                             │                            │
    │                             │──── INSERT (4x) ──────────→│ entregas_programadas
    │                             │                            │  Entrega 1: 26/01
    │                             │                            │  Entrega 2: 02/02
    │                             │                            │  Entrega 3: 09/02
    │                             │                            │  Entrega 4: 16/02
    │                             │                            │  estado: PENDIENTE
    │                             │                            │
    │←─ Calendario creado ───────│                            │

┌──────────────────────────────┐
│  DOMINGO 26/01 - ENTREGA #1  │
└──────────────────────────────┘

[CHEF]                        [SISTEMA]                      [BD]
    │                             │                            │
    │─── Ver orden preparación ─→ │                            │
    │                             │                            │
    │                             │──── SELECT ───────────────→│ entregas_programadas
    │                             │←─── Entrega #1 ───────────│  WHERE fecha=26/01
    │                             │                            │  estado: PENDIENTE
    │                             │                            │
    │─── Iniciar preparación ────→ │                            │
    │                             │                            │
    │                             │──── UPDATE ───────────────→│ entregas_programadas
    │                             │                            │  SET estado = 'EN_PREPARACION'
    │                             │                            │
    │  [Prepara 35 comidas]       │                            │
    │  [Empaca individuales]      │                            │
    │  [Etiqueta cada una]        │                            │
    │                             │                            │
    │─── Listo para envío ───────→ │                            │
    │                             │                            │
    │                             │──── UPDATE ───────────────→│ entregas_programadas
    │                             │                            │  SET estado = 'EN_TRANSITO'
    │                             │                            │
    │                             │──── NOTIFICAR ────────────→│ notificaciones
    │                             │     "Tu pedido está en     │  (al paciente)
    │                             │      camino 🚚"            │

[REPARTIDOR]                  [SISTEMA]                      [BD]
    │                             │                            │
    │─── Confirmar entrega ─────→ │                            │
    │  - Foto de entrega          │                            │
    │  - Firma digital            │                            │
    │  - Hora real: 18:15         │                            │
    │                             │                            │
    │                             │──── UPDATE ───────────────→│ entregas_programadas
    │                             │                            │  SET estado = 'ENTREGADO'
    │                             │                            │  SET fecha_entrega_real = 18:15
    │                             │                            │  SET evidencia_foto = '...'
    │                             │                            │
    │                             │──── NOTIFICAR ────────────→│ notificaciones
    │                             │     "¡Pedido entregado!"   │  (al paciente)


┌─────────────────────────────────────────────────────────────────────────┐
│                    FASE 6: SEGUIMIENTO CONTINUO                         │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐
│ LUNES 27/01 - PRIMER DÍA     │
└──────────────────────────────┘

[PACIENTE]                    [SISTEMA]                      [BD]
    │                             │                            │
    │─── 08:15 Come desayuno ────│                            │
    │                             │                            │
    │─── /ingestas/nueva ───────→ │                            │
    │  - Comida: Desayuno         │                            │
    │  - Hora: 08:15              │                            │
    │  - Estado ánimo: NORMAL     │                            │
    │  - Nivel hambre: 3/5        │                            │
    │  - Nivel saciedad: 4/5      │                            │
    │                             │                            │
    │                             │──── INSERT ───────────────→│ ingestas
    │                             │                            │  - id_ingesta: 1
    │                             │                            │  - id_paciente: 1
    │                             │                            │  - fecha_ingesta: 27/01 08:15
    │                             │                            │  - tipo_comida: DESAYUNO
    │                             │                            │
    │                             │──── INSERT (múltiple) ────→│ alimento_ingesta
    │                             │                            │  (cada alimento consumido)
    │                             │                            │
    │←─── Ingesta registrada ────│                            │

┌──────────────────────────────┐
│ LUNES 03/02 - SEGUIMIENTO    │
└──────────────────────────────┘

[NUTRICIONISTA]               [SISTEMA]                      [BD]
    │                             │                            │
    │─ /evaluaciones/nueva ─────→ │                            │
    │  - Paciente #1              │                            │
    │  - Peso: 83.2 kg            │                            │
    │  - IMC: 27.2                │                            │
    │                             │                            │
    │                             │──── SELECT ───────────────→│ evaluaciones
    │                             │←─ Última evaluación ──────│  WHERE id_paciente=1
    │                             │   Peso anterior: 85.5 kg   │  ORDER BY fecha DESC
    │                             │                            │  LIMIT 1
    │                             │                            │
    │                             │──── CALCULAR ─────────────→│
    │                             │  Cambio peso: -2.3 kg ✓    │
    │                             │  Cambio grasa: -1.4%       │
    │                             │                            │
    │                             │──── INSERT ───────────────→│ evaluaciones
    │                             │                            │  - id_evaluacion: 2
    │                             │                            │  - id_paciente: 1
    │                             │                            │  - peso_kg: 83.2
    │                             │                            │  - cambio_peso: -2.3
    │                             │                            │
    │←─ Progreso excelente ──────│                            │
    │   Plan continúa sin cambios │                            │


┌─────────────────────────────────────────────────────────────────────────┐
│                      COMUNICACIÓN Y NOTIFICACIONES                      │
└─────────────────────────────────────────────────────────────────────────┘

[PACIENTE]                    [SISTEMA]                      [BD]
    │                             │                            │
    │─── /mensajes ─────────────→ │                            │
    │  "¿Puedo sustituir el       │                            │
    │   pescado por pollo?"       │                            │
    │                             │                            │
    │                             │──── INSERT ───────────────→│ mensajes
    │                             │                            │  - remitente: Paciente #1
    │                             │                            │  - destinatario: Nutricionista
    │                             │                            │  - mensaje: "..."
    │                             │                            │
    │                             │──── NOTIFICAR ────────────→│ notificaciones
    │                             │     (al nutricionista)     │

[NUTRICIONISTA]               [SISTEMA]                      [BD]
    │                             │                            │
    │─── Responder mensaje ─────→ │                            │
    │  "Sí, usa 150g de pechuga   │                            │
    │   de pollo"                 │                            │
    │                             │                            │
    │                             │──── INSERT ───────────────→│ mensajes
    │                             │                            │  - remitente: Nutricionista
    │                             │                            │  - destinatario: Paciente #1
    │                             │                            │  - mensaje_padre_id: X
    │                             │                            │
    │                             │──── NOTIFICAR ────────────→│ notificaciones
    │                             │     (al paciente)          │
```

---

## 📊 RESUMEN DE TABLAS Y RELACIONES

```
users (credenciales)
  ├─→ pacientes (info personal)
  ├─→ nutricionistas (info profesional)
  └─→ admins (info administrativa)

pacientes
  ├─→ evaluaciones (mediciones)
  │     └─→ mediciones (histórico)
  ├─→ analisis_clinicos (laboratorio)
  ├─→ contratos (servicios contratados)
  │     ├─→ servicios (tipo de servicio)
  │     ├─→ planes_alimentacion (planes)
  │     │     └─→ plan_dias (días del plan)
  │     │           └─→ comidas (5 comidas/día)
  │     │                 ├─→ alimento_comida (alimentos)
  │     │                 └─→ comida_receta (recetas)
  │     └─→ calendarios_entrega (programación)
  │           └─→ entregas_programadas (entregas)
  ├─→ direcciones (direcciones de entrega)
  ├─→ ingestas (registro de comidas)
  │     └─→ alimento_ingesta (alimentos consumidos)
  ├─→ fotos_progreso (fotos de evolución)
  ├─→ mensajes (comunicación)
  └─→ notificaciones (alertas)
```

---

**¡Este es el flujo visual completo del sistema!** 🎨
