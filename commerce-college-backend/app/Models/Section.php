<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    use HasFactory;

    protected $fillable = ['semester_id', 'name', 'capacity', 'class_teacher_id'];

    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    public function classTeacher()
    {
        return $this->belongsTo(User::class, 'class_teacher_id');
    }

    public function students()
    {
        return $this->hasMany(StudentProfile::class);
    }
}
