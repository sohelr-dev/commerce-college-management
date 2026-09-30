<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fee_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('amount_paid', 10, 2);
            $table->date('payment_date');
            $table->string('transaction_id')->nullable();
            $table->enum('method', ['cash', 'bkash', 'nagad', 'bank', 'card'])->default('cash');
            $table->enum('status', ['paid', 'due', 'partial'])->default('due');
            $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fee_payments');
    }
};
