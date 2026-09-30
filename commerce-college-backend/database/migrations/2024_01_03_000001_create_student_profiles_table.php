<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('department_id')->constrained()->cascadeOnDelete();
            $table->foreignId('semester_id')->constrained()->cascadeOnDelete();
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();
            $table->string('roll_no');
            $table->string('registration_no')->unique();
            $table->string('session');
            $table->string('guardian_name')->nullable();
            $table->string('guardian_phone')->nullable();
            $table->timestamps();

            $table->unique(['section_id', 'roll_no']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_profiles');
    }
};
