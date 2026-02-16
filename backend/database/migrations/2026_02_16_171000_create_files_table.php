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
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_cloud_account_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('mime_type')->nullable();
            $table->bigInteger('size')->default(0);
            $table->string('cloud_file_id')->index(); // ID from Google Drive
            $table->string('parent_id')->nullable()->index(); // ID of parent folder in Drive
            $table->string('path')->index()->nullable(); // Virtual path for easy lookup
            $table->json('metadata')->nullable(); // Store extra info like webViewLink, etc.
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('files');
    }
};
