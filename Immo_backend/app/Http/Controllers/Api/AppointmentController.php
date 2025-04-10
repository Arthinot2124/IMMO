<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AppointmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Appointment::with(['property', 'user']);

        // Filter by confirmation status
        if ($request->has('confirmation_status')) {
            $query->where('confirmation_status', $request->confirmation_status);
        }

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by property
        if ($request->has('property_id')) {
            $query->where('property_id', $request->property_id);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->where('appointment_date', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->where('appointment_date', '<=', $request->end_date);
        }

        $appointments = $query->orderBy('appointment_date', 'asc')->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => $appointments
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
            'appointment_date' => 'required|date|after:now',
        ]);

        // Check if property is available for appointments
        $property = Property::findOrFail($validated['property_id']);
        if ($property->status !== 'Disponible' && $property->status !== 'Réservé') {
            return response()->json([
                'status' => 'error',
                'message' => 'Property is not available for appointments'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Check if there's already an appointment at the same time
        $existingAppointment = Appointment::where('property_id', $validated['property_id'])
            ->where('appointment_date', $validated['appointment_date'])
            ->where('confirmation_status', '!=', 'Annulé')
            ->exists();

        if ($existingAppointment) {
            return response()->json([
                'status' => 'error',
                'message' => 'There is already an appointment scheduled at this time'
            ], Response::HTTP_BAD_REQUEST);
        }

        $appointment = Appointment::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Appointment created successfully',
            'data' => $appointment
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(Appointment $appointment)
    {
        $appointment->load(['property', 'user']);
        
        return response()->json([
            'status' => 'success',
            'data' => $appointment
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'appointment_date' => 'sometimes|required|date|after:now',
            'confirmation_status' => 'sometimes|required|in:En attente,Confirmé,Annulé',
        ]);

        // If changing the date, check for conflicts
        if (isset($validated['appointment_date']) && $validated['appointment_date'] != $appointment->appointment_date) {
            $existingAppointment = Appointment::where('property_id', $appointment->property_id)
                ->where('appointment_date', $validated['appointment_date'])
                ->where('confirmation_status', '!=', 'Annulé')
                ->where('appointment_id', '!=', $appointment->appointment_id)
                ->exists();

            if ($existingAppointment) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'There is already an appointment scheduled at this time'
                ], Response::HTTP_BAD_REQUEST);
            }
        }

        $appointment->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Appointment updated successfully',
            'data' => $appointment
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Appointment $appointment)
    {
        $appointment->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Appointment deleted successfully'
        ]);
    }

    /**
     * Get appointments for a specific user
     */
    public function userAppointments(User $user)
    {
        $appointments = $user->appointments()->with('property')->orderBy('appointment_date', 'asc')->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $appointments
        ]);
    }

    /**
     * Get appointments for a specific property
     */
    public function propertyAppointments(Property $property)
    {
        $appointments = $property->appointments()->with('user')->orderBy('appointment_date', 'asc')->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $appointments
        ]);
    }
}
