<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRestaurantSpaceRequest;
use App\Http\Requests\UpdateRestaurantSpaceRequest;
use App\Http\Resources\RestaurantSpaceResource;
use App\Models\RestaurantSpace;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RestaurantSpaceController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of restaurant spaces.
     */
    public function index(Request $request): JsonResponse
    {
        $query = RestaurantSpace::query()
            ->withCount('tables')
            ->select('id', 'name', 'is_active');

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->input('search')}%");
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        return $this->success(
            RestaurantSpaceResource::collection($query->paginate(15)),
            'Restaurant spaces retrieved successfully'
        );
    }

    /**
     * Store a newly created restaurant space.
     */
    public function store(StoreRestaurantSpaceRequest $request): JsonResponse
    {
        $space = RestaurantSpace::create($request->validated());
        $space->loadCount('tables');

        return $this->success(
            new RestaurantSpaceResource($space),
            'Restaurant space created successfully',
            201
        );
    }

    /**
     * Display the specified restaurant space.
     */
    public function show($tenant, $id): JsonResponse
    {
        $space = RestaurantSpace::withCount('tables')->findOrFail($id);

        return $this->success(
            new RestaurantSpaceResource($space),
            'Restaurant space retrieved successfully'
        );
    }

    /**
     * Update the specified restaurant space in storage.
     */
    public function update(UpdateRestaurantSpaceRequest $request, $tenant, $id): JsonResponse
    {
        $space = RestaurantSpace::findOrFail($id);
        $space->update($request->validated());
        $space->loadCount('tables');

        return $this->success(
            new RestaurantSpaceResource($space),
            'Restaurant space updated successfully'
        );
    }

    /**
     * Remove the specified restaurant space from storage.
     */
    public function destroy($tenant, $id): JsonResponse
    {
        $space = RestaurantSpace::findOrFail($id);
        $space->delete();

        return $this->success(
            null,
            'Restaurant space deleted successfully'
        );
    }
}