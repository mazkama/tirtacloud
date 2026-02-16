<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserCloudAccount;
use Illuminate\Support\Facades\Log;

class UploadBalancerService
{
    /**
     * Select the best account for upload based on available space
     */
    public function selectAccountForUpload(User $user, int $fileSize = 0)
    {
        $accounts = UserCloudAccount::where('user_id', $user->id)
            ->where('provider', 'google')
            ->where('is_active', true)
            ->get();

        if ($accounts->isEmpty()) {
            throw new \Exception('No active Google Drive accounts found');
        }

        // Calculate available space for each account
        $accountsWithSpace = $accounts->map(function ($account) {
            $available = $account->total_storage - $account->used_storage;
            return [
                'account' => $account,
                'available_space' => $available,
            ];
        });

        // Filter accounts with sufficient space
        $suitableAccounts = $accountsWithSpace->filter(function ($item) use ($fileSize) {
            return $item['available_space'] >= $fileSize;
        });

        if ($suitableAccounts->isEmpty()) {
            throw new \Exception('No account has sufficient free space for this file');
        }

        // Sort by available space (descending)
        $sorted = $suitableAccounts->sortByDesc('available_space');

        return $sorted->first()['account'];
    }

    /**
     * Update storage usage after upload
     */
    public function updateStorageUsage(UserCloudAccount $account, int $bytesAdded)
    {
        $account->increment('used_storage', $bytesAdded);
        
        Log::info("Updated storage for account {$account->id}: +{$bytesAdded} bytes");
        
        return $account->fresh();
    }

    /**
     * Update storage usage after delete
     */
    public function decrementStorageUsage(UserCloudAccount $account, int $bytesRemoved)
    {
        $account->decrement('used_storage', $bytesRemoved);
        
        Log::info("Updated storage for account {$account->id}: -{$bytesRemoved} bytes");
        
        return $account->fresh();
    }

    /**
     * Get account distribution for a user
     */
    public function getAccountDistribution(User $user)
    {
        $accounts = UserCloudAccount::where('user_id', $user->id)
            ->where('provider', 'google')
            ->where('is_active', true)
            ->get();

        return $accounts->map(function ($account) {
            return [
                'id' => $account->id,
                'email' => $account->account_email,
                'total' => $account->total_storage,
                'used' => $account->used_storage,
                'available' => $account->total_storage - $account->used_storage,
                'usage_percent' => $account->total_storage > 0 
                    ? round(($account->used_storage / $account->total_storage) * 100, 2)
                    : 0,
            ];
        });
    }
}
