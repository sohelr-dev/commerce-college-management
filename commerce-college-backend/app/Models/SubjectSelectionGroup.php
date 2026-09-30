<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubjectSelectionGroup extends Model
{
    use HasFactory;

    protected $fillable = ['department_id', 'semester_id', 'name', 'code', 'required_count', 'is_mandatory_pass'];

    protected $casts = ['is_mandatory_pass' => 'boolean'];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'selection_group_subjects', 'selection_group_id', 'subject_id')->withTimestamps();
    }
}
