<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlanAlimentacion;
use App\Models\PlanDia;
use App\Models\Comida;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PlanAlimentacionController extends Controller
{
    /**
     * Listar planes de alimentación
     */
    public function index(Request $request)
    {
        $query = PlanAlimentacion::with(['paciente.user', 'dias.comidas.alimentos']);
        
        // Búsqueda por nombre, apellido, correo o celular del paciente
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('paciente', function($q) use ($search) {
                $q->where('nombre', 'LIKE', "%{$search}%")
                  ->orWhere('apellido', 'LIKE', "%{$search}%")
                  ->orWhere('celular', 'LIKE', "%{$search}%")
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('email', 'LIKE', "%{$search}%");
                  });
            });
        }
        
        // Filtrar por paciente ID específico
        if ($request->has('paciente_id')) {
            $query->where('id_paciente', $request->paciente_id);
        }
        
        // Filtrar planes activos
        if ($request->has('activo') && $request->activo == 1) {
            $query->activos();
        }
        
        $planes = $query->paginate(10);
        
        return response()->json($planes);
    }

    /**
     * Crear nuevo plan de alimentación
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:150',
            'descripcion' => 'nullable|string',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_inicio',
            'id_paciente' => 'required|exists:pacientes,id_paciente',
            'id_contrato' => 'nullable|exists:contratos,id_contrato',
            'dias' => 'required|array|min:1',
            'dias.*.dia_index' => 'required|integer|min:1',
            'dias.*.comidas' => 'required|array|min:1',
            'dias.*.comidas.*.tipo_comida' => 'required|in:desayuno,almuerzo,cena,snack',
            'dias.*.comidas.*.orden' => 'required|integer',
            'dias.*.comidas.*.alimentos' => 'required|array|min:1',
            'dias.*.comidas.*.alimentos.*.id_alimento' => 'required|exists:alimentos,id_alimento',
            'dias.*.comidas.*.alimentos.*.cantidad_gramos' => 'required|numeric|min:0.01',
        ]);

        DB::beginTransaction();
        try {
            // Crear el plan
            $plan = PlanAlimentacion::create([
                'nombre' => $request->nombre,
                'descripcion' => $request->descripcion,
                'fecha_inicio' => $request->fecha_inicio,
                'fecha_fin' => $request->fecha_fin,
                'id_paciente' => $request->id_paciente,
                'id_contrato' => $request->id_contrato,
            ]);

            // Crear días, comidas y alimentos
            foreach ($request->dias as $diaData) {
                $dia = PlanDia::create([
                    'id_plan' => $plan->id_plan,
                    'dia_index' => $diaData['dia_index'],
                ]);

                foreach ($diaData['comidas'] as $comidaData) {
                    $comida = Comida::create([
                        'id_dia' => $dia->id_dia,
                        'tipo_comida' => $comidaData['tipo_comida'],
                        'orden' => $comidaData['orden'],
                    ]);

                    // Adjuntar alimentos a la comida
                    foreach ($comidaData['alimentos'] as $alimentoData) {
                        $comida->alimentos()->attach($alimentoData['id_alimento'], [
                            'cantidad_gramos' => $alimentoData['cantidad_gramos']
                        ]);
                    }
                }
            }

            // Generar calendario de entregas automáticamente si hay contrato
            $calendarioCreado = false;
            $entregasGeneradas = 0;
            
            if ($plan->id_contrato) {
                $calendarioCreado = $this->generarCalendarioEntregas($plan);
                if ($calendarioCreado) {
                    $entregasGeneradas = $this->generarEntregasProgramadas($plan);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Plan de alimentación creado exitosamente',
                'plan' => $plan->load('dias.comidas.alimentos'),
                'calendario_entrega' => [
                    'creado' => $calendarioCreado,
                    'entregas_generadas' => $entregasGeneradas
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error al crear plan: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al crear el plan',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Generar calendario de entregas para el plan
     */
    private function generarCalendarioEntregas($plan)
    {
        try {
            // Verificar si ya existe un calendario para este contrato
            $calendarioExistente = \App\Models\CalendarioEntrega::where('id_contrato', $plan->id_contrato)->first();
            
            if ($calendarioExistente) {
                return false; // Ya existe, no crear duplicado
            }
            
            $calendario = \App\Models\CalendarioEntrega::create([
                'id_contrato' => $plan->id_contrato,
                'fecha_inicio' => $plan->fecha_inicio,
                'fecha_fin' => $plan->fecha_fin,
                'estado' => 'ACTIVO',
                'observaciones' => 'Calendario generado automáticamente al crear plan de alimentación'
            ]);
            
            return true;
        } catch (\Exception $e) {
            \Log::error('Error al generar calendario: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Generar entregas programadas basadas en el plan
     */
    private function generarEntregasProgramadas($plan)
    {
        try {
            $calendario = \App\Models\CalendarioEntrega::where('id_contrato', $plan->id_contrato)->first();
            
            if (!$calendario) {
                return 0;
            }
            
            // Obtener la dirección principal del paciente
            $direccion = \App\Models\Direccion::where('id_paciente', $plan->id_paciente)
                ->where('es_principal', true)
                ->first();
            
            if (!$direccion) {
                // Si no hay dirección principal, tomar la primera disponible
                $direccion = \App\Models\Direccion::where('id_paciente', $plan->id_paciente)->first();
            }
            
            if (!$direccion) {
                \Log::warning("No se encontró dirección para paciente {$plan->id_paciente}");
                return 0;
            }
            
            // Calcular número de días del plan
            $fechaInicio = new \DateTime($plan->fecha_inicio);
            $fechaFin = new \DateTime($plan->fecha_fin);
            $intervalo = $fechaInicio->diff($fechaFin);
            $totalDias = $intervalo->days + 1;
            
            // Generar entregas cada 7 días (semanal)
            $entregasCreadas = 0;
            $fechaEntrega = clone $fechaInicio;
            $numeroEntrega = 1;
            
            while ($fechaEntrega <= $fechaFin) {
                \App\Models\EntregaProgramada::create([
                    'id_calendario' => $calendario->id_calendario,
                    'numero_entrega' => $numeroEntrega,
                    'fecha_programada' => $fechaEntrega->format('Y-m-d'),
                    'direccion_entrega' => $direccion->direccion_completa,
                    'ciudad' => $direccion->ciudad,
                    'codigo_postal' => $direccion->codigo_postal,
                    'referencia' => $direccion->referencia,
                    'estado' => 'PENDIENTE',
                    'observaciones' => "Entrega semanal #{$numeroEntrega} - Plan: {$plan->nombre}"
                ]);
                
                $entregasCreadas++;
                $numeroEntrega++;
                
                // Avanzar 7 días
                $fechaEntrega->modify('+7 days');
            }
            
            return $entregasCreadas;
            
        } catch (\Exception $e) {
            \Log::error('Error al generar entregas programadas: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Mostrar plan específico
     */
    public function show($id)
    {
        $plan = PlanAlimentacion::with([
            'paciente',
            'dias' => function($query) {
                $query->orderBy('dia_index');
            },
            'dias.comidas' => function($query) {
                $query->orderBy('orden');
            },
            'dias.comidas.alimentos'
        ])->findOrFail($id);

        // Calcular totales nutricionales por día
        $plan->dias->each(function($dia) {
            $dia->totales = $dia->calcularTotales();
        });

        return response()->json($plan);
    }

    /**
     * Actualizar plan
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'sometimes|string|max:150',
            'descripcion' => 'nullable|string',
            'fecha_inicio' => 'sometimes|date',
            'fecha_fin' => 'sometimes|date|after:fecha_inicio',
        ]);

        $plan = PlanAlimentacion::findOrFail($id);
        $plan->update($request->all());

        return response()->json([
            'message' => 'Plan actualizado exitosamente',
            'plan' => $plan
        ]);
    }

    /**
     * Eliminar plan
     */
    public function destroy($id)
    {
        $plan = PlanAlimentacion::findOrFail($id);
        $plan->delete();

        return response()->json([
            'message' => 'Plan eliminado exitosamente'
        ]);
    }

    /**
     * Toggle the status of the specified plan.
     */
    public function toggleStatus(Request $request, $id)
    {
        try {
            $plan = PlanAlimentacion::findOrFail($id);
            
            $plan->activo = $request->input('activo', !$plan->activo);
            $plan->save();

            return response()->json([
                'success' => true,
                'message' => 'Estado del plan actualizado exitosamente',
                'data' => $plan
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el estado del plan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener el plan activo del paciente autenticado
     */
    public function miPlan(Request $request)
    {
        try {
            $user = auth()->user();
            
            // Obtener el paciente asociado al usuario
            $paciente = \App\Models\Paciente::where('user_id', $user->id)->first();
            
            if (!$paciente) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontró información del paciente'
                ], 404);
            }
            
            // Obtener planes del paciente ordenados por fecha
            $planes = PlanAlimentacion::with(['dias.comidas.alimentos', 'contrato.servicio'])
                ->where('id_paciente', $paciente->id_paciente)
                ->orderBy('fecha_inicio', 'desc')
                ->get();
            
            // Identificar el plan activo (si existe)
            $planActivo = $planes->first(function ($plan) {
                $hoy = now();
                return $plan->fecha_inicio <= $hoy && $plan->fecha_fin >= $hoy;
            });
            
            return response()->json([
                'success' => true,
                'data' => [
                    'plan_activo' => $planActivo,
                    'todos_los_planes' => $planes,
                    'total_planes' => $planes->count()
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error al obtener plan del paciente: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el plan',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
