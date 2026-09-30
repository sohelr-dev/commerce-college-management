<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GradeScale extends Model
{
    use HasFactory;

    protected $fillable = [
        'min_percentage', 'max_percentage', 'grade_letter', 'grade_point', 'remarks', 'sort_order',
    ];

    /**
     * শতকরা মার্কস ও পাস স্ট্যাটাস অনুযায়ী ডাইনামিকভাবে লেটার গ্রেড ও পয়েন্ট প্রোভাইড করে।
     */
    public static function getGradeForPercentage(float $percentage, bool $isPass = true): array
    {
        if (!$isPass) {
            return ['F', 0.00];
        }

        $rule = static::where('min_percentage', '<=', $percentage)
            ->where('max_percentage', '>=', $percentage)
            ->orderBy('sort_order', 'asc')
            ->first();

        if ($rule) {
            return [$rule->grade_letter, (float) $rule->grade_point];
        }

        // Fallback default matching Bangladesh National Board grading scale
        return match (true) {
            $percentage >= 80 => ['A+', 5.00],
            $percentage >= 70 => ['A', 4.00],
            $percentage >= 60 => ['A-', 3.50],
            $percentage >= 50 => ['B', 3.00],
            $percentage >= 40 => ['C', 2.00],
            $percentage >= 33 => ['D', 1.00],
            default => ['F', 0.00],
        };
    }
}
