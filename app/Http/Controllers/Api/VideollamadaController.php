<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sesion;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class VideollamadaController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Crear/obtener link de videollamada para una sesión
     */
    public function crear(Request $request)
    {
        $request->validate([
            'id_sesion' => 'required|exists:sesiones,id_sesion'
        ]);

        $sesion = Sesion::findOrFail($request->id_sesion);

        // Verificar que el usuario tiene permiso
        $user = $request->user();
        $tienePermiso = false;

        if ($user->role === 'paciente') {
            $tienePermiso = $sesion->id_paciente === $user->paciente->id_paciente;
        } elseif ($user->role === 'psicologo') {
            $tienePermiso = $sesion->profesional_id === $user->psicologo->id_psicologo && 
                           $sesion->tipo_profesional === 'PSICOLOGO';
        } elseif ($user->role === 'nutricionista') {
            $tienePermiso = $sesion->profesional_id === $user->nutricionista->id_nutricionista && 
                           $sesion->tipo_profesional === 'NUTRICIONISTA';
        } elseif ($user->role === 'admin') {
            $tienePermiso = true;
        }

        if (!$tienePermiso) {
            return response()->json([
                'message' => 'No tienes permiso para acceder a esta videollamada'
            ], 403);
        }

        // Verificar que la sesión es de tipo videollamada
        if ($sesion->tipo_sesion !== 'VIDEOLLAMADA') {
            return response()->json([
                'message' => 'Esta sesión no es de tipo videollamada'
            ], 400);
        }

        // Generar o obtener link
        $link = $sesion->generarLinkVideollamada();

        return response()->json([
            'data' => [
                'id_sesion' => $sesion->id_sesion,
                'link_videollamada' => $link,
                'room_name' => basename($link),
                'fecha_hora' => $sesion->fecha_hora,
                'duracion_minutos' => $sesion->duracion_minutos,
                'estado' => $sesion->estado
            ]
        ]);
    }

    /**
     * Obtener token/información para unirse a videollamada
     */
    public function getToken($id)
    {
        $sesion = Sesion::findOrFail($id);
        $user = request()->user();

        // Verificar permisos
        $tienePermiso = false;
        $displayName = '';

        if ($user->role === 'paciente') {
            $tienePermiso = $sesion->id_paciente === $user->paciente->id_paciente;
            $displayName = $user->paciente->nombre . ' ' . $user->paciente->apellido;
        } elseif ($user->role === 'psicologo') {
            $tienePermiso = $sesion->profesional_id === $user->psicologo->id_psicologo && 
                           $sesion->tipo_profesional === 'PSICOLOGO';
            $displayName = 'Dr. ' . $user->psicologo->nombre . ' ' . $user->psicologo->apellido;
        } elseif ($user->role === 'nutricionista') {
            $tienePermiso = $sesion->profesional_id === $user->nutricionista->id_nutricionista && 
                           $sesion->tipo_profesional === 'NUTRICIONISTA';
            $displayName = 'Nut. ' . $user->nutricionista->nombre . ' ' . $user->nutricionista->apellido;
        } elseif ($user->role === 'admin') {
            $tienePermiso = true;
            $displayName = 'Admin';
        }

        if (!$tienePermiso) {
            return response()->json([
                'message' => 'No tienes permiso para acceder a esta videollamada'
            ], 403);
        }

        // Verificar que la sesión está programada o en curso
        if (!in_array($sesion->estado, ['PROGRAMADA', 'EN_CURSO'])) {
            return response()->json([
                'message' => 'Esta sesión no está disponible para videollamada'
            ], 400);
        }

        return response()->json([
            'data' => [
                'room_name' => basename($sesion->link_videollamada),
                'display_name' => $displayName,
                'user_role' => $user->role,
                'sesion' => [
                    'id' => $sesion->id_sesion,
                    'fecha_hora' => $sesion->fecha_hora,
                    'duracion_minutos' => $sesion->duracion_minutos,
                    'tipo_profesional' => $sesion->tipo_profesional
                ]
            ]
        ]);
    }

    /**
     * Finalizar videollamada
     */
    public function finalizar(Request $request, $id)
    {
        $sesion = Sesion::findOrFail($id);
        $user = $request->user();

        // Solo el profesional puede finalizar la sesión
        $puedeFinalizar = false;

        if ($user->role === 'psicologo') {
            $puedeFinalizar = $sesion->profesional_id === $user->psicologo->id_psicologo && 
                              $sesion->tipo_profesional === 'PSICOLOGO';
        } elseif ($user->role === 'nutricionista') {
            $puedeFinalizar = $sesion->profesional_id === $user->nutricionista->id_nutricionista && 
                              $sesion->tipo_profesional === 'NUTRICIONISTA';
        } elseif ($user->role === 'admin') {
            $puedeFinalizar = true;
        }

        if (!$puedeFinalizar) {
            return response()->json([
                'message' => 'No tienes permiso para finalizar esta videollamada'
            ], 403);
        }

        $request->validate([
            'notas' => 'nullable|string'
        ]);

        try {
            $sesion->update([
                'estado' => 'COMPLETADA',
                'notas' => $request->notas ?? $sesion->notas
            ]);

            // Enviar notificación de videollamada finalizada
            try {
                $this->notificationService->notificarVideollamadaFinalizada($sesion);
            } catch (\Exception $e) {
                \Log::error('Error al enviar notificación de videollamada finalizada', [
                    'sesion_id' => $sesion->id_sesion,
                    'error' => $e->getMessage()
                ]);
            }

            return response()->json([
                'message' => 'Videollamada finalizada exitosamente',
                'data' => $sesion
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al finalizar videollamada',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Notificar que un participante se unió
     */
    public function participanteUnido(Request $request, $id)
    {
        $sesion = Sesion::findOrFail($id);
        $user = $request->user();

        $request->validate([
            'nombre_participante' => 'required|string'
        ]);

        try {
            $this->notificationService->notificarParticipanteUnido($sesion, $request->nombre_participante);

            return response()->json([
                'message' => 'Notificación enviada'
            ]);
        } catch (\Exception $e) {
            \Log::error('Error al notificar participante unido', [
                'sesion_id' => $sesion->id_sesion,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Error al enviar notificación',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verificar disponibilidad de videollamada
     */
    public function verificar($id)
    {
        $sesion = Sesion::findOrFail($id);
        $user = request()->user();

        // Verificar permisos
        $tienePermiso = false;

        if ($user->role === 'paciente') {
            $tienePermiso = $sesion->id_paciente === $user->paciente->id_paciente;
        } elseif ($user->role === 'psicologo') {
            $tienePermiso = $sesion->profesional_id === $user->psicologo->id_psicologo && 
                           $sesion->tipo_profesional === 'PSICOLOGO';
        } elseif ($user->role === 'nutricionista') {
            $tienePermiso = $sesion->profesional_id === $user->nutricionista->id_nutricionista && 
                           $sesion->tipo_profesional === 'NUTRICIONISTA';
        } elseif ($user->role === 'admin') {
            $tienePermiso = true;
        }

        $disponible = $tienePermiso && 
                     $sesion->tipo_sesion === 'VIDEOLLAMADA' && 
                     in_array($sesion->estado, ['PROGRAMADA', 'EN_CURSO']);

        return response()->json([
            'disponible' => $disponible,
            'estado' => $sesion->estado,
            'fecha_hora' => $sesion->fecha_hora,
            'puede_unirse' => $disponible
        ]);
    }
}
