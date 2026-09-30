<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Semester;
use Illuminate\Http\Request;

class SemesterController extends Controller
{
    public function index(Request $request)
    {
        return Semester::with('department')
            ->when($request->department_id, fn ($q) => $q->where('department_id', $request->department_id))
            ->orderBy('order')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'department_id' => ['required', 'exists:departments,id'],
            'name' => ['required', 'string', 'max:255'],
            'order' => ['required', 'integer', 'min:1'],
            'session' => ['nullable', 'string'],
        ]);

        return response()->json(Semester::create($data)->load('department'), 201);
    }

    public function show(Semester $semester)
    {
        return $semester->load(['department', 'sections', 'subjects']);
    }

    public function update(Request $request, Semester $semester)
    {
        $data = $request->validate([
            'department_id' => ['required', 'exists:departments,id'],
            'name' => ['required', 'string', 'max:255'],
            'order' => ['required', 'integer', 'min:1'],
            'session' => ['nullable', 'string'],
        ]);

        $semester->update($data);

        return response()->json($semester);
    }

    public function destroy(Semester $semester)
    {
        $semester->delete();

        return response()->json(['message' => 'সেমিস্টার মুছে ফেলা হয়েছে']);
    }
}
