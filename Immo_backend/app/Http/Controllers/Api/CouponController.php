<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\User;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Carbon\Carbon;

class CouponController extends Controller
{
    /**
     * Display a listing of coupons.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        // Remove authentication check
        $coupons = Coupon::with(['usedByUser:user_id,full_name,email', 'usedForProperty:property_id,title,property_type'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $coupons
        ]);
    }

    /**
     * Store a newly created coupon.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // Remove authentication check
        
        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|string|unique:coupons,code',
            'discount_type' => 'sometimes|string|in:video_access,percentage,fixed_amount',
            'discount_value' => 'nullable|required_if:discount_type,percentage,fixed_amount|numeric',
            'expires_at' => 'nullable|date|after:now',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Generate a code if not provided
        $code = $request->code ?? $this->generateUniqueCode();

        // Create the coupon
        $coupon = Coupon::create([
            'code' => $code,
            'discount_type' => $request->discount_type ?? 'video_access',
            'discount_value' => $request->discount_value,
            'expires_at' => $request->expires_at,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Coupon created successfully',
            'data' => $coupon
        ], 201);
    }

    /**
     * Display the specified coupon.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        // Remove authentication check
        
        $coupon = Coupon::with(['usedByUser:user_id,full_name,email', 'usedForProperty:property_id,title,property_type'])
            ->find($id);

        if (!$coupon) {
            return response()->json([
                'status' => 'error',
                'message' => 'Coupon not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $coupon
        ]);
    }

    /**
     * Update the specified coupon.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        // Remove authentication check
        
        $coupon = Coupon::find($id);

        if (!$coupon) {
            return response()->json([
                'status' => 'error',
                'message' => 'Coupon not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|string|unique:coupons,code,' . $id,
            'discount_type' => 'sometimes|string|in:video_access,percentage,fixed_amount',
            'discount_value' => 'nullable|required_if:discount_type,percentage,fixed_amount|numeric',
            'expires_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update the coupon
        $coupon->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Coupon updated successfully',
            'data' => $coupon
        ]);
    }

    /**
     * Remove the specified coupon.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        // Remove authentication check
        
        $coupon = Coupon::find($id);

        if (!$coupon) {
            return response()->json([
                'status' => 'error',
                'message' => 'Coupon not found'
            ], 404);
        }

        $coupon->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Coupon deleted successfully'
        ]);
    }

    /**
     * Validate a coupon code.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function validateCoupon(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|exists:coupons,code',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid coupon code',
                'errors' => $validator->errors()
            ], 422);
        }

        $coupon = Coupon::where('code', $request->code)->first();

        if (!$coupon || !$coupon->isValid()) {
            return response()->json([
                'status' => 'error',
                'message' => $coupon && $coupon->is_used ? 'Le coupon a déjà été utilisé.' : 'Coupon invalide ou expiré'
            ], 422);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Coupon is valid',
            'data' => [
                'coupon' => $coupon,
                'discount_type' => $coupon->discount_type,
                'discount_value' => $coupon->discount_value,
            ]
        ]);
    }

    /**
     * Apply a coupon to a property (mark as used).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function applyCoupon(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|exists:coupons,code',
            'property_id' => 'required|exists:properties,property_id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $coupon = Coupon::where('code', $request->code)->first();
        
        if (!$coupon || !$coupon->isValid()) {
            return response()->json([
                'status' => 'error',
                'message' => $coupon && $coupon->is_used ? 'Le coupon a déjà été utilisé.' : 'Coupon invalide ou expiré'
            ], 422);
        }

        // Get the user from auth if available, otherwise set to null
        $user = Auth::user();
        $property = Property::find($request->property_id);

        // Mark coupon as used
        $coupon->update([
            'is_used' => true,
            'used_at' => now(),
            'used_by_user_id' => $user ? $user->user_id : null,
            'used_for_property_id' => $property->property_id,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Coupon applied successfully',
            'data' => $coupon
        ]);
    }

    /**
     * Generate a batch of coupons.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function generateBatch(Request $request)
    {
        // Remove authentication check
        
        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:1|max:100',
            'discount_type' => 'sometimes|string|in:video_access,percentage,fixed_amount',
            'discount_value' => 'nullable|required_if:discount_type,percentage,fixed_amount|numeric',
            'expires_at' => 'nullable|date|after:now',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $coupons = [];
        $quantity = $request->quantity;
        
        for ($i = 0; $i < $quantity; $i++) {
            $coupon = Coupon::create([
                'code' => $this->generateUniqueCode(),
                'discount_type' => $request->discount_type ?? 'video_access',
                'discount_value' => $request->discount_value,
                'expires_at' => $request->expires_at,
            ]);
            
            $coupons[] = $coupon;
        }

        return response()->json([
            'status' => 'success',
            'message' => "{$quantity} coupons generated successfully",
            'data' => $coupons
        ], 201);
    }

    /**
     * Generate a unique coupon code.
     *
     * @return string
     */
    private function generateUniqueCode()
    {
        $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed confusing characters like I, O
        $numbers = '123456789'; // Removed confusing numbers like 0
        
        do {
            // Create a alphabetic part (3 characters)
            $alpha = '';
            for ($i = 0; $i < 3; $i++) {
                $alpha .= $chars[rand(0, strlen($chars) - 1)];
            }
            
            // Create a numeric part (4 digits)
            $numeric = '';
            for ($i = 0; $i < 4; $i++) {
                $numeric .= $numbers[rand(0, strlen($numbers) - 1)];
            }
            
            // Combine to format XXX-0000
            $code = $alpha . '-' . $numeric;
            
        } while (Coupon::where('code', $code)->exists());
        
        return $code;
    }
} 