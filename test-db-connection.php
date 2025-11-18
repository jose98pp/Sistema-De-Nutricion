<?php
// Script para verificar la conexión a la base de datos

echo "=== Verificación de conexión a MySQL ===\n";

// Configuración de la base de datos
$host = '127.0.0.1';
$port = 3306;
$database = 'nutricion';
$username = 'root';
$password = '';

try {
    echo "Intentando conectar a MySQL...\n";
    echo "Host: $host\n";
    echo "Puerto: $port\n";
    echo "Usuario: $username\n";
    echo "Base de datos: $database\n\n";
    
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$database", $username, $password);
    echo "✅ ¡Conexión exitosa a MySQL!\n\n";
    
    // Verificar tablas
    echo "=== Tablas en la base de datos ===\n";
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "Total de tablas: " . count($tables) . "\n";
    
    // Verificar si existe la tabla planes_alimentacion
    if (in_array('planes_alimentacion', $tables)) {
        echo "✅ Tabla 'planes_alimentacion' existe\n";
        
        // Verificar columnas
        $columns = $pdo->query("SHOW COLUMNS FROM planes_alimentacion")->fetchAll(PDO::FETCH_COLUMN);
        if (in_array('id_contrato', $columns)) {
            echo "✅ Columna 'id_contrato' existe en planes_alimentacion\n";
        } else {
            echo "❌ Columna 'id_contrato' NO existe en planes_alimentacion\n";
        }
    } else {
        echo "❌ Tabla 'planes_alimentacion' NO existe\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Error de conexión: " . $e->getMessage() . "\n";
    echo "Código de error: " . $e->getCode() . "\n";
} catch (Exception $e) {
    echo "❌ Error general: " . $e->getMessage() . "\n";
}

echo "\n=== Fin de la verificación ===\n";