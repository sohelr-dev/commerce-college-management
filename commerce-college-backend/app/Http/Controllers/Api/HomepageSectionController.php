<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomepageSection;
use Illuminate\Http\Request;

class HomepageSectionController extends Controller
{
    private static $defaultSections = [
        ['section_key' => 'banners', 'title' => 'প্রধান ব্যানারসমূহ', 'subtitle' => 'কলেজ ক্যাম্পাস ও খবরাখবর', 'is_enabled' => true, 'sort_order' => 1],
        ['section_key' => 'stats', 'title' => 'আমাদের পরিসংখ্যান', 'subtitle' => 'এক নজরে আমাদের অর্জন', 'is_enabled' => true, 'sort_order' => 2],
        ['section_key' => 'principal', 'title' => 'অধ্যক্ষের বাণী', 'subtitle' => 'কলেজ প্রশাসনিক বার্তা', 'is_enabled' => true, 'sort_order' => 3],
        ['section_key' => 'why_us', 'title' => 'কেন কমার্স কলেজ', 'subtitle' => 'মানসম্মত শিক্ষার নিশ্চয়তা', 'is_enabled' => true, 'sort_order' => 4],
        ['section_key' => 'departments', 'title' => 'একাডেমিক বিভাগসমূহ', 'subtitle' => 'আমাদের কোর্স ও বিভাগসমূহ', 'is_enabled' => true, 'sort_order' => 5],
        ['section_key' => 'teachers', 'title' => 'অভিজ্ঞ শিক্ষকমণ্ডলী', 'subtitle' => 'আমাদের সম্মানিত শিক্ষকবৃন্দ', 'is_enabled' => true, 'sort_order' => 6],
        ['section_key' => 'notices', 'title' => 'সাম্প্রতিক নোটিশ ও ঘোষণা', 'subtitle' => 'গুরুত্বপূর্ণ সকল আপডেট', 'is_enabled' => true, 'sort_order' => 7],
        ['section_key' => 'events', 'title' => 'আসন্ন ইভেন্ট ও কার্যক্রম', 'subtitle' => 'ক্যাম্পাসের সকল প্রোগ্রাম', 'is_enabled' => true, 'sort_order' => 8],
        ['section_key' => 'gallery', 'title' => 'ফটো গ্যালারি', 'subtitle' => 'ক্যাম্পাস জীবন ও ফটো অ্যালবাম', 'is_enabled' => true, 'sort_order' => 9],
        ['section_key' => 'cta', 'title' => 'আজই ভর্তি হন', 'subtitle' => 'উজ্জ্বল ভবিষ্যতের পথচলা', 'is_enabled' => true, 'sort_order' => 10],
    ];

    public function index()
    {
        $existing = HomepageSection::all()->keyBy('section_key');

        foreach (self::$defaultSections as $def) {
            if (!$existing->has($def['section_key'])) {
                HomepageSection::create($def);
            }
        }

        $sections = HomepageSection::orderBy('sort_order', 'asc')->get();
        return response()->json(['data' => $sections]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'sections' => 'required|array',
            'sections.*.section_key' => 'required|string',
            'sections.*.title' => 'required|string',
            'sections.*.subtitle' => 'nullable|string',
            'sections.*.content' => 'nullable|string',
            'sections.*.is_enabled' => 'required|boolean',
            'sections.*.sort_order' => 'nullable|integer',
        ]);

        foreach ($request->sections as $sec) {
            HomepageSection::updateOrCreate(
                ['section_key' => $sec['section_key']],
                [
                    'title' => $sec['title'],
                    'subtitle' => $sec['subtitle'] ?? null,
                    'content' => $sec['content'] ?? null,
                    'is_enabled' => $sec['is_enabled'],
                    'sort_order' => $sec['sort_order'] ?? 0,
                ]
            );
        }

        return response()->json(['message' => 'Homepage sections updated successfully']);
    }
}
