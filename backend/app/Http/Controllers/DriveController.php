<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\GoogleDriveService;
use App\Models\UserCloudAccount;
use Illuminate\Support\Facades\Auth;
use Google\Service\Drive;

class DriveController extends Controller
{
    protected $driveService;

    public function __construct(GoogleDriveService $driveService)
    {
        $this->driveService = $driveService;
    }

    public function getAuthUrl()
    {
        return response()->json([
            'url' => $this->driveService->getAuthUrl()
        ]);
    }

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

            \Log::info('Google Token Received: ', $token);
            $this->driveService->setAccessToken($token);

            // Get user info from Google
            $oauth2 = new \Google\Service\Oauth2($this->driveService->getDriveService()->getClient());
            $userInfo = $oauth2->userinfo->get();
            
            // Get Storage Quota
            $about = $this->driveService->getDriveService()->about->get(['fields' => 'storageQuota']);
            $quota = $about->getStorageQuota();

            // Save account
            $account = UserCloudAccount::updateOrCreate(
                [
                    'user_id' => $request->user()->id,
                    'provider' => 'google',
                    'account_email' => $userInfo->email,
                ],
                [
                    'account_name' => $userInfo->name,
                    'access_token' => $token['access_token'],
                    'refresh_token' => $token['refresh_token'] ?? null, // Refresh token only comes on first consent
                    'expires_at' => now()->addSeconds($token['expires_in']),
                    'total_storage' => $quota->limit,
                    'used_storage' => $quota->usage,
                ]
            );

            return response()->json(['message' => 'Account linked successfully', 'account' => $account]);

        } catch (\Exception $e) {
            \Log::error('Google Drive Callback Error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to link account: ' . $e->getMessage()], 500);
        }
    }

    public function listFiles(Request $request)
    {
        $user = $request->user();
        // For Phase 1, just list from first account
        $account = $user->cloudAccounts()->where('provider', 'google')->first();
        
        if (!$account) {
            return response()->json(['error' => 'No Google Drive account linked'], 404);
        }

        // Refresh token if needed
        if ($account->expires_at->isPast()) {
            if ($account->refresh_token) {
                try {
                    $newToken = $this->driveService->refreshToken($account->refresh_token);
                    $account->update([
                        'access_token' => $newToken['access_token'],
                        'expires_at' => now()->addSeconds($newToken['expires_in'])
                    ]);
                } catch (\Exception $e) {
                    \Log::error('Token refresh failed: ' . $e->getMessage());
                    return response()->json(['error' => 'Token expired. Please re-link your account.'], 401);
                }
            } else {
                return response()->json(['error' => 'Token expired. Please re-link your account.'], 401);
            }
        }

        try {
            $this->driveService->getDriveService()->getClient()->setAccessToken($account->access_token);
            
            $files = $this->driveService->listFiles($request->folder_id);
            
            return response()->json(['files' => $files->getFiles()]);
        } catch (\Exception $e) {
            \Log::error('List files error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch files: ' . $e->getMessage()], 500);
        }
    }

    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file',
            'folder_id' => 'nullable|string'
        ]);

        $user = $request->user();
        $account = $user->cloudAccounts()->where('provider', 'google')->first();
        
        if (!$account) {
            return response()->json(['error' => 'No Google Drive account linked'], 404);
        }

        $this->driveService->getDriveService()->getClient()->setAccessToken($account->access_token);
        
        // Refresh check skipped for brevity, should be added in production
        if ($this->driveService->getDriveService()->getClient()->isAccessTokenExpired()) {
             // Logic to refresh token using $account->refresh_token
             if ($account->refresh_token) {
                 $newToken = $this->driveService->refreshToken($account->refresh_token);
                 $account->update(['access_token' => $newToken['access_token']]);
             }
        }

        $file = $this->driveService->uploadFile($request->file('file'), $request->folder_id);

        return response()->json(['message' => 'File uploaded successfully', 'file' => $file]);
    }

    public function delete($fileId, Request $request)
    {
        $user = $request->user();
        $account = $user->cloudAccounts()->where('provider', 'google')->first();

        if (!$account) {
            return response()->json(['error' => 'No Google Drive account linked'], 404);
        }

        $this->driveService->getDriveService()->getClient()->setAccessToken($account->access_token);
        
        if ($this->driveService->deleteFile($fileId)) {
            return response()->json(['message' => 'File deleted successfully']);
        }

        return response()->json(['error' => 'Failed to delete file'], 500);
    }

    public function getDownloadUrl($fileId, Request $request)
    {
        $user = $request->user();
        $account = $user->cloudAccounts()->where('provider', 'google')->first();

        if (!$account) {
            return response()->json(['error' => 'No Google Drive account linked'], 404);
        }

        $this->driveService->getDriveService()->getClient()->setAccessToken($account->access_token);
        
        $file = $this->driveService->getFileDetails($fileId);
        
        return response()->json(['url' => $file->webContentLink]);
    }
}
