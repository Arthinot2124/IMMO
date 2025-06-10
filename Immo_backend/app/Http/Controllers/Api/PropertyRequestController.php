<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PropertyRequest;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PropertyRequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = PropertyRequest::with('user');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $propertyRequests = $query->orderBy('submitted_at', 'desc')->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => $propertyRequests
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,user_id',
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'surface' => 'nullable|numeric|min:0',
            'location' => 'nullable|string|max:255',
            'property_type' => 'required|string|in:VILLA,TERRAIN,APPARTEMENT',
            'transaction_type' => 'required|string|in:AHOFA,AMIDY',
            'category' => 'nullable|string|max:50',
            'property_status' => 'nullable|string|max:50',
            'additional_details' => 'nullable|string',
            'status' => 'nullable|string|in:En attente,Accepté,Refusé',
        ]);

        $propertyRequest = PropertyRequest::create($validated);

        // Récupérer les informations de l'utilisateur qui a fait la demande
        $user = User::findOrFail($validated['user_id']);
        
        // Créer une notification pour tous les administrateurs
        $admins = User::whereHas('role', function($query) {
            $query->where('role_name', 'Admin');
        })->get();
        
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->user_id,
                'message' => "Nouvelle demande de propriété (#" . $propertyRequest->request_id . ") de " . $user->full_name . " - " . $propertyRequest->title,
                'is_read' => false
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Property request created successfully',
            'data' => $propertyRequest
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(PropertyRequest $propertyRequest)
    {
        $propertyRequest->load('user');
        
        return response()->json([
            'status' => 'success',
            'data' => $propertyRequest
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PropertyRequest $propertyRequest)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:150',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'surface' => 'nullable|numeric|min:0',
            'location' => 'nullable|string|max:255',
            'property_type' => 'sometimes|required|string|in:VILLA,TERRAIN,APPARTEMENT',
            'transaction_type' => 'sometimes|required|string|in:AHOFA,AMIDY',
            'category' => 'nullable|string|max:50',
            'property_status' => 'nullable|string|max:50',
            'additional_details' => 'nullable|string',
            'status' => 'sometimes|required|in:En attente,Accepté,Refusé',
        ]);

        $propertyRequest->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Property request updated successfully',
            'data' => $propertyRequest
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PropertyRequest $propertyRequest)
    {
        $propertyRequest->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Property request deleted successfully'
        ]);
    }

    /**
     * Get property requests for a specific user
     */
    public function userRequests(User $user)
    {
        $propertyRequests = $user->propertyRequests()->orderBy('submitted_at', 'desc')->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $propertyRequests
        ]);
    }
}
