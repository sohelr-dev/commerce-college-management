<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Hero Banners table
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->string('image_path');
            $table->string('button_text')->nullable();
            $table->string('button_link')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Gallery Items table
        Schema::create('gallery_items', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->string('category')->default('General');
            $table->string('image_path');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 3. Events table
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('event_date')->nullable();
            $table->string('location')->nullable();
            $table->string('image_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 4. Homepage Sections table
        Schema::create('homepage_sections', function (Blueprint $table) {
            $table->id();
            $table->string('section_key')->unique();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->text('content')->nullable();
            $table->boolean('is_enabled')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // 5. Update site_settings table
        Schema::table('site_settings', function (Blueprint $table) {
            $table->string('college_logo')->nullable()->after('college_name');
            $table->string('favicon')->nullable()->after('college_logo');
            $table->string('principal_image')->nullable()->after('principal_name');
            $table->string('principal_title')->nullable()->after('principal_image');
            $table->text('principal_bio')->nullable()->after('principal_message');
            $table->text('header_info')->nullable()->after('admission_info');
            $table->text('footer_info')->nullable()->after('header_info');
            $table->json('social_links')->nullable()->after('footer_info');
            $table->text('google_map_embed')->nullable()->after('social_links');
        });

        // 6. Update notices table
        Schema::table('notices', function (Blueprint $table) {
            $table->string('attachment_path')->nullable()->after('description');
        });

        // 7. Update teacher_profiles table
        Schema::table('teacher_profiles', function (Blueprint $table) {
            $table->text('bio')->nullable()->after('qualification');
            $table->string('subject_specialty')->nullable()->after('bio');
        });
    }

    public function down(): void
    {
        Schema::table('teacher_profiles', function (Blueprint $table) {
            $table->dropColumn(['bio', 'subject_specialty']);
        });

        Schema::table('notices', function (Blueprint $table) {
            $table->dropColumn('attachment_path');
        });

        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn([
                'college_logo',
                'favicon',
                'principal_image',
                'principal_title',
                'principal_bio',
                'header_info',
                'footer_info',
                'social_links',
                'google_map_embed',
            ]);
        });

        Schema::dropIfExists('homepage_sections');
        Schema::dropIfExists('events');
        Schema::dropIfExists('gallery_items');
        Schema::dropIfExists('banners');
    }
};
