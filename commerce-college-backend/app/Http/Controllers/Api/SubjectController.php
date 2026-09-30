<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        return Subject::with(['department', 'semester', 'teachers', 'parentSubject', 'childSubjects'])
            ->when($request->semester_id, fn ($q) => $q->where('semester_id', $request->semester_id))
            ->when($request->department_id, fn ($q) => $q->where('department_id', $request->department_id))
            ->when($request->subject_category, fn ($q) => $q->where('subject_category', $request->subject_category))
            ->get();
    }

    private function rules($subjectId = null): array
    {
        return [
            'department_id'          => ['required', 'exists:departments,id'],
            'semester_id'            => ['required', 'exists:semesters,id'],
            'name'                   => ['required', 'string', 'max:255'],
            'code'                   => ['required', 'string', 'max:20', Rule::unique('subjects', 'code')->ignore($subjectId)],
            'credit'                 => ['nullable', 'integer', 'min:1', 'max:10'],
            'full_marks'             => ['required', 'numeric', 'min:1'],
            'subject_category'       => ['required', Rule::in(['compulsory', 'group_a', 'group_b'])],
            'grading_type'           => ['nullable', Rule::in(['general', 'english', 'ict_home_science'])],
            'full_marks_mcq'         => ['nullable', 'numeric', 'min:0'],
            'full_marks_written'     => ['nullable', 'numeric', 'min:0'],
            'full_marks_practical'   => ['nullable', 'numeric', 'min:0'],
            'pass_marks_overall'     => ['nullable', 'numeric', 'min:0'],
            'pass_marks_mcq'         => ['nullable', 'numeric', 'min:0'],
            'pass_marks_written'     => ['nullable', 'numeric', 'min:0'],
            'pass_marks_practical'   => ['nullable', 'numeric', 'min:0'],
            'require_overall_pass'   => ['nullable', 'boolean'],
            'require_written_pass'   => ['nullable', 'boolean'],
            'require_mcq_pass'       => ['nullable', 'boolean'],
            'require_practical_pass' => ['nullable', 'boolean'],
            'subject_type'           => ['nullable', Rule::in(['compulsory', 'optional'])],
            'parent_subject_id'      => ['nullable', 'exists:subjects,id'],
        ];
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());

        $subject = Subject::create($data);

        return response()->json($subject->load(['department', 'semester', 'parentSubject']), 201);
    }

    public function show(Subject $subject)
    {
        return $subject->load(['department', 'semester', 'teachers', 'parentSubject', 'childSubjects']);
    }

    public function update(Request $request, Subject $subject)
    {
        $data = $request->validate($this->rules($subject->id));

        $subject->update($data);

        return response()->json($subject->load(['department', 'semester', 'parentSubject']));
    }

    public function destroy(Subject $subject)
    {
        $subject->delete();

        return response()->json(['message' => 'বিষয় মুছে ফেলা হয়েছে']);
    }

    /**
     * Teacher-কে subject assign করো।
     *
     * একজন teacher একাধিক department-এর একই নামের subject পড়াতে পারে।
     * যেমন: Humanities-এর Bangla এবং Business-এর Bangla দুটোই নিতে পারে।
     *
     * Request body:
     *   - teacher_id: required
     *   - section_id: required
     *
     * একই teacher + subject + section combo দুইবার assign হবে না (unique constraint)।
     */
    public function assignTeacher(Request $request, Subject $subject)
    {
        $data = $request->validate([
            'teacher_id' => ['required', 'exists:users,id'],
            'section_id' => ['required', 'exists:sections,id'],
        ]);

        // Teacher-এর role check
        $teacher = \App\Models\User::findOrFail($data['teacher_id']);
        if ($teacher->role !== 'teacher') {
            return response()->json(['message' => 'নির্বাচিত ব্যবহারকারী একজন শিক্ষক নন'], 422);
        }

        // syncWithoutDetaching ব্যবহার করো — duplicate হবে না
        $subject->teachers()->syncWithoutDetaching([
            $data['teacher_id'] => ['section_id' => $data['section_id']],
        ]);

        return response()->json($subject->load(['teachers', 'department', 'semester']));
    }

    /**
     * Teacher-এর কাছ থেকে subject unassign করো।
     */
    public function unassignTeacher(Request $request, Subject $subject)
    {
        $data = $request->validate([
            'teacher_id' => ['required', 'exists:users,id'],
            'section_id' => ['nullable', 'exists:sections,id'],
        ]);

        if ($data['section_id']) {
            // নির্দিষ্ট section থেকে remove
            DB::table('teacher_subject')
                ->where('teacher_id', $data['teacher_id'])
                ->where('subject_id', $subject->id)
                ->where('section_id', $data['section_id'])
                ->delete();
        } else {
            // সব section থেকে remove
            $subject->teachers()->detach($data['teacher_id']);
        }

        return response()->json($subject->load(['teachers', 'department', 'semester']));
    }

    /**
     * একজন teacher কোন কোন subject পড়ায় তার list (সব department মিলিয়ে)
     */
    public function teacherSubjects(Request $request)
    {
        $teacherId = $request->teacher_id;
        if (!$teacherId) {
            return response()->json(['message' => 'teacher_id প্রয়োজন'], 422);
        }

        $rows = DB::table('teacher_subject')
            ->where('teacher_id', $teacherId)
            ->get();

        $subjectIds = $rows->pluck('subject_id')->unique();
        $subjects = Subject::with(['department', 'semester'])
            ->whereIn('id', $subjectIds)
            ->get();

        // প্রতিটি subject এর সাথে সংশ্লিষ্ট sections দেখাও
        return $subjects->map(function ($subject) use ($rows) {
            $sectionIds = $rows->where('subject_id', $subject->id)->pluck('section_id');
            $subject->assigned_section_ids = $sectionIds->values();
            return $subject;
        });
    }
}
