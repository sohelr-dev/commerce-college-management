<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\Department;
use App\Models\Event;
use App\Models\GalleryItem;
use App\Models\HomepageSection;
use App\Models\Notice;
use App\Models\Section;
use App\Models\Semester;
use App\Models\SiteSetting;
use App\Models\StudentProfile;
use App\Models\Subject;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ===== Admin =====
        $admin = User::firstOrCreate(
            ['email' => 'admin@commercecollege.edu.bd'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'phone' => '01700000000',
                'status' => 'active',
            ]
        );

        // ===== Site Settings =====
        SiteSetting::updateOrCreate(
            ['id' => 1],
            [
                'college_name' => 'Commerce College',
                'tagline' => 'জ্ঞান, সততা ও নেতৃত্বের আলোকবর্তিকা',
                'hero_text' => 'ব্যবসা ও আধুনিক শিক্ষায় দেশসেরা প্রতিষ্ঠান — যেখানে ভবিষ্যতের উদ্যোক্তা, হিসাববিদ ও দক্ষ ব্যবস্থাপকরা গড়ে ওঠেন।',
                'about_text' => 'কমার্স কলেজ বিশ্বমানের ব্যবসায় শিক্ষায় দীর্ঘদিন ধরে নেতৃত্ব দিয়ে আসছে। আমাদের অভিজ্ঞ শিক্ষকমণ্ডলী, ডিজিটাল ক্লাসরুম ও আধুনিক ল্যাব শিক্ষার্থীদের অনন্য উচ্চতায় পৌঁছে দিতে প্রস্তুত।',
                'mission_text' => 'মানসম্মত ব্যবসায় শিক্ষার মাধ্যমে সৎ, দক্ষ, প্রযুক্তিপ্রেমী ও সৃজনশীল ভবিষ্যৎ প্রজন্ম গড়ে তোলা।',
                'vision_text' => 'জাতীয় ও আন্তর্জাতিক পর্যায়ে শীর্ষস্থানীয় বাণিজ্য শিক্ষা কেন্দ্র হিসেবে আত্মপ্রকাশ করা।',
                'principal_name' => 'অধ্যাপক ড. আহমেদ আলী খান',
                'principal_title' => 'অধ্যক্ষ, কমার্স কলেজ',
                'principal_message' => 'আমাদের কলেজে আপনাদের জানাই আন্তরিক অভিনন্দন। শিক্ষা মানে কেবল পাঠ্যপুস্তকের জ্ঞান নয়, বরং নীতি-নৈতিকতা ও সৃজনশীলতার বিকাশ। আমরা প্রতিটি শিক্ষার্থীকে বিশ্বায়নের যুগে প্রতিযোগী হিসেবে গড়ে তুলতে সংকল্পবদ্ধ।',
                'principal_bio' => 'ঢাকা বিশ্ববিদ্যালয় থেকে ফিন্যান্সে পিএইচডি অর্জনের পর বিগত ২৫ বছর ধরে শিক্ষা প্রশাসনে সফলতার সাথে নেতৃত্ব দিচ্ছেন।',
                'established_year' => 2012,
                'address' => '১২৩, বাণিজ্যিক এলাকা, ধানমন্ডি, ঢাকা-১২০৯',
                'phone' => '01700-000000, 02-9876543',
                'email' => 'info@commercecollege.edu.bd',
                'facebook_url' => 'https://facebook.com',
                'admission_info' => 'নতুন শিক্ষাবর্ষে BBA, Accounting, Management সহ সকল বিভাগে ভর্তি চলছে। বিস্তারিত ও আবেদনের জন্য ভর্তি তথ্য বাটনে ক্লিক করুন।',
                'header_info' => '২০২৫-২০২৬ শিক্ষাবর্ষে একাদশ ও অনার্স ১ম বর্ষের ভর্তি চলছে',
                'footer_info' => 'মানসম্মত শিক্ষা ও সৎ চরিত্র গঠনের অঙ্গীকারে পরিচালিত ঐতিহ্যবাহী উচ্চ শিক্ষা প্রতিষ্ঠান।',
            ]
        );

        // ===== Seed Hero Banners (Multi-Banner Slider) =====
        Banner::truncate();
        Banner::create([
            'title' => 'ডিজিটাল ক্যাম্পাস ও আধুনিক শিক্ষাব্যবস্থা',
            'description' => 'স্মার্ট ক্লাসরুম, অনলাইন পোর্টাল ও অভিজ্ঞ শিক্ষকদের সমন্বয়ে পরিচালিত শীর্ষস্থানীয় বিদ্যাপীঠ।',
            'image_path' => 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1600&auto=format&fit=crop',
            'button_text' => 'ভর্তি আবেদন করুন',
            'button_link' => '/admissions',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        Banner::create([
            'title' => 'ব্যবসায় ও প্রযুক্তি শিক্ষায় নতুন দিগন্ত',
            'description' => 'BBA, Accounting ও Management বিভাগে আন্তর্জাতিক মানের কারিকুলাম ও স্কিল ডেভেলপমেন্ট।',
            'image_path' => 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop',
            'button_text' => 'বিভাগসমূহ দেখুন',
            'button_link' => '/departments',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        Banner::create([
            'title' => 'সমৃদ্ধ বইয়ের ভাণ্ডার ও কম্পিউটার ল্যাব',
            'description' => 'প্রতিটি শিক্ষার্থীর জন্য ই-লাইব্রেরি, ব্যবহারিক কোর্স ও সহ-শিক্ষা কার্যক্রমের সুযোগ।',
            'image_path' => 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1600&auto=format&fit=crop',
            'button_text' => 'আমাদের পরিচিতি',
            'button_link' => '/about',
            'sort_order' => 3,
            'is_active' => true,
        ]);

        // ===== Seed Photo Gallery =====
        GalleryItem::truncate();
        GalleryItem::create(['title' => 'বার্ষিক ক্রীড়া প্রতিযোগিতা', 'category' => 'Sports', 'image_path' => 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800', 'sort_order' => 1, 'is_active' => true]);
        GalleryItem::create(['title' => 'কম্পিউটার ল্যাব সেশন', 'category' => 'Academic', 'image_path' => 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800', 'sort_order' => 2, 'is_active' => true]);
        GalleryItem::create(['title' => 'সাংস্কৃতিক সন্ধ্যা', 'category' => 'Event', 'image_path' => 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800', 'sort_order' => 3, 'is_active' => true]);
        GalleryItem::create(['title' => 'ক্যাম্পাস প্রাঙ্গণ', 'category' => 'Campus', 'image_path' => 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800', 'sort_order' => 4, 'is_active' => true]);
        GalleryItem::create(['title' => 'কেন্দ্রীয় গ্রন্থাগার', 'category' => 'Academic', 'image_path' => 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=800', 'sort_order' => 5, 'is_active' => true]);
        GalleryItem::create(['title' => 'সেমিনার ও ওয়ার্কশপ', 'category' => 'Event', 'image_path' => 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800', 'sort_order' => 6, 'is_active' => true]);

        // ===== Seed Events =====
        Event::truncate();
        Event::create([
            'title' => 'নবীন বরণ ও সাংস্কৃতিক অনুষ্ঠান ২০২৬',
            'description' => '২০২৫-২০২৬ শিক্ষাবর্ষের নতুন শিক্ষার্থীদের বরণ করে নিতে জাঁকজমকপূর্ণ কনসার্ট ও সাংস্কৃতিক উৎসব।',
            'event_date' => now()->addDays(15),
            'location' => 'কলেজ অডিটোরিয়াম',
            'image_path' => 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800',
            'is_active' => true,
        ]);
        Event::create([
            'title' => 'আইটি ও ক্যারিয়ার ফেয়ার ২০২৬',
            'description' => 'জাতীয় ও আন্তর্জাতিক তথ্যপ্রযুক্তি প্রতিষ্ঠানের অংশগ্রহণে সরাসরি জব ফেয়ার ও ক্যারিয়ার কাউন্সিলিং।',
            'event_date' => now()->addDays(30),
            'location' => 'ক্যাম্পাস গ্রাউন্ড',
            'image_path' => 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800',
            'is_active' => true,
        ]);

        // ===== Seed Homepage Sections =====
        HomepageSection::truncate();
        $defaultSections = [
            ['section_key' => 'banners', 'title' => 'প্রধান ব্যানার স্লাইডার', 'subtitle' => 'কলেজ ক্যাম্পাস ও খবরাখবর', 'is_enabled' => true, 'sort_order' => 1],
            ['section_key' => 'stats', 'title' => 'আমাদের অর্জন ও পরিসংখ্যান', 'subtitle' => 'এক নজরে আমাদের সাফল্য', 'is_enabled' => true, 'sort_order' => 2],
            ['section_key' => 'principal', 'title' => 'অধ্যক্ষের বাণী', 'subtitle' => 'প্রশাসনিক দিকনির্দেশনা', 'is_enabled' => true, 'sort_order' => 3],
            ['section_key' => 'why_us', 'title' => 'কেন আমাদের কলেজ বেছে নেবেন', 'subtitle' => 'মানের নিশ্চয়তা', 'is_enabled' => true, 'sort_order' => 4],
            ['section_key' => 'departments', 'title' => 'একাডেমিক বিভাগসমূহ', 'subtitle' => 'আমাদের বিশেষায়িত বিষয়সমূহ', 'is_enabled' => true, 'sort_order' => 5],
            ['section_key' => 'teachers', 'title' => 'সম্মানিত শিক্ষকমণ্ডলী', 'subtitle' => 'অভিজ্ঞ শিক্ষকবৃন্দ', 'is_enabled' => true, 'sort_order' => 6],
            ['section_key' => 'notices', 'title' => 'সাম্প্রতিক নোটিশ বোর্ড', 'subtitle' => 'জরুরি তথ্য ও আদেশ', 'is_enabled' => true, 'sort_order' => 7],
            ['section_key' => 'events', 'title' => 'আসন্ন ইভেন্ট ও অনুষ্ঠান', 'subtitle' => 'ক্যাম্পাসের সাম্প্রতিক আয়োজন', 'is_enabled' => true, 'sort_order' => 8],
            ['section_key' => 'gallery', 'title' => 'ফটো গ্যালারি', 'subtitle' => 'সুন্দর স্মৃতির অ্যালবাম', 'is_enabled' => true, 'sort_order' => 9],
            ['section_key' => 'cta', 'title' => 'আজই ভর্তি হোন', 'subtitle' => 'আপনার উজ্জ্বল ভবিষ্যৎ গড়ার প্রত্যয়ে', 'is_enabled' => true, 'sort_order' => 10],
        ];
        foreach ($defaultSections as $ds) {
            HomepageSection::create($ds);
        }

        // ===== Departments =====
        $bba = Department::firstOrCreate(['code' => 'BBA'], ['name' => 'Bachelor of Business Administration', 'description' => 'ব্যবসা প্রশাসন বিভাগ']);
        $acc = Department::firstOrCreate(['code' => 'ACC'], ['name' => 'Accounting', 'description' => 'হিসাববিজ্ঞান বিভাগ']);
        $mgt = Department::firstOrCreate(['code' => 'MGT'], ['name' => 'Management', 'description' => 'ব্যবস্থাপনা বিভাগ']);

        // ===== Teacher =====
        $teacherUser = User::firstOrCreate(
            ['email' => 'teacher@commercecollege.edu.bd'],
            [
                'name' => 'কামাল হোসেন',
                'password' => Hash::make('password'),
                'role' => 'teacher',
                'phone' => '01700000001',
                'avatar' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400',
                'status' => 'active',
            ]
        );

        TeacherProfile::updateOrCreate(
            ['user_id' => $teacherUser->id],
            [
                'department_id' => $bba->id,
                'employee_id' => 'EMP-1001',
                'designation' => 'সহকারী অধ্যাপক',
                'qualification' => 'MBA (University of Dhaka)',
                'bio' => 'বিগত ১০ বছর যাবত ব্যবসায়িক অর্থায়ন ও ফিন্যান্স বিষয়ে পাঠদান করছেন।',
                'subject_specialty' => 'ফিন্যান্স ও ব্যাংকিং',
                'joining_date' => '2020-01-15',
            ]
        );
    }
}
