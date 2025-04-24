<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PropertyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Property::with(['user', 'media']);

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Filter by surface range
        if ($request->has('min_surface')) {
            $query->where('surface', '>=', $request->min_surface);
        }
        if ($request->has('max_surface')) {
            $query->where('surface', '<=', $request->max_surface);
        }

        // Filter by location
        if ($request->has('location')) {
            $query->where('location', 'like', '%' . $request->location . '%');
        }

        // Search by title or description
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        // Filter by property_type
        if ($request->has('property_type')) {
            $query->where('property_type', $request->property_type);
        }

        // Get per_page parameter or use default 10
        $perPage = $request->input('per_page', 10);

        $properties = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $properties
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'sometimes|exists:users,user_id',
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'surface' => 'nullable|numeric|min:0',
            'location' => 'nullable|string|max:255',
            'category' => 'nullable|in:LITE,ESSENTIEL,PREMIUM',
            'status' => 'nullable|in:Disponible,Réservé,Vendu,Loué',
        ]);

        // Ajouter l'ID utilisateur par défaut s'il n'est pas fourni
        if (!isset($validated['user_id'])) {
            $validated['user_id'] = 1; // Assurez-vous que cet utilisateur existe
        }

        $property = Property::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Property created successfully',
            'data' => $property
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(Property $property)
    {
        $property->load(['user', 'media', 'ratings']);
        return response()->json([
            'status' => 'success',
            'data' => $property
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Property $property)
    {
        $validated = $request->validate([
            'user_id' => 'sometimes|required|exists:users,user_id',
            'title' => 'sometimes|required|string|max:150',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'surface' => 'nullable|numeric|min:0',
            'location' => 'nullable|string|max:255',
            'category' => 'nullable|in:LITE,ESSENTIEL,PREMIUM',
            'status' => 'nullable|in:Disponible,Réservé,Vendu,Loué',
        ]);

        $property->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Property updated successfully',
            'data' => $property
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Property $property)
    {
        $property->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Property deleted successfully'
        ]);
    }
}
