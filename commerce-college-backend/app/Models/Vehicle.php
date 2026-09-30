<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = ['route_id', 'vehicle_number', 'driver_name', 'driver_phone', 'capacity'];

    public function route()
    {
        return $this->belongsTo(TransportRoute::class, 'route_id');
    }
}
