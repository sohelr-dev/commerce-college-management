<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exam_results', function (Blueprint $table) {
            $table->decimal('marks_mcq', 6, 2)->nullable()->after('subject_id');
            $table->decimal('marks_written', 6, 2)->nullable()->after('marks_mcq');
            $table->boolean('is_pass')->default(true)->after('grade_point');
        });
    }

    public function down(): void
    {
        Schema::table('exam_results', function (Blueprint $table) {
            $table->dropColumn(['marks_mcq', 'marks_written', 'is_pass']);
        });
    }
};
