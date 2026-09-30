<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\Section;
use App\Models\StudentProfile;
use App\Models\StudentSubject;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExamResultController extends Controller
{
    /**
     * Teacher-এর জন্য: তার assigned sections এবং প্রতিটি section-এ সে কোন subject পড়ায়।
     * Response structure:
     * [
     *   {
     *     section: { id, name, semester: { id, name, department: { id, name } } },
     *     subjects: [ { id, name, code, ... } ]
     *   }
     * ]
     */
    public function teacherSectionsWithSubjects(Request $request)
    {
        $user = $request->user();

        // teacher_subject pivot থেকে section_id এবং subject_id গ্রুপ করে আনো
        $rows = DB::table('teacher_subject')
            ->where('teacher_id', $user->id)
            ->get();

        // section_id অনুযায়ী group করো
        $grouped = $rows->groupBy('section_id');

        $result = [];
        foreach ($grouped as $sectionId => $subjectRows) {
            $section = Section::with(['semester.department'])->find($sectionId);
            if (!$section) continue;

            $subjectIds = $subjectRows->pluck('subject_id');
            $subjects = Subject::with(['department'])->whereIn('id', $subjectIds)->get();

            $result[] = [
                'section'  => $section,
                'subjects' => $subjects,
            ];
        }

        return response()->json($result);
    }

    /**
     * Result entry করার জন্য student list আনো।
     *
     * বর্তমান approach: exam এ session ও year থাকলে সেটা দিয়ে filter করো।
     * Session+year based student list:
     *   - exam.session এবং exam.year দিয়ে student filter করা যাবে
     *   - অথবা সরাসরি section_id দিয়ে filter করা যাবে
     *
     * Query params:
     *   - section_id (required): কোন section এর students
     *   - subject_id (required): কোন subject এর result entry
     *   - session (optional): session filter (exam এ না থাকলে এখান থেকে নাও)
     *   - year (optional): year filter
     */
    public function studentsFor(Request $request, Exam $exam)
    {
        $request->validate([
            'section_id' => ['required', 'exists:sections,id'],
            'subject_id' => ['required', 'exists:subjects,id'],
        ]);

        // Section-এর সকল student — exam এর session/year দিয়ে filter করো
        $studentQuery = StudentProfile::with('user')
            ->where('section_id', $request->section_id);

        // Exam এ session থাকলে সেই session-এর students দেখাও
        if ($exam->session) {
            $studentQuery->where('session', $exam->session);
        }

        // Exam এ year থাকলে সেই year-এর students দেখাও
        if ($exam->year) {
            $studentQuery->where('year', $exam->year);
        }

        $students = $studentQuery->orderBy('roll_no')->get();

        // ইতোপূর্বে save করা results
        $existing = ExamResult::where('exam_id', $exam->id)
            ->where('subject_id', $request->subject_id)
            ->get()
            ->keyBy('student_id');

        return $students->map(function ($sp) use ($existing) {
            $result = $existing[$sp->user_id] ?? null;

            return [
                'student_id'      => $sp->user_id,
                'name'            => $sp->user->name,
                'roll_no'         => $sp->roll_no,
                'session'         => $sp->session,
                'year'            => $sp->year,
                'marks_mcq'       => $result?->marks_mcq,
                'marks_written'   => $result?->marks_written,
                'marks_practical' => $result?->marks_practical,
                'is_pass'         => $result?->is_pass,
                'fail_reason'     => $result?->fail_reason,
                'grade'           => $result?->grade,
                'grade_point'     => $result?->grade_point,
                'marks_obtained'  => $result?->marks_obtained,
            ];
        });
    }

    /**
     * Result entry করার আগে filter options আনো।
     * Frontend-এ result entry form এ এই API call করবে:
     *   - department list (group: Humanities / Business)
     *   - session list (exam থেকে)
     *   - year list (1st / 2nd)
     *   - exam list (selected department+session+year filtered)
     * এই method টি exam list filter করে দেয়।
     */
    public function examFilterOptions(Request $request)
    {
        // সব unique session এর list
        $sessions = Exam::select('session')
            ->whereNotNull('session')
            ->distinct()
            ->orderBy('session', 'desc')
            ->pluck('session');

        return response()->json([
            'sessions' => $sessions,
            'years'    => ['1st', '2nd'],
        ]);
    }

    /**
     * Teacher / Admin: Bulk marks save — Bangladesh HSC পাস/ফেল নিয়ম অনুযায়ী।
     *
     * Request body:
     *   - subject_id
     *   - records: [{ student_id, marks_mcq, marks_written, marks_practical }]
     */
    public function bulkStore(Request $request, Exam $exam)
    {
        $data = $request->validate([
            'subject_id'                => ['required', 'exists:subjects,id'],
            'records'                   => ['required', 'array', 'min:1'],
            'records.*.student_id'      => ['required', 'exists:users,id'],
            'records.*.marks_mcq'       => ['nullable', 'numeric', 'min:0'],
            'records.*.marks_written'   => ['nullable', 'numeric', 'min:0'],
            'records.*.marks_practical' => ['nullable', 'numeric', 'min:0'],
        ]);

        $subject = Subject::findOrFail($data['subject_id']);

        // full_marks: subject config থেকে, না থাকলে parts যোগ করে বের করো
        $fullMarks = $subject->full_marks > 0
            ? $subject->full_marks
            : (($subject->full_marks_written ?? 0) + ($subject->full_marks_mcq ?? 0) + ($subject->full_marks_practical ?? 0));

        if ($fullMarks <= 0) $fullMarks = 100;

        foreach ($data['records'] as $record) {
            $mcq       = isset($record['marks_mcq'])       && $record['marks_mcq']       !== '' ? (float) $record['marks_mcq']       : null;
            $written   = isset($record['marks_written'])   && $record['marks_written']   !== '' ? (float) $record['marks_written']   : null;
            $practical = isset($record['marks_practical']) && $record['marks_practical'] !== '' ? (float) $record['marks_practical'] : null;

            // Subject নিজের evaluateResult() method ব্যবহার করে
            $eval       = $subject->evaluateResult($mcq, $written, $practical);
            $isPass     = $eval['is_pass'];
            $failReason = $eval['reason'];

            $obtained   = ($mcq ?? 0) + ($written ?? 0) + ($practical ?? 0);
            $percentage = $fullMarks > 0 ? ($obtained / $fullMarks) * 100 : 0;

            [$grade, $gradePoint] = ExamResult::calculateGrade($percentage, $isPass);

            ExamResult::updateOrCreate(
                [
                    'exam_id'    => $exam->id,
                    'student_id' => $record['student_id'],
                    'subject_id' => $data['subject_id'],
                ],
                [
                    'marks_mcq'       => $mcq,
                    'marks_written'   => $written,
                    'marks_practical' => $practical,
                    'marks_obtained'  => $obtained,
                    'full_marks'      => $fullMarks,
                    'grade'           => $grade,
                    'grade_point'     => $gradePoint,
                    'is_pass'         => $isPass,
                    'fail_reason'     => $failReason,
                    'entered_by'      => $request->user()->id,
                ]
            );
        }

        return response()->json(['message' => 'ফলাফল সফলভাবে সংরক্ষিত ও হিসাবকৃত হয়েছে']);
    }

    // Student: নিজের ফলাফল দেখে
    public function myResults(Request $request)
    {
        return $this->buildTabulation($request->user()->id);
    }

    // Admin/Teacher: single student-এর result দেখে
    public function studentResults(Request $request, $studentId)
    {
        return response()->json($this->buildTabulation($studentId));
    }

    private function buildTabulation($studentId)
    {
        $optionalSubjectIds = StudentSubject::where('student_id', $studentId)
            ->where('is_optional', true)
            ->pluck('subject_id');

        $results = ExamResult::with(['exam', 'subject'])
            ->where('student_id', $studentId)
            ->get()
            ->groupBy('exam_id');

        return $results->map(function ($items) use ($optionalSubjectIds) {
            $totalObtained = $items->sum('marks_obtained');
            $totalFull     = $items->sum('full_marks');

            $mandatoryItems = $items->reject(fn ($r) => $optionalSubjectIds->contains($r->subject_id));
            $failedItems    = $mandatoryItems->filter(fn ($r) => !$r->is_pass);
            $overallPass    = $failedItems->count() === 0;

            $gpaItems = $mandatoryItems->count() > 0 ? $mandatoryItems : $items;
            $gpa      = $overallPass ? round($gpaItems->avg('grade_point'), 2) : 0.00;

            $totalSubjects = $items->count();
            $passedCount   = $items->filter(fn ($r) => $r->is_pass)->count();
            $failedCount   = $items->filter(fn ($r) => !$r->is_pass)->count();
            $failedNames   = $items->filter(fn ($r) => !$r->is_pass)->map(fn ($r) => $r->subject?->name)->values();

            return [
                'exam'                 => $items->first()->exam,
                'subjects'             => $items->map(function ($r) use ($optionalSubjectIds) {
                    $arr = $r->toArray();
                    $arr['is_optional'] = $optionalSubjectIds->contains($r->subject_id);
                    return $arr;
                })->values(),
                'total_subjects'       => $totalSubjects,
                'passed_subjects'      => $passedCount,
                'failed_subjects'      => $failedCount,
                'failed_subject_names' => $failedNames,
                'total_obtained'       => $totalObtained,
                'total_full'           => $totalFull,
                'percentage'           => $totalFull > 0 ? round($totalObtained / $totalFull * 100, 1) : 0,
                'gpa'                  => $gpa,
                'overall_result'       => $overallPass ? 'PASS' : 'FAIL',
            ];
        })->values();
    }
}
