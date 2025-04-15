<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::with('role')->get();
        return response()->json([
            'status' => 'success',
            'data' => $users
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'role_id' => 'sometimes|exists:roles,role_id',
                'full_name' => 'required|string|max:100',
                'email' => 'nullable|email|unique:users',
                'phone' => 'nullable|string|max:20|regex:/^\d+$/',
                'address' => 'nullable|string|max:255',
                'password' => 'required|string',
            ]);

            // Vérifier qu'au moins un des deux (email ou phone) est fourni
            if (empty($validated['email']) && empty($validated['phone'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Un email ou un numéro de téléphone est requis'
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            // Définir le rôle client (2) par défaut si non spécifié
            if (!isset($validated['role_id'])) {
                $validated['role_id'] = 2; // Rôle client par défaut
            }

            // Remplacer password par password_hash
            $validated['password_hash'] = Hash::make($validated['password']);
            unset($validated['password']);

            $user = User::create($validated);
            $user->load('role');  // Charger le rôle pour la réponse

            return response()->json([
                'status' => 'success',
                'message' => 'User created successfully',
                'data' => $user
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        $user->load('role');
        return response()->json([
            'status' => 'success',
            'data' => $user
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        try {
            $validated = $request->validate([
                'role_id' => 'sometimes|required|exists:roles,role_id',
                'full_name' => 'sometimes|required|string|max:100',
                'email' => 'nullable|email|unique:users,email,' . $user->user_id . ',user_id',
                'phone' => 'nullable|string|max:20|regex:/^\d+$/',
                'address' => 'nullable|string|max:255',
                'password' => 'sometimes|required|string',
            ]);

            if (isset($validated['password'])) {
                $validated['password_hash'] = Hash::make($validated['password']);
                unset($validated['password']);
            }

            $user->update($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'User updated successfully',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'User deleted successfully'
        ]);
    }

    /**
     * Login user - with email or phone number
     */
    public function login(Request $request)
    {
        // Validate that at least one of email or phone is provided
        $request->validate([
            'password' => 'required|string',
        ]);

        // Check if login is using email or phone
        $credentials = [];
        $user = null;

        if ($request->has('email')) {
            $request->validate(['email' => 'required|email']);
            $user = User::where('email', $request->email)->first();
            $credentials['type'] = 'email';
        } elseif ($request->has('phone')) {
            $request->validate(['phone' => 'required|string|regex:/^\d+$/']);
            $user = User::where('phone', $request->phone)->first();
            $credentials['type'] = 'phone';
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Email or phone number is required.'
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (!$user || !Hash::check($request->password, $user->password_hash)) {
            return response()->json([
                'status' => 'error',
                'message' => 'The provided credentials are incorrect.'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Load user role for frontend use
        $user->load('role');

        // Session login simplifié - pas de token
        return response()->json([
            'status' => 'success',
            'user' => $user,
            'message' => 'Login successful'
        ]);
    }

    /**
     * Logout user - simplifié sans token
     */
    public function logout(Request $request)
    {
        // Pas besoin de gérer les tokens ici
        return response()->json([
            'status' => 'success',
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Get User sans authentification
     */
    public function profile(Request $request)
    {
        // Méthode simplifiée temporairement - retourne un message indiquant que c'est temporaire
        // Normalement, il faudrait $request->user(), mais sans authentification, on ne peut pas l'utiliser
        return response()->json([
            'status' => 'success',
            'message' => 'Authentication désactivée temporairement - Cette route retournerait normalement les données de l\'utilisateur connecté'
        ]);
    }
}
