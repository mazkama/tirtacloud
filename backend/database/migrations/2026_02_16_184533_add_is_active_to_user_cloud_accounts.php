<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('user_cloud_accounts', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('used_storage');
            $table->index(['user_id', 'provider', 'is_active'], 'idx_user_provider_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_cloud_accounts', function (Blueprint $table) {
            $table->dropIndex('idx_user_provider_active');
            $table->dropColumn('is_active');
        });
    }
};
