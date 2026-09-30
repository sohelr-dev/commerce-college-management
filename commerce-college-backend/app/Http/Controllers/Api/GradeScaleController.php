<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GradeScale;
use Illuminate\Http\Request;

class GradeScaleController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => GradeScale::orderBy('sort_order', 'asc')->get()
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'min_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'max_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'grade_letter' => ['required', 'string', 'max:10'],
            'grade_point' => ['required', 'numeric', 'min:0', 'max:5.00'],
            'remarks' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $scale = GradeScale::create($data);

        return response()->json(['message' => 'গ্রেড স্কেল তৈরি হয়েছে', 'data' => $scale], 201);
    }

    public function update(Request $request, GradeScale $gradeScale)
    {
        $data = $request->validate([
            'min_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'max_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'grade_letter' => ['required', 'string', 'max:10'],
            'grade_point' => ['required', 'numeric', 'min:0', 'max:5.00'],
            'remarks' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $gradeScale->update($data);

        return response()->json(['message' => 'গ্রেড স্কেল আপডেট হয়েছে', 'data' => $gradeScale]);
    }

    public function destroy(GradeScale $gradeScale)
    {
        $gradeScale->delete();

        return response()->json(['message' => 'গ্রেড স্কেল মুছে ফেলা হয়েছে']);
    }
}
