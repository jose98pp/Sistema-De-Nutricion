<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ingesta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class IngestaController extends Controller
{
    /**
     * Listar ingestas
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Ingesta::with(['paciente', 'alimentos']);
        
        // Si es paciente, solo ver sus ingestas
        if ($user->isPaciente()) {
            $paciente = $user->paciente;
            $query->where('id_paciente', $paciente->id_paciente);
        }
        
        // Filtrar por paciente (para nutricionistas/admin)
        if ($request->has('paciente_id')) {
            $query->where('id_paciente', $request->paciente_id);
        }
        
        // Filtrar por rango de fechas
        if ($request->has('fecha_inicio') && $request->has('fecha_fin')) {
            $query->entreFechas($request->fecha_inicio, $request->fecha_fin);
        }
        
        $ingestas = $query->orderBy('fecha_hora', 'desc')->paginate(15);
        
        // Calcular totales nutricionales para cada ingesta
        $ingestas->getCollection()->transform(function($ingesta) {
            $ingesta->totales = $ingesta->calcularTotales();
            return $ingesta;
        });
        
        return response()->json($ingestas);
    }

    /**
     * Registrar nueva ingesta
     */
    public function store(Request $request)
    {
        $request->validate([
            'fecha_hora' => 'required|date|before_or_equal:now',
            'id_paciente' => 'required|exists:pacientes,id_paciente',
            'alimentos' => 'required|array|min:1',
            'alimentos.*.id_alimento' => 'required|exists:alimentos,id_alimento',
            'alimentos.*.cantidad_gramos' => 'required|numeric|min:0.01',
        ]);

        DB::beginTransaction();
        try {
            // Crear la ingesta
            $ingesta = Ingesta::create([
                'fecha_hora' => $request->fecha_hora,
                'id_paciente' => $request->id_paciente,
            ]);

            // Adjuntar alimentos
            foreach ($request->alimentos as $alimentoData) {
                $ingesta->alimentos()->attach($alimentoData['id_alimento'], [
                    'cantidad_gramos' => $alimentoData['cantidad_gramos']
                ]);
            }

            DB::commit();

            // Calcular totales
            $ingesta->load('alimentos');
            $totales = $ingesta->calcularTotales();

            return response()->json([
                'message' => 'Ingesta registrada exitosamente',
                'ingesta' => $ingesta,
                'totales' => $totales
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al registrar la ingesta',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar ingesta específica
     */
    public function show($id)
    {
        $ingesta = Ingesta::with(['paciente', 'alimentos'])->findOrFail($id);
        $ingesta->totales = $ingesta->calcularTotales();
        
        return response()->json($ingesta);
    }

    /**
     * Actualizar ingesta (solo dentro de 24 horas)
     */
    public function update(Request $request, $id)
    {
        $ingesta = Ingesta::findOrFail($id);
        
        // Verificar que no han pasado más de 24 horas
        $horasPasadas = Carbon::now()->diffInHours($ingesta->created_at);
        if ($horasPasadas > 24) {
            return response()->json([
                'message' => 'No se puede editar una ingesta después de 24 horas'
            ], 403);
        }

        $request->validate([
            'fecha_hora' => 'sometimes|date|before_or_equal:now',
            'alimentos' => 'sometimes|array|min:1',
            'alimentos.*.id_alimento' => 'required_with:alimentos|exists:alimentos,id_alimento',
            'alimentos.*.cantidad_gramos' => 'required_with:alimentos|numeric|min:0.01',
        ]);

        DB::beginTransaction();
        try {
            if ($request->has('fecha_hora')) {
                $ingesta->update(['fecha_hora' => $request->fecha_hora]);
            }

            if ($request->has('alimentos')) {
                // Eliminar alimentos anteriores
                $ingesta->alimentos()->detach();
                
                // Agregar nuevos alimentos
                foreach ($request->alimentos as $alimentoData) {
                    $ingesta->alimentos()->attach($alimentoData['id_alimento'], [
                        'cantidad_gramos' => $alimentoData['cantidad_gramos']
                    ]);
                }
            }

            DB::commit();

            $ingesta->load('alimentos');
            $totales = $ingesta->calcularTotales();

            return response()->json([
                'message' => 'Ingesta actualizada exitosamente',
                'ingesta' => $ingesta,
                'totales' => $totales
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar la ingesta',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar ingesta
     */
    public function destroy($id)
    {
        $ingesta = Ingesta::findOrFail($id);
        $ingesta->delete();

        return response()->json([
            'message' => 'Ingesta eliminada exitosamente'
        ]);
    }

    /**
     * Obtener historial de ingestas por paciente
     */
    public function historial(Request $request, $pacienteId)
    {
        $request->validate([
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
        ]);

        $query = Ingesta::where('id_paciente', $pacienteId)
                        ->with('alimentos')
                        ->orderBy('fecha_hora', 'desc');

        if ($request->has('fecha_inicio') && $request->has('fecha_fin')) {
            $query->entreFechas($request->fecha_inicio, $request->fecha_fin);
        }

        $ingestas = $query->get();
        
        // Calcular totales por día
        $ingestasPorDia = $ingestas->groupBy(function($ingesta) {
            return $ingesta->fecha_hora->format('Y-m-d');
        })->map(function($ingestasDia) {
            $totales = [
                'calorias' => 0,
                'proteinas' => 0,
                'carbohidratos' => 0,
                'grasas' => 0,
            ];
            
            foreach ($ingestasDia as $ingesta) {
                $nutrientes = $ingesta->calcularTotales();
                $totales['calorias'] += $nutrientes['calorias'];
                $totales['proteinas'] += $nutrientes['proteinas'];
                $totales['carbohidratos'] += $nutrientes['carbohidratos'];
                $totales['grasas'] += $nutrientes['grasas'];
            }
            
            return [
                'ingestas' => $ingestasDia,
                'totales' => $totales
            ];
        });

        return response()->json($ingestasPorDia);
    }

    /**
     * Registrar rápidamente una comida del plan como consumida
     */
    public function registrarRapido(Request $request)
    {
        $request->validate([
            'id_comida' => 'required|exists:comidas,id_comida',
            'modificaciones' => 'nullable|array',
            'modificaciones.*.id_alimento' => 'required|exists:alimentos,id_alimento',
            'modificaciones.*.cantidad_gramos' => 'required|numeric|min:0'
        ]);

        $user = $request->user();
        $paciente = $user->paciente;

        if (!$paciente) {
            return response()->json([
                'success' => false,
                'message' => 'No eres un paciente registrado'
            ], 403);
        }

        DB::beginTransaction();
        try {
            // Obtener la comida del plan con sus alimentos
            $comida = \App\Models\Comida::with('alimentos')->findOrFail($request->id_comida);

            // Crear la ingesta
            $ingesta = Ingesta::create([
                'id_paciente' => $paciente->id_paciente,
                'fecha_hora' => now(),
                'tipo_comida' => $comida->tipo_comida,
                'observaciones' => $request->observaciones ?? "Registrado desde el plan: {$comida->nombre}"
            ]);

            // Si hay modificaciones, usar esas cantidades, sino usar las del plan
            if ($request->has('modificaciones') && !empty($request->modificaciones)) {
                // Usar modificaciones
                foreach ($request->modificaciones as $mod) {
                    $ingesta->alimentos()->attach($mod['id_alimento'], [
                        'cantidad_gramos' => $mod['cantidad_gramos']
                    ]);
                }
            } else {
                // Usar alimentos del plan original
                foreach ($comida->alimentos as $alimento) {
                    $ingesta->alimentos()->attach($alimento->id_alimento, [
                        'cantidad_gramos' => $alimento->pivot->cantidad_gramos
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Ingesta registrada exitosamente',
                'data' => $ingesta->load('alimentos')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar ingesta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener progreso del día actual
     */
    public function progresoDelDia(Request $request)
    {
        $user = $request->user();
        $paciente = $user->paciente;

        if (!$paciente) {
            return response()->json([
                'success' => false,
                'message' => 'No eres un paciente registrado'
            ], 403);
        }

        $fecha = $request->get('fecha', Carbon::today()->toDateString());

        // Obtener plan activo
        $plan = \App\Models\PlanAlimentacion::whereHas('contrato', function($query) use ($paciente) {
            $query->where('id_paciente', $paciente->id_paciente)
                  ->where('estado', 'ACTIVO');
        })->where('estado', 'ACTIVO')->first();

        if (!$plan) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes un plan activo'
            ], 404);
        }

        // Obtener comidas del plan para este día
        $dia = $plan->planDias()
            ->where('fecha', $fecha)
            ->with(['comidas' => function($query) {
                $query->orderBy('hora_recomendada');
            }, 'comidas.alimentos'])
            ->first();

        // Obtener ingestas registradas hoy
        $ingestas = Ingesta::where('id_paciente', $paciente->id_paciente)
            ->whereDate('fecha_hora', $fecha)
            ->with('alimentos')
            ->get();

        // Calcular totales del plan
        $totalesPlan = ['calorias' => 0, 'proteinas' => 0, 'carbohidratos' => 0, 'grasas' => 0];
        $comidasPlan = [];

        if ($dia) {
            foreach ($dia->comidas as $comida) {
                $totalesComida = ['calorias' => 0, 'proteinas' => 0, 'carbohidratos' => 0, 'grasas' => 0];
                
                foreach ($comida->alimentos as $alimento) {
                    $cantidad = $alimento->pivot->cantidad_gramos ?? 0;
                    $factor = $cantidad / 100;
                    
                    $totalesComida['calorias'] += ($alimento->calorias_por_100g ?? 0) * $factor;
                    $totalesComida['proteinas'] += ($alimento->proteinas_por_100g ?? 0) * $factor;
                    $totalesComida['carbohidratos'] += ($alimento->carbohidratos_por_100g ?? 0) * $factor;
                    $totalesComida['grasas'] += ($alimento->grasas_por_100g ?? 0) * $factor;
                }

                $totalesPlan['calorias'] += $totalesComida['calorias'];
                $totalesPlan['proteinas'] += $totalesComida['proteinas'];
                $totalesPlan['carbohidratos'] += $totalesComida['carbohidratos'];
                $totalesPlan['grasas'] += $totalesComida['grasas'];

                // Verificar si esta comida ya fue consumida
                $consumida = $ingestas->first(function($ingesta) use ($comida) {
                    return stripos($ingesta->observaciones ?? '', "plan: {$comida->nombre}") !== false 
                           || $ingesta->tipo_comida === $comida->tipo_comida;
                });

                $comidasPlan[] = [
                    'id_comida' => $comida->id_comida,
                    'tipo_comida' => $comida->tipo_comida,
                    'hora_recomendada' => $comida->hora_recomendada,
                    'nombre' => $comida->nombre,
                    'alimentos' => $comida->alimentos,
                    'totales' => [
                        'calorias' => round($totalesComida['calorias'], 0),
                        'proteinas' => round($totalesComida['proteinas'], 1),
                        'carbohidratos' => round($totalesComida['carbohidratos'], 1),
                        'grasas' => round($totalesComida['grasas'], 1)
                    ],
                    'consumida' => $consumida ? true : false,
                    'id_ingesta' => $consumida ? $consumida->id_ingesta : null
                ];
            }
        }

        // Calcular totales consumidos
        $totalesConsumidos = ['calorias' => 0, 'proteinas' => 0, 'carbohidratos' => 0, 'grasas' => 0];
        foreach ($ingestas as $ingesta) {
            $nutrientes = $ingesta->calcularTotales();
            $totalesConsumidos['calorias'] += $nutrientes['calorias'];
            $totalesConsumidos['proteinas'] += $nutrientes['proteinas'];
            $totalesConsumidos['carbohidratos'] += $nutrientes['carbohidratos'];
            $totalesConsumidos['grasas'] += $nutrientes['grasas'];
        }

        // Calcular progreso
        $progreso = [
            'calorias' => $totalesPlan['calorias'] > 0 ? ($totalesConsumidos['calorias'] / $totalesPlan['calorias']) * 100 : 0,
            'proteinas' => $totalesPlan['proteinas'] > 0 ? ($totalesConsumidos['proteinas'] / $totalesPlan['proteinas']) * 100 : 0,
            'carbohidratos' => $totalesPlan['carbohidratos'] > 0 ? ($totalesConsumidos['carbohidratos'] / $totalesPlan['carbohidratos']) * 100 : 0,
            'grasas' => $totalesPlan['grasas'] > 0 ? ($totalesConsumidos['grasas'] / $totalesPlan['grasas']) * 100 : 0
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'fecha' => $fecha,
                'plan' => [
                    'id_plan' => $plan->id_plan,
                    'nombre_plan' => $plan->nombre_plan,
                    'calorias_objetivo' => $plan->calorias_objetivo
                ],
                'comidas_plan' => $comidasPlan,
                'totales_plan' => [
                    'calorias' => round($totalesPlan['calorias'], 0),
                    'proteinas' => round($totalesPlan['proteinas'], 1),
                    'carbohidratos' => round($totalesPlan['carbohidratos'], 1),
                    'grasas' => round($totalesPlan['grasas'], 1)
                ],
                'totales_consumidos' => [
                    'calorias' => round($totalesConsumidos['calorias'], 0),
                    'proteinas' => round($totalesConsumidos['proteinas'], 1),
                    'carbohidratos' => round($totalesConsumidos['carbohidratos'], 1),
                    'grasas' => round($totalesConsumidos['grasas'], 1)
                ],
                'progreso' => [
                    'calorias' => round($progreso['calorias'], 1),
                    'proteinas' => round($progreso['proteinas'], 1),
                    'carbohidratos' => round($progreso['carbohidratos'], 1),
                    'grasas' => round($progreso['grasas'], 1)
                ],
                'comidas_completadas' => count(array_filter($comidasPlan, fn($c) => $c['consumida'])),
                'total_comidas' => count($comidasPlan)
            ]
        ]);
    }
}
