<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'phone', 'address',
        'avatar', 'gender', 'religion', 'date_of_birth', 'status',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'date_of_birth' => 'date',
        'password' => 'hashed',
    ];

    protected $appends = ['avatar_url', 'studentProfile', 'teacherProfile'];

    public function getStudentProfileAttribute()
    {
        return $this->relationLoaded('studentProfile') ? $this->getRelation('studentProfile') : null;
    }

    public function getTeacherProfileAttribute()
    {
        return $this->relationLoaded('teacherProfile') ? $this->getRelation('teacherProfile') : null;
    }

    public function getAvatarUrlAttribute()
    {
        if (!$this->avatar) return null;
        if (str_starts_with($this->avatar, 'http://') || str_starts_with($this->avatar, 'https://')) {
            return $this->avatar;
        }
        return asset('storage/' . $this->avatar);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isTeacher(): bool
    {
        return $this->role === 'teacher';
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    public function studentProfile()
    {
        return $this->hasOne(StudentProfile::class);
    }

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'student_subjects', 'student_id', 'subject_id')
            ->withPivot('is_optional')
            ->withTimestamps();
    }

    public function teacherProfile()
    {
        return $this->hasOne(TeacherProfile::class);
    }

    public function teachingSubjects()
    {
        return $this->belongsToMany(Subject::class, 'teacher_subject', 'teacher_id', 'subject_id')
            ->withPivot('section_id')
            ->withTimestamps();
    }

    public function classTeacherOfSections()
    {
        return $this->hasMany(Section::class, 'class_teacher_id');
    }


   
}
