<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notice extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'audience',
        'department_id',
        'posted_by',
        'is_pinned',
        'attachment_path',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
    ];

    protected $appends = ['attachment_url'];

    public function getAttachmentUrlAttribute()
    {
        if (!$this->attachment_path) return null;
        if (str_starts_with($this->attachment_path, 'http://') || str_starts_with($this->attachment_path, 'https://')) {
            return $this->attachment_path;
        }
        return asset('storage/' . $this->attachment_path);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function postedBy()
    {
        return $this->belongsTo(User::class, 'posted_by');
    }
}
