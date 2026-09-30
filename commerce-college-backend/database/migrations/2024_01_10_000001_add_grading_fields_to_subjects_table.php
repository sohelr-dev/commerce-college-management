<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            $table->enum('subject_category', ['compulsory', 'group_a', 'group_b'])->default('compulsory')->after('full_marks');

          
            $table->enum('grading_type', ['general', 'english', 'ict_home_science'])->default('general')->after('subject_category');

            $table->unsignedInteger('full_marks_mcq')->default(30)->after('grading_type');
            $table->unsignedInteger('full_marks_written')->default(70)->after('full_marks_mcq');
            $table->unsignedInteger('pass_marks_mcq')->default(10)->after('full_marks_written');
            $table->unsignedInteger('pass_marks_written')->default(23)->after('pass_marks_mcq');
        });
    }

    public function down(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            $table->dropColumn(['subject_category', 'grading_type', 'full_marks_mcq', 'full_marks_written', 'pass_marks_mcq', 'pass_marks_written']);
        });
    }
};
