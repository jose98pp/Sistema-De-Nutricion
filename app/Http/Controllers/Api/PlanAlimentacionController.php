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
        $query = PlanAlimentacion::with(['paciente', 'dias.comidas.alimentos']);
        
        // Filtrar por paciente
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

            DB::commit();

            return response()->json([
                'message' => 'Plan de alimentación creado exitosamente',
                'plan' => $plan->load('dias.comidas.alimentos')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear el plan',
                'error' => $e->getMessage()
            ], 500);
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
}
