<?php
// Test script to debug API issues
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

// Create a test request with JSON content
$request = Illuminate\Http\Request::create('/api/login', 'POST', [], [], [], [
    'CONTENT_TYPE' => 'application/json',
    'HTTP_ACCEPT' => 'application/json'
], json_encode([
    'email' => 'admin@nutricion.com',
    'password' => 'wrongpassword'
]));

try {
    echo "Testing API login endpoint...\n";
    $response = $kernel->handle($request);
    
    echo "Status Code: " . $response->getStatusCode() . "\n";
    echo "Response: " . $response->getContent() . "\n";
    
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}