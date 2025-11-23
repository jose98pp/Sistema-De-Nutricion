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

// 2. Verificar que Laravel esté respondiendo (401 sin token y 200 con token)
// 2.1 Sin autenticación
$ch = curl_init('http://127.0.0.1:8000/api/alimentos');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json'
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode == 401) {
    echo "✅ API Laravel responde sin token (401): OK\n";
} else {
    echo "❌ API Laravel sin token HTTP: $httpCode\n";
}

// 2.2 Con autenticación
$loginCh = curl_init('http://127.0.0.1:8000/api/login');
curl_setopt($loginCh, CURLOPT_RETURNTRANSFER, true);
curl_setopt($loginCh, CURLOPT_TIMEOUT, 5);
curl_setopt($loginCh, CURLOPT_POST, true);
curl_setopt($loginCh, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
$loginBody = json_encode(['email' => 'admin@nutricion.com', 'password' => 'password']);
curl_setopt($loginCh, CURLOPT_POSTFIELDS, $loginBody);
$loginResp = curl_exec($loginCh);
$loginCode = curl_getinfo($loginCh, CURLINFO_HTTP_CODE);
curl_close($loginCh);

$accessToken = null;
if ($loginCode === 200 && $loginResp) {
    $json = json_decode($loginResp, true);
    if (isset($json['access_token'])) {
        $accessToken = $json['access_token'];
    }
}

if ($accessToken) {
    $authCh = curl_init('http://127.0.0.1:8000/api/alimentos');
    curl_setopt($authCh, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($authCh, CURLOPT_TIMEOUT, 5);
    curl_setopt($authCh, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Authorization: Bearer ' . $accessToken,
    ]);
    $authResp = curl_exec($authCh);
    $authCode = curl_getinfo($authCh, CURLINFO_HTTP_CODE);
    curl_close($authCh);

    if ($authCode == 200) {
        echo "✅ API Laravel responde con token (200): OK\n";
    } else {
        echo "❌ API Laravel con token HTTP: $authCode\n";
    }
} else {
    echo "❌ No se obtuvo token de acceso para probar API autenticada\n";
}

// 3. Verificar que Vite esté respondiendo (aceptando HTML)
$ch = curl_init('http://localhost:5173/@vite/client');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: text/javascript'
]);
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