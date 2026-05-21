<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'phone' => $this->phone,
            'email' => $this->email,
            'address' => $this->address,
            'points' => $this->points ?? 0,
            'total_spent' => $this->orders()->where('status', 'completed')->sum('total') ?? 0.00,
            'due_amount' => $this->orders()->where('status', '!=', 'completed')->sum('total') ?? 0.00,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
