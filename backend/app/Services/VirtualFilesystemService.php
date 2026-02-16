<?php

namespace App\Services;

use App\Models\User;
use App\Models\VirtualFile;
use App\Models\UserCloudAccount;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class VirtualFilesystemService
{
    protected $googleDriveService;

    public function __construct(GoogleDriveService $googleDriveService)
    {
        $this->googleDriveService = $googleDriveService;
    }

    /**
     * List files in a virtual path
     */
    public function listFiles(User $user, string $virtualPath = '/')
    {
        // Normalize path
        $virtualPath = $this->normalizePath($virtualPath);
        
        // Get parent folder
        $parent = null;
        if ($virtualPath !== '/') {
            $parent = VirtualFile::forUser($user->id)
                ->where('virtual_path', $virtualPath)
                ->where('is_folder', true)
                ->first();
                
            if (!$parent) {
                return collect([]);
            }
        }

        // List files in this path
        return VirtualFile::forUser($user->id)
            ->where('parent_virtual_id', $parent ? $parent->id : null)
            ->with('cloudAccount')
            ->orderBy('is_folder', 'desc')
            ->orderBy('name', 'asc')
            ->get();
    }

    /**
     * Create a virtual file entry
     */
    public function createVirtualFile(User $user, array $fileData)
    {
        // Ensure virtual_path is set
        if (!isset($fileData['virtual_path'])) {
            $parentPath = $fileData['parent_virtual_id'] 
                ? VirtualFile::find($fileData['parent_virtual_id'])->virtual_path 
                : '/';
            $fileData['virtual_path'] = $this->joinPaths($parentPath, $fileData['name']);
        }

        $fileData['user_id'] = $user->id;

        return VirtualFile::create($fileData);
    }

    /**
     * Get file by virtual path
     */
    public function getFileByPath(User $user, string $path)
    {
        $path = $this->normalizePath($path);
        
        return VirtualFile::forUser($user->id)
            ->where('virtual_path', $path)
            ->with('cloudAccount')
            ->first();
    }

    /**
     * Delete virtual file
     */
    public function deleteVirtualFile(int $virtualFileId)
    {
        $file = VirtualFile::findOrFail($virtualFileId);
        
        // If it's a folder, delete all children recursively
        if ($file->is_folder) {
            $this->deleteFolder($file);
        }

        // Delete from Google Drive
        try {
            $this->googleDriveService->getDriveService()
                ->getClient()
                ->setAccessToken($file->cloudAccount->access_token);
            $this->googleDriveService->deleteFile($file->cloud_file_id);
        } catch (\Exception $e) {
            Log::error('Failed to delete from Google Drive: ' . $e->getMessage());
        }

        return $file->delete();
    }

    /**
     * Sync folder from Google Drive
     */
    public function syncFolder(UserCloudAccount $account, string $folderId = null)
    {
        try {
            // Set access token
            $this->googleDriveService->getDriveService()
                ->getClient()
                ->setAccessToken($account->access_token);

            // List files from Google Drive
            $driveFiles = $this->googleDriveService->listFiles($folderId);
            
            $syncedCount = 0;
            foreach ($driveFiles->getFiles() as $driveFile) {
                $this->syncFile($account, $driveFile, $folderId);
                $syncedCount++;
            }

            return $syncedCount;
        } catch (\Exception $e) {
            Log::error('Sync failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a virtual folder
     */
    public function createFolder(User $user, string $name, int $parentId = null, int $cloudAccountId)
    {
        $parentPath = '/';
        if ($parentId) {
            $parent = VirtualFile::findOrFail($parentId);
            $parentPath = $parent->virtual_path;
        }

        $virtualPath = $this->joinPaths($parentPath, $name);

        return VirtualFile::create([
            'user_id' => $user->id,
            'cloud_account_id' => $cloudAccountId,
            'virtual_path' => $virtualPath,
            'parent_virtual_id' => $parentId,
            'name' => $name,
            'is_folder' => true,
            'cloud_file_id' => '', // Will be set when created in Google Drive
            'size' => 0,
        ]);
    }

    // Private helper methods

    private function syncFile(UserCloudAccount $account, $driveFile, $parentFolderId)
    {
        // Check if file already exists
        $virtualFile = VirtualFile::where('cloud_file_id', $driveFile->getId())
            ->where('cloud_account_id', $account->id)
            ->first();

        $isFolder = $driveFile->getMimeType() === 'application/vnd.google-apps.folder';

        // Determine parent
        $parentVirtualId = null;
        if ($parentFolderId) {
            $parentVirtual = VirtualFile::where('cloud_file_id', $parentFolderId)
                ->where('cloud_account_id', $account->id)
                ->first();
            $parentVirtualId = $parentVirtual ? $parentVirtual->id : null;
        }

        $parentPath = $parentVirtualId 
            ? VirtualFile::find($parentVirtualId)->virtual_path 
            : '/';
        $virtualPath = $this->joinPaths($parentPath, $driveFile->getName());

        $fileData = [
            'user_id' => $account->user_id,
            'cloud_account_id' => $account->id,
            'virtual_path' => $virtualPath,
            'parent_virtual_id' => $parentVirtualId,
            'name' => $driveFile->getName(),
            'mime_type' => $driveFile->getMimeType(),
            'size' => $driveFile->getSize() ?? 0,
            'is_folder' => $isFolder,
            'cloud_file_id' => $driveFile->getId(),
            'metadata' => [
                'webViewLink' => $driveFile->getWebViewLink(),
                'webContentLink' => $driveFile->getWebContentLink(),
            ],
        ];

        if ($virtualFile) {
            $virtualFile->update($fileData);
        } else {
            VirtualFile::create($fileData);
        }
    }

    private function deleteFolder(VirtualFile $folder)
    {
        $children = VirtualFile::where('parent_virtual_id', $folder->id)->get();
        
        foreach ($children as $child) {
            if ($child->is_folder) {
                $this->deleteFolder($child);
            }
            $child->delete();
        }
    }

    private function normalizePath(string $path): string
    {
        $path = trim($path);
        if (empty($path) || $path === '/') {
            return '/';
        }
        
        // Ensure starts with /
        if ($path[0] !== '/') {
            $path = '/' . $path;
        }
        
        // Remove trailing slash
        $path = rtrim($path, '/');
        
        return $path;
    }

    private function joinPaths(string $parent, string $child): string
    {
        $parent = $this->normalizePath($parent);
        $child = trim($child, '/');
        
        if ($parent === '/') {
            return '/' . $child;
        }
        
        return $parent . '/' . $child;
    }
}
