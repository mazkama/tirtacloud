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
    ];

    protected $casts = [
        'expires_at' => 'datetime',
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
        $this->attributes['refresh_token'] = encrypt($value);
    }

    protected function getRefreshTokenAttribute($value)
    {
        return decrypt($value);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function files()
    {
        return $this->hasMany(File::class);
    }
}
