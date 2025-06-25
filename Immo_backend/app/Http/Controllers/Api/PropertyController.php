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

        // Filter by transaction_type
        if ($request->has('transaction_type')) {
            $query->where('transaction_type', $request->transaction_type);
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
            'property_type' => 'required|in:VILLA,TERRAIN,APPARTEMENT',
            'transaction_type' => 'required|in:AHOFA,AMIDY',
            'category' => 'nullable|in:LITE,ESSENTIEL,PREMIUM',
            'status' => 'nullable|in:Disponible,Réservé,Vendu,Loué',
            'additional_details' => 'nullable|string',
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
            'property_type' => 'sometimes|required|in:VILLA,TERRAIN,APPARTEMENT',
            'transaction_type' => 'sometimes|required|in:AHOFA,AMIDY',
            'category' => 'nullable|in:LITE,ESSENTIEL,PREMIUM',
            'status' => 'nullable|in:Disponible,Réservé,Vendu,Loué',
            'additional_details' => 'nullable|string',
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

    /**
     * Increment view count for a property
     */
    public function incrementView(Request $request, Property $property)
    {
        // Récupérer l'ID utilisateur de plusieurs façons pour déboguer
        $userId = null;
        
        // Méthode 1: Auth standard
        if (auth()->check()) {
            $userId = auth()->id();
        }
        
        // Méthode 2: Depuis la requête
        if ($request->has('user_id')) {
            $userId = $request->input('user_id');
        }
        
        // Méthode 3: Depuis la session ou le token
        if (session()->has('user_id')) {
            $userId = session('user_id');
        }
        
        // Méthode 4: Header personnalisé (à ajouter côté frontend)
        if ($request->header('X-User-ID')) {
            $userId = $request->header('X-User-ID');
        }
        
        // Get IP address
        $ipAddress = $request->ip();
        
        // Journaliser pour déboguer
        \Illuminate\Support\Facades\Log::info('Increment view data', [
            'user_id' => $userId,
            'ip_address' => $ipAddress,
            'property_id' => $property->property_id,
            'auth_check' => auth()->check(),
            'request_user_id' => $request->input('user_id')
        ]);
        
        // Si l'utilisateur n'est pas identifié
        if (!$userId) {
            // Check if this IP has already viewed this property in the last 24 hours
            $lastView = \App\Models\PropertyView::where('property_id', $property->property_id)
                ->where('ip_address', $ipAddress)
                ->where('viewed_at', '>', now()->subHours(24))
                ->first();
        } else {
            // Si l'utilisateur est identifié
            // Check if this user has already viewed this property in the last 24 hours
            $lastView = \App\Models\PropertyView::where('property_id', $property->property_id)
                ->where('user_id', $userId)
                ->where('viewed_at', '>', now()->subHours(24))
                ->first();
        }
        
        // If no recent view found, create a new one and increment the property's view count
        if (!$lastView) {
            // Create the view record
            \App\Models\PropertyView::create([
                'property_id' => $property->property_id,
                'user_id' => $userId,
                'ip_address' => $ipAddress
            ]);
            
            // Increment the property view count
            $property->increment('views');
        }
        
        return response()->json([
            'status' => 'success',
            'views' => $property->views,
            'debug_auth' => [
                'user_id' => $userId,
                'auth_check' => auth()->check(),
                'ip' => $ipAddress
            ]
        ]);
    }

    /**
     * Reset view count for a property
     */
    public function resetViews(Property $property)
    {
        try {
            // Réinitialiser le compteur de vues
            $property->views = 0;
            $property->save();
            
            // Supprimer tous les enregistrements de vues pour cette propriété
            \App\Models\PropertyView::where('property_id', $property->property_id)->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Compteur de vues réinitialisé',
                'views' => 0
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la réinitialisation des vues: ' . $e->getMessage()
            ], 500);
        }
    }
}
