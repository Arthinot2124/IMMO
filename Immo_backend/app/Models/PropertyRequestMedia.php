<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PropertyRequestMedia extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'property_request_media';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'media_id';

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
        'request_id',
        'media_type',
        'media_url',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'media_type' => 'string',
        'uploaded_at' => 'datetime',
    ];

    /**
     * Get the property request that owns the media.
     */
    public function propertyRequest()
    {
        return $this->belongsTo(PropertyRequest::class, 'request_id', 'request_id');
    }
}
