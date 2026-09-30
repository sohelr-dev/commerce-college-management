<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Section;
use Illuminate\Http\Request;

class SectionController extends Controller
{
    public function index(Request $request)
    {
        return Section::with(['semester.department', 'classTeacher'])
            ->when($request->semester_id, fn ($q) => $q->where('semester_id', $request->semester_id))
            ->withCount('students')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'semester_id' => ['required', 'exists:semesters,id'],
            'name' => ['required', 'string', 'max:50'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'class_teacher_id' => ['nullable', 'exists:users,id'],
        ]);

        return response()->json(Section::create($data)->load('semester'), 201);
    }

    public function show(Section $section)
    {
        return $section->load(['semester.department', 'classTeacher', 'students.user']);
    }

    public function update(Request $request, Section $section)
    {
        $data = $request->validate([
            'semester_id' => ['required', 'exists:semesters,id'],
            'name' => ['required', 'string', 'max:50'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'class_teacher_id' => ['nullable', 'exists:users,id'],
        ]);

        $section->update($data);

        return response()->json($section);
    }

    public function destroy(Section $section)
    {
        $section->delete();

        return response()->json(['message' => 'সেকশন মুছে ফেলা হয়েছে']);
    }
}
