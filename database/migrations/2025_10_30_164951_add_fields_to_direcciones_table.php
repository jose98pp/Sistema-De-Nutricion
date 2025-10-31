<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('direcciones', function (Blueprint $table) {
            $table->text('direccion_completa')->nullable()->after('descripcion');
            $table->string('ciudad', 100)->nullable()->after('direccion_completa');
            $table->string('codigo_postal', 20)->nullable()->after('ciudad');
            $table->text('referencia')->nullable()->after('codigo_postal');
            $table->boolean('es_principal')->default(false)->after('referencia');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('direcciones', function (Blueprint $table) {
            $table->dropColumn(['direccion_completa', 'ciudad', 'codigo_postal', 'referencia', 'es_principal']);
        });
    }
};
