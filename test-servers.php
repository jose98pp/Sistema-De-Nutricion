<?php
// Script de prueba para verificar el funcionamiento de los servidores

echo "=== Prueba de Servidores NutriSystem ===\n\n";

// 1. Verificar conexión a la base de datos
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=nutricion', 'root', '');
    echo "✅ Conexión a base de datos: OK\n";
} catch (Exception $e) {
    echo "❌ Error de base de datos: " . $e->getMessage() . "\n";
}

// 2. Verificar que Laravel esté respondiendo
$ch = curl_init('http://127.0.0.1:8000/api/alimentos');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode == 401) {
    echo "✅ API Laravel respondiendo (401 - sin autenticación): OK\n";
} else {
    echo "❌ API Laravel no responde correctamente (HTTP: $httpCode)\n";
}

// 3. Verificar que Vite esté respondiendo
$ch = curl_init('http://localhost:5173');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode == 200) {
    echo "✅ Servidor Vite respondiendo: OK\n";
} else {
    echo "❌ Servidor Vite no responde correctamente (HTTP: $httpCode)\n";
}

echo "\n=== Resumen ===\n";
echo "Backend API: http://127.0.0.1:8000\n";
echo "Frontend web: http://localhost:5173\n";
echo "Para probar manualmente:\n";
echo "- API alimentos: http://127.0.0.1:8000/api/alimentos (debe dar 401)\n";
echo "- Frontend: http://localhost:5173 (debe cargar la interfaz)\n";
?>