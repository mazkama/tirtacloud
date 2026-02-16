<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\VirtualFilesystemService;
use App\Services\UploadBalancerService;
use App\Services\GoogleDriveService;
use App\Models\VirtualFile;
use App\Models\UserCloudAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VirtualFilesController extends Controller
{
    protected $vfsService;
    protected $uploadBalancer;
    protected $driveService;

    public function __construct(
        VirtualFilesystemService $vfsService,
        UploadBalancerService $uploadBalancer,
        GoogleDriveService $driveService
    ) {
        $this->vfsService = $vfsService;
        $this->uploadBalancer = $uploadBalancer;
        $this->driveService = $driveService;
    }

    /**
     * List files in virtual path — ONLY files uploaded through TirtaCloud
     * GET /api/vfs/files?path=/Documents
     */
    public function index(Request $request)
    {
        $path = $request->query('path', '/');
        $user = $request->user();

        try {
            $files = $this->vfsService->listFiles($user, $path);
            
            return response()->json([
                'path' => $path,
                'files' => $files,
            ]);
        } catch (\Exception $e) {
            Log::error('VFS list error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Upload file with auto-balancing to Google Drive with most free space
     * POST /api/vfs/upload
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file',
            'path' => 'nullable|string',
            'parent_id' => 'nullable|integer',
        ]);

        $user = $request->user();
        $file = $request->file('file');
        $fileSize = $file->getSize();

        try {
            // Resolve parent folder ID
            $parentId = $request->parent_id;
            
            // If parent_id not given but path is not root, resolve from path
            if (!$parentId && $request->path && $request->path !== '/') {
                $parentFolder = VirtualFile::forUser($user->id)
                    ->where('virtual_path', $request->path)
                    ->where('is_folder', true)
                    ->first();
                if ($parentFolder) {
                    $parentId = $parentFolder->id;
                }
            }
            
            // If parent_id is set, verify the user owns it
            if ($parentId) {
                $parent = VirtualFile::where('id', $parentId)
                    ->where('user_id', $user->id)
                    ->where('is_folder', true)
                    ->first();
                if (!$parent) {
                    return response()->json(['error' => 'Parent folder not found'], 404);
                }
            }

            // Select best account (most free space)
            $account = $this->uploadBalancer->selectAccountForUpload($user, $fileSize);
            
            // Refresh token if needed
            $this->refreshTokenIfNeeded($account);
            
            // Set access token
            $this->driveService->getDriveService()
                ->getClient()
                ->setAccessToken($account->access_token);

            // Upload to Google Drive
            $driveFile = $this->driveService->uploadFile($file, null);

            // Create virtual file entry (this is the ONLY way files enter VFS)
            $virtualFile = $this->vfsService->createVirtualFile($user, [
                'cloud_account_id' => $account->id,
                'parent_virtual_id' => $parentId,
                'name' => $file->getClientOriginalName(),
                'mime_type' => $file->getClientMimeType(),
                'size' => $fileSize,
                'is_folder' => false,
                'cloud_file_id' => $driveFile->getId(),
                'metadata' => [
                    'webViewLink' => $driveFile->getWebViewLink(),
                    'webContentLink' => $driveFile->getWebContentLink(),
                ],
            ]);

            // Update storage usage on the account
            $this->uploadBalancer->updateStorageUsage($account, $fileSize);

            return response()->json([
                'message' => 'File uploaded successfully',
                'file' => $virtualFile,
                'account_used' => [
                    'id' => $account->id,
                    'email' => $account->account_email,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Upload error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Download file — user must own the file
     * GET /api/vfs/download/{id}
     */
    public function download(Request $request, $id)
    {
        try {
            $virtualFile = VirtualFile::with('cloudAccount')
                ->where('id', $id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();
            
            // Refresh token if needed
            $this->refreshTokenIfNeeded($virtualFile->cloudAccount);

            $this->driveService->getDriveService()
                ->getClient()
                ->setAccessToken($virtualFile->cloudAccount->access_token);

            $fileDetails = $this->driveService->getFileDetails($virtualFile->cloud_file_id);

            return response()->json([
                'url' => $fileDetails->getWebContentLink(),
                'name' => $virtualFile->name,
            ]);
        } catch (\Exception $e) {
            Log::error('Download error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Preview / stream file (PDF, images, videos) — user must own the file
     * GET /api/vfs/preview/{id}
     */
    public function preview(Request $request, $id)
    {
        try {
            $virtualFile = VirtualFile::with('cloudAccount')
                ->where('id', $id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();
            
            // Refresh token if needed
            $this->refreshTokenIfNeeded($virtualFile->cloudAccount);

            $this->driveService->getDriveService()
                ->getClient()
                ->setAccessToken($virtualFile->cloudAccount->access_token);

            $fileContent = $this->driveService->getFileContent($virtualFile->cloud_file_id);

            return response($fileContent)
                ->header('Content-Type', $virtualFile->mime_type)
                ->header('Content-Disposition', 'inline; filename="' . $virtualFile->name . '"')
                ->header('Cache-Control', 'private, max-age=3600');
        } catch (\Exception $e) {
            Log::error('Preview error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete file — user must own the file
     * DELETE /api/vfs/files/{id}
     */
    public function destroy(Request $request, $id)
    {
        try {
            $virtualFile = VirtualFile::with('cloudAccount')
                ->where('id', $id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            $fileSize = $virtualFile->size;
            $account = $virtualFile->cloudAccount;

            // Delete from Google Drive
            try {
                $this->refreshTokenIfNeeded($account);
                $this->driveService->getDriveService()
                    ->getClient()
                    ->setAccessToken($account->access_token);
                $this->driveService->deleteFile($virtualFile->cloud_file_id);
            } catch (\Exception $e) {
                Log::warning('Could not delete from Google Drive: ' . $e->getMessage());
            }

            // Delete from VFS
            $virtualFile->delete();

            // Decrement storage usage
            if ($account) {
                $this->uploadBalancer->decrementStorageUsage($account, $fileSize);
            }

            return response()->json(['message' => 'File deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Delete error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Create a virtual folder
     * POST /api/vfs/create-folder
     */
    public function createFolder(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|integer',
        ]);

        $user = $request->user();

        try {
            // Validate parent folder ownership
            if ($request->parent_id) {
                $parent = VirtualFile::where('id', $request->parent_id)
                    ->where('user_id', $user->id)
                    ->where('is_folder', true)
                    ->first();
                if (!$parent) {
                    return response()->json(['error' => 'Parent folder not found'], 404);
                }
            }

            // Get first active account (folder is virtual, no Drive API needed)
            $account = UserCloudAccount::where('user_id', $user->id)
                ->where('is_active', true)
                ->first();

            if (!$account) {
                return response()->json([
                    'error' => 'No cloud account linked. Please connect a Google Drive account first.'
                ], 400);
            }

            $folder = $this->vfsService->createFolder(
                $user,
                $request->name,
                $request->parent_id,
                $account->id
            );

            return response()->json([
                'message' => 'Folder created successfully',
                'folder' => $folder,
            ]);
        } catch (\Exception $e) {
            Log::error('Create folder error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Helper: refresh Google OAuth token if expired
     */
    private function refreshTokenIfNeeded(UserCloudAccount $account): void
    {
        if ($account->expires_at && $account->expires_at->isPast()) {
            if ($account->refresh_token) {
                try {
                    $newToken = $this->driveService->refreshToken($account->refresh_token);
                    $account->update([
                        'access_token' => $newToken['access_token'],
                        'expires_at' => now()->addSeconds($newToken['expires_in'] ?? 3600),
                    ]);
                } catch (\Exception $e) {
                    Log::error('Token refresh failed: ' . $e->getMessage());
                    throw new \Exception('Token expired. Please re-link your Google Drive account.');
                }
            }
        }
    }
}
