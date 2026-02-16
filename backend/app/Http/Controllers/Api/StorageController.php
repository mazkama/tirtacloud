<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StorageStatsService;
use Illuminate\Http\Request;

class StorageController extends Controller
{
    protected $storageStats;

    public function __construct(StorageStatsService $storageStats)
    {
        $this->storageStats = $storageStats;
    }

    /**
     * Get aggregated storage stats
     * GET /api/storage/stats
     */
    public function stats(Request $request)
    {
        $user = $request->user();
        
        return response()->json($this->storageStats->getComprehensiveStats($user));
    }

    /**
     * Get per-account breakdown
     * GET /api/storage/accounts
     */
    public function accounts(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'accounts' => $this->storageStats->getAccountBreakdown($user),
        ]);
    }
}
