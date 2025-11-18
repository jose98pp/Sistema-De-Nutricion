<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "🔍 Verificando usuario test@app.com...\n\n";

$user = User::where('email', 'test@app.com')->first();

if ($user) {
    echo "✅ Usuario encontrado:\n";
    echo "   - ID: {$user->id}\n";
    echo "   - Email: {$user->email}\n";
    echo "   - Nombre: {$user->name}\n";
    echo "   - Role: {$user->role}\n";
    echo "\n";
    
    // Verificar contraseña
    $password = '123456';
    $isValid = Hash::check($password, $user->password);
    
    if ($isValid) {
        echo "✅ Contraseña '123456' es CORRECTA\n";
    } else {
        echo "❌ Contraseña '123456' es INCORRECTA\n";
        echo "\n🔧 Actualizando contraseña...\n";
        $user->password = Hash::make($password);
        $user->save();
        echo "✅ Contraseña actualizada correctamente\n";
    }
    
    // Verificar si tiene paciente asociado
    if ($user->role === 'paciente') {
        $paciente = \App\Models\Paciente::where('user_id', $user->id)->first();
        if ($paciente) {
            echo "\n✅ Paciente asociado:\n";
            echo "   - ID Paciente: {$paciente->id_paciente}\n";
            echo "   - Nombre: {$paciente->nombre} {$paciente->apellido}\n";
        } else {
            echo "\n❌ NO tiene paciente asociado\n";
        }
    }
} else {
    echo "❌ Usuario NO encontrado\n";
    echo "\n🔧 Creando usuario de prueba...\n";
    
    // Crear usuario
    $user = User::create([
        'name' => 'Usuario Prueba',
        'email' => 'test@app.com',
        'password' => Hash::make('123456'),
        'role' => 'paciente',
        'email_verified_at' => now()
    ]);
    
    echo "✅ Usuario creado: {$user->email}\n";
    
    // Crear paciente
    $paciente = \App\Models\Paciente::create([
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
}

echo "\n✅ Verificación completada\n";
echo "\n📱 Credenciales para la app:\n";
echo "   Email: test@app.com\n";
echo "   Password: 123456\n";
