<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Property;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Order::with(['property', 'user']);

        // Filter by order type
        if ($request->has('order_type')) {
            $query->where('order_type', $request->order_type);
        }

        // Filter by order status
        if ($request->has('order_status')) {
            $query->where('order_status', $request->order_status);
        }

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by property
        if ($request->has('property_id')) {
            $query->where('property_id', $request->property_id);
        }

        $orders = $query->orderBy('order_date', 'desc')->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => $orders
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
            'order_type' => 'required|in:Achat,Location',
        ]);

        // Check if property is available
        $property = Property::findOrFail($validated['property_id']);
        if ($property->status !== 'Disponible') {
            return response()->json([
                'status' => 'error',
                'message' => 'Property is not available'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Create the order
        $order = Order::create($validated);

        // Update property status
        if ($validated['order_type'] === 'Achat') {
            $property->status = 'Réservé';
        } else {
            $property->status = 'Réservé';
        }
        $property->save();

        // Récupérer les informations de l'utilisateur qui a fait la commande
        $user = User::findOrFail($validated['user_id']);
        
        // Créer une notification pour tous les administrateurs
        $admins = User::whereHas('role', function($query) {
            $query->where('role_name', 'Admin');
        })->get();
        
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->user_id,
                'message' => "Nouvelle commande (#" . $order->order_id . ") de " . $user->full_name . " pour " . $property->title,
                'is_read' => false
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Order created successfully',
            'data' => $order
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        $order->load(['property', 'user']);
        
        return response()->json([
            'status' => 'success',
            'data' => $order
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'order_status' => 'required|in:En attente,Confirmé,Annulé,Terminé',
        ]);

        $oldStatus = $order->order_status;
        $order->update($validated);

        // Update property status based on order status
        $property = Property::findOrFail($order->property_id);
        
        if ($validated['order_status'] === 'Annulé' && $oldStatus !== 'Annulé') {
            // If order is cancelled, set property back to available
            $property->status = 'Disponible';
        } elseif ($validated['order_status'] === 'Confirmé' && $oldStatus !== 'Confirmé') {
            // When an order is confirmed, keep the property as reserved
            $property->status = 'Réservé';
        } elseif ($validated['order_status'] === 'Terminé' && $oldStatus !== 'Terminé') {
            // If order is completed, set property status based on order type
            if ($order->order_type === 'Achat') {
                $property->status = 'Vendu';
            } else {
                $property->status = 'Loué';
            }
        }
        
        $property->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Order updated successfully',
            'data' => $order
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        // If order is active, set property back to available
        if ($order->order_status !== 'Annulé' && $order->order_status !== 'Terminé') {
            $property = Property::findOrFail($order->property_id);
            $property->status = 'Disponible';
            $property->save();
        }

        $order->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Order deleted successfully'
        ]);
    }

    /**
     * Get orders for a specific user
     */
    public function userOrders(User $user)
    {
        $orders = $user->orders()->with('property')->orderBy('order_date', 'desc')->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $orders
        ]);
    }

    /**
     * Get orders for a specific property
     */
    public function propertyOrders(Property $property)
    {
        $orders = $property->orders()->with('user')->orderBy('order_date', 'desc')->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $orders
        ]);
    }
}
