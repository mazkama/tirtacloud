<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\GoogleDriveService;
use App\Models\UserCloudAccount;
use Illuminate\Support\Facades\Log;

/**
 * DriveController
 * 
 * Handles Google Drive ACCOUNT MANAGEMENT only.
 * On account link: auto-creates "TirtaCloud" folder for file isolation.
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
     * Handle the OAuth callback:
     * 1. Save account credentials
     * 2. Auto-create "TirtaCloud" folder in Google Drive
     * 3. Save folder ID for future uploads
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
                return response()->json(['error' => 'Google Auth Error: ' . ($token['error_description'] ?? $token['error'])], 400);
            }

            Log::info('Google Token Received');
            $this->driveService->setAccessToken($token);

            // Get user info from Google
            $oauth2 = new \Google\Service\Oauth2($this->driveService->getDriveService()->getClient());
            $userInfo = $oauth2->userinfo->get();
            
            // Get Storage Quota
            $about = $this->driveService->getDriveService()->about->get(['fields' => 'storageQuota']);
            $quota = $about->getStorageQuota();

            // ====================================================
            // AUTO-CREATE "TirtaCloud" FOLDER IN GOOGLE DRIVE
            // This isolates all TirtaCloud uploads from personal files
            // ====================================================
            $rootFolderId = null;
            try {
                // Check if folder already exists
                $existingFolderId = $this->driveService->findFolder('TirtaCloud');
                
                if ($existingFolderId) {
                    $rootFolderId = $existingFolderId;
                    Log::info('Found existing TirtaCloud folder: ' . $rootFolderId);
                } else {
                    // Create new folder
                    $folder = $this->driveService->createFolder('TirtaCloud');
                    $rootFolderId = $folder->getId();
                    Log::info('Created TirtaCloud folder: ' . $rootFolderId);
                }
            } catch (\Exception $e) {
                Log::error('Failed to create TirtaCloud folder: ' . $e->getMessage());
                // Don't fail the account link — folder can be created later
            }

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
                    'root_folder_id' => $rootFolderId,
                ]
            );

            return response()->json([
                'message' => 'Account linked successfully',
                'account' => [
                    'id' => $account->id,
                    'email' => $account->account_email,
                    'name' => $account->account_name,
                    'root_folder_created' => !empty($rootFolderId),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Google Drive Callback Error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to link account: ' . $e->getMessage()], 500);
        }
    }
}
