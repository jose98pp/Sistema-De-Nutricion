<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PacienteController;
use App\Http\Controllers\Api\NutricionistaController;
use App\Http\Controllers\Api\AlimentoController;
use App\Http\Controllers\Api\ServicioController;
use App\Http\Controllers\Api\ContratoController;
use App\Http\Controllers\Api\PlanAlimentacionController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\IngestaController;
use App\Http\Controllers\Api\EvaluacionController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ProgressPhotoController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DireccionController;
use App\Http\Controllers\Api\RecetaController;
use App\Http\Controllers\Api\AnalisisClinicoController;
use App\Http\Controllers\Api\CalendarioEntregaController;
use App\Http\Controllers\Api\EntregaProgramadaController;
use App\Http\Controllers\Api\MenuSemanalController;
use App\Http\Controllers\Api\PlanAlimentacionMejoradoController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rutas públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rutas protegidas con Sanctum - Comunes para todos los roles autenticados
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
    
    // Perfil
    Route::put('/perfil', [ProfileController::class, 'update']);
    Route::put('/perfil/cambiar-password', [ProfileController::class, 'changePassword']);
    
    // Notificaciones (todos los roles)
    Route::get('notificaciones', [NotificationController::class, 'index']);
    Route::post('notificaciones', [NotificationController::class, 'store']);
    Route::put('notificaciones/{id}/leer', [NotificationController::class, 'markAsRead']);
    Route::put('notificaciones/leer-todas', [NotificationController::class, 'markAllAsRead']);
    Route::get('notificaciones/no-leidas/contar', [NotificationController::class, 'countUnread']);
    Route::delete('notificaciones/{id}', [NotificationController::class, 'destroy']);
    
    // Mensajes (todos los roles)
    Route::get('mensajes/conversaciones', [MessageController::class, 'conversations']);
    Route::get('mensajes/conversacion/{userId}', [MessageController::class, 'getConversation']);
    Route::post('mensajes', [MessageController::class, 'store']);
    Route::put('mensajes/{id}/leer', [MessageController::class, 'markAsRead']);
    Route::get('mensajes/no-leidos/contar', [MessageController::class, 'countUnread']);
    Route::get('mensajes/usuarios/buscar', [MessageController::class, 'searchUsers']);
    
    // Fotos de Progreso (todos los roles)
    Route::get('fotos-progreso', [ProgressPhotoController::class, 'index']);
    Route::post('fotos-progreso', [ProgressPhotoController::class, 'store']);
    Route::get('fotos-progreso/{id}', [ProgressPhotoController::class, 'show']);
    Route::post('fotos-progreso/{id}', [ProgressPhotoController::class, 'update']);
    Route::delete('fotos-progreso/{id}', [ProgressPhotoController::class, 'destroy']);
    Route::get('fotos-progreso/paciente/{pacienteId}', [ProgressPhotoController::class, 'getFotosPaciente']);
    Route::get('fotos-progreso/comparacion/{pacienteId}', [ProgressPhotoController::class, 'comparacion']);
    Route::get('fotos-progreso/timeline/{pacienteId}', [ProgressPhotoController::class, 'timeline']);
    
    // Planes de Alimentación e Ingestas (todos los roles)
    Route::apiResource('planes', PlanAlimentacionController::class);
    Route::apiResource('ingestas', IngestaController::class);
    Route::get('ingestas/historial/{paciente_id}', [IngestaController::class, 'historial']);
    
    // Alimentos (lectura para todos, escritura solo admin/nutricionista)
    Route::get('alimentos', [AlimentoController::class, 'index']);
    Route::get('alimentos/{id}', [AlimentoController::class, 'show']);
});

// Rutas exclusivas para Admin y Nutricionista
Route::middleware(['auth:sanctum', 'role:admin,nutricionista'])->group(function () {
    
    // Pacientes
    Route::apiResource('pacientes', PacienteController::class);
    
    // Nutricionistas (solo admin puede gestionar)
    Route::apiResource('nutricionistas', NutricionistaController::class)->middleware('role:admin');
    
    // Alimentos (solo escritura para admin/nutricionista)
    Route::post('alimentos', [AlimentoController::class, 'store']);
    Route::put('alimentos/{id}', [AlimentoController::class, 'update']);
    Route::delete('alimentos/{id}', [AlimentoController::class, 'destroy']);
    
    // Servicios
    Route::apiResource('servicios', ServicioController::class);
    
    // Contratos
    Route::apiResource('contratos', ContratoController::class);
    Route::get('contratos/paciente/{paciente_id}', [ContratoController::class, 'getByPaciente']);
    Route::get('contratos/estado/{estado}', [ContratoController::class, 'getByEstado']);
    
    // Evaluaciones
    Route::apiResource('evaluaciones', EvaluacionController::class);
    Route::get('evaluaciones/historial/{paciente_id}', [EvaluacionController::class, 'historialPaciente']);
    Route::get('evaluaciones-pacientes', [EvaluacionController::class, 'getPacientesNutricionista']);
    
    // Direcciones (gestión completa)
    Route::apiResource('direcciones', DireccionController::class);
    Route::get('direcciones/paciente/{id_paciente}', [DireccionController::class, 'byPaciente']);
    
    // Recetas (gestión completa)
    Route::apiResource('recetas', RecetaController::class);
    Route::post('recetas/{id}/agregar-comida', [RecetaController::class, 'attachToComida']);
    Route::delete('recetas/{id}/remover-comida/{id_comida}', [RecetaController::class, 'detachFromComida']);
    
    // Análisis Clínicos (gestión completa)
    Route::apiResource('analisis-clinicos', AnalisisClinicoController::class);
    Route::post('analisis-clinicos/{id}/vincular-evaluacion', [AnalisisClinicoController::class, 'attachToEvaluacion']);
    Route::delete('analisis-clinicos/{id}/desvincular-evaluacion/{id_evaluacion}', [AnalisisClinicoController::class, 'detachFromEvaluacion']);
    
    // Calendarios de Entrega (gestión completa)
    Route::apiResource('calendarios-entrega', CalendarioEntregaController::class);
    Route::get('calendarios-entrega/contrato/{id_contrato}', [CalendarioEntregaController::class, 'byContrato']);
    Route::get('calendarios-entrega-activos', [CalendarioEntregaController::class, 'activos']);
    
    // Entregas Programadas (gestión completa)
    Route::apiResource('entregas-programadas', EntregaProgramadaController::class);
    Route::put('entregas-programadas/{id}/marcar-entregada', [EntregaProgramadaController::class, 'marcarComoEntregada']);
    Route::put('entregas-programadas/{id}/marcar-omitida', [EntregaProgramadaController::class, 'marcarComoOmitida']);
    Route::get('entregas-del-dia', [EntregaProgramadaController::class, 'entregasDelDia']);
    Route::get('entregas-pendientes', [EntregaProgramadaController::class, 'entregasPendientes']);
    Route::post('entregas-programadas/generar/{id_calendario}', [EntregaProgramadaController::class, 'generarEntregas']);
    
    // Planes de Alimentación Mejorados
    Route::get('planes-mejorados', [PlanAlimentacionMejoradoController::class, 'index']);
    Route::post('planes-mejorados', [PlanAlimentacionMejoradoController::class, 'store']);
    Route::get('planes-mejorados/{id}', [PlanAlimentacionMejoradoController::class, 'show']);
    Route::put('planes-mejorados/{id}', [PlanAlimentacionMejoradoController::class, 'update']);
    Route::delete('planes-mejorados/{id}', [PlanAlimentacionMejoradoController::class, 'destroy']);
    Route::post('planes-mejorados/{id}/duplicar', [PlanAlimentacionMejoradoController::class, 'duplicar']);
});

// Rutas exclusivas para Pacientes
Route::middleware(['auth:sanctum', 'role:paciente'])->group(function () {
    
    // Mis Direcciones (solo lectura)
    Route::get('mis-direcciones', [DireccionController::class, 'misDirecciones']);
    
    // Mis Recetas (solo del plan activo)
    Route::get('mis-recetas', [RecetaController::class, 'misRecetas']);
    
    // Mis Análisis Clínicos
    Route::get('mis-analisis', [AnalisisClinicoController::class, 'misAnalisis']);
    
    // Mi Calendario de Entrega
    Route::get('mi-calendario', [CalendarioEntregaController::class, 'miCalendario']);
    
    // Mis Entregas
    Route::get('mis-entregas', [EntregaProgramadaController::class, 'misEntregas']);
    Route::get('mis-entregas/proximas', [EntregaProgramadaController::class, 'proximasEntregas']);
    
    // Mi Menú Semanal
    Route::get('mi-menu-semanal', [MenuSemanalController::class, 'miMenuSemanal']);
    Route::get('menu-del-dia', [MenuSemanalController::class, 'menuDelDia']);
    
    // Mis Comidas de Hoy
    Route::get('progreso-del-dia', [IngestaController::class, 'progresoDelDia']);
    Route::post('registrar-rapido', [IngestaController::class, 'registrarRapido']);
});
