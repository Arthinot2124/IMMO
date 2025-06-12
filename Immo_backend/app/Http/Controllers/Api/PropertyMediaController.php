<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\PropertyMedia;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class PropertyMediaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, Property $property)
    {
        $media = $property->media;
        
        return response()->json([
            'status' => 'success',
            'data' => $media
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Property $property)
    {
        $validated = $request->validate([
            'media_type' => 'required|in:Photo,Vidéo,Document',
            'media_file' => 'required|file|max:512000', // 512000 Ko = 500 Mo
        ]);

        // Store the file
        $path = $request->file('media_file')->store('property_media/' . $property->property_id, 'public');
        
        $media = new PropertyMedia([
            'property_id' => $property->property_id,
            'media_type' => $validated['media_type'],
            'media_url' => Storage::url($path),
        ]);
        
        $media->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Media uploaded successfully',
            'data' => $media
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(Property $property, PropertyMedia $media)
    {
        // Check if the media belongs to the property
        if ($media->property_id !== $property->property_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Media not found for this property'
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'status' => 'success',
            'data' => $media
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Property $property, PropertyMedia $media)
    {
        // Check if the media belongs to the property
        if ($media->property_id !== $property->property_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Media not found for this property'
            ], Response::HTTP_NOT_FOUND);
        }

        $validated = $request->validate([
            'media_type' => 'sometimes|required|in:Photo,Vidéo,Document',
            'media_file' => 'sometimes|required|file|max:512000', // 512000 Ko = 500 Mo
        ]);

        if ($request->hasFile('media_file')) {
            // Delete the old file if it exists
            $oldPath = str_replace('/storage', 'public', $media->media_url);
            if (Storage::exists($oldPath)) {
                Storage::delete($oldPath);
            }

            // Store the new file
            $path = $request->file('media_file')->store('property_media/' . $property->property_id, 'public');
            $media->media_url = Storage::url($path);
        }

        if (isset($validated['media_type'])) {
            $media->media_type = $validated['media_type'];
        }

        $media->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Media updated successfully',
            'data' => $media
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Property $property, PropertyMedia $media)
    {
        // Check if the media belongs to the property
        if ($media->property_id !== $property->property_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Media not found for this property'
            ], Response::HTTP_NOT_FOUND);
        }

        // Delete the file if it exists
        $path = str_replace('/storage', 'public', $media->media_url);
        if (Storage::exists($path)) {
            Storage::delete($path);
        }

        $media->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Media deleted successfully'
        ]);
    }

    /**
     * Copy media from a property request to a property.
     */
    public function copyFromRequest(Request $request, Property $property)
    {
        $validated = $request->validate([
            'request_id' => 'required|exists:property_requests,request_id',
        ]);

        $requestId = $validated['request_id'];
        $mediaItems = \App\Models\PropertyRequestMedia::where('request_id', $requestId)->get();
        
        $copiedMedia = [];
        
        foreach ($mediaItems as $mediaItem) {
            // Ensure the URL is correct (doesn't already have the base URL)
            $mediaUrl = $mediaItem->media_url;
            
            // Create new media entry
            $newMedia = new PropertyMedia([
                'property_id' => $property->property_id,
                'media_type' => $mediaItem->media_type,
                'media_url' => $mediaUrl,
            ]);
            
            $newMedia->save();
            $copiedMedia[] = $newMedia;
        }
        
        return response()->json([
            'status' => 'success',
            'message' => count($copiedMedia) . ' media items copied successfully',
            'data' => $copiedMedia
        ]);
    }
}
