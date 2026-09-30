<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('college_name')->default('Commerce College');
            $table->string('tagline')->nullable();
            $table->text('hero_text')->nullable();
            $table->text('about_text')->nullable();
            $table->text('mission_text')->nullable();
            $table->text('vision_text')->nullable();
            $table->string('principal_name')->nullable();
            $table->text('principal_message')->nullable();
            $table->unsignedSmallInteger('established_year')->nullable();
            $table->string('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('facebook_url')->nullable();
            $table->text('admission_info')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
