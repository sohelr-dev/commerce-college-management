<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'department_id', 'semester_id', 'section_id',
        'roll_no', 'registration_no', 'session', 'year',
        'guardian_name', 'guardian_phone',
    ];

    protected $casts = [
        'year' => 'string', // '1st' or '2nd'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    /**
     * Student যদি 1st year pass করে পরের বছর 2nd year-এ ওঠে,
     * session একই থাকে কিন্তু year = '2nd' হয়।
     * শুধু year পরিবর্তন করলেই হয়, session change হয় না।
     */
    public function promoteToSecondYear(): bool
    {
        if ($this->year === '1st') {
            $this->year = '2nd';
            return $this->save();
        }
        return false;
    }
}

