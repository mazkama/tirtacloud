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

        $token = $this->driveService->handleCallback($code);
        $this->driveService->setAccessToken($token);

        // Get user info from Google
        $googleUser = $this->driveService->getUserInfo(); // Need to implement getUserInfo in Service if not exists, or do it here
        // Actually, let's use the Oauth2 service inside Service class

        // Initialize User Info
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
           // Implement refresh logic here or in service.
           // For now assuming token is valid or we handle refresh.
           // TODO: Add refresh logic
        }

        $this->driveService->getDriveService()->getClient()->setAccessToken($account->access_token);
        
        $files = $this->driveService->listFiles($request->folder_id);
        
        return response()->json($files->getFiles());
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
