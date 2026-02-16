<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DriveController;
use App\Http\Controllers\Api\VirtualFilesController;
use App\Http\Controllers\Api\StorageController;
use App\Http\Controllers\Api\ShareController;

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

// PUBLIC Share Routes (no auth required — like S3 presigned URLs)
Route::prefix('share')->group(function () {
    Route::get('/{slug}', [ShareController::class, 'publicView']);
    Route::get('/{slug}/preview', [ShareController::class, 'publicPreview']);
    Route::get('/{slug}/download', [ShareController::class, 'publicDownload']);
});

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    // Google Drive Account Management ONLY
    Route::get('/drive/auth-url', [DriveController::class, 'getAuthUrl']);
    Route::post('/drive/callback', [DriveController::class, 'callback']);

    // Virtual Filesystem Routes (THE ONLY file access point)
    Route::prefix('vfs')->group(function () {
        Route::get('/files', [VirtualFilesController::class, 'index']);
        Route::post('/upload', [VirtualFilesController::class, 'upload']);
        Route::delete('/files/{id}', [VirtualFilesController::class, 'destroy']);
        Route::post('/create-folder', [VirtualFilesController::class, 'createFolder']);

        // Preview/download — support token from query param (for img/video/iframe src)
        Route::middleware(\App\Http\Middleware\TokenFromQuery::class)->group(function () {
            Route::get('/preview/{id}', [VirtualFilesController::class, 'preview']);
            Route::get('/download/{id}', [VirtualFilesController::class, 'download']);
        });

        // Share management
        Route::post('/share', [ShareController::class, 'create']);
        Route::get('/shares', [ShareController::class, 'index']);
        Route::delete('/shares/{id}', [ShareController::class, 'destroy']);
    });

    // Storage Stats Routes
    Route::prefix('storage')->group(function () {
        Route::get('/stats', [StorageController::class, 'stats']);
        Route::get('/accounts', [StorageController::class, 'accounts']);
    });
});
