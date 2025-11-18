<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\PlanAlimentacion;
use App\Models\Comida;
use Carbon\Carbon;

// Crear plan de alimentación
$plan = PlanAlimentacion::create([
    'id_paciente' => 12,
    'id_nutricionista' => 1,
    'nombre' => 'Plan de Pérdida de Peso',
    'nombre_plan' => 'Plan Nutricional Personalizado',
    'objetivo' => 'perdida_peso',
    'calorias_diarias' => 2000,
    'proteinas' => 150,
    'carbohidratos' => 200,
    'grasas' => 67,
    'fecha_inicio' => Carbon::now()->subDays(7),
    'fecha_fin' => Carbon::now()->addDays(30),
    'estado' => 'activo'
]);

echo "✅ Plan creado con ID: {$plan->id_plan}\n";

// Crear comidas para la semana
$dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
$tiposComida = ['desayuno', 'media_mañana', 'almuerzo', 'merienda', 'cena'];

$comidaExamples = [
    'desayuno' => [
        'nombre' => 'Desayuno Saludable',
        'descripcion' => 'Avena con frutas y nueces',
        'calorias' => 400,
        'proteinas' => 15,
        'carbohidratos' => 60,
        'grasas' => 10
    ],
    'media_mañana' => [
        'nombre' => 'Snack Matutino',
        'descripcion' => 'Yogurt griego con almendras',
        'calorias' => 200,
        'proteinas' => 15,
        'carbohidratos' => 20,
        'grasas' => 8
    ],
    'almuerzo' => [
        'nombre' => 'Almuerzo Balanceado',
        'descripcion' => 'Pollo a la plancha con ensalada y arroz integral',
        'calorias' => 600,
        'proteinas' => 45,
        'carbohidratos' => 60,
        'grasas' => 15
    ],
    'merienda' => [
        'nombre' => 'Merienda Ligera',
        'descripcion' => 'Frutas frescas con queso cottage',
        'calorias' => 250,
        'proteinas' => 12,
        'carbohidratos' => 35,
        'grasas' => 6
    ],
    'cena' => [
        'nombre' => 'Cena Nutritiva',
        'descripcion' => 'Pescado al horno con vegetales',
        'calorias' => 550,
        'proteinas' => 40,
        'carbohidratos' => 45,
        'grasas' => 18
    ]
];

$comidasCreadas = 0;

foreach ($dias as $dia) {
    foreach ($tiposComida as $tipo) {
        $data = $comidaExamples[$tipo];
        
        Comida::create([
            'id_plan' => $plan->id_plan,
            'dia_semana' => $dia,
            'tipo_comida' => $tipo,
            'nombre' => $data['nombre'],
            'descripcion' => $data['descripcion'],
            'calorias' => $data['calorias'],
            'proteinas' => $data['proteinas'],
            'carbohidratos' => $data['carbohidratos'],
            'grasas' => $data['grasas']
        ]);
        
        $comidasCreadas++;
    }
}

echo "✅ {$comidasCreadas} comidas creadas para el plan\n";
echo "\n📊 Resumen:\n";
echo "- Plan ID: {$plan->id_plan}\n";
echo "- Paciente ID: 12 (paciente@test.com)\n";
echo "- Fecha inicio: {$plan->fecha_inicio}\n";
echo "- Fecha fin: {$plan->fecha_fin}\n";
echo "- Comidas por día: 5\n";
echo "- Total comidas: {$comidasCreadas}\n";
echo "\n✨ El usuario paciente@test.com ahora tiene un plan completo!\n";
