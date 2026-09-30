<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->decimal('marks_obtained', 6, 2)->default(0);
            $table->decimal('full_marks', 6, 2)->default(100);
            $table->string('grade', 5)->nullable();
            $table->decimal('grade_point', 3, 2)->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('entered_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['exam_id', 'student_id', 'subject_id'], 'result_unique_entry');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_results');
    }
};
