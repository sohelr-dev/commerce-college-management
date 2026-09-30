<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_id', 'student_id', 'subject_id', 'marks_mcq', 'marks_written', 'marks_practical',
        'marks_obtained', 'full_marks', 'grade', 'grade_point', 'is_pass', 'fail_reason',
        'remarks', 'entered_by',
    ];

    protected $casts = ['is_pass' => 'boolean'];

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function enteredBy()
    {
        return $this->belongsTo(User::class, 'entered_by');
    }

    public static function calculateGrade(float $percentage, bool $isPass = true): array
    {
        return GradeScale::getGradeForPercentage($percentage, $isPass);
    }
}
