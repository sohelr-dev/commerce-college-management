<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index()
    {
        return Department::withCount(['semesters', 'subjects'])->latest()->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:20', 'unique:departments,code'],
            'description' => ['nullable', 'string'],
        ]);

        return response()->json(Department::create($data), 201);
    }

    public function show(Department $department)
    {
        return $department->load(['semesters.sections', 'subjects']);
    }

    public function update(Request $request, Department $department)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:20', 'unique:departments,code,' . $department->id],
            'description' => ['nullable', 'string'],
        ]);

        $department->update($data);

        return response()->json($department);
    }

    public function destroy(Department $department)
    {
        $department->delete();

        return response()->json(['message' => 'বিভাগ মুছে ফেলা হয়েছে']);
    }
}
