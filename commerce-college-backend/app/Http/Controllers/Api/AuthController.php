<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['প্রদত্ত তথ্য ভুল। ইমেইল বা পাসওয়ার্ড সঠিক নয়।'],
            ]);
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => ['আপনার অ্যাকাউন্ট নিষ্ক্রিয় করা আছে। প্রশাসকের সাথে যোগাযোগ করুন।'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $this->formatUser($user),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'সফলভাবে লগআউট হয়েছে']);
    }

    public function me(Request $request)
    {
        return response()->json($this->formatUser($request->user()));
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required'],
            'new_password' => ['required', 'min:6', 'confirmed'],
        ]);

        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['বর্তমান পাসওয়ার্ড সঠিক নয়।'],
            ]);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        return response()->json(['message' => 'পাসওয়ার্ড আপডেট হয়েছে']);
    }

    private function formatUser(User $user): array
    {
        $data = $user->only(['id', 'name', 'email', 'role', 'phone', 'address', 'avatar', 'status']);

        if ($user->isStudent()) {
            $data['profile'] = $user->studentProfile()->with(['department', 'semester', 'section'])->first();
        } elseif ($user->isTeacher()) {
            $data['profile'] = $user->teacherProfile()->with('department')->first();
        }

        return $data;
    }
}
