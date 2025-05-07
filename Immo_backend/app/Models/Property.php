<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'properties';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'property_id';

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
        'transaction_type',
        'category',
        'status',
        'views',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2',
        'surface' => 'decimal:2',
        'property_type' => 'string',
        'transaction_type' => 'string',
        'category' => 'string',
        'status' => 'string',
        'views' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the property.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    /**
     * Get the media for the property.
     */
    public function media()
    {
        return $this->hasMany(PropertyMedia::class, 'property_id', 'property_id');
    }

    /**
     * Get the orders for the property.
     */
    public function orders()
    {
        return $this->hasMany(Order::class, 'property_id', 'property_id');
    }

    /**
     * Get the appointments for the property.
     */
    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'property_id', 'property_id');
    }

    /**
     * Get the ratings for the property.
     */
    public function ratings()
    {
        return $this->hasMany(Rating::class, 'property_id', 'property_id');
    }

    /**
     * Get the property views records.
     */
    public function propertyViews()
    {
        return $this->hasMany(PropertyView::class, 'property_id', 'property_id');
    }
}
