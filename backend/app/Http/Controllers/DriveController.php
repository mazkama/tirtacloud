<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\GoogleDriveService;
use App\Models\UserCloudAccount;
use Illuminate\Support\Facades\Auth;
use Google\Service\Drive;

/**
 * DriveController
 * 
 * Handles Google Drive ACCOUNT MANAGEMENT only.
 * NO file listing, upload, delete, or download — all file ops go through VFS.
 */
class DriveController extends Controller
{
    protected $driveService;

    public function __construct(GoogleDriveService $driveService)
    {
        $this->driveService = $driveService;
    }

    /**
     * Get the Google OAuth URL for linking a new account
     */
    public function getAuthUrl()
    {
        return response()->json([
            'url' => $this->driveService->getAuthUrl()
        ]);
    }

    /**
     * Handle the OAuth callback and save account credentials
     */
    public function callback(Request $request)
    {
        $code = $request->code;
        if (!$code) {
            return response()->json(['error' => 'Authorization code required'], 400);
        }

        try {
            $token = $this->driveService->handleCallback($code);
            
            if (isset($token['error'])) {
                return response()->json(['error' => 'Google Auth Error: ' . $token['error_description']], 400);
            }

            \Log::info('Google Token Received');
            $this->driveService->setAccessToken($token);

            // Get user info from Google
            $oauth2 = new \Google\Service\Oauth2($this->driveService->getDriveService()->getClient());
            $userInfo = $oauth2->userinfo->get();
            
            // Get Storage Quota
            $about = $this->driveService->getDriveService()->about->get(['fields' => 'storageQuota']);
            $quota = $about->getStorageQuota();

            // Save account — support multiple accounts per user
            $account = UserCloudAccount::updateOrCreate(
                [
                    'user_id' => $request->user()->id,
                    'provider' => 'google',
                    'account_email' => $userInfo->email,
                ],
                [
                    'account_name' => $userInfo->name,
                    'access_token' => $token['access_token'],
                    'refresh_token' => $token['refresh_token'] ?? null,
                    'expires_at' => now()->addSeconds($token['expires_in']),
                    'total_storage' => $quota->limit,
                    'used_storage' => $quota->usage,
                    'is_active' => true,
                ]
            );

            return response()->json([
                'message' => 'Account linked successfully',
                'account' => $account
            ]);

        } catch (\Exception $e) {
            \Log::error('Google Drive Callback Error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to link account: ' . $e->getMessage()], 500);
        }
    }

    // ==========================================================
    // REMOVED: listFiles, upload, delete, getDownloadUrl
    // All file operations now go through VirtualFilesController.
    // This ensures ONLY files uploaded through TirtaCloud are visible.
    // ==========================================================
}
