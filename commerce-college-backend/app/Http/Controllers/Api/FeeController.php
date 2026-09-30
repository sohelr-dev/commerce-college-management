<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\FeePayment;
use App\Models\StudentProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class FeeController extends Controller
{
    public function index(Request $request)
    {
        return Fee::with(['department', 'semester'])
            ->when($request->semester_id, fn ($q) => $q->where('semester_id', $request->semester_id))
            ->latest()
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'         => ['required', 'string', 'max:255'],
            'type'          => ['required', Rule::in(['tuition', 'exam', 'admission', 'library', 'transport', 'other'])],
            'amount'        => ['required', 'numeric', 'min:0'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'semester_id'   => ['nullable', 'exists:semesters,id'],
            'due_date'      => ['required', 'date'],
        ]);

        $fee = Fee::create($data);

        // Auto-generate due payment records for applicable students
        $studentsQuery = StudentProfile::query();
        if ($data['semester_id'] ?? null) {
            $studentsQuery->where('semester_id', $data['semester_id']);
        } elseif ($data['department_id'] ?? null) {
            $studentsQuery->where('department_id', $data['department_id']);
        }

        foreach ($studentsQuery->get() as $student) {
            FeePayment::create([
                'fee_id'       => $fee->id,
                'student_id'   => $student->user_id,
                'amount_paid'  => 0,
                'payment_date' => now(),
                'status'       => 'due',
            ]);
        }

        return response()->json($fee, 201);
    }

    public function destroy(Fee $fee)
    {
        $fee->delete();

        return response()->json(['message' => 'ফি মুছে ফেলা হয়েছে']);
    }

    // Admin: collect a payment from a student
    public function collectPayment(Request $request)
    {
        $data = $request->validate([
            'fee_id'         => ['required', 'exists:fees,id'],
            'student_id'     => ['required', 'exists:users,id'],
            'amount_paid'    => ['required', 'numeric', 'min:0.01'],
            'method'         => ['required', Rule::in(['cash', 'bkash', 'nagad', 'bank', 'card'])],
            'transaction_id' => ['nullable', 'string'],
        ]);

        $fee = Fee::findOrFail($data['fee_id']);

        $payment = FeePayment::where('fee_id', $data['fee_id'])
            ->where('student_id', $data['student_id'])
            ->first();

        $previousPaid = $payment ? (float) $payment->amount_paid : 0;
        $paidTotal    = $previousPaid + (float) $data['amount_paid'];
        $status       = $paidTotal >= $fee->amount ? 'paid' : ($paidTotal > 0 ? 'partial' : 'due');

        $payment = FeePayment::updateOrCreate(
            ['fee_id' => $data['fee_id'], 'student_id' => $data['student_id']],
            [
                'amount_paid'    => $paidTotal,
                'payment_date'   => now(),
                'transaction_id' => $data['transaction_id'] ?? null,
                'method'         => $data['method'],
                'status'         => $status,
                'received_by'    => $request->user()->id,
            ]
        );

        return response()->json([
            'payment'          => $payment->load('fee'),
            'previous_paid'    => $previousPaid,
            'new_payment'      => (float) $data['amount_paid'],
            'total_paid'       => $paidTotal,
            'remaining'        => max(0, $fee->amount - $paidTotal),
            'status'           => $status,
        ]);
    }

    // Admin: fee report across students (per-fee breakdown)
    public function report(Request $request)
    {
        $query = FeePayment::with(['fee', 'student']);

        if ($request->fee_id) {
            $query->where('fee_id', $request->fee_id);
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->student_id) {
            $query->where('student_id', $request->student_id);
        }

        return $query->latest()->paginate($request->per_page ?? 30);
    }

    // Admin: student-wise fee summary (all fees for each student)
    public function studentFeesSummary(Request $request)
    {
        $query = FeePayment::with(['fee', 'student.studentProfile.department', 'student.studentProfile.section'])
            ->when($request->student_id, fn ($q) => $q->where('student_id', $request->student_id));

        return $query->latest()->get();
    }

    // Admin: monthly income report
    public function monthlyReport(Request $request)
    {
        $year = $request->year ?? now()->year;

        // Monthly total collection (only paid & partial)
        $monthly = FeePayment::selectRaw(
            "MONTH(payment_date) as month, YEAR(payment_date) as year,
             SUM(amount_paid) as total_collected,
             COUNT(CASE WHEN status = 'paid' THEN 1 END) as fully_paid_count,
             COUNT(CASE WHEN status = 'partial' THEN 1 END) as partial_count,
             COUNT(*) as total_transactions"
        )
            ->whereYear('payment_date', $year)
            ->where('amount_paid', '>', 0)
            ->groupByRaw('YEAR(payment_date), MONTH(payment_date)')
            ->orderByRaw('YEAR(payment_date), MONTH(payment_date)')
            ->get();

        // Fee type breakdown for the year
        $byType = FeePayment::join('fees', 'fee_payments.fee_id', '=', 'fees.id')
            ->selectRaw('fees.type, SUM(fee_payments.amount_paid) as total_collected, COUNT(*) as count')
            ->whereYear('fee_payments.payment_date', $year)
            ->where('fee_payments.amount_paid', '>', 0)
            ->groupBy('fees.type')
            ->get();

        // Overall totals
        $overall = FeePayment::selectRaw(
            'SUM(CASE WHEN status = "paid" THEN amount_paid ELSE 0 END) as total_paid,
             SUM(CASE WHEN status = "partial" THEN amount_paid ELSE 0 END) as total_partial,
             SUM(CASE WHEN status = "due" THEN 0 ELSE amount_paid END) as total_collected,
             COUNT(CASE WHEN status = "due" THEN 1 END) as due_count,
             COUNT(CASE WHEN status = "paid" THEN 1 END) as paid_count'
        )->whereYear('payment_date', $year)->first();

        return response()->json([
            'year'    => $year,
            'monthly' => $monthly,
            'by_type' => $byType,
            'overall' => $overall,
        ]);
    }

    // Student: view own fees
    public function myFees(Request $request)
    {
        return FeePayment::with('fee')
            ->where('student_id', $request->user()->id)
            ->latest()
            ->get();
    }
}
