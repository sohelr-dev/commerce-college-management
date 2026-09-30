<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fee extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'type', 'amount', 'department_id', 'semester_id', 'due_date'];

    protected $casts = ['due_date' => 'date', 'amount' => 'decimal:2'];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    public function payments()
    {
        return $this->hasMany(FeePayment::class);
    }
}
