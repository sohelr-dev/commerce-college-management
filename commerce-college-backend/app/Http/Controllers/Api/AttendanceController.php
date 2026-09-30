<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\StudentProfile;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AttendanceController extends Controller
{
    // Teacher: get student list for a subject/section/date to mark attendance
    public function studentsFor(Request $request)
    {
        $request->validate([
            'section_id' => ['required', 'exists:sections,id'],
            'subject_id' => ['required', 'exists:subjects,id'],
            'date' => ['required', 'date'],
        ]);

        $students = StudentProfile::with('user')
            ->where('section_id', $request->section_id)
            ->orderBy('roll_no')
            ->get();

        $existing = Attendance::where('section_id', $request->section_id)
            ->where('subject_id', $request->subject_id)
            ->where('date', $request->date)
            ->pluck('status', 'student_id');

        return $students->map(function ($sp) use ($existing) {
            return [
                'student_id' => $sp->user_id,
                'name' => $sp->user->name,
                'roll_no' => $sp->roll_no,
                'status' => $existing[$sp->user_id] ?? 'present',
            ];
        });
    }

    // Teacher: bulk save attendance for a class on a date
    public function bulkStore(Request $request)
    {
        $data = $request->validate([
            'section_id' => ['required', 'exists:sections,id'],
            'subject_id' => ['required', 'exists:subjects,id'],
            'date' => ['required', 'date'],
            'records' => ['required', 'array', 'min:1'],
            'records.*.student_id' => ['required', 'exists:users,id'],
            'records.*.status' => ['required', Rule::in(['present', 'absent', 'late', 'excused'])],
        ]);

        foreach ($data['records'] as $record) {
            Attendance::updateOrCreate(
                [
                    'student_id' => $record['student_id'],
                    'subject_id' => $data['subject_id'],
                    'date' => $data['date'],
                ],
                [
                    'section_id' => $data['section_id'],
                    'status' => $record['status'],
                    'marked_by' => $request->user()->id,
                ]
            );
        }

        return response()->json(['message' => 'হাজিরা সংরক্ষিত হয়েছে']);
    }

    // Student: view own attendance, optionally filter by subject
    public function myAttendance(Request $request)
    {
        $query = Attendance::with('subject')
            ->where('student_id', $request->user()->id);

        if ($request->subject_id) {
            $query->where('subject_id', $request->subject_id);
        }

        $records = $query->orderByDesc('date')->get();

        $summary = $records->groupBy('subject_id')->map(function ($items) {
            $total = $items->count();
            $present = $items->whereIn('status', ['present', 'late'])->count();

            return [
                'subject' => $items->first()->subject->name,
                'total' => $total,
                'present' => $present,
                'percentage' => $total > 0 ? round($present / $total * 100, 1) : 0,
            ];
        })->values();

        return response()->json(['records' => $records, 'summary' => $summary]);
    }

    // Admin: attendance report for a section/subject/date range
    public function report(Request $request)
    {
        $query = Attendance::with(['student', 'subject', 'section']);

        if ($request->section_id) {
            $query->where('section_id', $request->section_id);
        }
        if ($request->subject_id) {
            $query->where('subject_id', $request->subject_id);
        }
        if ($request->from) {
            $query->whereDate('date', '>=', $request->from);
        }
        if ($request->to) {
            $query->whereDate('date', '<=', $request->to);
        }

        return $query->orderByDesc('date')->paginate($request->per_page ?? 30);
    }
}
