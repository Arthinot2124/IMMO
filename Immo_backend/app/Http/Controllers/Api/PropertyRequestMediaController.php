<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PropertyRequest;
use App\Models\PropertyRequestMedia;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class PropertyRequestMediaController extends Controller
{
    /**
     * Display a listing of media for a property request.
     */
    public function index(Request $request, PropertyRequest $propertyRequest)
    {
        $media = $propertyRequest->media;
        
        return response()->json([
            'status' => 'success',
            'data' => $media
        ]);
    }

    /**
     * Store new media for a property request.
     */
    public function store(Request $request, PropertyRequest $propertyRequest)
    {
        $validated = $request->validate([
            'media_type' => 'nullable|in:Photo,Vidéo,Document',
            'media_file' => 'required|file|max:512000', // 512000 Ko = 500 Mo
        ]);

        // Store the file
        $path = $request->file('media_file')->store('property_request_media/' . $propertyRequest->request_id, 'public');
        
        $media = new PropertyRequestMedia([
            'request_id' => $propertyRequest->request_id,
            'media_type' => $validated['media_type'] ?? 'Photo',
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
     * Store multiple media files for a property request.
     */
    public function storeMultiple(Request $request, PropertyRequest $propertyRequest)
    {
        $request->validate([
            'images' => 'required|array',
            'images.*' => 'required|file|mimes:jpeg,png,jpg,gif|max:102400', // Max 100MB
        ]);

        $uploadedMedia = [];

        foreach ($request->file('images') as $image) {
            $path = $image->store('property_request_media/' . $propertyRequest->request_id, 'public');
            
            $media = new PropertyRequestMedia([
                'request_id' => $propertyRequest->request_id,
                'media_type' => 'Photo',
                'media_url' => Storage::url($path),
            ]);
            
            $media->save();
            $uploadedMedia[] = $media;
        }

        return response()->json([
            'status' => 'success',
            'message' => count($uploadedMedia) . ' media files uploaded successfully',
            'data' => $uploadedMedia
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified media item.
     */
    public function show(PropertyRequest $propertyRequest, PropertyRequestMedia $media)
    {
        // Check if the media belongs to the property request
        if ($media->request_id !== $propertyRequest->request_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Media not found for this property request'
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'status' => 'success',
            'data' => $media
        ]);
    }

    /**
     * Update the specified media item.
     */
    public function update(Request $request, PropertyRequest $propertyRequest, PropertyRequestMedia $media)
    {
        // Check if the media belongs to the property request
        if ($media->request_id !== $propertyRequest->request_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Media not found for this property request'
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
            $path = $request->file('media_file')->store('property_request_media/' . $propertyRequest->request_id, 'public');
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
     * Remove the specified media item.
     */
    public function destroy(PropertyRequest $propertyRequest, PropertyRequestMedia $media)
    {
        // Check if the media belongs to the property request
        if ($media->request_id !== $propertyRequest->request_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Media not found for this property request'
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
} 