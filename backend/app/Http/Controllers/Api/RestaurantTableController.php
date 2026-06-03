<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRestaurantTableRequest;
use App\Http\Requests\UpdateRestaurantTableRequest;
use App\Http\Resources\RestaurantTableResource;
use App\Models\RestaurantTable;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RestaurantTableController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of restaurant tables.
     */
    public function index(Request $request): JsonResponse
    {
        $query = RestaurantTable::query()
            ->with('space:id,name')
            ->select('id', 'restaurant_space_id', 'table_number', 'capacity', 'status');

        if ($request->filled('search')) {
            $query->where('table_number', 'like', "%{$request->input('search')}%");
        }

        if ($request->filled('restaurant_space_id')) {
            $query->where('restaurant_space_id', $request->input('restaurant_space_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        return $this->success(
            RestaurantTableResource::collection($query->paginate(15)),
            'Restaurant tables retrieved successfully'
        );
    }

    /**
     * Store a newly created restaurant table.
     */
    public function store(StoreRestaurantTableRequest $request): JsonResponse
    {
        $table = RestaurantTable::create($request->validated());

        return $this->success(
            new RestaurantTableResource($table->load('space')),
            'Restaurant table created successfully',
            201
        );
    }

    /**
     * Display the specified restaurant table.
     */
    public function show($tenant, $id): JsonResponse
    {
        $table = RestaurantTable::with('space')->findOrFail($id);

        return $this->success(
            new RestaurantTableResource($table),
            'Restaurant table retrieved successfully'
        );
    }

    /**
     * Update the specified restaurant table in storage.
     */
    public function update(UpdateRestaurantTableRequest $request, $tenant, $id): JsonResponse
    {
        $table = RestaurantTable::findOrFail($id);
        $table->update($request->validated());

        return $this->success(
            new RestaurantTableResource($table->load('space')),
            'Restaurant table updated successfully'
        );
    }

    /**
     * Remove the specified restaurant table from storage.
     */
    public function destroy($tenant, $id): JsonResponse
    {
        $table = RestaurantTable::findOrFail($id);
        $table->delete();

        return $this->success(
            null,
            'Restaurant table deleted successfully'
        );
    }
}