<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExamRoutine;
use App\Models\StudentProfile;
use Illuminate\Http\Request;

class ExamRoutineController extends Controller
{
    // Admin/Teacher: exam-wise routine list
    public function index(Request $request)
    {
        return ExamRoutine::with(['subject', 'section.semester.department'])
            ->when($request->exam_id, fn ($q) => $q->where('exam_id', $request->exam_id))
            ->when($request->section_id, fn ($q) => $q->where('section_id', $request->section_id))
            ->orderBy('exam_date')
            ->orderBy('start_time')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'exam_id' => ['required', 'exists:exams,id'],
            'subject_id' => ['required', 'exists:subjects,id'],
            'section_id' => ['required', 'exists:sections,id'],
            'exam_date' => ['required', 'date'],
            'start_time' => ['nullable'],
            'end_time' => ['nullable'],
            'room' => ['nullable', 'string'],
        ]);

        $routine = ExamRoutine::updateOrCreate(
            [
                'exam_id' => $data['exam_id'],
                'subject_id' => $data['subject_id'],
                'section_id' => $data['section_id'],
            ],
            $data
        );

        return response()->json($routine->load(['subject', 'section']), 201);
    }

    public function destroy(ExamRoutine $examRoutine)
    {
        $examRoutine->delete();

        return response()->json(['message' => 'রুটিন এন্ট্রি মুছে ফেলা হয়েছে']);
    }

    // Student: নিজের সেশন/গ্রুপ/সেকশন অনুযায়ী পরীক্ষার রুটিন দেখে
    public function myRoutine(Request $request)
    {
        $profile = StudentProfile::where('user_id', $request->user()->id)->first();

        if (! $profile) {
            return response()->json([]);
        }

        return ExamRoutine::with(['exam', 'subject'])
            ->where('section_id', $profile->section_id)
            ->orderBy('exam_date')
            ->orderBy('start_time')
            ->get();
    }
}
