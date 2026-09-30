<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: student_profiles এ `year` কলাম যোগ করো (1st/2nd year)
 * এবং teacher_subject pivot এ department_id যোগ করো
 * যাতে একজন teacher একাধিক department-এর subject পড়াতে পারে।
 */
return new class extends Migration
{
    public function up(): void
    {
        // 1. student_profiles এ year কলাম যোগ করো
        Schema::table('student_profiles', function (Blueprint $table) {
            // '1st' বা '2nd' — default 1st year
            $table->enum('year', ['1st', '2nd'])->default('1st')->after('session');
        });

        // 2. teacher_subject pivot থেকে UNIQUE constraint তুলে নাও
        //    কারণ একই teacher একই subject ভিন্ন department-এ পড়াতে পারে
        //    (যেমন: Humanities Bangla AND Business Bangla)
        // Note: teacher_id + subject_id + section_id unique রাখবো
        // কিন্তু subject assignment এ department_id context যোগ করতে হবে
        // Existing unique: teacher_subject_section_unique (teacher_id, subject_id, section_id)
        // এটা ঠিক আছে — একজন teacher একই subject একই section-এ দুইবার assign হবে না।

        // 3. exams table এ session ও year কলাম যোগ করো
        //    Result entry করার সময় exam select করলে session+year auto filter করা যাবে
        Schema::table('exams', function (Blueprint $table) {
            $table->string('session')->nullable()->after('semester_id');
            $table->enum('year', ['1st', '2nd'])->nullable()->after('session');
        });
    }

    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->dropColumn(['session', 'year']);
        });

        Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropColumn('year');
        });
    }
};
