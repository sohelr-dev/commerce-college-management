<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_id', 'semester_id', 'name', 'code', 'credit', 'full_marks',
        'subject_category', 'grading_type', 'full_marks_mcq', 'full_marks_written',
        'full_marks_practical', 'pass_marks_overall', 'pass_marks_mcq', 'pass_marks_written',
        'pass_marks_practical', 'require_overall_pass', 'require_written_pass',
        'require_mcq_pass', 'require_practical_pass', 'subject_type', 'parent_subject_id',
    ];

    protected $casts = [
        'require_overall_pass' => 'boolean',
        'require_written_pass' => 'boolean',
        'require_mcq_pass' => 'boolean',
        'require_practical_pass' => 'boolean',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    public function parentSubject()
    {
        return $this->belongsTo(Subject::class, 'parent_subject_id');
    }

    public function childSubjects()
    {
        return $this->hasMany(Subject::class, 'parent_subject_id');
    }

    public function teachers()
    {
        return $this->belongsToMany(User::class, 'teacher_subject', 'subject_id', 'teacher_id')
            ->withPivot('section_id')
            ->withTimestamps();
    }

    /**
     * বিষয়ভিত্তিক মার্কস ও পাস রুলস অনুযায়ী পাস/ফেল এবং ফেলের কারণ নির্ধারণ করে।
     */
    public function evaluateResult(?float $mcq, ?float $written, ?float $practical = null): array
    {
        $obtainedTotal = ($mcq ?? 0) + ($written ?? 0) + ($practical ?? 0);
        $reasons = [];

        // 1. CQ / Written Pass check
        if ($this->require_written_pass && $this->full_marks_written > 0) {
            if (($written ?? 0) < $this->pass_marks_written) {
                $reasons[] = "CQ/লিখিত ন্যূনতম পাস (" . $this->pass_marks_written . ") অর্জিত হয়নি";
            }
        }

        // 2. MCQ Pass check
        if ($this->require_mcq_pass && $this->full_marks_mcq > 0) {
            if (($mcq ?? 0) < $this->pass_marks_mcq) {
                $reasons[] = "MCQ ন্যূনতম পাস (" . $this->pass_marks_mcq . ") অর্জিত হয়নি";
            }
        }

        // 3. Practical Pass check
        if ($this->require_practical_pass && $this->full_marks_practical > 0) {
            if (($practical ?? 0) < $this->pass_marks_practical) {
                $reasons[] = "Practical ন্যূনতম পাস (" . $this->pass_marks_practical . ") অর্জিত হয়নি";
            }
        }

        // 4. Overall Pass check
        if ($this->require_overall_pass) {
            $requiredOverall = $this->pass_marks_overall > 0 ? $this->pass_marks_overall : 33;
            if ($obtainedTotal < $requiredOverall) {
                $reasons[] = "সর্বমোট ন্যূনতম পাস মার্ক (" . $requiredOverall . ") পাওয়া যায়নি";
            }
        }

        if (!empty($reasons)) {
            return [
                'is_pass' => false,
                'reason' => implode(' | ', $reasons),
            ];
        }

        return [
            'is_pass' => true,
            'reason' => null,
        ];
    }
}
