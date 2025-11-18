<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Modificar el enum para agregar 'psicologo'
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'nutricionista', 'paciente', 'psicologo') NOT NULL DEFAULT 'paciente'");
    }

    public function down(): void
    {
        // Volver al enum original
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'nutricionista', 'paciente') NOT NULL DEFAULT 'paciente'");
    }
};
