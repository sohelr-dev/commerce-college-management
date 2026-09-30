<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'author', 'isbn', 'category', 'publisher', 'shelf_no', 'total_copies', 'available_copies',
    ];

    public function issues()
    {
        return $this->hasMany(BookIssue::class);
    }
}
