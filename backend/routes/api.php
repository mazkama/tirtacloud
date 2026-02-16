<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DriveController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Virtual Filesystem (VFS) Private Routes
| All file operations go through VFS — NO direct Google Drive file access.
|
*/

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/login', function() {
    return response()->json(['error' => 'Unauthenticated'], 401);
})->name('login');

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    // Google Drive Account Management ONLY (no file listing!)
    Route::get('/drive/auth-url', [DriveController::class, 'getAuthUrl']);
    Route::post('/drive/callback', [DriveController::class, 'callback']);
    // REMOVED: /drive/files — VFS is the only way to see files
    // REMOVED: /drive/upload — use /vfs/upload instead
    // REMOVED: /drive/files/{fileId} — use /vfs/files/{id} instead
    // REMOVED: /drive/files/{fileId}/download — use /vfs/download/{id} instead
    
    // Virtual Filesystem Routes (THE ONLY file access point)
    Route::prefix('vfs')->group(function () {
        Route::get('/files', [App\Http\Controllers\Api\VirtualFilesController::class, 'index']);
        Route::post('/upload', [App\Http\Controllers\Api\VirtualFilesController::class, 'upload']);
        Route::get('/preview/{id}', [App\Http\Controllers\Api\VirtualFilesController::class, 'preview']);
        Route::get('/download/{id}', [App\Http\Controllers\Api\VirtualFilesController::class, 'download']);
        Route::delete('/files/{id}', [App\Http\Controllers\Api\VirtualFilesController::class, 'destroy']);
        Route::post('/create-folder', [App\Http\Controllers\Api\VirtualFilesController::class, 'createFolder']);
        // REMOVED: /sync — VFS is upload-only, no sync from Google Drive
    });
    
    // Storage Stats Routes
    Route::prefix('storage')->group(function () {
        Route::get('/stats', [App\Http\Controllers\Api\StorageController::class, 'stats']);
        Route::get('/accounts', [App\Http\Controllers\Api\StorageController::class, 'accounts']);
    });
});
