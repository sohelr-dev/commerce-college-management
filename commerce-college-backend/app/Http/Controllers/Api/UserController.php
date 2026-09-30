<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use App\Models\Subject;
use App\Models\SubjectSelectionGroup;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()->with([
            'studentProfile.department',
            'studentProfile.section',
            'studentProfile.semester',
            'teacherProfile.department',
            'subjects',
        ]);

        if ($request->role) {
            $query->where('role', $request->role);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%")
                    ->orWhere('phone', 'like', "%{$request->search}%");
            });
        }

        if ($request->role === 'student') {
            if ($request->department_id) {
                $query->whereHas('studentProfile', function ($q) use ($request) {
                    $q->where('department_id', $request->department_id);
                });
            }
            if ($request->session) {
                $query->whereHas('studentProfile', function ($q) use ($request) {
                    $q->where('session', $request->session);
                });
            }
            if ($request->year) {
                $query->whereHas('studentProfile', function ($q) use ($request) {
                    $q->where('year', $request->year);
                });
            }
            if ($request->semester_id) {
                $query->whereHas('studentProfile', function ($q) use ($request) {
                    $q->where('semester_id', $request->semester_id);
                });
            }
            if ($request->section_id) {
                $query->whereHas('studentProfile', function ($q) use ($request) {
                    $q->where('section_id', $request->section_id);
                });
            }
        }

        if ($request->role === 'teacher') {
            if ($request->department_id) {
                $query->whereHas('teacherProfile', function ($q) use ($request) {
                    $q->where('department_id', $request->department_id);
                });
            }
        }

        return $query->latest()->paginate($request->per_page ?? 20);
    }

    public function studentSessions()
    {
        $sessions = StudentProfile::select('session')
            ->distinct()
            ->orderBy('session', 'desc')
            ->pluck('session');

        return response()->json($sessions);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'            => ['required', 'string', 'max:255'],
            'email'           => ['required', 'email', 'unique:users,email'],
            'password'        => ['required', 'string', 'min:6'],
            'role'            => ['required', Rule::in(['admin', 'teacher', 'student'])],
            'phone'           => ['nullable', 'string'],
            'address'         => ['nullable', 'string'],
            'gender'          => ['required_if:role,student', 'nullable', Rule::in(['male', 'female', 'other'])],
            'religion'        => ['required_if:role,student', 'nullable', 'string', Rule::in(['islam', 'hinduism', 'christianity', 'buddhism', 'other'])],
            'date_of_birth'   => ['nullable', 'date'],
            'avatar_file'     => ['nullable', 'image', 'max:5120'],

            // student fields
            'department_id'   => ['required_if:role,student', 'nullable', 'exists:departments,id'],
            'semester_id'     => ['required_if:role,student', 'nullable', 'exists:semesters,id'],
            'section_id'      => ['required_if:role,student', 'nullable', 'exists:sections,id'],
            'roll_no'         => [
                'required_if:role,student',
                'nullable',
                'string',
                Rule::unique('student_profiles', 'roll_no')->where(function ($q) use ($request) {
                    return $q->where('section_id', $request->section_id)
                             ->where('session', $request->session);
                }),
            ],
            'registration_no' => ['required_if:role,student', 'nullable', 'string', 'unique:student_profiles,registration_no'],
            'session'         => ['required_if:role,student', 'nullable', 'string'],
            'year'            => ['nullable', Rule::in(['1st', '2nd'])],
            'guardian_name'   => ['nullable', 'string'],
            'guardian_phone'  => ['nullable', 'string'],

            // ═══ ফিক্স: গুচ্ছ থেকে বাছাইকৃত বিষয়ের ভ্যালিডেশন যোগ করা হলো ═══
            'group_a_subject_ids'   => ['nullable', 'array'],
            'group_a_subject_ids.*' => ['exists:subjects,id'],
            'group_b_subject_id'    => ['nullable', 'exists:subjects,id'],

            // teacher fields
            'employee_id'      => ['required_if:role,teacher', 'nullable', 'string', 'unique:teacher_profiles,employee_id'],
            'designation'      => ['nullable', 'string'],
            'qualification'    => ['nullable', 'string'],
            'bio'              => ['nullable', 'string'],
            'subject_specialty'=> ['nullable', 'string'],
            'joining_date'     => ['nullable', 'date'],
            'teacher_department_id' => ['nullable', 'exists:departments,id'],
        ]);

        $avatarPath = null;
        if ($request->hasFile('avatar_file')) {
            $avatarPath = $request->file('avatar_file')->store('avatars', 'public');
        }

        $user = DB::transaction(function () use ($data, $avatarPath, $request) {
            $user = User::create([
                'name'          => $data['name'],
                'email'         => $data['email'],
                'password'      => Hash::make($data['password']),
                'role'          => $data['role'],
                'phone'         => $data['phone'] ?? null,
                'address'       => $data['address'] ?? null,
                'gender'        => $data['gender'] ?? null,
                'religion'      => $data['religion'] ?? null,
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'avatar'        => $avatarPath,
            ]);

            if ($data['role'] === 'student') {
                StudentProfile::create([
                    'user_id'         => $user->id,
                    'department_id'   => $data['department_id'],
                    'semester_id'     => $data['semester_id'],
                    'section_id'      => $data['section_id'],
                    'roll_no'         => $data['roll_no'],
                    'registration_no' => $data['registration_no'],
                    'session'         => $data['session'],
                    'year'            => $data['year'] ?? '1st',
                    'guardian_name'   => $data['guardian_name'] ?? null,
                    'guardian_phone'  => $data['guardian_phone'] ?? null,
                ]);

                $this->assignStudentSubjects($user, $data, $request);
            } elseif ($data['role'] === 'teacher') {
                TeacherProfile::create([
                    'user_id'          => $user->id,
                    'department_id'    => $data['teacher_department_id'] ?? ($data['department_id'] ?? null),
                    'employee_id'      => $data['employee_id'],
                    'designation'      => $data['designation'] ?? null,
                    'qualification'    => $data['qualification'] ?? null,
                    'bio'              => $data['bio'] ?? null,
                    'subject_specialty'=> $data['subject_specialty'] ?? null,
                    'joining_date'     => $data['joining_date'] ?? null,
                ]);
            }

            return $user;
        });

        return response()->json(
            $user->load(['studentProfile.department', 'studentProfile.semester', 'studentProfile.section', 'teacherProfile.department']),
            201
        );
    }

    /**
     * Compulsory subjects auto assign (department + semester অনুযায়ী)
     */
    private function assignCompulsorySubjects(User $user, array $data): void
    {
        $compulsorySubjects = Subject::where('department_id', $data['department_id'])
            ->where('semester_id', $data['semester_id'])
            ->where('subject_category', 'compulsory')
            ->pluck('id');

        foreach ($compulsorySubjects as $subjectId) {
            $user->subjects()->syncWithoutDetaching([$subjectId => ['is_optional' => false]]);
        }
    }

    /**
     * ═══ ফিক্স ═══
     * Compulsory + Group A (mandatory pass) + Group B (৪র্থ বিষয়, is_optional=true) সব একসাথে
     * সঠিকভাবে validate করে assign করে। required_count না মিললে বা ভুল pool থেকে subject এলে error দেয়।
     */
    private function assignStudentSubjects(User $user, array $data, Request $request): void
    {
        $this->assignCompulsorySubjects($user, $data);

        $groups = SubjectSelectionGroup::with('subjects')
            ->where('department_id', $data['department_id'])
            ->where('semester_id', $data['semester_id'])
            ->get();

        $groupA = $groups->firstWhere('code', 'group_a');
        $groupB = $groups->firstWhere('code', 'group_b');

        $groupAIds = collect($request->input('group_a_subject_ids', []));
        $groupBId  = $request->input('group_b_subject_id');

        // ═══ ক্রস-সিলেকশন চেক: ক-গুচ্ছের নির্বাচিত বিষয় খ-গুচ্ছে নেওয়া যাবে না ═══
        if ($groupBId && $groupAIds->contains($groupBId)) {
            throw ValidationException::withMessages([
                'group_b_subject_id' => ['ক-গুচ্ছে নির্বাচিত বিষয় পুনরায় খ-গুচ্ছে (৪র্থ বিষয় হিসেবে) নির্বাচন করা যাবে না। অন্য বিষয় নির্বাচন করুন।'],
            ]);
        }

        // ═══ জেন্ডার চেক: গার্হস্থ্য বিজ্ঞান শুধুমাত্র ছাত্রীদের (female) জন্য ═══
        $allChosenIds = $groupAIds->merge($groupBId ? [$groupBId] : []);
        $homeEcoExists = Subject::whereIn('id', $allChosenIds)
            ->where(function ($q) {
                $q->where('name', 'like', '%গার্হস্থ্য%')
                  ->orWhere('name', 'like', '%Home Economics%')
                  ->orWhere('code', 'like', '%273%');
            })->exists();

        $studentGender = $data['gender'] ?? $user->gender ?? null;
        if ($homeEcoExists && $studentGender !== 'female') {
            throw ValidationException::withMessages([
                'group_b_subject_id' => ['"গার্হস্থ্য বিজ্ঞান" বিষয়টি শুধুমাত্র ছাত্রীদের জন্য প্রযোজ্য। কোনো ছাত্র এটি নির্বাচন করতে পারবে না।'],
            ]);
        }

        // ═══ ধর্ম চেক: ইসলামের ইতিহাস ও সংস্কৃতি শুধুমাত্র মুসলিম ছাত্র-ছাত্রীদের জন্য ═══
        $islamicHistorySubject = Subject::whereIn('id', $allChosenIds)
            ->where(function ($q) {
                $q->where('name', 'like', '%ইসলামের ইতিহাস%')
                  ->orWhere('name', 'like', '%Islamic History%')
                  ->orWhere('code', 'like', '%267%')
                  ->orWhere('code', 'like', '%268%');
            })->first();

        $studentReligion = $data['religion'] ?? $user->religion ?? null;
        if ($islamicHistorySubject && $studentReligion !== 'islam') {
            $field = $groupAIds->contains($islamicHistorySubject->id) ? 'group_a_subject_ids' : 'group_b_subject_id';
            throw ValidationException::withMessages([
                $field => ['"ইসলামের ইতিহাস ও সংস্কৃতি" বিষয়টি শুধুমাত্র মুসলিম ছাত্র-ছাত্রীদের জন্য প্রযোজ্য। হিন্দু বা অন্য ধর্মের শিক্ষার্থীদের জন্য এটি প্রযোজ্য নয়।'],
            ]);
        }

        // Group A validation: required_count মিলতে হবে এবং subject অবশ্যই group_a-এর পুলে থাকতে হবে
        if ($groupA) {
            $poolIds = $groupA->subjects->pluck('id');
            $picked  = $groupAIds->intersect($poolIds);

            if ($picked->count() !== (int) $groupA->required_count) {
                throw ValidationException::withMessages([
                    'group_a_subject_ids' => ["\"{$groupA->name}\" থেকে ঠিক {$groupA->required_count} টি বিষয় বাছাই করতে হবে।"],
                ]);
            }

            foreach ($picked as $subjectId) {
                $user->subjects()->syncWithoutDetaching([$subjectId => ['is_optional' => !$groupA->is_mandatory_pass]]);
            }
        }

        // Group B validation: ঐচ্ছিক হলেও যদি দেওয়া হয়, সেটা অবশ্যই group_b-এর পুলে থাকতে হবে
        if ($groupB && $groupBId) {
            $poolIds = $groupB->subjects->pluck('id');
            if (!$poolIds->contains($groupBId)) {
                throw ValidationException::withMessages([
                    'group_b_subject_id' => ["নির্বাচিত বিষয়টি \"{$groupB->name}\"-এর তালিকায় নেই।"],
                ]);
            }
            $user->subjects()->syncWithoutDetaching([$groupBId => ['is_optional' => !$groupB->is_mandatory_pass]]);
        }
    }

    public function show(User $user)
    {
        return $user->load([
            'studentProfile.department',
            'studentProfile.semester',
            'studentProfile.section',
            'teacherProfile.department',
            'subjects',
            'teachingSubjects',
        ]);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name'    => ['required', 'string', 'max:255'],
            'email'   => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'phone'   => ['nullable', 'string'],
            'address' => ['nullable', 'string'],
            'gender'  => ['nullable', Rule::in(['male', 'female', 'other'])],
            'religion'=> ['nullable', 'string', Rule::in(['islam', 'hinduism', 'christianity', 'buddhism', 'other'])],
            'status'  => ['required', Rule::in(['active', 'inactive'])],
            'avatar_file' => ['nullable', 'image', 'max:5120'],

            'designation'       => ['nullable', 'string'],
            'qualification'     => ['nullable', 'string'],
            'bio'               => ['nullable', 'string'],
            'subject_specialty' => ['nullable', 'string'],
            'department_id'     => ['nullable', 'exists:departments,id'],

            'guardian_name'  => ['nullable', 'string'],
            'guardian_phone' => ['nullable', 'string'],
            'roll_no'        => ['nullable', 'string'],
            'session'        => ['nullable', 'string'],
            'year'           => ['nullable', Rule::in(['1st', '2nd'])],
            'semester_id'    => ['nullable', 'exists:semesters,id'],
        ]);

        if ($request->hasFile('avatar_file')) {
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            $data['avatar'] = $request->file('avatar_file')->store('avatars', 'public');
        }

        $user->update([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'phone'    => $data['phone'] ?? $user->phone,
            'address'  => $data['address'] ?? $user->address,
            'gender'   => $data['gender'] ?? $user->gender,
            'religion' => $data['religion'] ?? $user->religion,
            'status'   => $data['status'],
            'avatar'   => $data['avatar'] ?? $user->avatar,
        ]);

        if ($user->role === 'teacher' && $user->teacherProfile) {
            $user->teacherProfile->update([
                'designation'       => $data['designation']       ?? $user->teacherProfile->designation,
                'qualification'     => $data['qualification']     ?? $user->teacherProfile->qualification,
                'bio'               => $data['bio']               ?? $user->teacherProfile->bio,
                'subject_specialty' => $data['subject_specialty'] ?? $user->teacherProfile->subject_specialty,
                'department_id'     => $data['department_id']     ?? $user->teacherProfile->department_id,
            ]);
        } elseif ($user->role === 'student' && $user->studentProfile) {
            $updateData = [
                'guardian_name'  => $data['guardian_name']  ?? $user->studentProfile->guardian_name,
                'guardian_phone' => $data['guardian_phone'] ?? $user->studentProfile->guardian_phone,
                'roll_no'        => $data['roll_no']        ?? $user->studentProfile->roll_no,
                'session'        => $data['session']        ?? $user->studentProfile->session,
            ];

            if (isset($data['year'])) {
                $updateData['year'] = $data['year'];
            }

            if (isset($data['semester_id'])) {
                $updateData['semester_id'] = $data['semester_id'];
            }

            $user->studentProfile->update($updateData);
        }

        return response()->json($user->load([
            'studentProfile.department',
            'studentProfile.semester',
            'studentProfile.section',
            'teacherProfile.department',
        ]));
    }

    public function destroy(User $user)
    {
        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }
        $user->delete();

        return response()->json(['message' => 'ব্যবহারকারী মুছে ফেলা হয়েছে']);
    }

    public function resetPassword(Request $request, User $user)
    {
        $data = $request->validate(['password' => ['required', 'string', 'min:6']]);
        $user->update(['password' => Hash::make($data['password'])]);

        return response()->json(['message' => 'পাসওয়ার্ড রিসেট করা হয়েছে']);
    }

    public function bulkPromoteYear(Request $request)
    {
        $data = $request->validate([
            'student_ids' => ['required', 'array', 'min:1'],
            'student_ids.*' => ['required', 'exists:users,id'],
        ]);

        $count = StudentProfile::whereIn('user_id', $data['student_ids'])
            ->where('year', '1st')
            ->update(['year' => '2nd']);

        return response()->json([
            'message' => "{$count} জন ছাত্রকে 2nd year-এ promote করা হয়েছে",
            'promoted_count' => $count,
        ]);
    }
}