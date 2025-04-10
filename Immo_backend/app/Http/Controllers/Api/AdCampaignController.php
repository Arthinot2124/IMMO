<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdCampaign;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AdCampaignController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = AdCampaign::with('admin');

        // Filter by admin
        if ($request->has('admin_id')) {
            $query->where('admin_id', $request->admin_id);
        }

        // Filter by platform
        if ($request->has('platform')) {
            $query->where('platform', $request->platform);
        }

        // Filter by active campaigns
        if ($request->has('active') && $request->active) {
            $now = now();
            $query->where(function ($q) use ($now) {
                $q->where('start_date', '<=', $now)
                  ->where('end_date', '>=', $now);
            });
        }

        $campaigns = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => $campaigns
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'admin_id' => 'required|exists:users,user_id',
            'campaign_name' => 'required|string|max:150',
            'platform' => 'nullable|string|max:50',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'budget' => 'nullable|numeric|min:0',
        ]);

        // Check if admin is actually an admin
        $admin = User::findOrFail($validated['admin_id']);
        $adminRole = $admin->role;
        
        if (!$adminRole || $adminRole->role_name !== 'Admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only administrators can create ad campaigns'
            ], Response::HTTP_FORBIDDEN);
        }

        $campaign = AdCampaign::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Ad campaign created successfully',
            'data' => $campaign
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(AdCampaign $adCampaign)
    {
        $adCampaign->load('admin');
        
        return response()->json([
            'status' => 'success',
            'data' => $adCampaign
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AdCampaign $adCampaign)
    {
        $validated = $request->validate([
            'campaign_name' => 'sometimes|required|string|max:150',
            'platform' => 'nullable|string|max:50',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'budget' => 'nullable|numeric|min:0',
        ]);

        $adCampaign->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Ad campaign updated successfully',
            'data' => $adCampaign
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AdCampaign $adCampaign)
    {
        $adCampaign->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Ad campaign deleted successfully'
        ]);
    }

    /**
     * Get ad campaigns created by a specific admin
     */
    public function adminCampaigns(User $admin)
    {
        // Check if user is an admin
        $adminRole = $admin->role;
        
        if (!$adminRole || $adminRole->role_name !== 'Admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'User is not an administrator'
            ], Response::HTTP_FORBIDDEN);
        }

        $campaigns = $admin->adCampaigns()->orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $campaigns
        ]);
    }

    /**
     * Get active ad campaigns
     */
    public function activeCampaigns()
    {
        $now = now();
        $campaigns = AdCampaign::where('start_date', '<=', $now)
            ->where('end_date', '>=', $now)
            ->with('admin')
            ->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $campaigns
        ]);
    }
}
