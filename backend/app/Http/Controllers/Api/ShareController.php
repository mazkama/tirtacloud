<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShareLink;
use App\Models\VirtualFile;
use App\Models\UserCloudAccount;
use App\Services\GoogleDriveService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ShareController extends Controller
{
    protected $driveService;

    public function __construct(GoogleDriveService $driveService)
    {
        $this->driveService = $driveService;
    }

    /**
     * Create a shareable link for a file
     * POST /api/vfs/share
     */
    public function create(Request $request)
    {
        $request->validate([
            'file_id' => 'required|integer',
            'expires_in' => 'nullable|integer|min:1', // hours
            'password' => 'nullable|string|min:4',
        ]);

        $user = $request->user();

        try {
            // Verify file ownership
            $file = VirtualFile::where('id', $request->file_id)
                ->where('user_id', $user->id)
                ->where('is_folder', false)
                ->firstOrFail();

            // Check if active share link already exists for this file
            $existing = ShareLink::where('virtual_file_id', $file->id)
                ->where('user_id', $user->id)
                ->valid()
                ->first();

            if ($existing) {
                return response()->json([
                    'share_link' => $this->formatShareLink($existing),
                ]);
            }

            // Generate unique token and slug
            $token = Str::random(48);
            $slug = Str::random(10);

            $expiresAt = null;
            if ($request->expires_in) {
                $expiresAt = now()->addHours($request->expires_in);
            }

            $shareLink = ShareLink::create([
                'user_id' => $user->id,
                'virtual_file_id' => $file->id,
                'token' => $token,
                'slug' => $slug,
                'expires_at' => $expiresAt,
                'password' => $request->password ? bcrypt($request->password) : null,
                'is_active' => true,
            ]);

            return response()->json([
                'message' => 'Share link created',
                'share_link' => $this->formatShareLink($shareLink),
            ]);
        } catch (\Exception $e) {
            Log::error('Share create error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * List share links for current user
     * GET /api/vfs/shares
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $shares = ShareLink::with('virtualFile')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($share) {
                return $this->formatShareLink($share);
            });

        return response()->json(['shares' => $shares]);
    }

    /**
     * Revoke/delete a share link
     * DELETE /api/vfs/shares/{id}
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $share = ShareLink::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $share->delete();

        return response()->json(['message' => 'Share link revoked']);
    }

    /**
     * PUBLIC: View shared file info (no auth required)
     * GET /api/share/{slug}
     */
    public function publicView($slug)
    {
        try {
            $share = ShareLink::with(['virtualFile.cloudAccount'])
                ->where('slug', $slug)
                ->where('is_active', true)
                ->firstOrFail();

            if (!$share->isValid()) {
                return response()->json(['error' => 'This share link has expired'], 410);
            }

            // Increment view count
            $share->increment('view_count');

            $file = $share->virtualFile;

            return response()->json([
                'file' => [
                    'name' => $file->name,
                    'mime_type' => $file->mime_type,
                    'size' => $file->size,
                    'has_password' => !empty($share->password),
                ],
                'preview_url' => url("/api/share/{$slug}/preview"),
                'download_url' => url("/api/share/{$slug}/download"),
                'expires_at' => $share->expires_at?->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Share link not found'], 404);
        }
    }

    /**
     * PUBLIC: Stream/preview shared file (no auth required)
     * GET /api/share/{slug}/preview
     */
    public function publicPreview($slug)
    {
        try {
            $share = ShareLink::with(['virtualFile.cloudAccount'])
                ->where('slug', $slug)
                ->where('is_active', true)
                ->firstOrFail();

            if (!$share->isValid()) {
                return response()->json(['error' => 'This share link has expired'], 410);
            }

            $file = $share->virtualFile;
            $account = $file->cloudAccount;

            // Refresh token if needed
            $this->refreshTokenIfNeeded($account);

            $this->driveService->getDriveService()
                ->getClient()
                ->setAccessToken($account->access_token);

            $fileContent = $this->driveService->getFileContent($file->cloud_file_id);

            return response($fileContent)
                ->header('Content-Type', $file->mime_type)
                ->header('Content-Disposition', 'inline; filename="' . $file->name . '"')
                ->header('Cache-Control', 'public, max-age=3600')
                ->header('Accept-Ranges', 'bytes');
        } catch (\Exception $e) {
            Log::error('Share preview error: ' . $e->getMessage());
            return response()->json(['error' => 'File not available'], 500);
        }
    }

    /**
     * PUBLIC: Download shared file (no auth required)
     * GET /api/share/{slug}/download
     */
    public function publicDownload($slug)
    {
        try {
            $share = ShareLink::with(['virtualFile.cloudAccount'])
                ->where('slug', $slug)
                ->where('is_active', true)
                ->firstOrFail();

            if (!$share->isValid()) {
                return response()->json(['error' => 'This share link has expired'], 410);
            }

            // Increment download count
            $share->increment('download_count');

            $file = $share->virtualFile;
            $account = $file->cloudAccount;

            $this->refreshTokenIfNeeded($account);

            $this->driveService->getDriveService()
                ->getClient()
                ->setAccessToken($account->access_token);

            $fileContent = $this->driveService->getFileContent($file->cloud_file_id);

            return response($fileContent)
                ->header('Content-Type', $file->mime_type)
                ->header('Content-Disposition', 'attachment; filename="' . $file->name . '"')
                ->header('Content-Length', $file->size);
        } catch (\Exception $e) {
            Log::error('Share download error: ' . $e->getMessage());
            return response()->json(['error' => 'File not available'], 500);
        }
    }

    /**
     * Format share link for API response
     */
    private function formatShareLink(ShareLink $share): array
    {
        $frontendUrl = rtrim(config('app.frontend_url', config('app.url')), '/');
        
        return [
            'id' => $share->id,
            'slug' => $share->slug,
            'url' => $frontendUrl . '/s/' . $share->slug,
            'preview_url' => url("/api/share/{$share->slug}/preview"),
            'download_url' => url("/api/share/{$share->slug}/download"),
            'file_name' => $share->virtualFile?->name,
            'file_id' => $share->virtual_file_id,
            'expires_at' => $share->expires_at?->toISOString(),
            'has_password' => !empty($share->password),
            'is_active' => $share->is_active,
            'view_count' => $share->view_count,
            'download_count' => $share->download_count,
            'created_at' => $share->created_at?->toISOString(),
        ];
    }

    /**
     * Helper: refresh token if needed
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
                    throw new \Exception('Token expired.');
                }
            }
        }
    }
}
