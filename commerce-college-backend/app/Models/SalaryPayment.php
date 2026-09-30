<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalaryPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id', 'month', 'year', 'gross_amount', 'net_amount', 'status', 'payment_date', 'paid_by',
    ];

    protected $casts = ['payment_date' => 'date'];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function paidBy()
    {
        return $this->belongsTo(User::class, 'paid_by');
    }
}
