<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the table if it exists to avoid errors
        Schema::dropIfExists('coupons');
        
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->boolean('is_used')->default(false);
            $table->timestamp('used_at')->nullable();
            $table->unsignedBigInteger('used_by_user_id')->nullable();
            $table->foreign('used_by_user_id')->references('user_id')->on('users')->onDelete('set null');
            $table->unsignedBigInteger('used_for_property_id')->nullable();
            $table->foreign('used_for_property_id')->references('property_id')->on('properties')->onDelete('set null');
            $table->string('discount_type')->default('video_access'); // video_access, percentage, fixed_amount
            $table->decimal('discount_value', 10, 2)->nullable(); // for percentage or fixed amount discounts
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
}; 