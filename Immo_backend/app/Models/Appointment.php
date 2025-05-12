<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'appointments';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'appointment_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'property_id',
        'user_id',
        'appointment_date',
        'confirmation_status',
        'comments',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'appointment_date' => 'datetime',
        'confirmation_status' => 'string',
        'created_at' => 'datetime',
    ];

    /**
     * Indique si le modèle doit être horodaté automatiquement.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (!$model->created_at) {
                $model->created_at = now();
            }
        });
    }

    /**
     * Get the property that owns the appointment.
     */
    public function property()
    {
        return $this->belongsTo(Property::class, 'property_id', 'property_id');
    }

    /**
     * Get the user that owns the appointment.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
