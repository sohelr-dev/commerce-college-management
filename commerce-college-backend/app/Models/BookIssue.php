<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookIssue extends Model
{
    use HasFactory;

    protected $fillable = [
        'book_id', 'user_id', 'issue_date', 'due_date', 'return_date', 'status', 'fine_amount', 'issued_by',
    ];

    protected $casts = ['issue_date' => 'date', 'due_date' => 'date', 'return_date' => 'date'];

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function issuedBy()
    {
        return $this->belongsTo(User::class, 'issued_by');
    }
}
