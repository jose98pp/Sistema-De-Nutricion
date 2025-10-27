<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alimento;
use Illuminate\Http\Request;

class AlimentoController extends Controller
{
    /**
     * Listar alimentos
     */
    public function index(Request $request)
    {
        $query = Alimento::query();
        
        // Búsqueda por nombre
        if ($request->has('search')) {
            $query->where('nombre', 'like', '%' . $request->search . '%');
        }
        
        // Filtro por categoría
        if ($request->has('categoria')) {
            $query->where('categoria', $request->categoria);
        }
        
        // Filtro por restricciones
        if ($request->has('restricciones')) {
            $query->where('restricciones', 'like', '%' . $request->restricciones . '%');
        }
        
        $alimentos = $query->paginate(20);
        
        return response()->json($alimentos);
    }

    /**
     * Registrar nuevo alimento
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:150',
            'categoria' => 'required|in:fruta,verdura,cereal,proteina,lacteo,grasa,otro',
            'calorias_por_100g' => 'required|numeric|min:0',
            'proteinas_por_100g' => 'required|numeric|min:0',
            'carbohidratos_por_100g' => 'required|numeric|min:0',
            'grasas_por_100g' => 'required|numeric|min:0',
            'restricciones' => 'nullable|string',
        ]);

        $alimento = Alimento::create($request->all());

        return response()->json([
            'message' => 'Alimento registrado exitosamente',
            'alimento' => $alimento
        ], 201);
    }

    /**
     * Mostrar alimento específico
     */
    public function show($id)
    {
        $alimento = Alimento::findOrFail($id);
        return response()->json($alimento);
    }

    /**
     * Actualizar alimento
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'sometimes|string|max:150',
            'categoria' => 'sometimes|in:fruta,verdura,cereal,proteina,lacteo,grasa,otro',
            'calorias_por_100g' => 'sometimes|numeric|min:0',
            'proteinas_por_100g' => 'sometimes|numeric|min:0',
            'carbohidratos_por_100g' => 'sometimes|numeric|min:0',
            'grasas_por_100g' => 'sometimes|numeric|min:0',
            'restricciones' => 'nullable|string',
        ]);

        $alimento = Alimento::findOrFail($id);
        $alimento->update($request->all());

        return response()->json([
            'message' => 'Alimento actualizado exitosamente',
            'alimento' => $alimento
        ]);
    }

    /**
     * Eliminar alimento
     */
    public function destroy($id)
    {
        $alimento = Alimento::findOrFail($id);
        $alimento->delete();

        return response()->json([
            'message' => 'Alimento eliminado exitosamente'
        ]);
    }
}
