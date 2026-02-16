<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserCloudAccount;
use App\Models\VirtualFile;
use Illuminate\Support\Facades\DB;

class StorageStatsService
{
    /**
     * Get total storage across all user's accounts
     */
    public function getTotalStorage(User $user)
    {
        return UserCloudAccount::where('user_id', $user->id)
            ->where('provider', 'google')
            ->where('is_active', true)
            ->sum('total_storage');
    }

    /**
     * Get used storage across all user's accounts
     */
    public function getUsedStorage(User $user)
    {
        return UserCloudAccount::where('user_id', $user->id)
            ->where('provider', 'google')
            ->where('is_active', true)
            ->sum('used_storage');
    }

    /**
     * Get available storage
     */
    public function getAvailableStorage(User $user)
    {
        return $this->getTotalStorage($user) - $this->getUsedStorage($user);
    }

    /**
     * Get per-account breakdown
     */
    public function getAccountBreakdown(User $user)
    {
        $accounts = UserCloudAccount::where('user_id', $user->id)
            ->where('provider', 'google')
            ->where('is_active', true)
            ->get();

        return $accounts->map(function ($account) {
            $available = $account->total_storage - $account->used_storage;
            $usagePercent = $account->total_storage > 0 
                ? round(($account->used_storage / $account->total_storage) * 100, 2)
                : 0;

            return [
                'id' => $account->id,
                'email' => $account->account_email,
                'name' => $account->account_name,
                'total_storage' => $account->total_storage,
                'used_storage' => $account->used_storage,
                'available_storage' => $available,
                'usage_percent' => $usagePercent,
                'total_storage_formatted' => $this->formatBytes($account->total_storage),
                'used_storage_formatted' => $this->formatBytes($account->used_storage),
                'available_storage_formatted' => $this->formatBytes($available),
            ];
        });
    }

    /**
     * Get comprehensive stats
     */
    public function getComprehensiveStats(User $user)
    {
        $total = $this->getTotalStorage($user);
        $used = $this->getUsedStorage($user);
        $available = $total - $used;
        $usagePercent = $total > 0 ? round(($used / $total) * 100, 2) : 0;

        return [
            'total_storage' => $total,
            'used_storage' => $used,
            'available_storage' => $available,
            'usage_percent' => $usagePercent,
            'total_storage_formatted' => $this->formatBytes($total),
            'used_storage_formatted' => $this->formatBytes($used),
            'available_storage_formatted' => $this->formatBytes($available),
            'account_count' => UserCloudAccount::where('user_id', $user->id)
                ->where('provider', 'google')
                ->where('is_active', true)
                ->count(),
            'file_count' => VirtualFile::where('user_id', $user->id)
                ->where('is_folder', false)
                ->count(),
            'folder_count' => VirtualFile::where('user_id', $user->id)
                ->where('is_folder', true)
                ->count(),
            'accounts' => $this->getAccountBreakdown($user),
        ];
    }

    /**
     * Format bytes to human-readable format
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
