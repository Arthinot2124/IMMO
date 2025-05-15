import React, { useState, useEffect } from 'react';
import { StarIcon, CheckCircleIcon } from 'lucide-react';
import apiService from '../services/apiService';
import authService from '../services/authService';

interface ApiResponse {
  status: string;
  data?: any;
  message?: string;
}

interface StarRatingProps {
  propertyId: number;
  initialRating?: number;
  userRating?: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isLightMode?: boolean;
}

interface UserRating {
  rating_id: number;
  property_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  propertyId,
  initialRating = 0,
  userRating = 0,
  onRatingChange,
  readOnly = false,
  size = 'md',
  isLightMode = true,
}) => {
  // État local
  const [hover, setHover] = useState(0);
  const [rating, setRating] = useState(0);
  const [canRate, setCanRate] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [ratingId, setRatingId] = useState<number | null>(null);
  
  // Styles basés sur les props
  const starSize = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' }[size];
  const filledColor = isLightMode ? 'text-yellow-400' : 'text-yellow-300';
  const emptyColor = isLightMode ? 'text-gray-300' : 'text-gray-600';
  const successColor = isLightMode ? 'text-green-500' : 'text-green-400';
  const errorColor = isLightMode ? 'text-red-500' : 'text-red-400';
  
  // Initialisation et vérification
  useEffect(() => {
    console.log(`[StarRating] Initialisation pour propriété #${propertyId}, userRating=${userRating}`);
    
    // Force réinitialisation complète de l'état au changement de propriété
    setRating(0);
    setHover(0);
    setCanRate(false);
    setError('');
    setSuccess(false);
    setIsUpdating(false);
    setRatingId(null);
    
    // Définir la note visible immédiatement si userRating est fourni
    if (userRating > 0) {
      console.log(`[StarRating] userRating fourni: ${userRating}`);
      setRating(userRating);
    }
    
    const checkIfUserCanRate = async () => {
      // Si le composant est en mode lecture seule, on arrête ici
      if (readOnly) {
        console.log(`[StarRating] Mode lecture seule activé`);
        return;
      }
      
      // Vérifier si l'utilisateur est connecté
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        console.log(`[StarRating] Utilisateur non connecté`);
        return;
      }
      
      // Vérifier si l'utilisateur est admin
      if (currentUser.role_id !== 1) {
        console.log(`[StarRating] Utilisateur non admin, notation impossible`);
        return;
      }
      
      try {
        // S'assurer que propertyId est converti en nombre pour comparaison stricte
        const propertyIdNum = Number(propertyId);
        console.log(`[StarRating] Vérification pour user_id=${currentUser.user_id}, property_id=${propertyIdNum}`);
        
        // Vérifier si l'utilisateur a déjà noté cette propriété spécifique
        const response = await apiService.get<ApiResponse>(`/users/${currentUser.user_id}/ratings?property_id=${propertyIdNum}`);
        console.log(`[StarRating] Réponse API vérification pour propriété ${propertyIdNum}:`, response.data);
        
        if (response.data.status === 'success') {
          // Vérifier explicitement les ratings pour cette propriété spécifique
          const propertyRatings = response.data.data ? response.data.data.filter(
            (r: any) => Number(r.property_id) === propertyIdNum
          ) : [];
          
          console.log(`[StarRating] Filtrage: trouvé ${propertyRatings.length} notes pour propriété ${propertyIdNum}`);
          
          if (propertyRatings.length > 0) {
            // L'utilisateur a déjà noté cette propriété spécifique
            const userNote = Number(propertyRatings[0].rating);
            const ratingId = Number(propertyRatings[0].rating_id);
            console.log(`[StarRating] Utilisateur a déjà noté la propriété #${propertyIdNum}: ${userNote} (id: ${ratingId})`);
            setRating(userNote);
            setRatingId(ratingId);
            // Pour les admins, ils peuvent toujours modifier leur note
            setCanRate(true);
            setIsUpdating(true);
          } else {
            // L'utilisateur peut noter cette propriété
            console.log(`[StarRating] Utilisateur peut noter la propriété #${propertyIdNum} - aucune note existante`);
            setCanRate(true);
            setIsUpdating(false);
            setRating(0); // S'assurer que rating est à 0
          }
        }
      } catch (error) {
        console.error(`[StarRating] Erreur vérification:`, error);
        setError('Erreur lors de la vérification');
      }
    };
    
    // Léger délai pour s'assurer que le state est propre avant de démarrer la vérification
    const timer = setTimeout(() => {
      checkIfUserCanRate();
      
      // Si un userRating est fourni, l'utiliser (cas où le parent connaît déjà la note)
      if (userRating > 0) {
        console.log(`[StarRating] userRating fourni: ${userRating}`);
        setRating(userRating);
        // Pour les admins, ils peuvent toujours modifier leur note existante
        if (!readOnly && authService.isAdmin()) {
          setCanRate(true);
          setIsUpdating(true);
        }
      } else {
        console.log(`[StarRating] Pas de userRating fourni ou userRating=0, vérification nécessaire`);
      }
    }, 100);
    
    // Nettoyage lors du démontage
    return () => {
      console.log(`[StarRating] Nettoyage pour propriété #${propertyId}`);
      clearTimeout(timer);
    };
  }, [propertyId, readOnly, userRating]);
  
  // Envoi d'une nouvelle note ou mise à jour d'une note existante
  const handleRating = async (newRating: number) => {
    // Si l'utilisateur ne peut pas noter, ne rien faire
    if (!canRate) {
      console.log(`[StarRating] Tentative de notation impossible: canRate=${canRate}`);
      return;
    }
    
    // Récupérer l'utilisateur connecté
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      setError('Vous devez être connecté pour noter');
      return;
    }
    
    // Vérifier si l'utilisateur est admin
    if (currentUser.role_id !== 1) {
      setError('Seuls les administrateurs peuvent noter');
      return;
    }
    
    try {
      // S'assurer que propertyId est un nombre
      const propertyIdNum = Number(propertyId);
      
      // Montrer un feedback immédiat à l'utilisateur
      setRating(newRating);
      
      // Ajouter un délai court avant l'envoi pour éviter les erreurs 429
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let response;
      
      if (isUpdating && ratingId) {
        // Mise à jour d'une note existante
        console.log(`[StarRating] Mise à jour note ${newRating} pour propriété #${propertyIdNum}, rating_id=${ratingId}`);
        response = await apiService.put<ApiResponse>(`/ratings/${ratingId}`, {
          property_id: propertyIdNum,
          user_id: currentUser.user_id,
          rating: newRating,
        });
      } else {
        // Création d'une nouvelle note
        console.log(`[StarRating] Création note ${newRating} pour propriété #${propertyIdNum}`);
        response = await apiService.post<ApiResponse>('/ratings', {
          property_id: propertyIdNum,
          user_id: currentUser.user_id,
          rating: newRating,
        });
      }
      
      console.log(`[StarRating] Réponse API ${isUpdating ? 'modification' : 'création'}:`, response.data);
      
      if (response.data.status === 'success') {
        // Mettre à jour l'état local
        setSuccess(true);
        
        // Si c'était une création, récupérer l'ID de la note créée
        if (!isUpdating && response.data.data && response.data.data.rating_id) {
          setRatingId(response.data.data.rating_id);
          setIsUpdating(true);
        }
        
        // Informer le parent du changement
        if (onRatingChange) {
          onRatingChange(newRating);
        }
        
        // Masquer le message de succès après 3 secondes
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        setError(response.data.message || 'Erreur lors de l\'enregistrement');
      }
    } catch (error: any) {
      console.error(`[StarRating] Erreur envoi:`, error);
      
      if (error.response?.status === 429) {
        setError('Trop de tentatives, veuillez patienter un moment');
        
        // Réessayer automatiquement après 3 secondes
        setTimeout(() => {
          setError('');
          handleRating(newRating);
        }, 3000);
        return;
      }
      
      setError(error.response?.data?.message || 'Erreur lors de l\'envoi');
      
      // Masquer le message d'erreur après 3 secondes
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };
  
  // Rendu des étoiles
  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => {
      // Déterminer si l'étoile doit être remplie
      const isFilled = (hover && canRate) ? 
        hover >= star : 
        rating >= star;
      
      return (
        <button
          key={star}
          type="button"
          disabled={!canRate}
          className={`${starSize} transition-colors duration-200 focus:outline-none mr-1.5 ${
            canRate ? 'cursor-pointer' : 'cursor-default'
          }`}
          onClick={() => handleRating(star)}
          onMouseEnter={() => canRate && setHover(star)}
          onMouseLeave={() => canRate && setHover(0)}
        >
          <StarIcon 
            className={`${
              isFilled ? filledColor : emptyColor
            } transition-all duration-200 ${
              canRate ? 'hover:scale-110' : ''
            }`}
            fill={isFilled ? 'currentColor' : 'none'}
            strokeWidth={1.5}
          />
        </button>
      );
    });
  };
  
  return (
    <div className="relative">
      <div className="flex items-center">
        {renderStars()}
      </div>
      
      {success && (
        <div className={`flex items-center ${successColor} text-xs animate-fade-in mt-1`}>
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          {isUpdating ? 'Note modifiée' : 'Note enregistrée'}
        </div>
      )}
      
      {error && (
        <div className={`${errorColor} text-xs animate-fade-in mt-1`}>
          {error}
        </div>
      )}
      
      {canRate && (
        <div className="absolute -top-8 left-0 right-0 text-center text-xs bg-gray-800 text-white py-1 px-2 rounded opacity-90 z-10 hidden group-hover:block">
          {isUpdating ? 'Cliquez pour modifier' : 'Cliquez pour noter'}
        </div>
      )}
    </div>
  );
};

export default StarRating; 