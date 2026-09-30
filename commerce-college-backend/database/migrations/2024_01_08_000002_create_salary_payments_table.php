<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salary_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('month');
            $table->unsignedSmallInteger('year');
            $table->decimal('gross_amount', 10, 2);
            $table->decimal('net_amount', 10, 2);
            $table->enum('status', ['paid', 'pending'])->default('pending');
            $table->date('payment_date')->nullable();
            $table->foreignId('paid_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['teacher_id', 'month', 'year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salary_payments');
    }
};
