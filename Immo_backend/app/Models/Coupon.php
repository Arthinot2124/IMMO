<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'code',
        'is_used',
        'used_at',
        'used_by_user_id',
        'used_for_property_id',
        'discount_type',
        'discount_value',
        'expires_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_used' => 'boolean',
        'used_at' => 'datetime',
        'expires_at' => 'datetime',
        'discount_value' => 'float',
    ];

    /**
     * Get the user who used this coupon.
     */
    public function usedByUser()
    {
        return $this->belongsTo(User::class, 'used_by_user_id', 'user_id');
    }

    /**
     * Get the property this coupon was used for.
     */
    public function usedForProperty()
    {
        return $this->belongsTo(Property::class, 'used_for_property_id', 'property_id');
    }

    /**
     * Check if the coupon is valid.
     *
     * @return bool
     */
    public function isValid()
    {
        // Coupon is valid if it's not used and not expired
        if ($this->is_used) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        return true;
    }
} 