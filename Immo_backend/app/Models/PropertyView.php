<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PropertyView extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'property_views';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'view_id';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'property_id',
        'user_id',
        'ip_address',
        'viewed_at'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'viewed_at' => 'datetime',
    ];

    /**
     * Get the property associated with the view.
     */
    public function property()
    {
        return $this->belongsTo(Property::class, 'property_id', 'property_id');
    }

    /**
     * Get the user associated with the view.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
} 