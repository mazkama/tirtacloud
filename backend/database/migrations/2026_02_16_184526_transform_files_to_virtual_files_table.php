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
        // Check if files table exists, if so rename it, otherwise create virtual_files
        if (Schema::hasTable('files')) {
            // Add new columns to existing files table
            Schema::table('files', function (Blueprint $table) {
                if (!Schema::hasColumn('files', 'user_id')) {
                    $table->foreignId('user_id')->after('id')->nullable()->constrained()->onDelete('cascade');
                }
                if (!Schema::hasColumn('files', 'virtual_path')) {
                    $table->string('virtual_path', 512)->after('user_id')->nullable();
                }
                if (!Schema::hasColumn('files', 'parent_virtual_id')) {
                    $table->foreignId('parent_virtual_id')->after('virtual_path')->nullable()->constrained('files')->onDelete('cascade');
                }
                if (!Schema::hasColumn('files', 'is_folder')) {
                    $table->boolean('is_folder')->after('mime_type')->default(false)->index();
                }
            });
            
            // Rename column
            Schema::table('files', function (Blueprint $table) {
                if (Schema::hasColumn('files', 'user_cloud_account_id')) {
                    $table->renameColumn('user_cloud_account_id', 'cloud_account_id');
                }
            });
            
            // Rename table
            Schema::rename('files', 'virtual_files');
            
            // Add indexes after rename
            Schema::table('virtual_files', function (Blueprint $table) {
                $table->index('user_id', 'idx_user');
                $table->index(['user_id', 'parent_virtual_id'], 'idx_user_parent');
            });
        } else {
            // Create virtual_files table from scratch
            Schema::create('virtual_files', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->string('virtual_path', 512);
                $table->foreignId('parent_virtual_id')->nullable()->constrained('virtual_files')->onDelete('cascade');
                $table->foreignId('cloud_account_id')->constrained('user_cloud_accounts')->onDelete('cascade');
                $table->string('name');
                $table->string('mime_type')->nullable();
                $table->boolean('is_folder')->default(false)->index();
                $table->bigInteger('size')->default(0);
                $table->string('cloud_file_id')->index();
                $table->json('metadata')->nullable();
                $table->timestamps();
                
                $table->index('user_id', 'idx_user');
                $table->index(['user_id', 'parent_virtual_id'], 'idx_user_parent');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('virtual_files')) {
            Schema::dropIfExists('virtual_files');
        }
    }
};
