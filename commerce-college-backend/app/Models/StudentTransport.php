<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentTransport extends Model
{
    use HasFactory;

    protected $fillable = ['student_id', 'route_id', 'vehicle_id', 'pickup_point'];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function route()
    {
        return $this->belongsTo(TransportRoute::class, 'route_id');
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class, 'vehicle_id');
    }
}
