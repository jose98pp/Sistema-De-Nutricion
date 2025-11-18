<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\PlanDia;
use Carbon\Carbon;

echo "🧪 Probando endpoint corregido /mi-menu-semanal...\n\n";

// Obtener usuario de prueba
$user = User::where('email', 'test@app.com')->first();

if (!$user) {
    echo "❌ Usuario no encontrado\n";
    exit(1);
}

echo "✅ Usuario: {$user->email}\n";

// Obtener paciente
$paciente = $user->paciente ?? \App\Models\Paciente::where('user_id', $user->id)->first();

if (!$paciente) {
    echo "❌ Paciente no encontrado\n";
    exit(1);
}

echo "✅ Paciente: ID {$paciente->id_paciente}\n";

// Obtener plan activo
$fechaInicio = Carbon::now()->startOfWeek()->format('Y-m-d');
$fechaFin = Carbon::now()->endOfWeek()->format('Y-m-d');

$plan = \App\Models\PlanAlimentacion::where('id_paciente', $paciente->id_paciente)
    ->where('fecha_inicio', '<=', $fechaFin)
    ->where('fecha_fin', '>=', $fechaInicio)
    ->first();

if (!$plan) {
    echo "❌ Plan no encontrado\n";
    exit(1);
}

echo "✅ Plan: ID {$plan->id_plan} - {$plan->nombre_plan}\n\n";

// Obtener plan_dias
echo "📅 Buscando plan_dias para la semana {$fechaInicio} a {$fechaFin}...\n";

$planDias = PlanDia::where('id_plan', $plan->id_plan)
    ->whereBetween('fecha', [$fechaInicio, $fechaFin])
    ->with(['comidas.alimentos'])
    ->orderBy('fecha')
    ->get();

echo "   Total días encontrados: " . $planDias->count() . "\n\n";

if ($planDias->count() > 0) {
    echo "📊 Detalle por día:\n";
    foreach ($planDias as $dia) {
        $comidasCount = $dia->comidas->count();
        echo "   {$dia->fecha} ({$dia->dia_semana}): {$comidasCount} comidas\n";
        
        foreach ($dia->comidas as $comida) {
            $alimentosCount = $comida->alimentos->count();
            echo "      - {$comida->nombre} ({$comida->tipo_comida}): {$alimentosCount} alimentos\n";
        }
    }
} else {
    echo "⚠️  No hay días creados para esta semana\n";
    echo "   Ejecuta: php artisan plan:poblar-comidas {$plan->id_plan}\n";
}

echo "\n✅ Prueba completada\n";
