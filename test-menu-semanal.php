<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Paciente;
use App\Models\PlanAlimentacion;
use App\Models\Comida;
use Carbon\Carbon;

echo "🧪 Probando endpoint /mi-menu-semanal...\n\n";

// Obtener usuario de prueba
$user = User::where('email', 'test@app.com')->first();

if (!$user) {
    echo "❌ Usuario no encontrado\n";
    exit(1);
}

echo "✅ Usuario encontrado: {$user->email} (ID: {$user->id})\n";

// Obtener paciente
$paciente = Paciente::where('user_id', $user->id)->first();

if (!$paciente) {
    echo "❌ Paciente no encontrado\n";
    exit(1);
}

echo "✅ Paciente encontrado: ID {$paciente->id_paciente}\n";

// Obtener plan activo
$fechaInicio = Carbon::now()->startOfWeek()->format('Y-m-d');
$fechaFin = Carbon::now()->endOfWeek()->format('Y-m-d');

echo "\n📅 Buscando plan para la semana:\n";
echo "   Inicio: {$fechaInicio}\n";
echo "   Fin: {$fechaFin}\n\n";

$plan = PlanAlimentacion::where('id_paciente', $paciente->id_paciente)
    ->where('fecha_inicio', '<=', $fechaFin)
    ->where('fecha_fin', '>=', $fechaInicio)
    ->first();

if (!$plan) {
    echo "❌ No se encontró plan activo\n";
    exit(1);
}

echo "✅ Plan encontrado: ID {$plan->id_plan}\n";
echo "   Nombre: {$plan->nombre_plan}\n";
echo "   Vigencia: {$plan->fecha_inicio} a {$plan->fecha_fin}\n\n";

// Verificar comidas
echo "🍽️  Verificando comidas...\n";

$comidas = Comida::where('id_plan', $plan->id_plan)
    ->whereBetween('fecha', [$fechaInicio, $fechaFin])
    ->get();

echo "   Total comidas encontradas: " . $comidas->count() . "\n";

if ($comidas->count() > 0) {
    echo "\n📊 Comidas por día:\n";
    $comidasPorDia = $comidas->groupBy('fecha');
    foreach ($comidasPorDia as $fecha => $comidasDia) {
        echo "   {$fecha}: " . $comidasDia->count() . " comidas\n";
    }
} else {
    echo "\n⚠️  No hay comidas para esta semana\n";
    echo "   Ejecuta: php artisan plan:poblar-comidas {$plan->id_plan}\n";
}

echo "\n✅ Prueba completada\n";
