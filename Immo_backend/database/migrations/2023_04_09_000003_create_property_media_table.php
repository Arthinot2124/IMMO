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
        Schema::create('property_media', function (Blueprint $table) {
            $table->id('media_id');
            $table->foreignId('property_id')->constrained('properties', 'property_id')->cascadeOnDelete()->cascadeOnUpdate();
            $table->enum('media_type', ['Photo', 'Vidéo', 'Document']);
            $table->string('media_url', 255);
            $table->timestamp('uploaded_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('property_media');
    }
};
