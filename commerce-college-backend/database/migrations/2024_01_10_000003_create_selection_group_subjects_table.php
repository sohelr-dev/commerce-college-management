<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // একটি গুচ্ছের (selection group) মধ্যে কোন কোন বিষয় পুলে আছে (ছাত্র এখান থেকে বেছে নেবে)
        Schema::create('selection_group_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('selection_group_id')->constrained('subject_selection_groups')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['selection_group_id', 'subject_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('selection_group_subjects');
    }
};
