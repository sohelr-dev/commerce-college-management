<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SiteSettingController extends Controller
{
    public function show()
    {
        return response()->json(SiteSetting::current());
    }

    public function update(Request $request)
    {
        $settings = SiteSetting::current();

        $data = $request->validate([
            'college_name' => ['required', 'string', 'max:255'],
            'tagline' => ['nullable', 'string'],
            'hero_text' => ['nullable', 'string'],
            'about_text' => ['nullable', 'string'],
            'mission_text' => ['nullable', 'string'],
            'vision_text' => ['nullable', 'string'],
            'principal_name' => ['nullable', 'string'],
            'principal_title' => ['nullable', 'string'],
            'principal_message' => ['nullable', 'string'],
            'principal_bio' => ['nullable', 'string'],
            'established_year' => ['nullable', 'integer'],
            'address' => ['nullable', 'string'],
            'phone' => ['nullable', 'string'],
            'email' => ['nullable', 'email'],
            'facebook_url' => ['nullable', 'string'],
            'admission_info' => ['nullable', 'string'],
            'header_info' => ['nullable', 'string'],
            'footer_info' => ['nullable', 'string'],
            'social_links' => ['nullable'],
            'google_map_embed' => ['nullable', 'string'],
            'logo' => ['nullable', 'image', 'max:5120'],
            'favicon_file' => ['nullable', 'image', 'max:2048'],
            'principal_img' => ['nullable', 'image', 'max:5120'],
        ]);

        if ($request->hasFile('logo')) {
            if ($settings->college_logo && Storage::disk('public')->exists($settings->college_logo)) {
                Storage::disk('public')->delete($settings->college_logo);
            }
            $data['college_logo'] = $request->file('logo')->store('settings', 'public');
        }

        if ($request->hasFile('favicon_file')) {
            if ($settings->favicon && Storage::disk('public')->exists($settings->favicon)) {
                Storage::disk('public')->delete($settings->favicon);
            }
            $data['favicon'] = $request->file('favicon_file')->store('settings', 'public');
        }

        if ($request->hasFile('principal_img')) {
            if ($settings->principal_image && Storage::disk('public')->exists($settings->principal_image)) {
                Storage::disk('public')->delete($settings->principal_image);
            }
            $data['principal_image'] = $request->file('principal_img')->store('settings', 'public');
        }

        if (is_string($request->social_links)) {
            $data['social_links'] = json_decode($request->social_links, true);
        }

        $settings->update($data);

        return response()->json($settings);
    }

    public function contactMessages(Request $request)
    {
        return ContactMessage::latest()->paginate($request->per_page ?? 20);
    }

    public function markContactRead(ContactMessage $contactMessage)
    {
        $contactMessage->update(['is_read' => true]);

        return response()->json($contactMessage);
    }

    public function destroyContact(ContactMessage $contactMessage)
    {
        $contactMessage->delete();

        return response()->json(['message' => 'মুছে ফেলা হয়েছে']);
    }
}
