<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PropertyController;
use App\Http\Controllers\Api\PropertyMediaController;
use App\Http\Controllers\Api\PropertyRequestController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\RatingController;
use App\Http\Controllers\Api\AdCampaignController;

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
Route::get('/properties/{property}/media/{media}', [PropertyMediaController::class, 'show']);
Route::post('/properties/{property}/media/{media}', [PropertyMediaController::class, 'update']);
Route::delete('/properties/{property}/media/{media}', [PropertyMediaController::class, 'destroy']);

// Property Requests
Route::apiResource('property-requests', PropertyRequestController::class);
Route::get('/users/{user}/property-requests', [PropertyRequestController::class, 'userRequests']);

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

// Ad Campaigns
Route::apiResource('ad-campaigns', AdCampaignController::class);
Route::get('/users/{admin}/ad-campaigns', [AdCampaignController::class, 'adminCampaigns']);
Route::get('/ad-campaigns/active', [AdCampaignController::class, 'activeCampaigns']);

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
        'pending_appointments' => \App\Models\Appointment::where('confirmation_status', 'En attente')->count(),
        'pending_property_requests' => \App\Models\PropertyRequest::where('status', 'En attente')->count(),
        'recent_orders' => \App\Models\Order::with(['user', 'property'])->orderBy('order_date', 'desc')->take(5)->get(),
        'recent_properties' => \App\Models\Property::orderBy('created_at', 'desc')->take(5)->get(),
    ];
    
    return response()->json([
        'status' => 'success',
        'data' => $stats
    ]);
});
