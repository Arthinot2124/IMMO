<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rating;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class RatingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Rating::with(['property', 'user']);

        // Filter by property
        if ($request->has('property_id')) {
            $query->where('property_id', $request->property_id);
        }

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by rating value
        if ($request->has('rating')) {
            $query->where('rating', $request->rating);
        }

        $ratings = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => $ratings
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,property_id',
            'user_id' => 'required|exists:users,user_id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        // Check if user has already rated this property
        $existingRating = Rating::where('property_id', $validated['property_id'])
            ->where('user_id', $validated['user_id'])
            ->first();

        if ($existingRating) {
            return response()->json([
                'status' => 'error',
                'message' => 'You have already rated this property'
            ], Response::HTTP_BAD_REQUEST);
        }

        $rating = Rating::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Rating created successfully',
            'data' => $rating
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(Rating $rating)
    {
        $rating->load(['property', 'user']);
        
        return response()->json([
            'status' => 'success',
            'data' => $rating
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Rating $rating)
    {
        $validated = $request->validate([
            'rating' => 'sometimes|required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $rating->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Rating updated successfully',
            'data' => $rating
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Rating $rating)
    {
        $rating->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Rating deleted successfully'
        ]);
    }

    /**
     * Get ratings for a specific property
     */
    public function propertyRatings(Property $property)
    {
        $ratings = $property->ratings()->with('user')->orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $ratings
        ]);
    }

    /**
     * Get average rating for a specific property
     */
    public function propertyAverageRating(Property $property)
    {
        $averageRating = $property->ratings()->avg('rating');
        $ratingsCount = $property->ratings()->count();
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'average_rating' => $averageRating,
                'ratings_count' => $ratingsCount
            ]
        ]);
    }

    /**
     * Get ratings by a specific user
     */
    public function userRatings(User $user)
    {
        $ratings = $user->ratings()->with('property')->orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $ratings
        ]);
    }
}
