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
        Schema::table('menu_items', function (Blueprint $table) {
            // Add index on category_id for faster filtering
            $table->index('category_id');
            // Add index on is_available for filtering by availability
            $table->index('is_available');
        });

        Schema::table('restaurant_spaces', function (Blueprint $table) {
            // Add index on is_active for faster filtering
            $table->index('is_active');
        });

        Schema::table('restaurant_tables', function (Blueprint $table) {
            // Add index on restaurant_space_id for foreign key relationship
            $table->index('restaurant_space_id');
            // Add index on status for faster filtering by table status
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menu_items', function (Blueprint $table) {
            $table->dropIndex(['category_id']);
            $table->dropIndex(['is_available']);
        });

        Schema::table('restaurant_spaces', function (Blueprint $table) {
            $table->dropIndex(['is_active']);
        });

        Schema::table('restaurant_tables', function (Blueprint $table) {
            $table->dropIndex(['restaurant_space_id']);
            $table->dropIndex(['status']);
        });
    }
};
