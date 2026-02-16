<?php

namespace App\Services;

use App\Models\User;
use App\Models\VirtualFile;
use App\Models\UserCloudAccount;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * VirtualFilesystemService
 * 
 * Manages the private virtual filesystem.
 * ONLY files uploaded through TirtaCloud are tracked here.
 * NO sync from Google Drive — this is intentional.
 */
class VirtualFilesystemService
{
    /**
     * List files in a virtual path — only files uploaded through system
     */
    public function listFiles(User $user, string $virtualPath = '/')
    {
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

        // List files in this path — ONLY from virtual_files table
        return VirtualFile::forUser($user->id)
            ->where('parent_virtual_id', $parent ? $parent->id : null)
            ->with('cloudAccount:id,account_email')
            ->orderBy('is_folder', 'desc')
            ->orderBy('name', 'asc')
            ->get();
    }

    /**
     * Create a virtual file entry after upload
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
     * Create a virtual folder
     */
    public function createFolder(User $user, string $name, int $parentId = null, int $cloudAccountId)
    {
        $parentPath = '/';
        if ($parentId) {
            $parent = VirtualFile::where('id', $parentId)
                ->where('user_id', $user->id)
                ->firstOrFail();
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
            'cloud_file_id' => 'virtual-folder-' . uniqid(),
            'size' => 0,
        ]);
    }

    /**
     * Delete virtual file and its children (for folders)
     */
    public function deleteFolder(VirtualFile $folder)
    {
        $children = VirtualFile::where('parent_virtual_id', $folder->id)->get();
        
        foreach ($children as $child) {
            if ($child->is_folder) {
                $this->deleteFolder($child);
            }
            $child->delete();
        }
    }

    // ========== Private Helper Methods ==========

    private function normalizePath(string $path): string
    {
        $path = trim($path);
        if (empty($path) || $path === '/') {
            return '/';
        }
        
        if ($path[0] !== '/') {
            $path = '/' . $path;
        }
        
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
