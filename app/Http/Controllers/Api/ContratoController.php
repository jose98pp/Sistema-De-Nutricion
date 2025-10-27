<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contrato;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContratoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            \Log::info('Iniciando carga de contratos');
            
            $contratos = Contrato::with(['paciente', 'servicio'])
                ->orderBy('created_at', 'desc')
                ->get();
            
            \Log::info('Contratos cargados: ' . $contratos->count());
            
            return response()->json([
                'success' => true,
                'data' => $contratos
            ]);
        } catch (\Exception $e) {
            \Log::error('Error al cargar contratos: ' . $e->getMessage());
            \Log::error('Trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al cargar contratos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_paciente' => 'required|exists:pacientes,id_paciente',
            'id_servicio' => 'required|exists:servicios,id_servicio',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'costo_contratado' => 'required|numeric|min:0',
            'estado' => 'required|in:PENDIENTE,ACTIVO,FINALIZADO,CANCELADO',
            'observaciones' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $contrato = Contrato::create($request->all());
        $contrato->load(['paciente', 'servicio']);

        return response()->json([
            'success' => true,
            'message' => 'Contrato creado exitosamente',
            'data' => $contrato
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $contrato = Contrato::with(['paciente', 'servicio', 'planesAlimentacion'])
            ->find($id);

        if (!$contrato) {
            return response()->json([
                'success' => false,
                'message' => 'Contrato no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $contrato
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $contrato = Contrato::find($id);

        if (!$contrato) {
            return response()->json([
                'success' => false,
                'message' => 'Contrato no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'id_paciente' => 'sometimes|required|exists:pacientes,id_paciente',
            'id_servicio' => 'sometimes|required|exists:servicios,id_servicio',
            'fecha_inicio' => 'sometimes|required|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'costo_contratado' => 'sometimes|required|numeric|min:0',
            'estado' => 'sometimes|required|in:PENDIENTE,ACTIVO,FINALIZADO,CANCELADO',
            'observaciones' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $contrato->update($request->all());
        $contrato->load(['paciente', 'servicio']);

        return response()->json([
            'success' => true,
            'message' => 'Contrato actualizado exitosamente',
            'data' => $contrato
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $contrato = Contrato::find($id);

        if (!$contrato) {
            return response()->json([
                'success' => false,
                'message' => 'Contrato no encontrado'
            ], 404);
        }

        // Check if contrato has planes
        if ($contrato->planesAlimentacion()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar el contrato porque tiene planes alimentarios asociados'
            ], 400);
        }

        $contrato->delete();

        return response()->json([
            'success' => true,
            'message' => 'Contrato eliminado exitosamente'
        ]);
    }

    /**
     * Get contratos by paciente
     */
    public function getByPaciente($idPaciente)
    {
        $contratos = Contrato::with(['servicio', 'planesAlimentacion'])
            ->where('id_paciente', $idPaciente)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $contratos
        ]);
    }

    /**
     * Get contratos by estado
     */
    public function getByEstado($estado)
    {
        $contratos = Contrato::with(['paciente', 'servicio'])
            ->where('estado', $estado)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $contratos
        ]);
    }
}
