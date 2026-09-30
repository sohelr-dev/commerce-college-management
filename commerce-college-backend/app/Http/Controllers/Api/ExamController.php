<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ExamController extends Controller
{
    /**
     * Exam list — filter by department/semester/session/year/type/status
     */
    public function index(Request $request)
    {
        return Exam::with(['department', 'semester'])
            ->when($request->semester_id,    fn ($q) => $q->where('semester_id',    $request->semester_id))
            ->when($request->department_id,  fn ($q) => $q->where('department_id',  $request->department_id))
            ->when($request->session,        fn ($q) => $q->where('session',        $request->session))
            ->when($request->year,           fn ($q) => $q->where('year',           $request->year))
            ->when($request->type,           fn ($q) => $q->where('type',           $request->type))
            ->when($request->status,         fn ($q) => $q->where('status',         $request->status))
            ->latest('start_date')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'          => ['required', 'string', 'max:255'],
            'type'          => ['required', Rule::in(['quiz', 'midterm', 'final', 'assignment'])],
            'department_id' => ['required', 'exists:departments,id'],
            'semester_id'   => ['required', 'exists:semesters,id'],
            // session: কোন ব্যাচের পরীক্ষা (e.g., 2024-25)
            'session'       => ['nullable', 'string', 'max:20'],
            // year: 1st year নাকি 2nd year এর পরীক্ষা
            'year'          => ['nullable', Rule::in(['1st', '2nd'])],
            'start_date'    => ['required', 'date'],
            'end_date'      => ['required', 'date', 'after_or_equal:start_date'],
        ]);

        return response()->json(Exam::create($data)->load(['department', 'semester']), 201);
    }

    public function show(Exam $exam)
    {
        return $exam->load(['department', 'semester', 'results.student', 'results.subject']);
    }

    public function update(Request $request, Exam $exam)
    {
        $data = $request->validate([
            'name'       => ['required', 'string', 'max:255'],
            'type'       => ['required', Rule::in(['quiz', 'midterm', 'final', 'assignment'])],
            'session'    => ['nullable', 'string', 'max:20'],
            'year'       => ['nullable', Rule::in(['1st', '2nd'])],
            'start_date' => ['required', 'date'],
            'end_date'   => ['required', 'date', 'after_or_equal:start_date'],
            'status'     => ['required', Rule::in(['upcoming', 'ongoing', 'completed', 'result_published'])],
        ]);

        $exam->update($data);

        return response()->json($exam->load(['department', 'semester']));
    }

    public function destroy(Exam $exam)
    {
        $exam->delete();

        return response()->json(['message' => 'পরীক্ষা মুছে ফেলা হয়েছে']);
    }
}
