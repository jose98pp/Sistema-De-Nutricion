<?php
// Test CORS Configuration
header('Content-Type: application/json');

echo json_encode([
    'message' => 'CORS Test',
    'server_ip' => $_SERVER['SERVER_ADDR'] ?? 'unknown',
    'request_origin' => $_SERVER['HTTP_ORIGIN'] ?? 'no origin',
    'request_method' => $_SERVER['REQUEST_METHOD'],
    'cors_headers' => [
        'Access-Control-Allow-Origin' => $_SERVER['HTTP_ACCESS_CONTROL_ALLOW_ORIGIN'] ?? 'not set',
        'Access-Control-Allow-Methods' => $_SERVER['HTTP_ACCESS_CONTROL_ALLOW_METHODS'] ?? 'not set',
        'Access-Control-Allow-Headers' => $_SERVER['HTTP_ACCESS_CONTROL_ALLOW_HEADERS'] ?? 'not set',
    ]
], JSON_PRETTY_PRINT);
