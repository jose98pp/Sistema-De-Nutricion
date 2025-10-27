<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "🔍 Probando conexión a MySQL...\n\n";

try {
    // Intentar conexión
    DB::connection()->getPdo();
    echo "✅ CONEXIÓN EXITOSA!\n\n";
    
    // Mostrar información
    $database = DB::connection()->getDatabaseName();
    echo "📊 Base de datos: $database\n";
    
    // Contar tablas
    $tables = DB::select('SHOW TABLES');
    $count = count($tables);
    echo "📋 Total de tablas: $count\n\n";
    
    if ($count > 0) {
        echo "Tablas encontradas:\n";
        foreach (array_slice($tables, 0, 10) as $table) {
            $tableName = array_values((array)$table)[0];
            echo "  ✓ $tableName\n";
        }
        if ($count > 10) {
            echo "  ... y " . ($count - 10) . " más\n";
        }
    }
    
    echo "\n✅ ¡Todo funciona correctamente!\n";
    
} catch (\Exception $e) {
    echo "❌ ERROR DE CONEXIÓN\n\n";
    echo "Mensaje: " . $e->getMessage() . "\n\n";
    
    echo "💡 Posibles soluciones:\n";
    echo "1. Verifica que MySQL esté corriendo en XAMPP\n";
    echo "2. Revisa tu archivo .env:\n";
    echo "   - DB_HOST=127.0.0.1\n";
    echo "   - DB_PORT=3306\n";
    echo "   - DB_DATABASE=nutricion\n";
    echo "   - DB_USERNAME=root\n";
    echo "   - DB_PASSWORD= (vacío)\n";
    echo "3. Asegúrate que la base de datos 'nutricion' existe\n";
}
