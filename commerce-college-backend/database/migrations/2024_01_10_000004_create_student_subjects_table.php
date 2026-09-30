<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ছাত্র ভর্তির সময় তার চূড়ান্ত বিষয় তালিকা (আবশ্যিক + ক-গুচ্ছ থেকে বাছাইকৃত + খ-গুচ্ছ থেকে বাছাইকৃত)
        Schema::create('student_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_optional')->default(false); // true = ৪র্থ বিষয় (খ-গুচ্ছ), ফেল করলে মোট রেজাল্ট ফেল হবে না
            $table->timestamps();

            $table->unique(['student_id', 'subject_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_subjects');
    }
};
