<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $fillable = [
        'college_name',
        'college_logo',
        'favicon',
        'tagline',
        'hero_text',
        'about_text',
        'mission_text',
        'vision_text',
        'principal_name',
        'principal_image',
        'principal_title',
        'principal_message',
        'principal_bio',
        'established_year',
        'address',
        'phone',
        'email',
        'facebook_url',
        'admission_info',
        'header_info',
        'footer_info',
        'social_links',
        'google_map_embed',
    ];

    protected $casts = [
        'social_links' => 'array',
    ];

    protected $appends = [
        'logo_url',
        'favicon_url',
        'principal_image_url',
    ];

    public function getLogoUrlAttribute()
    {
        if (!$this->college_logo) return null;
        if (str_starts_with($this->college_logo, 'http://') || str_starts_with($this->college_logo, 'https://')) {
            return $this->college_logo;
        }
        return asset('storage/' . $this->college_logo);
    }

    public function getFaviconUrlAttribute()
    {
        if (!$this->favicon) return null;
        if (str_starts_with($this->favicon, 'http://') || str_starts_with($this->favicon, 'https://')) {
            return $this->favicon;
        }
        return asset('storage/' . $this->favicon);
    }

    public function getPrincipalImageUrlAttribute()
    {
        if (!$this->principal_image) return null;
        if (str_starts_with($this->principal_image, 'http://') || str_starts_with($this->principal_image, 'https://')) {
            return $this->principal_image;
        }
        return asset('storage/' . $this->principal_image);
    }

    public static function current(): self
    {
        return static::first() ?? static::create(['college_name' => 'Commerce College']);
    }
}
