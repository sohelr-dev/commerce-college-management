<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\StudentProfile;
use App\Models\StudentSubject;
use Illuminate\Http\Request;

class TabulationController extends Controller
{
    /**
     * একটি পরীক্ষার জন্য সব ছাত্রের সব বিষয়ের মার্ক এক গ্রিডে (Tabulation Sheet) —
     * প্রতি ছাত্রের রো, প্রতি বিষয়ের কলাম, শেষে মোট/GPA/ফলাফল।
     */
    public function index(Request $request, Exam $exam)
    {
        $request->validate([
            'section_id' => ['required', 'exists:sections,id'],
        ]);

        $students = StudentProfile::with('user')
            ->where('section_id', $request->section_id)
            ->orderBy('roll_no')
            ->get();

        $studentIds = $students->pluck('user_id');

        $results = ExamResult::where('exam_id', $exam->id)
            ->whereIn('student_id', $studentIds)
            ->with('subject')
            ->get()
            ->groupBy('student_id');

        $optionalMap = StudentSubject::whereIn('student_id', $studentIds)
            ->where('is_optional', true)
            ->get()
            ->groupBy('student_id')
            ->map(fn ($rows) => $rows->pluck('subject_id'));

        $subjectsUsed = $results->flatten()->pluck('subject')->unique('id')->values();

        $rows = $students->map(function ($sp) use ($results, $optionalMap) {
            $studentResults = $results->get($sp->user_id, collect());
            $optionalIds = $optionalMap->get($sp->user_id, collect());

            $mandatory = $studentResults->reject(fn ($r) => $optionalIds->contains($r->subject_id));
            $overallPass = $mandatory->isNotEmpty() ? $mandatory->every(fn ($r) => $r->is_pass) : false;

            $totalObtained = $studentResults->sum('marks_obtained');
            $totalFull = $studentResults->sum('full_marks');
            $gpa = $overallPass ? round(($mandatory->isNotEmpty() ? $mandatory : $studentResults)->avg('grade_point'), 2) : 0.00;

            return [
                'student_id' => $sp->user_id,
                'roll_no' => $sp->roll_no,
                'name' => $sp->user->name,
                'subjects' => $studentResults->map(function ($r) use ($optionalIds) {
                    return [
                        'subject_id' => $r->subject_id,
                        'subject_name' => $r->subject->name,
                        'marks_mcq' => $r->marks_mcq,
                        'marks_written' => $r->marks_written,
                        'marks_obtained' => $r->marks_obtained,
                        'grade' => $r->grade,
                        'is_pass' => $r->is_pass,
                        'is_optional' => $optionalIds->contains($r->subject_id),
                    ];
                })->values(),
                'total_obtained' => $totalObtained,
                'total_full' => $totalFull,
                'gpa' => $gpa,
                'result' => $overallPass ? 'pass' : 'fail',
            ];
        });

        return response()->json([
            'exam' => $exam,
            'subjects' => $subjectsUsed,
            'rows' => $rows,
        ]);
    }
}
