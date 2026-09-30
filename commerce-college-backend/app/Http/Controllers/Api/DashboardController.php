<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Department;
use App\Models\ExamResult;
use App\Models\Fee;
use App\Models\FeePayment;
use App\Models\Notice;
use App\Models\Section;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return $this->adminStats();
        } elseif ($user->isTeacher()) {
            return $this->teacherStats($user);
        }

        return $this->studentStats($user);
    }

    private function adminStats()
    {
        return response()->json([
            'total_students' => User::where('role', 'student')->count(),
            'total_teachers' => User::where('role', 'teacher')->count(),
            'total_departments' => Department::count(),
            'total_sections' => Section::count(),
            'total_subjects' => Subject::count(),
            'fee_collected' => FeePayment::where('status', 'paid')->orWhere('status', 'partial')->sum('amount_paid'),
            'fee_due' => Fee::sum('amount') - FeePayment::sum('amount_paid'),
            'recent_notices' => Notice::latest()->take(5)->get(),
        ]);
    }

    private function teacherStats(User $user)
    {
        $subjectIds = $user->teachingSubjects()->pluck('subjects.id');

        return response()->json([
            'my_subjects' => $user->teachingSubjects()->with('department')->get(),
            'today_attendance_marked' => Attendance::whereIn('subject_id', $subjectIds)
                ->whereDate('date', now())
                ->count(),
            'recent_notices' => Notice::where('audience', 'all')->orWhere('audience', 'teachers')->latest()->take(5)->get(),
        ]);
    }

    private function studentStats(User $user)
    {
        $profile = $user->studentProfile;

        $attendance = Attendance::where('student_id', $user->id)->get();
        $totalAttendance = $attendance->count();
        $presentCount = $attendance->whereIn('status', ['present', 'late'])->count();

        return response()->json([
            'profile' => $profile?->load(['department', 'semester', 'section']),
            'attendance_percentage' => $totalAttendance > 0 ? round($presentCount / $totalAttendance * 100, 1) : 0,
            'total_due' => FeePayment::where('student_id', $user->id)->where('status', '!=', 'paid')
                ->with('fee')->get()->sum(fn ($p) => $p->fee->amount - $p->amount_paid),
            'latest_gpa' => round(ExamResult::where('student_id', $user->id)->avg('grade_point'), 2),
            'recent_notices' => Notice::where('audience', 'all')->orWhere('audience', 'students')->latest()->take(5)->get(),
        ]);
    }
}
