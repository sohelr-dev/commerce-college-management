<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\ContactMessage;
use App\Models\Department;
use App\Models\Event;
use App\Models\GalleryItem;
use App\Models\HomepageSection;
use App\Models\Notice;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    public function settings()
    {
        return response()->json(SiteSetting::current());
    }

    public function stats()
    {
        $setting = SiteSetting::current();
        return response()->json([
            'total_students' => User::where('role', 'student')->where('status', 'active')->count(),
            'total_teachers' => User::where('role', 'teacher')->where('status', 'active')->count(),
            'total_departments' => Department::count(),
            'established_year' => $setting->established_year,
        ]);
    }

    public function banners()
    {
        $banners = Banner::where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'desc')
            ->get();
        return response()->json(['data' => $banners]);
    }

    public function gallery(Request $request)
    {
        $query = GalleryItem::where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'desc');

        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        $items = $query->get();
        return response()->json(['data' => $items]);
    }

    public function events()
    {
        $events = Event::where('is_active', true)
            ->orderBy('event_date', 'asc')
            ->orderBy('id', 'desc')
            ->get();
        return response()->json(['data' => $events]);
    }

    public function sections()
    {
        $sections = HomepageSection::orderBy('sort_order', 'asc')->get();
        return response()->json(['data' => $sections]);
    }

    public function departments()
    {
        return Department::withCount(['semesters', 'subjects'])->get();
    }

    public function notices(Request $request)
    {
        return Notice::with('department')
            ->where('audience', 'all')
            ->orderByDesc('is_pinned')
            ->latest()
            ->paginate($request->per_page ?? 6);
    }

    public function faculty()
    {
        return User::where('role', 'teacher')
            ->where('status', 'active')
            ->with('teacherProfile.department')
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'name' => $t->name,
                    'email' => $t->email,
                    'phone' => $t->phone,
                    'avatar_url' => $t->avatar_url,
                    'designation' => $t->teacherProfile?->designation,
                    'qualification' => $t->teacherProfile?->qualification,
                    'bio' => $t->teacherProfile?->bio,
                    'specialty' => $t->teacherProfile?->subject_specialty,
                    'department' => $t->teacherProfile?->department?->name,
                    'department_id' => $t->teacherProfile?->department_id,
                ];
            });
    }

    public function storeContact(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email'],
            'phone' => ['nullable', 'string'],
            'subject' => ['nullable', 'string'],
            'message' => ['required', 'string'],
        ]);

        ContactMessage::create($data);

        return response()->json(['message' => 'আপনার বার্তা সফলভাবে পাঠানো হয়েছে। আমরা শীঘ্রই যোগাযোগ করব।'], 201);
    }
}
