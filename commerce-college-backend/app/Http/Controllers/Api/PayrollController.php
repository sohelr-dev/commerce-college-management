<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalaryPayment;
use App\Models\SalaryStructure;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PayrollController extends Controller
{
    // ===== Salary Structures =====
    public function structures()
    {
        return SalaryStructure::with('teacher')->get();
    }

    public function storeStructure(Request $request)
    {
        $data = $request->validate([
            'teacher_id' => ['required', 'exists:users,id'],
            'basic_salary' => ['required', 'numeric', 'min:0'],
            'house_allowance' => ['nullable', 'numeric', 'min:0'],
            'medical_allowance' => ['nullable', 'numeric', 'min:0'],
            'other_allowance' => ['nullable', 'numeric', 'min:0'],
            'deductions' => ['nullable', 'numeric', 'min:0'],
            'effective_from' => ['required', 'date'],
        ]);

        $structure = SalaryStructure::updateOrCreate(
            ['teacher_id' => $data['teacher_id']],
            $data
        );

        return response()->json($structure->load('teacher'), 201);
    }

    // ===== Monthly Payment Generation =====
    public function generateMonthly(Request $request)
    {
        $data = $request->validate([
            'month' => ['required', 'integer', 'min:1', 'max:12'],
            'year' => ['required', 'integer', 'min:2020'],
        ]);

        $structures = SalaryStructure::all();
        $created = 0;

        foreach ($structures as $s) {
            $exists = SalaryPayment::where('teacher_id', $s->teacher_id)
                ->where('month', $data['month'])
                ->where('year', $data['year'])
                ->exists();

            if (! $exists) {
                SalaryPayment::create([
                    'teacher_id' => $s->teacher_id,
                    'month' => $data['month'],
                    'year' => $data['year'],
                    'gross_amount' => $s->grossAmount(),
                    'net_amount' => $s->netAmount(),
                    'status' => 'pending',
                ]);
                $created++;
            }
        }

        return response()->json(['message' => "{$created} টি বেতন এন্ট্রি তৈরি হয়েছে"]);
    }

    public function markPaid(Request $request, SalaryPayment $salaryPayment)
    {
        $salaryPayment->update([
            'status' => 'paid',
            'payment_date' => now(),
            'paid_by' => $request->user()->id,
        ]);

        return response()->json($salaryPayment->load('teacher'));
    }

    // Admin: payment report (optionally filter by month/year)
    public function report(Request $request)
    {
        $query = SalaryPayment::with('teacher');

        if ($request->month) {
            $query->where('month', $request->month);
        }
        if ($request->year) {
            $query->where('year', $request->year);
        }

        return $query->orderByDesc('year')->orderByDesc('month')->get();
    }

    // Teacher: own payroll history
    public function myPayroll(Request $request)
    {
        return SalaryPayment::where('teacher_id', $request->user()->id)
            ->orderByDesc('year')->orderByDesc('month')
            ->get();
    }
}
