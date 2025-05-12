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
            console.log(`[StarRating] Utilisateur a déjà noté la propriété #${propertyIdNum}: ${userNote}`);
            setRating(userNote);
            setCanRate(false);
          } else {
            // L'utilisateur peut noter cette propriété
            console.log(`[StarRating] Utilisateur peut noter la propriété #${propertyIdNum} - aucune note existante`);
            setCanRate(true);
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
        setCanRate(false);
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
  
  // Envoi d'une nouvelle note
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
    
    try {
      // S'assurer que propertyId est un nombre
      const propertyIdNum = Number(propertyId);
      console.log(`[StarRating] Envoi note ${newRating} pour propriété #${propertyIdNum}`);
      
      // Appel API pour enregistrer la note
      const response = await apiService.post<ApiResponse>('/ratings', {
        property_id: propertyIdNum,
        user_id: currentUser.user_id,
        rating: newRating,
      });
      
      console.log(`[StarRating] Réponse API envoi:`, response.data);
      
      if (response.data.status === 'success') {
        // Mettre à jour l'état local
        setRating(newRating);
        setCanRate(false);
        setSuccess(true);
        
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
      setError(error.response?.data?.message || 'Erreur lors de l\'envoi');
      
      // Masquer le message d'erreur après 3 secondes
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };
  
  // Rendu des étoiles
  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
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
            (hover || rating) >= star ? filledColor : emptyColor
          } transition-all duration-200 ${
            canRate ? 'hover:scale-110' : ''
          }`}
          fill={(hover || rating) >= star ? 'currentColor' : 'none'}
          strokeWidth={1.5}
        />
      </button>
    ));
  };
  
  return (
    <div className="relative">
      <div className="flex items-center">
        {renderStars()}
        
        {success && (
          <span className={`ml-2 flex items-center ${successColor} text-xs animate-fade-in`}>
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Note enregistrée
          </span>
        )}
        
        {error && (
          <span className={`ml-2 ${errorColor} text-xs animate-fade-in`}>
            {error}
          </span>
        )}
      </div>
      
      {canRate && (
        <div className="absolute -top-8 left-0 right-0 text-center text-xs bg-gray-800 text-white py-1 px-2 rounded opacity-90 z-10 hidden group-hover:block">
          Cliquez pour noter
        </div>
      )}
    </div>
  );
};

export default StarRating; 