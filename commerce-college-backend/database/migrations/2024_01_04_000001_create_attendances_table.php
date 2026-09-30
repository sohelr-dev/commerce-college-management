<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->enum('status', ['present', 'absent', 'late', 'excused'])->default('present');
            $table->foreignId('marked_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['student_id', 'subject_id', 'date'], 'attendance_unique_per_day');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
