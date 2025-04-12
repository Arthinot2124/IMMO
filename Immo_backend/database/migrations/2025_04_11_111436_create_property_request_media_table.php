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
        Schema::create('property_request_media', function (Blueprint $table) {
            $table->id('media_id');
            $table->foreignId('request_id')->constrained('property_requests', 'request_id')->cascadeOnDelete()->cascadeOnUpdate();
            $table->enum('media_type', ['Photo', 'Vidéo', 'Document'])->default('Photo');
            $table->string('media_url', 255);
            $table->timestamp('uploaded_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('property_request_media');
    }
};
