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

// Recuperación de contraseña
Route::post('/forgot-password', [\App\Http\Controllers\Api\PasswordResetController::class, 'forgotPassword']);
Route::post('/reset-password', [\App\Http\Controllers\Api\PasswordResetController::class, 'resetPassword']);
Route::post('/verify-reset-token', [\App\Http\Controllers\Api\PasswordResetController::class, 'verifyToken']);

// Rutas protegidas con Sanctum - Comunes para todos los roles autenticados
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
    
    // Perfil
    Route::get('/perfil', [ProfileController::class, 'show']);
    Route::put('/perfil', [ProfileController::class, 'update']);
    Route::post('/perfil/foto', [ProfileController::class, 'uploadPhoto']);
    Route::delete('/perfil/foto', [ProfileController::class, 'deletePhoto']);
    Route::put('/perfil/password', [ProfileController::class, 'changePassword']);
    Route::put('/perfil/preferencias', [ProfileController::class, 'updatePreferences']);
    Route::put('/perfil/notificaciones', [ProfileController::class, 'updateNotifications']);
    
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
    Route::put('mensajes/{id}', [MessageController::class, 'update']);
    Route::delete('mensajes/{id}', [MessageController::class, 'destroy']);
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
    
    // Ingestas (todos los roles)
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
    
    // Nutricionistas - Lectura para admin y nutricionista, escritura solo admin
    Route::get('nutricionistas', [NutricionistaController::class, 'index']);
    Route::get('nutricionistas/{id}', [NutricionistaController::class, 'show']);
    
    // Contratos - CRUD completo para admin y nutricionista
    Route::get('contratos', [ContratoController::class, 'index']);
    Route::post('contratos', [ContratoController::class, 'store']);
    Route::get('contratos/{id}', [ContratoController::class, 'show']);
    Route::put('contratos/{id}', [ContratoController::class, 'update']);
    Route::delete('contratos/{id}', [ContratoController::class, 'destroy']);
    Route::get('contratos/paciente/{paciente_id}', [ContratoController::class, 'getByPaciente']);
    Route::get('contratos/estado/{estado}', [ContratoController::class, 'getByEstado']);
    
    // Cancelar contrato - Admin y Nutricionista
    Route::put('contratos/{id}/cancelar', [ContratoController::class, 'cancelar']);
    
    // Planes de Alimentación - CRUD para admin y nutricionista
    Route::get('planes', [PlanAlimentacionController::class, 'index']);
    Route::post('planes', [PlanAlimentacionController::class, 'store']);
    Route::get('planes/{id}', [PlanAlimentacionController::class, 'show']);
    Route::put('planes/{id}', [PlanAlimentacionController::class, 'update']);
    Route::delete('planes/{id}', [PlanAlimentacionController::class, 'destroy']);
    Route::patch('planes/{id}/toggle-status', [PlanAlimentacionController::class, 'toggleStatus']);
    
    // Planes de Alimentación Mejorados
    Route::get('planes-mejorados', [PlanAlimentacionMejoradoController::class, 'index']);
    Route::post('planes-mejorados', [PlanAlimentacionMejoradoController::class, 'store']);
    Route::get('planes-mejorados/{id}', [PlanAlimentacionMejoradoController::class, 'show']);
    Route::put('planes-mejorados/{id}', [PlanAlimentacionMejoradoController::class, 'update']);
    Route::delete('planes-mejorados/{id}', [PlanAlimentacionMejoradoController::class, 'destroy']);
    Route::post('planes-mejorados/{id}/duplicar', [PlanAlimentacionMejoradoController::class, 'duplicar']);
    
    // Servicios - Lectura para admin y nutricionista
    Route::get('servicios', [ServicioController::class, 'index']);
    Route::get('servicios/{id}', [ServicioController::class, 'show']);
    
    // Evaluaciones - CRUD completo para admin y nutricionista
    Route::get('evaluaciones', [EvaluacionController::class, 'index']);
    Route::post('evaluaciones', [EvaluacionController::class, 'store']);
    Route::get('evaluaciones/{id}', [EvaluacionController::class, 'show']);
    Route::put('evaluaciones/{id}', [EvaluacionController::class, 'update']);
    Route::delete('evaluaciones/{id}', [EvaluacionController::class, 'destroy']);
    Route::get('evaluaciones/historial/{paciente_id}', [EvaluacionController::class, 'historialPaciente']);
    Route::get('evaluaciones-pacientes', [EvaluacionController::class, 'getPacientesNutricionista']);
    
    // Calendarios de Entrega - Admin y Nutricionista
    Route::apiResource('calendarios-entrega', CalendarioEntregaController::class);
    Route::get('calendarios-entrega/contrato/{id_contrato}', [CalendarioEntregaController::class, 'byContrato']);
    Route::get('calendarios-entrega-activos', [CalendarioEntregaController::class, 'activos']);
    
    // Entregas Programadas - Admin y Nutricionista
    Route::apiResource('entregas-programadas', EntregaProgramadaController::class);
    Route::put('entregas-programadas/{id}/marcar-entregada', [EntregaProgramadaController::class, 'marcarComoEntregada']);
    Route::put('entregas-programadas/{id}/marcar-omitida', [EntregaProgramadaController::class, 'marcarComoOmitida']);
    Route::get('entregas-del-dia', [EntregaProgramadaController::class, 'entregasDelDia']);
    Route::get('entregas-pendientes', [EntregaProgramadaController::class, 'entregasPendientes']);
    Route::post('entregas-programadas/generar/{id_calendario}', [EntregaProgramadaController::class, 'generarEntregas']);
    
    // Recetas - Admin y Nutricionista
    Route::apiResource('recetas', RecetaController::class);
    Route::post('recetas/{id}/agregar-comida', [RecetaController::class, 'attachToComida']);
    Route::delete('recetas/{id}/remover-comida/{id_comida}', [RecetaController::class, 'detachFromComida']);
    
    // Análisis Clínicos - Admin y Nutricionista
    Route::apiResource('analisis-clinicos', AnalisisClinicoController::class);
    Route::post('analisis-clinicos/{id}/vincular-evaluacion', [AnalisisClinicoController::class, 'attachToEvaluacion']);
    Route::delete('analisis-clinicos/{id}/desvincular-evaluacion/{id_evaluacion}', [AnalisisClinicoController::class, 'detachFromEvaluacion']);
    
    // Direcciones - Admin y Nutricionista
    Route::apiResource('direcciones', DireccionController::class);
    Route::get('direcciones/paciente/{id_paciente}', [DireccionController::class, 'byPaciente']);
});

// Rutas exclusivas para Admin
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Nutricionistas - Gestión completa solo para admin
    Route::post('nutricionistas', [NutricionistaController::class, 'store']);
    Route::put('nutricionistas/{id}', [NutricionistaController::class, 'update']);
    Route::delete('nutricionistas/{id}', [NutricionistaController::class, 'destroy']);
    
    // Alimentos (solo escritura para admin/nutricionista)
    Route::post('alimentos', [AlimentoController::class, 'store']);
    Route::put('alimentos/{id}', [AlimentoController::class, 'update']);
    Route::delete('alimentos/{id}', [AlimentoController::class, 'destroy']);
    
    // Servicios - Escritura solo para admin
    Route::post('servicios', [ServicioController::class, 'store']);
    Route::put('servicios/{id}', [ServicioController::class, 'update']);
    Route::delete('servicios/{id}', [ServicioController::class, 'destroy']);
});

// Rutas exclusivas para Pacientes
Route::middleware(['auth:sanctum', 'role:paciente'])->group(function () {
    
    // Mi Plan de Alimentación (solo lectura)
    Route::get('mi-plan', [PlanAlimentacionController::class, 'miPlan']);
    Route::get('mi-plan/{id}', [PlanAlimentacionController::class, 'show']);
    
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
    
    // Mi Menú Semanal
    Route::get('mi-menu-semanal', [MenuSemanalController::class, 'getMiMenuSemanal']);
    Route::get('menu-del-dia', [MenuSemanalController::class, 'menuDelDia']);
    
    // Mis Entregas
    Route::get('mis-entregas/proximas', [EntregaProgramadaController::class, 'proximasEntregas']);
    
    // Mis Comidas de Hoy
    Route::get('progreso-del-dia', [IngestaController::class, 'progresoDelDia']);
    Route::post('registrar-rapido', [IngestaController::class, 'registrarRapido']);
});
