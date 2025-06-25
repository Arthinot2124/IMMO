<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PropertyController;
use App\Http\Controllers\Api\PropertyMediaController;
use App\Http\Controllers\Api\PropertyRequestController;
use App\Http\Controllers\Api\PropertyRequestMediaController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\RatingController;
use App\Http\Controllers\Api\AdCampaignController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\CouponController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/login', [UserController::class, 'login']);
Route::post('/register', [UserController::class, 'store']);

// Properties - Public access for viewing
Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/properties/{property}', [PropertyController::class, 'show']);
Route::get('/properties/{property}/media', [PropertyMediaController::class, 'index']);
Route::get('/properties/{property}/ratings', [RatingController::class, 'propertyRatings']);
Route::get('/properties/{property}/average-rating', [RatingController::class, 'propertyAverageRating']);
Route::post('/properties/{property}/view', [PropertyController::class, 'incrementView']);
Route::post('/properties/{property}/reset-views', [PropertyController::class, 'resetViews']);

// User profile - était protégé, maintenant public
Route::get('/user', [UserController::class, 'profile']);
Route::post('/logout', [UserController::class, 'logout']);

// Roles
Route::apiResource('roles', RoleController::class);

// Users
Route::apiResource('users', UserController::class);

// Properties
Route::post('/properties', [PropertyController::class, 'store']);
Route::put('/properties/{property}', [PropertyController::class, 'update']);
Route::delete('/properties/{property}', [PropertyController::class, 'destroy']);

// Property Media
Route::post('/properties/{property}/media', [PropertyMediaController::class, 'store']);
Route::post('/properties/{property}/copy-media-from-request', [PropertyMediaController::class, 'copyFromRequest']);
Route::get('/properties/{property}/media/{media}', [PropertyMediaController::class, 'show']);
Route::post('/properties/{property}/media/{media}', [PropertyMediaController::class, 'update']);
Route::delete('/properties/{property}/media/{media}', [PropertyMediaController::class, 'destroy']);

// Property Requests
Route::apiResource('property-requests', PropertyRequestController::class);
Route::get('/users/{user}/property-requests', [PropertyRequestController::class, 'userRequests']);

// Property Request Media
Route::get('/property-requests/{propertyRequest}/media', [PropertyRequestMediaController::class, 'index']);
Route::post('/property-requests/{propertyRequest}/media', [PropertyRequestMediaController::class, 'store']);
Route::post('/property-requests/{propertyRequest}/images', [PropertyRequestMediaController::class, 'storeMultiple']);
Route::get('/property-requests/{propertyRequest}/media/{media}', [PropertyRequestMediaController::class, 'show']);
Route::post('/property-requests/{propertyRequest}/media/{media}', [PropertyRequestMediaController::class, 'update']);
Route::delete('/property-requests/{propertyRequest}/media/{media}', [PropertyRequestMediaController::class, 'destroy']);

// Orders
Route::apiResource('orders', OrderController::class);
Route::get('/users/{user}/orders', [OrderController::class, 'userOrders']);
Route::get('/properties/{property}/orders', [OrderController::class, 'propertyOrders']);

// Appointments
Route::apiResource('appointments', AppointmentController::class);
Route::get('/users/{user}/appointments', [AppointmentController::class, 'userAppointments']);
Route::get('/properties/{property}/appointments', [AppointmentController::class, 'propertyAppointments']);

// Notifications
Route::apiResource('notifications', NotificationController::class);
Route::get('/users/{user}/notifications', [NotificationController::class, 'userNotifications']);
Route::post('/users/{user}/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);

// Ratings
Route::apiResource('ratings', RatingController::class);
Route::get('/users/{user}/ratings', [RatingController::class, 'userRatings']);

// Favorites
Route::get('/favorites', [FavoriteController::class, 'index']);
Route::post('/favorites', [FavoriteController::class, 'store']);
Route::delete('/favorites/{property}', [FavoriteController::class, 'destroy']);
Route::get('/users/{user}/favorites', [FavoriteController::class, 'userFavorites']);
Route::get('/properties/{property}/favorites', [FavoriteController::class, 'checkFavorite']);
Route::get('/users/{user}/favorite-properties', [FavoriteController::class, 'getFavoriteProperties']);

// Ad Campaigns
Route::apiResource('ad-campaigns', AdCampaignController::class);
Route::get('/users/{admin}/ad-campaigns', [AdCampaignController::class, 'adminCampaigns']);
Route::get('/ad-campaigns/active', [AdCampaignController::class, 'activeCampaigns']);

// Coupons
Route::apiResource('coupons', CouponController::class);
Route::post('/coupons/validate', [CouponController::class, 'validateCoupon']);
Route::post('/coupons/apply', [CouponController::class, 'applyCoupon']);
Route::post('/coupons/generate-batch', [CouponController::class, 'generateBatch']);

// Dashboard data (pour admin)
Route::get('/dashboard/stats', function (Request $request) {
    // Get dashboard statistics
    $stats = [
        'total_properties' => \App\Models\Property::count(),
        'available_properties' => \App\Models\Property::where('status', 'Disponible')->count(),
        'sold_properties' => \App\Models\Property::where('status', 'Vendu')->count(),
        'rented_properties' => \App\Models\Property::where('status', 'Loué')->count(),
        'total_users' => \App\Models\User::count(),
        'total_orders' => \App\Models\Order::count(),
        'pending_orders' => \App\Models\Order::where('order_status', 'En attente')->count(),
        'pending_appointments' => \App\Models\Appointment::where('confirmation_status', 'En attente')->count(),
        'pending_property_requests' => \App\Models\PropertyRequest::where('status', 'En attente')->count(),
        'recent_orders' => \App\Models\Order::with(['user', 'property'])->orderBy('order_date', 'desc')->take(5)->get(),
        'recent_properties' => \App\Models\Property::orderBy('created_at', 'desc')->take(5)->get(),
        'total_coupons' => \App\Models\Coupon::count(),
        'used_coupons' => \App\Models\Coupon::where('is_used', true)->count(),
        'unused_coupons' => \App\Models\Coupon::where('is_used', false)->count(),
    ];
    
    return response()->json([
        'status' => 'success',
        'data' => $stats
    ]);
});

// Ajouter les routes d'authentification pour le mot de passe oublié
Route::post('/auth/forgot-password', [UserController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [UserController::class, 'resetPassword']);

// Profile image routes
Route::post('/users/{user}/profile-image', [UserController::class, 'updateProfileImage']);
Route::get('/users/{user}/profile-image', [UserController::class, 'getProfileImage']);
