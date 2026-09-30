<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\SubjectSelectionGroup;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SubjectSelectionController extends Controller
{
    public function index(Request $request)
    {
        return SubjectSelectionGroup::with(['department', 'semester', 'subjects'])
            ->when($request->semester_id, fn ($q) => $q->where('semester_id', $request->semester_id))
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'department_id' => ['required', 'exists:departments,id'],
            'semester_id' => ['required', 'exists:semesters,id'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', Rule::in(['group_a', 'group_b'])],
            'required_count' => ['required', 'integer', 'min:1'],
            'is_mandatory_pass' => ['boolean'],
            'subject_ids' => ['required', 'array', 'min:1'],
            'subject_ids.*' => ['exists:subjects,id'],
        ]);


     
        $mismatched = Subject::whereIn('id', $data['subject_ids'])
            ->where('subject_category', '!=', $data['code'])
            ->pluck('name', 'id');

        if ($mismatched->isNotEmpty()) {
            $groupLabel = $data['code'] === 'group_a' ? 'ক-গুচ্ছ' : 'খ-গুচ্ছ';
            return response()->json([
                'message' => "নিম্নলিখিত বিষয়গুলোর ক্যাটেগরি \"{$groupLabel}\" হিসেবে সেট করা নেই, তাই এই গুচ্ছে যোগ করা যাবে না: "
                    . $mismatched->implode(', ') . '। আগে "বিষয় ও মার্কস কনফিগারেশন" ট্যাব থেকে ঐ বিষয়গুলো সম্পাদনা করে সঠিক ক্যাটেগরি সেট করুন।',
            ], 422);
        }

        if ($data['required_count'] > count($data['subject_ids'])) {
            return response()->json([
                'message' => 'বাছাই সংখ্যা (required_count) পুলে থাকা মোট বিষয় সংখ্যার চেয়ে বেশি হতে পারবে না।',
            ], 422);
        }

        $group = SubjectSelectionGroup::updateOrCreate(
            [
                'department_id' => $data['department_id'],
                'semester_id' => $data['semester_id'],
                'code' => $data['code'],
            ],
            [
                'name' => $data['name'],
                'required_count' => $data['required_count'],
                'is_mandatory_pass' => $data['is_mandatory_pass'] ?? ($data['code'] === 'group_a'),
            ]
        );

        $group->subjects()->sync($data['subject_ids']);

        return response()->json($group->load(['department', 'semester', 'subjects']), 201);
    }

    public function destroy(SubjectSelectionGroup $subjectSelectionGroup)
    {
        $subjectSelectionGroup->delete();

        return response()->json(['message' => 'গুচ্ছ মুছে ফেলা হয়েছে']);
    }

  
    public function optionsFor(Request $request)
    {
        $request->validate([
            'department_id' => ['required', 'exists:departments,id'],
            'semester_id' => ['required', 'exists:semesters,id'],
        ]);

        $groups = SubjectSelectionGroup::with('subjects')
            ->where('department_id', $request->department_id)
            ->where('semester_id', $request->semester_id)
            ->get();

     
        $groupSubjectIds = $groups->flatMap(fn ($g) => $g->subjects->pluck('id'))->unique();

        $compulsory = Subject::where('department_id', $request->department_id)
            ->where('semester_id', $request->semester_id)
            ->where('subject_category', 'compulsory')
            ->whereNotIn('id', $groupSubjectIds)
            ->get();

        return response()->json([
            'compulsory' => $compulsory,
            'groups' => $groups,
        ]);
    }
}