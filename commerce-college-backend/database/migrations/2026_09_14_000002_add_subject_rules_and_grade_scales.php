<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Update subjects table
        Schema::table('subjects', function (Blueprint $table) {
            $table->float('full_marks_practical')->default(0)->after('full_marks_written');
            $table->float('pass_marks_overall')->default(33)->after('full_marks_practical');
            $table->float('pass_marks_practical')->default(0)->after('pass_marks_written');
            $table->boolean('require_overall_pass')->default(true)->after('pass_marks_practical');
            $table->boolean('require_written_pass')->default(true)->after('require_overall_pass');
            $table->boolean('require_mcq_pass')->default(true)->after('require_written_pass');
            $table->boolean('require_practical_pass')->default(false)->after('require_mcq_pass');
            $table->string('subject_type')->default('compulsory')->after('require_practical_pass');
            $table->foreignId('parent_subject_id')->nullable()->constrained('subjects')->nullOnDelete()->after('subject_type');
        });

        // 2. Update exam_results table
        Schema::table('exam_results', function (Blueprint $table) {
            $table->float('marks_practical')->nullable()->after('marks_written');
            $table->text('fail_reason')->nullable()->after('is_pass');
        });

        // 3. Update gallery_items table
        Schema::table('gallery_items', function (Blueprint $table) {
            $table->text('description')->nullable()->after('title');
        });

        // 4. Create grade_scales table
        Schema::create('grade_scales', function (Blueprint $table) {
            $table->id();
            $table->float('min_percentage');
            $table->float('max_percentage');
            $table->string('grade_letter');
            $table->float('grade_point', 8, 2);
            $table->string('remarks')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Seed default Bangladesh National Board Grade Scale
        DB::table('grade_scales')->insert([
            ['min_percentage' => 80, 'max_percentage' => 100, 'grade_letter' => 'A+', 'grade_point' => 5.00, 'remarks' => 'Outstanding', 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['min_percentage' => 70, 'max_percentage' => 79.99, 'grade_letter' => 'A', 'grade_point' => 4.00, 'remarks' => 'Excellent', 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['min_percentage' => 60, 'max_percentage' => 69.99, 'grade_letter' => 'A-', 'grade_point' => 3.50, 'remarks' => 'Very Good', 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['min_percentage' => 50, 'max_percentage' => 59.99, 'grade_letter' => 'B', 'grade_point' => 3.00, 'remarks' => 'Good', 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['min_percentage' => 40, 'max_percentage' => 49.99, 'grade_letter' => 'C', 'grade_point' => 2.00, 'remarks' => 'Satisfactory', 'sort_order' => 5, 'created_at' => now(), 'updated_at' => now()],
            ['min_percentage' => 33, 'max_percentage' => 39.99, 'grade_letter' => 'D', 'grade_point' => 1.00, 'remarks' => 'Passing', 'sort_order' => 6, 'created_at' => now(), 'updated_at' => now()],
            ['min_percentage' => 0,  'max_percentage' => 32.99, 'grade_letter' => 'F', 'grade_point' => 0.00, 'remarks' => 'Failed', 'sort_order' => 7, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('grade_scales');

        Schema::table('gallery_items', function (Blueprint $table) {
            $table->dropColumn('description');
        });

        Schema::table('exam_results', function (Blueprint $table) {
            $table->dropColumn(['marks_practical', 'fail_reason']);
        });

        Schema::table('subjects', function (Blueprint $table) {
            $table->dropForeign(['parent_subject_id']);
            $table->dropColumn([
                'full_marks_practical',
                'pass_marks_overall',
                'pass_marks_practical',
                'require_overall_pass',
                'require_written_pass',
                'require_mcq_pass',
                'require_practical_pass',
                'subject_type',
                'parent_subject_id',
            ]);
        });
    }
};
