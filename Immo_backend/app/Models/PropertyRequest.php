<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PropertyRequest extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'property_requests';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'request_id';

    /**
     * Indique si le modèle doit être horodaté automatiquement.
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
        'user_id',
        'title',
        'description',
        'price',
        'surface',
        'location',
        'property_type',
        'category',
        'property_status',
        'additional_details',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'status' => 'string',
        'property_type' => 'string',
        'property_status' => 'string',
        'price' => 'decimal:2',
        'surface' => 'decimal:2',
        'submitted_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the property request.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
    
    /**
     * Get the media for the property request.
     */
    public function media()
    {
        return $this->hasMany(PropertyRequestMedia::class, 'request_id', 'request_id');
    }
    
    /**
     * Override pour gérer les timestamps manuellement
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (!$model->submitted_at) {
                $model->submitted_at = now();
            }
            if (!$model->updated_at) {
                $model->updated_at = now();
            }
        });
        
        static::updating(function ($model) {
            $model->updated_at = now();
        });
    }
}
