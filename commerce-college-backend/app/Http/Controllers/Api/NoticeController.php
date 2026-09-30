<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class NoticeController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Notice::with(['department', 'postedBy'])->orderByDesc('is_pinned')->latest();

        if ($user->isStudent()) {
            $query->where(function ($q) {
                $q->where('audience', 'all')->orWhere('audience', 'students');
            });
        } elseif ($user->isTeacher()) {
            $query->where(function ($q) {
                $q->where('audience', 'all')->orWhere('audience', 'teachers');
            });
        }

        return $query->paginate($request->per_page ?? 15);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],          // optional — PDF-only notice allowed
            'audience'    => ['required', Rule::in(['all', 'teachers', 'students'])],
            'department_id' => ['nullable', 'exists:departments,id'],
            'is_pinned'   => ['nullable', 'boolean'],
            'attachment'  => ['nullable', 'file', 'mimes:pdf,doc,docx,jpg,jpeg,png', 'max:10240'],
        ]);

        // At least one of description or attachment must be provided
        if (empty($data['description']) && !$request->hasFile('attachment')) {
            return response()->json(['message' => 'বিবরণ অথবা সংযুক্ত ফাইল (PDF) যেকোনো একটি দিতে হবে।'], 422);
        }

        $data['posted_by'] = $request->user()->id;
        $data['is_pinned'] = $request->boolean('is_pinned');

        if ($request->hasFile('attachment')) {
            $data['attachment_path'] = $request->file('attachment')->store('notices', 'public');
        }

        $notice = Notice::create($data)->load('postedBy');

        return response()->json($notice, 201);
    }

    public function update(Request $request, Notice $notice)
    {
        $data = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'audience'    => ['required', Rule::in(['all', 'teachers', 'students'])],
            'department_id' => ['nullable', 'exists:departments,id'],
            'is_pinned'   => ['nullable', 'boolean'],
            'attachment'  => ['nullable', 'file', 'mimes:pdf,doc,docx,jpg,jpeg,png', 'max:10240'],
        ]);

        $data['is_pinned'] = $request->boolean('is_pinned');

        if ($request->hasFile('attachment')) {
            // Delete old attachment if exists
            if ($notice->attachment_path && Storage::disk('public')->exists($notice->attachment_path)) {
                Storage::disk('public')->delete($notice->attachment_path);
            }
            $data['attachment_path'] = $request->file('attachment')->store('notices', 'public');
        }

        $notice->update($data);

        return response()->json($notice->load('postedBy'));
    }

    public function destroy(Notice $notice)
    {
        if ($notice->attachment_path && Storage::disk('public')->exists($notice->attachment_path)) {
            Storage::disk('public')->delete($notice->attachment_path);
        }
        $notice->delete();

        return response()->json(['message' => 'নোটিশ মুছে ফেলা হয়েছে']);
    }
}
