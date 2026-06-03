<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMenuItemRequest;
use App\Http\Requests\UpdateMenuItemRequest;
use App\Http\Resources\MenuItemResource;
use App\Models\MenuItem;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuItemController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of menu items.
     */
    public function index(Request $request): JsonResponse
    {
        $query = MenuItem::query()
            ->with('category:id,name')
            ->select('id', 'category_id', 'name', 'description', 'price', 'is_available');

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->input('search')}%");
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->filled('is_available')) {
            $query->where('is_available', $request->boolean('is_available'));
        }

        if ($request->boolean('show_deleted')) {
            $query->withTrashed();
        }

        return $this->success(
            MenuItemResource::collection($query->paginate(15)),
            'Menu items retrieved successfully'
        );
    }

    /**
     * Store a newly created menu item.
     */
    public function store(StoreMenuItemRequest $request): JsonResponse
    {
        $menuItem = MenuItem::create($request->validated());

        return $this->success(
            new MenuItemResource($menuItem->load('category')),
            'Menu item created successfully',
            201
        );
    }

    /**
     * Display the specified menu item.
     */
    public function show($tenant, $id): JsonResponse
    {
        $menuItem = MenuItem::with('category')->findOrFail($id);

        return $this->success(
            new MenuItemResource($menuItem),
            'Menu item retrieved successfully'
        );
    }

    /**
     * Update the specified menu item in storage.
     */
    public function update(UpdateMenuItemRequest $request, $tenant, $id): JsonResponse
    {
        $menuItem = MenuItem::findOrFail($id);
        $menuItem->update($request->validated());

        return $this->success(
            new MenuItemResource($menuItem->load('category')),
            'Menu item updated successfully'
        );
    }

    /**
     * Remove the specified menu item from storage.
     */
    public function destroy($tenant, $id): JsonResponse
    {
        $menuItem = MenuItem::findOrFail($id);
        $menuItem->delete();

        return $this->success(
            null,
            'Menu item deleted successfully'
        );
    }
}