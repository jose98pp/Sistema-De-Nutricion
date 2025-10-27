<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlanAlimentacion;
use Illuminate\Http\Request;
use Carbon\Carbon;

class MenuSemanalController extends Controller
{
    /**
     * Obtener menú semanal del paciente autenticado
     */
    public function miMenuSemanal(Request $request)
    {
        $user = $request->user();
        $paciente = $user->paciente;
        
        if (!$paciente) {
            return response()->json([
                'success' => false,
                'message' => 'No eres un paciente registrado'
            ], 403);
        }

        // Obtener fecha de inicio de semana (parámetro opcional, por defecto esta semana)
        $fechaInicio = $request->get('fecha_inicio', Carbon::now()->startOfWeek());
        $fechaInicio = Carbon::parse($fechaInicio)->startOfDay();
        $fechaFin = $fechaInicio->copy()->addDays(6)->endOfDay();

        // Obtener plan activo del paciente
        $plan = PlanAlimentacion::whereHas('contrato', function($query) use ($paciente) {
            $query->where('id_paciente', $paciente->id_paciente)
                  ->where('estado', 'ACTIVO');
        })->where('estado', 'ACTIVO')
          ->with(['dias.comidas.alimentos'])
          ->first();

        if (!$plan) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes un plan activo'
            ], 404);
        }

        // Obtener días del plan que caen en esta semana
        $diasSemana = $plan->dias()
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->with(['comidas' => function($query) {
                $query->orderBy('hora_recomendada');
            }, 'comidas.alimentos'])
            ->orderBy('fecha')
            ->get();

        $menuSemanal = [];
        $totalesSemana = [
            'calorias' => 0,
            'proteinas' => 0,
            'carbohidratos' => 0,
            'grasas' => 0,
            'total_comidas' => 0
        ];

        foreach ($diasSemana as $dia) {
            $comidasDelDia = [];
            $totalesDia = ['calorias' => 0, 'proteinas' => 0, 'carbohidratos' => 0, 'grasas' => 0];

            foreach ($dia->comidas as $comida) {
                $totalesComida = ['calorias' => 0, 'proteinas' => 0, 'carbohidratos' => 0, 'grasas' => 0];
                
                $alimentosFormateados = [];
                foreach ($comida->alimentos as $alimento) {
                    $cantidad = $alimento->pivot->cantidad_gramos ?? 0;
                    $factor = $cantidad / 100;
                    
                    $caloriasPorcion = ($alimento->calorias_por_100g ?? 0) * $factor;
                    $proteinasPorcion = ($alimento->proteinas_por_100g ?? 0) * $factor;
                    $carbohidratosPorcion = ($alimento->carbohidratos_por_100g ?? 0) * $factor;
                    $grasasPorcion = ($alimento->grasas_por_100g ?? 0) * $factor;
                    
                    $totalesComida['calorias'] += $caloriasPorcion;
                    $totalesComida['proteinas'] += $proteinasPorcion;
                    $totalesComida['carbohidratos'] += $carbohidratosPorcion;
                    $totalesComida['grasas'] += $grasasPorcion;

                    $alimentosFormateados[] = [
                        'id_alimento' => $alimento->id_alimento,
                        'nombre' => $alimento->nombre,
                        'cantidad_gramos' => $cantidad,
                        'calorias' => round($caloriasPorcion, 1),
                        'proteinas' => round($proteinasPorcion, 1),
                        'carbohidratos' => round($carbohidratosPorcion, 1),
                        'grasas' => round($grasasPorcion, 1)
                    ];
                }

                $totalesDia['calorias'] += $totalesComida['calorias'];
                $totalesDia['proteinas'] += $totalesComida['proteinas'];
                $totalesDia['carbohidratos'] += $totalesComida['carbohidratos'];
                $totalesDia['grasas'] += $totalesComida['grasas'];

                $comidasDelDia[] = [
                    'id_comida' => $comida->id_comida,
                    'tipo_comida' => $comida->tipo_comida,
                    'hora_recomendada' => $comida->hora_recomendada,
                    'nombre' => $comida->nombre,
                    'descripcion' => $comida->descripcion,
                    'instrucciones' => $comida->instrucciones,
                    'alimentos' => $alimentosFormateados,
                    'totales' => [
                        'calorias' => round($totalesComida['calorias'], 0),
                        'proteinas' => round($totalesComida['proteinas'], 1),
                        'carbohidratos' => round($totalesComida['carbohidratos'], 1),
                        'grasas' => round($totalesComida['grasas'], 1)
                    ]
                ];
            }

            $totalesSemana['calorias'] += $totalesDia['calorias'];
            $totalesSemana['proteinas'] += $totalesDia['proteinas'];
            $totalesSemana['carbohidratos'] += $totalesDia['carbohidratos'];
            $totalesSemana['grasas'] += $totalesDia['grasas'];
            $totalesSemana['total_comidas'] += count($comidasDelDia);

            $menuSemanal[] = [
                'fecha' => $dia->fecha,
                'dia_semana' => $dia->dia_semana,
                'dia_numero' => $dia->dia_numero,
                'comidas' => $comidasDelDia,
                'totales_dia' => [
                    'calorias' => round($totalesDia['calorias'], 0),
                    'proteinas' => round($totalesDia['proteinas'], 1),
                    'carbohidratos' => round($totalesDia['carbohidratos'], 1),
                    'grasas' => round($totalesDia['grasas'], 1)
                ]
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'plan' => [
                    'id_plan' => $plan->id_plan,
                    'nombre_plan' => $plan->nombre_plan,
                    'objetivo' => $plan->objetivo,
                    'calorias_objetivo' => $plan->calorias_objetivo
                ],
                'fecha_inicio' => $fechaInicio->toDateString(),
                'fecha_fin' => $fechaFin->toDateString(),
                'dias' => $menuSemanal,
                'totales_semana' => [
                    'calorias' => round($totalesSemana['calorias'], 0),
                    'proteinas' => round($totalesSemana['proteinas'], 1),
                    'carbohidratos' => round($totalesSemana['carbohidratos'], 1),
                    'grasas' => round($totalesSemana['grasas'], 1),
                    'total_comidas' => $totalesSemana['total_comidas']
                ]
            ]
        ]);
    }

    /**
     * Obtener menú de un día específico
     */
    public function menuDelDia(Request $request)
    {
        $user = $request->user();
        $paciente = $user->paciente;
        
        if (!$paciente) {
            return response()->json([
                'success' => false,
                'message' => 'No eres un paciente registrado'
            ], 403);
        }

        $fecha = $request->get('fecha', Carbon::now()->toDateString());
        $fecha = Carbon::parse($fecha);

        // Obtener plan activo
        $plan = PlanAlimentacion::whereHas('contrato', function($query) use ($paciente) {
            $query->where('id_paciente', $paciente->id_paciente)
                  ->where('estado', 'ACTIVO');
        })->where('estado', 'ACTIVO')
          ->with(['dias.comidas.alimentos'])
          ->first();

        if (!$plan) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes un plan activo'
            ], 404);
        }

        // Obtener día específico
        $dia = $plan->dias()
            ->where('fecha', $fecha->toDateString())
            ->with(['comidas' => function($query) {
                $query->orderBy('hora_recomendada');
            }, 'comidas.alimentos'])
            ->first();

        if (!$dia) {
            return response()->json([
                'success' => false,
                'message' => 'No hay comidas programadas para esta fecha'
            ], 404);
        }

        $comidasDelDia = [];
        $totalesDia = ['calorias' => 0, 'proteinas' => 0, 'carbohidratos' => 0, 'grasas' => 0];

        foreach ($dia->comidas as $comida) {
            $totalesComida = ['calorias' => 0, 'proteinas' => 0, 'carbohidratos' => 0, 'grasas' => 0];
            
            $alimentosFormateados = [];
            foreach ($comida->alimentos as $alimento) {
                $cantidad = $alimento->pivot->cantidad_gramos ?? 0;
                $factor = $cantidad / 100;
                
                $caloriasPorcion = ($alimento->calorias_por_100g ?? 0) * $factor;
                $proteinasPorcion = ($alimento->proteinas_por_100g ?? 0) * $factor;
                $carbohidratosPorcion = ($alimento->carbohidratos_por_100g ?? 0) * $factor;
                $grasasPorcion = ($alimento->grasas_por_100g ?? 0) * $factor;
                
                $totalesComida['calorias'] += $caloriasPorcion;
                $totalesComida['proteinas'] += $proteinasPorcion;
                $totalesComida['carbohidratos'] += $carbohidratosPorcion;
                $totalesComida['grasas'] += $grasasPorcion;

                $alimentosFormateados[] = [
                    'id_alimento' => $alimento->id_alimento,
                    'nombre' => $alimento->nombre,
                    'cantidad_gramos' => $cantidad,
                    'calorias' => round($caloriasPorcion, 1),
                    'proteinas' => round($proteinasPorcion, 1),
                    'carbohidratos' => round($carbohidratosPorcion, 1),
                    'grasas' => round($grasasPorcion, 1)
                ];
            }

            $totalesDia['calorias'] += $totalesComida['calorias'];
            $totalesDia['proteinas'] += $totalesComida['proteinas'];
            $totalesDia['carbohidratos'] += $totalesComida['carbohidratos'];
            $totalesDia['grasas'] += $totalesComida['grasas'];

            $comidasDelDia[] = [
                'id_comida' => $comida->id_comida,
                'tipo_comida' => $comida->tipo_comida,
                'hora_recomendada' => $comida->hora_recomendada,
                'nombre' => $comida->nombre,
                'descripcion' => $comida->descripcion,
                'instrucciones' => $comida->instrucciones,
                'alimentos' => $alimentosFormateados,
                'totales' => [
                    'calorias' => round($totalesComida['calorias'], 0),
                    'proteinas' => round($totalesComida['proteinas'], 1),
                    'carbohidratos' => round($totalesComida['carbohidratos'], 1),
                    'grasas' => round($totalesComida['grasas'], 1)
                ]
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'plan' => [
                    'id_plan' => $plan->id_plan,
                    'nombre_plan' => $plan->nombre_plan,
                    'objetivo' => $plan->objetivo,
                    'calorias_objetivo' => $plan->calorias_objetivo
                ],
                'fecha' => $dia->fecha,
                'dia_semana' => $dia->dia_semana,
                'comidas' => $comidasDelDia,
                'totales_dia' => [
                    'calorias' => round($totalesDia['calorias'], 0),
                    'proteinas' => round($totalesDia['proteinas'], 1),
                    'carbohidratos' => round($totalesDia['carbohidratos'], 1),
                    'grasas' => round($totalesDia['grasas'], 1)
                ]
            ]
        ]);
    }
}
