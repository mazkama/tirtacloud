<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserCloudAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'provider',
        'account_name',
        'account_email',
        'access_token',
        'refresh_token',
        'expires_at',
        'total_storage',
        'used_storage',
        'is_active',
        'root_folder_id',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    protected $hidden = [
        'access_token',
        'refresh_token',
    ];

    // Encrypt tokens automatically
    protected function setAccessTokenAttribute($value)
    {
        $this->attributes['access_token'] = encrypt($value);
    }

    protected function getAccessTokenAttribute($value)
    {
        return decrypt($value);
    }

    protected function setRefreshTokenAttribute($value)
    {
        if ($value) {
            $this->attributes['refresh_token'] = encrypt($value);
        }
    }

    protected function getRefreshTokenAttribute($value)
    {
        if ($value) {
            return decrypt($value);
        }
        return null;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function virtualFiles()
    {
        return $this->hasMany(VirtualFile::class, 'cloud_account_id');
    }
}
