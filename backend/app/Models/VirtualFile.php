<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VirtualFile extends Model
{
    use HasFactory;

    protected $table = 'virtual_files';

    protected $fillable = [
        'user_id',
        'cloud_account_id',
        'virtual_path',
        'parent_virtual_id',
        'name',
        'mime_type',
        'size',
        'is_folder',
        'cloud_file_id',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'size' => 'integer',
        'is_folder' => 'boolean',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function cloudAccount()
    {
        return $this->belongsTo(UserCloudAccount::class, 'cloud_account_id');
    }

    public function parent()
    {
        return $this->belongsTo(VirtualFile::class, 'parent_virtual_id');
    }

    public function children()
    {
        return $this->hasMany(VirtualFile::class, 'parent_virtual_id');
    }

    // Scopes
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeInPath($query, $virtualPath)
    {
        return $query->where('virtual_path', 'LIKE', $virtualPath . '%');
    }

    public function scopeFolders($query)
    {
        return $query->where('is_folder', true);
    }

    public function scopeFiles($query)
    {
        return $query->where('is_folder', false);
    }

    // Helper methods
    public function getParentPath()
    {
        return dirname($this->virtual_path);
    }

    public function getFullPath()
    {
        return $this->virtual_path;
    }
}
