<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Mail\ResetPasswordMail;

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
                'phone' => 'nullable|string|max:20|regex:/^\d+$/|unique:users',
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
                'phone' => 'nullable|string|max:20|regex:/^\d+$/|unique:users,phone,' . $user->user_id . ',user_id',
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

    /**
     * Request password reset - send reset link/code
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string',
        ]);

        $identifier = $request->input('identifier');
        $user = null;

        // Vérifier si l'identifier est un email ou un téléphone
        if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
            $user = User::where('email', $identifier)->first();
        } else {
            // Supposer que c'est un numéro de téléphone
            $user = User::where('phone', $identifier)->first();
        }

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Aucun compte trouvé avec cet identifiant.'
            ], Response::HTTP_NOT_FOUND);
        }

        // Générer un token unique
        $token = Str::random(64);
        $expiresAt = now()->addHours(1); // Expire dans 1 heure

        // Stocker le token dans la base de données
        DB::table('password_resets')->updateOrInsert(
            ['email' => $user->email ?? $user->phone],
            [
                'token' => Hash::make($token),
                'created_at' => now(),
                'expires_at' => $expiresAt
            ]
        );

        // Construire le lien de réinitialisation
        $frontendUrl = config('app.frontend_url') ?: 'http://192.168.8.192:5173';
        $resetLink = $frontendUrl . '/login?token=' . $token . '&email=' . urlencode($user->email ?? $user->phone);

        // Envoyer l'email
        try {
            \Log::info('Tentative d\'envoi d\'email de réinitialisation', [
                'to' => $user->email,
                'resetLink' => $resetLink
            ]);

            Mail::to($user->email)
                ->send(new ResetPasswordMail($resetLink));
            
            \Log::info('Email de réinitialisation envoyé avec succès', [
                'to' => $user->email
            ]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Un lien de réinitialisation a été envoyé à votre adresse email.'
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur lors de l\'envoi de l\'email de réinitialisation', [
                'error' => $e->getMessage(),
                'to' => $user->email,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Reset password with token
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|string',
            'password' => 'required|string|min:6',
        ]);

        $user = null;

        // Vérifier si l'email est valide
        if (filter_var($request->email, FILTER_VALIDATE_EMAIL)) {
            $user = User::where('email', $request->email)->first();
        } else {
            // Supposer que c'est un numéro de téléphone
            $user = User::where('phone', $request->email)->first();
        }

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Aucun compte trouvé avec cet identifiant.'
            ], Response::HTTP_NOT_FOUND);
        }

        // Récupérer l'entrée de réinitialisation de mot de passe
        $resetEntry = DB::table('password_resets')
            ->where('email', $user->email ?? $user->phone)
            ->first();

        if (!$resetEntry) {
            return response()->json([
                'status' => 'error',
                'message' => 'Aucune demande de réinitialisation trouvée.'
            ], Response::HTTP_NOT_FOUND);
        }

        // Vérifier si le token a expiré
        if (now()->gt(\Carbon\Carbon::parse($resetEntry->expires_at))) {
            return response()->json([
                'status' => 'error',
                'message' => 'Le lien de réinitialisation a expiré. Veuillez faire une nouvelle demande.'
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Vérifier le token
        if (!Hash::check($request->token, $resetEntry->token)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lien de réinitialisation invalide.'
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Mettre à jour le mot de passe
        $user->password_hash = Hash::make($request->password);
        $user->save();

        // Supprimer l'entrée de réinitialisation
        DB::table('password_resets')
            ->where('email', $user->email ?? $user->phone)
            ->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Mot de passe réinitialisé avec succès.'
        ]);
    }

    /**
     * Update user profile image
     */
    public function updateProfileImage(Request $request, User $user)
    {
        try {
            $request->validate([
                'profile_image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            if ($request->hasFile('profile_image')) {
                // Supprimer l'ancienne image si elle existe
                if ($user->profile_image) {
                    $oldImagePath = public_path('storage/' . $user->profile_image);
                    if (file_exists($oldImagePath)) {
                        unlink($oldImagePath);
                    }
                }

                // Sauvegarder la nouvelle image
                $image = $request->file('profile_image');
                $imageName = 'profile_' . $user->user_id . '_' . time() . '.' . $image->getClientOriginalExtension();
                $image->storeAs('public/profile_images', $imageName);

                // Mettre à jour le chemin de l'image dans la base de données
                $user->update([
                    'profile_image' => 'profile_images/' . $imageName
                ]);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Profile image updated successfully',
                    'data' => [
                        'profile_image' => asset('storage/' . $user->profile_image)
                    ]
                ]);
            }

            return response()->json([
                'status' => 'error',
                'message' => 'No image file provided'
            ], Response::HTTP_BAD_REQUEST);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get user profile image
     */
    public function getProfileImage(User $user)
    {
        if ($user->profile_image) {
            return response()->json([
                'status' => 'success',
                'data' => [
                    'profile_image' => asset('storage/' . $user->profile_image)
                ]
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'No profile image found'
        ], Response::HTTP_NOT_FOUND);
    }
}
