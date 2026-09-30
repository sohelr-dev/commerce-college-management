<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalaryStructure extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id', 'basic_salary', 'house_allowance', 'medical_allowance',
        'other_allowance', 'deductions', 'effective_from',
    ];

    protected $casts = ['effective_from' => 'date'];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function grossAmount(): float
    {
        return $this->basic_salary + $this->house_allowance + $this->medical_allowance + $this->other_allowance;
    }

    public function netAmount(): float
    {
        return $this->grossAmount() - $this->deductions;
    }
}
