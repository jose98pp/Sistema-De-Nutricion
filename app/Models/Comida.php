<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comida extends Model
{
    use HasFactory;

    protected $table = 'comidas';
    protected $primaryKey = 'id_comida';

    protected $fillable = [
        'id_dia',
        'tipo_comida',
        'hora_recomendada',
        'nombre',
        'descripcion',
        'instrucciones',
        'orden',
    ];

    protected $casts = [
        'orden' => 'integer',
    ];

    // Relaciones
    public function dia()
    {
        return $this->belongsTo(PlanDia::class, 'id_dia');
    }

    public function alimentos()
    {
        return $this->belongsToMany(Alimento::class, 'alimento_comida', 'id_comida', 'id_alimento')
                    ->withPivot('cantidad_gramos', 'id_alimento_comida')
                    ->withTimestamps();
    }

    public function recetas()
    {
        return $this->belongsToMany(Receta::class, 'comida_receta', 'id_comida', 'id_receta')
                    ->withPivot('porciones')
                    ->withTimestamps();
    }

    public function entregas()
    {
        return $this->hasMany(EntregaProgramada::class, 'id_comida', 'id_comida');
    }

    // Método helper para calcular totales nutricionales de la comida
    public function calcularTotales()
    {
        $totales = [
            'calorias' => 0,
            'proteinas' => 0,
            'carbohidratos' => 0,
            'grasas' => 0,
        ];

        foreach ($this->alimentos as $alimento) {
            $cantidad = $alimento->pivot->cantidad_gramos;
            $nutrientes = $alimento->calcularNutrientes($cantidad);
            
            $totales['calorias'] += $nutrientes['calorias'];
            $totales['proteinas'] += $nutrientes['proteinas'];
            $totales['carbohidratos'] += $nutrientes['carbohidratos'];
            $totales['grasas'] += $nutrientes['grasas'];
        }

        return $totales;
    }
}
