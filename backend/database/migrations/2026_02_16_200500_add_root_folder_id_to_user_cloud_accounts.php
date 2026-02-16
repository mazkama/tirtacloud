<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_cloud_accounts', function (Blueprint $table) {
            $table->string('root_folder_id')->nullable()->after('used_storage');
        });
    }

    public function down(): void
    {
        Schema::table('user_cloud_accounts', function (Blueprint $table) {
            $table->dropColumn('root_folder_id');
        });
    }
};
