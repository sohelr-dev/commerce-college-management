<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salary_structures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('basic_salary', 10, 2);
            $table->decimal('house_allowance', 10, 2)->default(0);
            $table->decimal('medical_allowance', 10, 2)->default(0);
            $table->decimal('other_allowance', 10, 2)->default(0);
            $table->decimal('deductions', 10, 2)->default(0);
            $table->date('effective_from');
            $table->timestamps();

            $table->unique('teacher_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salary_structures');
    }
};
