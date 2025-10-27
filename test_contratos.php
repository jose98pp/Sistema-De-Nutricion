<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Contrato;

try {
    echo "Contando contratos...\n";
    $count = Contrato::count();
    echo "Total contratos: $count\n\n";
    
    if ($count > 0) {
        echo "Intentando cargar con relaciones...\n";
        $contratos = Contrato::with(['paciente', 'servicio'])->first();
        echo "Primer contrato cargado exitosamente:\n";
        echo "ID: {$contratos->id_contrato}\n";
        echo "Paciente: " . ($contratos->paciente ? $contratos->paciente->nombre : 'NULL') . "\n";
        echo "Servicio: " . ($contratos->servicio ? $contratos->servicio->nombre : 'NULL') . "\n";
    }
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Archivo: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
