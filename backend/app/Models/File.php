<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_cloud_account_id',
        'name',
        'mime_type',
        'size',
        'cloud_file_id',
        'parent_id',
        'path',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'size' => 'integer',
    ];

    public function account()
    {
        return $this->belongsTo(UserCloudAccount::class, 'user_cloud_account_id');
    }
}
