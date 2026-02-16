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
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    // Google Drive Routes
    Route::get('/drive/auth-url', [DriveController::class, 'getAuthUrl']);
    Route::post('/drive/callback', [DriveController::class, 'callback']);
    Route::get('/drive/files', [DriveController::class, 'listFiles']);
    Route::post('/drive/upload', [DriveController::class, 'upload']);
    Route::delete('/drive/files/{fileId}', [DriveController::class, 'delete']);
    Route::get('/drive/files/{fileId}/download', [DriveController::class, 'getDownloadUrl']);
});
