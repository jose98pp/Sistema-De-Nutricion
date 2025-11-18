<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Paciente;
use App\Models\PlanAlimentacion;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;

echo "🚀 Configurando usuario completo para la app...\n\n";

// Buscar o crear usuario
$user = User::where('email', 'test@app.com')->first();

if (!$user) {
    $user = User::create([
        'name' => 'Usuario Prueba',
        'email' => 'test@app.com',
        'password' => Hash::make('123456'),
        'role' => 'paciente',
        'email_verified_at' => now()
    ]);
    echo "✅ Usuario creado: {$user->email}\n";
} else {
    // Actualizar contraseña por si acaso
    $user->password = Hash::make('123456');
    $user->save();
    echo "✅ Usuario encontrado y contraseña actualizada: {$user->email}\n";
}

// Buscar o crear paciente
$paciente = Paciente::where('user_id', $user->id)->first();

if (!$paciente) {
    $paciente = Paciente::create([
        'user_id' => $user->id,
        'nombre' => 'Usuario',
        'apellido' => 'Prueba',
        'fecha_nacimiento' => '1990-01-01',
        'genero' => 'M',
        'email' => $user->email,
        'telefono' => '+1 234 567 8900',
        'peso_inicial' => 80.00,
        'estatura' => 1.75,
        'id_nutricionista' => 1
    ]);
    echo "✅ Paciente creado: ID {$paciente->id_paciente}\n";
} else {
    echo "✅ Paciente encontrado: ID {$paciente->id_paciente}\n";
}

// Buscar plan activo
$plan = PlanAlimentacion::where('id_paciente', $paciente->id_paciente)
    ->where('estado', 'activo')
    ->first();

if (!$plan) {
    $plan = PlanAlimentacion::create([
        'id_paciente' => $paciente->id_paciente,
        'id_nutricionista' => 1,
        'nombre' => 'Plan App Móvil',
        'nombre_plan' => 'Plan Nutricional App',
        'objetivo' => 'perdida_peso',
        'calorias_diarias' => 2000,
        'proteinas' => 150,
        'carbohidratos' => 200,
        'grasas' => 67,
        'fecha_inicio' => Carbon::now()->subDays(7),
        'fecha_fin' => Carbon::now()->addDays(30),
        'estado' => 'activo'
    ]);
    echo "✅ Plan creado: ID {$plan->id_plan}\n";
} else {
    echo "✅ Plan activo encontrado: ID {$plan->id_plan}\n";
}

echo "\n📊 Resumen:\n";
echo "   - Usuario ID: {$user->id}\n";
echo "   - Paciente ID: {$paciente->id_paciente}\n";
echo "   - Plan ID: {$plan->id_plan}\n";

echo "\n🎯 Credenciales para la app:\n";
echo "   Email: test@app.com\n";
echo "   Password: 123456\n";

echo "\n🚀 Ahora ejecuta: php artisan plan:poblar-comidas {$plan->id_plan}\n";
