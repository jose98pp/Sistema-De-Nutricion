<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Paciente;
use App\Models\PlanAlimentacion;
use App\Models\Ingesta;
use App\Models\Evaluacion;
use App\Models\ProgressPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Obtener estadísticas generales del dashboard
     */
    public function getStats(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'nutricionista' || $user->role === 'admin') {
            return $this->getNutricionistaStats($user);
        } else {
            return $this->getPacienteStats($user);
        }
    }

    /**
     * Estadísticas para Nutricionista/Admin
     */
    private function getNutricionistaStats($user)
    {
        // Contar pacientes totales
        $totalPacientes = User::where('role', 'paciente')->count();

        // Pacientes activos (con plan vigente)
        $pacientesActivos = PlanAlimentacion::where('fecha_fin', '>=', now())
            ->distinct('id_paciente')
            ->count('id_paciente');

        // Total de planes creados
        $totalPlanes = PlanAlimentacion::count();

        // Planes activos
        $planesActivos = PlanAlimentacion::where('fecha_fin', '>=', now())->count();

        // Total de evaluaciones
        $totalEvaluaciones = Evaluacion::count();

        // Evaluaciones este mes
        $evaluacionesMes = Evaluacion::whereMonth('fecha', now()->month)
            ->whereYear('fecha', now()->year)
            ->count();

        // Mensajes no leídos
        $mensajesNoLeidos = DB::table('messages')
            ->where('id_destinatario', $user->id)
            ->where('leido', false)
            ->count();

        // Pacientes recientes (últimos 7 días)
        $pacientesRecientes = User::where('role', 'paciente')
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        // Tendencia de peso de todos los pacientes (últimos 6 meses)
        $tendenciaPeso = Evaluacion::select(
                DB::raw('DATE_FORMAT(fecha, "%Y-%m") as mes'),
                DB::raw('AVG(peso_kg) as peso_promedio')
            )
            ->whereNotNull('peso_kg')
            ->where('fecha', '>=', now()->subMonths(6))
            ->groupBy('mes')
            ->orderBy('mes')
            ->get();

        // Adherencia promedio al plan
        $adherenciaPromedio = $this->calcularAdherenciaGeneral();

        // Top 5 pacientes con mejor progreso
        $topPacientes = $this->getTopPacientes();

        // Distribución de IMC
        $distribucionIMC = $this->getDistribucionIMC();

        return response()->json([
            'totales' => [
                'pacientes' => $totalPacientes,
                'pacientes_activos' => $pacientesActivos,
                'planes' => $totalPlanes,
                'planes_activos' => $planesActivos,
                'evaluaciones' => $totalEvaluaciones,
                'evaluaciones_mes' => $evaluacionesMes,
                'mensajes_no_leidos' => $mensajesNoLeidos,
                'pacientes_recientes' => $pacientesRecientes
            ],
            'tendencia_peso' => $tendenciaPeso,
            'adherencia_promedio' => $adherenciaPromedio,
            'top_pacientes' => $topPacientes,
            'distribucion_imc' => $distribucionIMC
        ]);
    }

    /**
     * Estadísticas para Paciente
     */
    private function getPacienteStats($user)
    {
        // Obtener id_paciente del usuario
        $idPaciente = $user->id_paciente ?? Paciente::where('user_id', $user->id)->value('id_paciente');
        
        if (!$idPaciente) {
            return response()->json([
                'error' => 'No se encontró información de paciente'
            ], 404);
        }
        
        $paciente = Paciente::where('id_paciente', $idPaciente)->first();

        // Plan actual
        $planActual = PlanAlimentacion::where('id_paciente', $idPaciente)
            ->where('fecha_inicio', '<=', now())
            ->where('fecha_fin', '>=', now())
            ->first();

        // Total de ingestas registradas
        $totalIngestas = Ingesta::where('id_paciente', $idPaciente)->count();

        // Ingestas esta semana
        $ingestasSemana = Ingesta::where('id_paciente', $idPaciente)
            ->whereBetween('fecha_hora', [now()->startOfWeek(), now()->endOfWeek()])
            ->count();

        // Total de evaluaciones
        $totalEvaluaciones = Evaluacion::where('id_paciente', $idPaciente)->count();

        // Última evaluación
        $ultimaEvaluacion = Evaluacion::where('id_paciente', $idPaciente)
            ->orderBy('fecha', 'desc')
            ->first();

        // Evolución de peso (últimos 6 meses)
        $evolucionPeso = Evaluacion::where('id_paciente', $idPaciente)
            ->whereNotNull('peso_kg')
            ->where('fecha', '>=', now()->subMonths(6))
            ->orderBy('fecha')
            ->get(['fecha', 'peso_kg']);

        // Adherencia al plan
        $adherencia = $planActual ? $this->calcularAdherenciaPaciente($idPaciente, $planActual) : 0;

        // Fotos de progreso
        $totalFotos = ProgressPhoto::where('id_paciente', $idPaciente)->count();

        // Mensajes no leídos
        $mensajesNoLeidos = DB::table('messages')
            ->where('id_destinatario', $user->id)
            ->where('leido', false)
            ->count();

        // Progreso hacia el objetivo
        $progresoObjetivo = $this->calcularProgresoObjetivo($idPaciente);

        // Calorías promedio última semana
        $caloriasPromedio = $this->calcularCaloriasPromedio($idPaciente);

        return response()->json([
            'paciente' => $paciente,
            'plan_actual' => $planActual,
            'totales' => [
                'ingestas' => $totalIngestas,
                'ingestas_semana' => $ingestasSemana,
                'evaluaciones' => $totalEvaluaciones,
                'fotos_progreso' => $totalFotos,
                'mensajes_no_leidos' => $mensajesNoLeidos
            ],
            'ultima_evaluacion' => $ultimaEvaluacion,
            'evolucion_peso' => $evolucionPeso,
            'adherencia' => $adherencia,
            'progreso_objetivo' => $progresoObjetivo,
            'calorias_promedio' => $caloriasPromedio
        ]);
    }

    /**
     * Calcular adherencia general de todos los pacientes
     */
    private function calcularAdherenciaGeneral()
    {
        $planesActivos = PlanAlimentacion::where('fecha_fin', '>=', now())->get();
        
        if ($planesActivos->isEmpty()) {
            return 0;
        }

        $adherenciaTotal = 0;
        foreach ($planesActivos as $plan) {
            $adherenciaTotal += $this->calcularAdherenciaPaciente($plan->id_paciente, $plan);
        }

        return round($adherenciaTotal / $planesActivos->count(), 2);
    }

    /**
     * Calcular adherencia de un paciente específico
     */
    private function calcularAdherenciaPaciente($pacienteId, $plan)
    {
        $diasPlan = now()->diffInDays($plan->fecha_inicio);
        if ($diasPlan > now()->diffInDays($plan->fecha_fin)) {
            $diasPlan = now()->diffInDays($plan->fecha_inicio, $plan->fecha_fin);
        }

        $ingestasRealizadas = Ingesta::where('id_paciente', $pacienteId)
            ->whereBetween('fecha_hora', [$plan->fecha_inicio, now()])
            ->count();

        $ingestasEsperadas = $diasPlan * 3; // 3 comidas al día

        return $ingestasEsperadas > 0 
            ? round(($ingestasRealizadas / $ingestasEsperadas) * 100, 2)
            : 0;
    }

    /**
     * Obtener top 5 pacientes con mejor progreso
     */
    private function getTopPacientes()
    {
        $pacientes = User::where('role', 'paciente')
            ->with(['paciente', 'evaluaciones'])
            ->get();

        $pacientesConProgreso = $pacientes->map(function($user) {
            $evaluaciones = $user->evaluaciones()->orderBy('fecha')->get();
            
            if ($evaluaciones->count() < 2) {
                return null;
            }

            $primera = $evaluaciones->first();
            $ultima = $evaluaciones->last();

            $perdidaPeso = $primera->peso_kg - $ultima->peso_kg;

            return [
                'id' => $user->id,
                'nombre' => $user->name,
                'perdida_peso' => round($perdidaPeso, 2),
                'peso_inicial' => $primera->peso_kg,
                'peso_actual' => $ultima->peso_kg,
                'evaluaciones' => $evaluaciones->count()
            ];
        })->filter()->sortByDesc('perdida_peso')->take(5)->values();

        return $pacientesConProgreso;
    }

    /**
     * Obtener distribución de IMC
     */
    private function getDistribucionIMC()
    {
        // Obtener última evaluación de cada paciente
        $ultimasEvaluaciones = Evaluacion::select('id_paciente', DB::raw('MAX(fecha) as ultima_fecha'))
            ->groupBy('id_paciente')
            ->get();

        $distribucion = [
            'bajo_peso' => 0,
            'normal' => 0,
            'sobrepeso' => 0,
            'obesidad' => 0
        ];

        foreach ($ultimasEvaluaciones as $eval) {
            $evaluacion = Evaluacion::where('id_paciente', $eval->id_paciente)
                ->where('fecha', $eval->ultima_fecha)
                ->first();

            if ($evaluacion && $evaluacion->peso_kg && $evaluacion->altura_m) {
                $imc = $evaluacion->peso_kg / ($evaluacion->altura_m ** 2);

                if ($imc < 18.5) {
                    $distribucion['bajo_peso']++;
                } elseif ($imc < 25) {
                    $distribucion['normal']++;
                } elseif ($imc < 30) {
                    $distribucion['sobrepeso']++;
                } else {
                    $distribucion['obesidad']++;
                }
            }
        }

        return $distribucion;
    }

    /**
     * Calcular progreso hacia el objetivo
     */
    private function calcularProgresoObjetivo($pacienteId)
    {
        $paciente = Paciente::where('id_paciente', $pacienteId)->first();
        
        if (!$paciente || !$paciente->peso_objetivo_kg) {
            return null;
        }

        $primeraEval = Evaluacion::where('id_paciente', $pacienteId)
            ->orderBy('fecha', 'asc')
            ->first();

        $ultimaEval = Evaluacion::where('id_paciente', $pacienteId)
            ->orderBy('fecha', 'desc')
            ->first();

        if (!$primeraEval || !$ultimaEval) {
            return null;
        }

        $pesoInicial = $primeraEval->peso_kg;
        $pesoActual = $ultimaEval->peso_kg;
        $pesoObjetivo = $paciente->peso_objetivo_kg;

        $totalAPerder = abs($pesoInicial - $pesoObjetivo);
        $perdidoHastaAhora = abs($pesoInicial - $pesoActual);

        $porcentaje = $totalAPerder > 0 
            ? round(($perdidoHastaAhora / $totalAPerder) * 100, 2)
            : 0;

        return [
            'peso_inicial' => $pesoInicial,
            'peso_actual' => $pesoActual,
            'peso_objetivo' => $pesoObjetivo,
            'total_a_perder' => $totalAPerder,
            'perdido_hasta_ahora' => $perdidoHastaAhora,
            'porcentaje' => min($porcentaje, 100)
        ];
    }

    /**
     * Calcular calorías promedio de la última semana
     */
    private function calcularCaloriasPromedio($pacienteId)
    {
        $ingestas = Ingesta::where('id_paciente', $pacienteId)
            ->where('fecha_hora', '>=', now()->subDays(7))
            ->with('alimentos')
            ->get();

        if ($ingestas->isEmpty()) {
            return 0;
        }

        // Calcular calorías totales de cada ingesta
        $totalCalorias = 0;
        foreach ($ingestas as $ingesta) {
            $totales = $ingesta->calcularTotales();
            $totalCalorias += $totales['calorias'];
        }

        $dias = $ingestas->pluck('fecha_hora')->map(function($fecha) {
            return date('Y-m-d', strtotime($fecha));
        })->unique()->count();

        return $dias > 0 ? round($totalCalorias / $dias, 0) : 0;
    }
}
