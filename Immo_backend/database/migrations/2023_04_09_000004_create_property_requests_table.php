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
        Schema::create('property_requests', function (Blueprint $table) {
            $table->id('request_id');
            $table->foreignId('user_id')->constrained('users', 'user_id')->cascadeOnDelete()->cascadeOnUpdate();
            $table->string('title', 150);
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2)->nullable();
            $table->decimal('surface', 10, 2)->nullable();
            $table->string('location')->nullable();
            $table->string('category')->nullable();
            $table->string('property_status')->nullable();
            $table->text('additional_details')->nullable();
            $table->enum('property_type', ['VILLA', 'TERRAIN', 'APPARTEMENT'])->default('VILLA');
            $table->enum('transaction_type', ['AHOFA', 'AMIDY']);
            $table->enum('status', ['En attente', 'Accepté', 'Refusé'])->default('En attente');
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('property_requests');
    }
};
