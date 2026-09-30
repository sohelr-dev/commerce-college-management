<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // এই টেবিল বিভাগভিত্তিক "ক-গুচ্ছ" / "খ-গুচ্ছ" পুল সংজ্ঞায়িত করে:
        // যেমন BBA বিভাগের ক-গুচ্ছ থেকে ৩টি বিষয় বেছে নিতে হবে, খ-গুচ্ছ থেকে ১টি (৪র্থ বিষয়)
        Schema::create('subject_selection_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained()->cascadeOnDelete();
            $table->foreignId('semester_id')->constrained()->cascadeOnDelete();
            $table->string('name'); // যেমন: ক-গুচ্ছ, খ-গুচ্ছ
            $table->enum('code', ['group_a', 'group_b']);
            $table->unsignedTinyInteger('required_count')->default(1); // কয়টি বিষয় বাছাই করতে হবে
            $table->boolean('is_mandatory_pass')->default(true); // false হলে এই গুচ্ছের বিষয় ফেল করলেও মোট রেজাল্ট ফেল হবে না (৪র্থ বিষয়)
            $table->timestamps();

            $table->unique(['department_id', 'semester_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subject_selection_groups');
    }
};
