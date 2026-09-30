<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->index('section_id', 'student_profiles_section_id_index');
            $table->dropUnique('student_profiles_section_id_roll_no_unique');
            $table->unique(['section_id', 'session', 'roll_no'], 'student_profiles_section_session_roll_unique');
        });
    }

    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropUnique('student_profiles_section_session_roll_unique');
            $table->unique(['section_id', 'roll_no'], 'student_profiles_section_id_roll_no_unique');
            $table->dropIndex('student_profiles_section_id_index');
        });
    }
};
