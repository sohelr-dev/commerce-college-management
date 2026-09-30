<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransportRoute extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'stoppages', 'fare_amount'];

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class, 'route_id');
    }

    public function students()
    {
        return $this->hasMany(StudentTransport::class, 'route_id');
    }
}
