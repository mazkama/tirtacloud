<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\VirtualFilesystemService;
use App\Services\UploadBalancerService;
use App\Services\GoogleDriveService;
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
     * List files in virtual path
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
     * Upload file with auto-balancing
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
            // Select best account
            $account = $this->uploadBalancer->selectAccountForUpload($user, $fileSize);
            
            // Set access token
            $this->driveService->getDriveService()
                ->getClient()
                ->setAccessToken($account->access_token);

            // Upload to Google Drive
            $driveFile = $this->driveService->uploadFile($file, null);

            // Create virtual file entry
            $virtualFile = $this->vfsService->createVirtualFile($user, [
                'cloud_account_id' => $account->id,
                'parent_virtual_id' => $request->parent_id,
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

            // Update storage usage
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
     * Download file
     * GET /api/vfs/download/{id}
     */
    public function download($id)
    {
        try {
            $virtualFile = \App\Models\VirtualFile::with('cloudAccount')->findOrFail($id);
            
            // Set access token
            $this->driveService->getDriveService()
                ->getClient()
                ->setAccessToken($virtualFile->cloudAccount->access_token);

            // Get file details
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
     * Preview/Stream file (PDF, images, videos)
     * GET /api/vfs/preview/{id}
     */
    public function preview(Request $request, $id)
    {
        try {
            // Verify user owns this file
            $virtualFile = \App\Models\VirtualFile::with('cloudAccount')
                ->where('id', $id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();
            
            // Set access token
            $this->driveService->getDriveService()
                ->getClient()
                ->setAccessToken($virtualFile->cloudAccount->access_token);

            // Stream file content from Google Drive
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
     * Delete file
     * DELETE /api/vfs/files/{id}
     */
    public function destroy($id)
    {
        try {
            $virtualFile = \App\Models\VirtualFile::findOrFail($id);
            $fileSize = $virtualFile->size;
            $accountId = $virtualFile->cloud_account_id;

            $this->vfsService->deleteVirtualFile($id);

            // Update storage usage
            $account = \App\Models\UserCloudAccount::find($accountId);
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
     * Trigger manual sync
     * POST /api/vfs/sync
     */
    public function sync(Request $request)
    {
        $request->validate([
            'account_id' => 'required|integer',
        ]);

        try {
            $account = \App\Models\UserCloudAccount::where('id', $request->account_id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            $syncedCount = $this->vfsService->syncFolder($account);

            return response()->json([
                'message' => 'Sync completed',
                'files_synced' => $syncedCount,
            ]);
        } catch (\Exception $e) {
            Log::error('Sync error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Create folder
     * POST /api/vfs/create-folder
     */
    public function createFolder(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|integer',
            'cloud_account_id' => 'required|integer',
        ]);

        try {
            $folder = $this->vfsService->createFolder(
                $request->user(),
                $request->name,
                $request->parent_id,
                $request->cloud_account_id
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
}
