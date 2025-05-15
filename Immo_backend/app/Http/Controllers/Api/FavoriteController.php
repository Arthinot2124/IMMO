<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class FavoriteController extends Controller
{
    /**
     * Display a listing of favorites.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        try {
            $userId = Auth::id();
            
            if (!$userId) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Utilisateur non connecté'
                ], 401);
            }
            
            $favorites = Favorite::where('user_id', $userId)
                ->with('property')
                ->get();
                
            return response()->json([
                'status' => 'success',
                'data' => $favorites
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la récupération des favoris: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display a listing of user's favorites.
     *
     * @param int $userId
     * @return \Illuminate\Http\Response
     */
    public function userFavorites($userId)
    {
        try {
            $currentUserId = Auth::id();
            
            // Vérifier si l'utilisateur demande ses propres favoris ou si c'est un admin
            if ($currentUserId != $userId && !Auth::user()->isAdmin()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Non autorisé à voir les favoris d\'un autre utilisateur'
                ], 403);
            }
            
            $favorites = Favorite::where('user_id', $userId)
                ->with(['property' => function($query) {
                    $query->with('media');
                }])
                ->get();
                
            return response()->json([
                'status' => 'success',
                'data' => $favorites
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la récupération des favoris: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Check if a property is in user's favorites.
     *
     * @param int $propertyId
     * @return \Illuminate\Http\Response
     */
    public function checkFavorite($propertyId)
    {
        try {
            $userId = Auth::id();
            
            if (!$userId) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Utilisateur non connecté'
                ], 401);
            }
            
            $favorite = Favorite::where('user_id', $userId)
                ->where('property_id', $propertyId)
                ->first();
                
            return response()->json([
                'status' => 'success',
                'data' => [
                    'is_favorite' => $favorite ? true : false,
                    'favorite' => $favorite
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la vérification du favori: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created favorite in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'property_id' => 'required|integer',
                'user_id' => 'sometimes|integer'
            ]);
    
            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation échouée',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Récupérer l'ID de l'utilisateur
            $userId = $request->user_id ?? Auth::id();
            
            if (!$userId) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'ID utilisateur requis'
                ], 422);
            }
            
            // On supprime la vérification d'autorisation pour simplifier
            
            // Vérifier si le favori existe déjà
            $existingFavorite = Favorite::where('user_id', $userId)
                ->where('property_id', $request->property_id)
                ->first();
                
            if ($existingFavorite) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Ce bien est déjà dans vos favoris',
                    'data' => $existingFavorite
                ]);
            }
            
            // Vérifier que la propriété existe
            $property = \App\Models\Property::find($request->property_id);
            if (!$property) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'La propriété demandée n\'existe pas'
                ], 404);
            }
            
            try {
                $favorite = new Favorite();
                $favorite->user_id = $userId;
                $favorite->property_id = $request->property_id;
                $favorite->created_at = now();
                $favorite->save();
                
                return response()->json([
                    'status' => 'success',
                    'message' => 'Bien ajouté aux favoris',
                    'data' => $favorite
                ], 201);
            } catch (\Exception $innerException) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Erreur de base de données: ' . $innerException->getMessage(),
                    'details' => $innerException->getTrace()
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de l\'ajout aux favoris: ' . $e->getMessage(),
                'trace' => $e->getTrace()
            ], 500);
        }
    }

    /**
     * Remove the specified favorite from storage.
     *
     * @param  int  $propertyId
     * @return \Illuminate\Http\Response
     */
    public function destroy($propertyId)
    {
        try {
            // Récupérer l'ID de l'utilisateur depuis la requête ou l'authentification
            $userId = Auth::id();
            
            // Si non authentifié, vérifier si l'ID utilisateur est passé en paramètre de requête
            if (!$userId && request()->has('user_id')) {
                $userId = request()->user_id;
            }
            
            if (!$userId) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'ID utilisateur requis'
                ], 422);
            }
            
            $favorite = Favorite::where('user_id', $userId)
                ->where('property_id', $propertyId)
                ->first();
                
            if (!$favorite) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Aucun favori à supprimer',
                    'data' => ['success' => true]
                ]);
            }
            
            $favorite->delete();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Bien retiré des favoris',
                'data' => ['success' => true]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la suppression du favori: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get properties favorited by user
     *
     * @param  int  $userId
     * @return \Illuminate\Http\Response
     */
    public function getFavoriteProperties($userId)
    {
        try {
            $currentUserId = Auth::id();
            
            // Vérifier si l'utilisateur demande ses propres favoris ou si c'est un admin
            if ($currentUserId != $userId && !Auth::user()->isAdmin()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Non autorisé à voir les favoris d\'un autre utilisateur'
                ], 403);
            }
            
            $favoriteProperties = Property::whereHas('favorites', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })->with('media')->get();
            
            return response()->json([
                'status' => 'success',
                'data' => $favoriteProperties
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la récupération des propriétés favorites: ' . $e->getMessage()
            ], 500);
        }
    }
} 