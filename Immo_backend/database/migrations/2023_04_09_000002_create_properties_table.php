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
        Schema::create('properties', function (Blueprint $table) {
            $table->id('property_id');
            $table->foreignId('user_id')->nullable()->constrained('users', 'user_id')->nullOnDelete()->cascadeOnUpdate();
            $table->string('title', 150);
            $table->text('description')->nullable();
            $table->decimal('price', 15, 2);
            $table->decimal('surface', 10, 2)->nullable();
            $table->string('location', 255)->nullable();
            $table->enum('category', ['LITE', 'ESSENTIEL', 'PREMIUM'])->default('LITE');
            $table->enum('status', ['Disponible', 'Réservé', 'Vendu', 'Loué'])->default('Disponible');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
