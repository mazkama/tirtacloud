<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShareLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'virtual_file_id',
        'token',
        'slug',
        'expires_at',
        'password',
        'is_active',
        'download_count',
        'view_count',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    protected $hidden = [
        'password',
        'token',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function virtualFile()
    {
        return $this->belongsTo(VirtualFile::class);
    }

    /**
     * Check if this share link is valid (active + not expired)
     */
    public function isValid(): bool
    {
        if (!$this->is_active) return false;
        if ($this->expires_at && $this->expires_at->isPast()) return false;
        return true;
    }

    /**
     * Scope to find active, non-expired links
     */
    public function scopeValid($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            });
    }
}
