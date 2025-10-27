<?php

use Illuminate\Support\Facades\Route;

// Sirve la aplicación React para todas las rutas
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
