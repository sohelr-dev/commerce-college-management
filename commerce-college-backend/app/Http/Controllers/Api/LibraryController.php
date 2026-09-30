<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookIssue;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LibraryController extends Controller
{
    // ===== Books =====
    public function index(Request $request)
    {
        $query = Book::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                    ->orWhere('author', 'like', "%{$request->search}%")
                    ->orWhere('isbn', 'like', "%{$request->search}%");
            });
        }

        return $query->latest()->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'author' => ['required', 'string', 'max:255'],
            'isbn' => ['nullable', 'string', 'unique:books,isbn'],
            'category' => ['nullable', 'string'],
            'publisher' => ['nullable', 'string'],
            'shelf_no' => ['nullable', 'string'],
            'total_copies' => ['required', 'integer', 'min:1'],
        ]);

        $data['available_copies'] = $data['total_copies'];

        return response()->json(Book::create($data), 201);
    }

    public function update(Request $request, Book $book)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'author' => ['required', 'string', 'max:255'],
            'isbn' => ['nullable', 'string', Rule::unique('books', 'isbn')->ignore($book->id)],
            'category' => ['nullable', 'string'],
            'publisher' => ['nullable', 'string'],
            'shelf_no' => ['nullable', 'string'],
            'total_copies' => ['required', 'integer', 'min:1'],
        ]);

        $issuedCount = $book->total_copies - $book->available_copies;
        $data['available_copies'] = max(0, $data['total_copies'] - $issuedCount);

        $book->update($data);

        return response()->json($book);
    }

    public function destroy(Book $book)
    {
        $book->delete();

        return response()->json(['message' => 'বইটি মুছে ফেলা হয়েছে']);
    }

    // ===== Issue / Return =====
    public function issue(Request $request)
    {
        $data = $request->validate([
            'book_id' => ['required', 'exists:books,id'],
            'user_id' => ['required', 'exists:users,id'],
            'due_date' => ['required', 'date', 'after:today'],
        ]);

        $book = Book::findOrFail($data['book_id']);

        if ($book->available_copies < 1) {
            return response()->json(['message' => 'এই বইয়ের কোনো কপি এই মুহূর্তে উপলব্ধ নেই'], 422);
        }

        $activeIssue = BookIssue::where('book_id', $book->id)
            ->where('user_id', $data['user_id'])
            ->where('status', 'issued')
            ->exists();

        if ($activeIssue) {
            return response()->json(['message' => 'এই ব্যবহারকারীর কাছে ইতিমধ্যে এই বইটি ইস্যু করা আছে'], 422);
        }

        $issue = BookIssue::create([
            'book_id' => $book->id,
            'user_id' => $data['user_id'],
            'issue_date' => now(),
            'due_date' => $data['due_date'],
            'status' => 'issued',
            'issued_by' => $request->user()->id,
        ]);

        $book->decrement('available_copies');

        return response()->json($issue->load(['book', 'user']), 201);
    }

    public function returnBook(Request $request, BookIssue $bookIssue)
    {
        if ($bookIssue->status === 'returned') {
            return response()->json(['message' => 'এই বইটি ইতিমধ্যে ফেরত দেওয়া হয়েছে'], 422);
        }

        $today = now()->startOfDay();
        $due = $bookIssue->due_date->startOfDay();
        $overdueDays = $today->greaterThan($due) ? $today->diffInDays($due) : 0;
        $fine = $overdueDays * 5; // ৳৫ প্রতি দিন জরিমানা

        $bookIssue->update([
            'return_date' => now(),
            'status' => 'returned',
            'fine_amount' => $fine,
        ]);

        $bookIssue->book()->increment('available_copies');

        return response()->json($bookIssue->load(['book', 'user']));
    }

    // Admin: all issues report
    public function allIssues(Request $request)
    {
        $query = BookIssue::with(['book', 'user']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return $query->latest()->paginate($request->per_page ?? 30);
    }

    // Student/Teacher: own issued books
    public function myIssues(Request $request)
    {
        return BookIssue::with('book')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();
    }
}
