<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('share_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('virtual_file_id')->constrained('virtual_files')->onDelete('cascade');
            $table->string('token', 64)->unique();
            $table->string('slug')->unique(); // human-friendly URL
            $table->timestamp('expires_at')->nullable(); // null = never expires
            $table->string('password')->nullable(); // optional password protection
            $table->boolean('is_active')->default(true);
            $table->bigInteger('download_count')->default(0);
            $table->bigInteger('view_count')->default(0);
            $table->timestamps();
            
            $table->index(['token', 'is_active']);
            $table->index(['slug', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('share_links');
    }
};
