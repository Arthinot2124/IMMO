import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HomeIcon, SettingsIcon, HeartIcon, TrashIcon, AlertCircleIcon, StarIcon } from "lucide-react";
import NotificationBadge from "../../components/NotificationBadge";
import apiService from "../../services/apiService";
import authService from "../../services/authService";
import { getMediaUrl } from "../../config/api";

// Types pour les favoris
interface PropertyMedia {
  media_id: number;
  property_id: number;
  media_type: string;
  media_url: string;
}

interface Favorite {
  favorite_id: number;
  property_id: number;
  user_id: number;
  created_at: string;
  property: {
    property_id: number;
    title: string;
    description: string;
    price: number;
    surface: number;
    location: string;
    property_type: string;
    transaction_type: string;
    category: string;
    status: string;
    media?: PropertyMedia[];
    rating?: number;
  };
}

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export const Favorites = (): JSX.Element => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [error, setError] = useState<string | null>(null);
  const [deletingFavorite, setDeletingFavorite] = useState<number | null>(null);

  // Mode sombre/clair (en fonction de la configuration utilisateur)
  const [isLightMode, setIsLightMode] = useState(() => {
    // Récupérer la préférence depuis localStorage au montage (ou false par défaut)
    const savedMode = localStorage.getItem('isLightMode');
    return savedMode !== null ? savedMode === 'true' : false;
  });

  // Couleurs qui changent en fonction du mode
  const accentColor = isLightMode ? "#0150BC" : "#59e0c5";
  const bgColor = isLightMode ? "bg-white" : "bg-[#0f172a]";
  const cardBgColor = isLightMode ? "bg-[#F8FAFC]" : "bg-[#1E2B47]";
  const textColor = isLightMode ? "text-[#0150BC]" : "text-[#59e0c5]";
  const textPrimaryColor = isLightMode ? "text-[#1E293B]" : "text-white";
  const textSecondaryColor = isLightMode ? "text-gray-700" : "text-gray-300";
  const buttonPrimaryBg = isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]";
  const buttonPrimaryText = isLightMode ? "text-white" : "text-[#0f172a]";
  const buttonSecondaryBg = isLightMode ? "bg-[#EFF6FF]" : "bg-[#1E2B47]";
  const cardBorder = isLightMode ? "border border-[#0150BC]/30" : "";

  // Mettre à jour le mode quand il change dans localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const savedMode = localStorage.getItem('isLightMode');
      if (savedMode !== null) {
        setIsLightMode(savedMode === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Vérifier régulièrement si le mode a changé
    const interval = setInterval(() => {
      const savedMode = localStorage.getItem('isLightMode');
      if (savedMode !== null && (savedMode === 'true') !== isLightMode) {
        setIsLightMode(savedMode === 'true');
      }
    }, 1000); // Vérifier chaque seconde

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [isLightMode]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  };

  // Chargement des favoris au montage du composant
  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      setError(null);
      
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        setError("Veuillez vous connecter pour voir vos favoris");
        setLoading(false);
        return;
      }
      
      try {
        // D'abord vérifier dans localStorage
        const storedFavorites = localStorage.getItem('userFavorites');
        if (storedFavorites) {
          const favoriteIds = JSON.parse(storedFavorites) as number[];
          
          if (favoriteIds.length === 0) {
            setFavorites([]);
            setLoading(false);
            return;
          }
          
          // Charger les propriétés correspondantes
          const favoriteProperties: Favorite[] = [];
          
          for (const propId of favoriteIds) {
            try {
              const response = await apiService.get<ApiResponse<any>>(`/properties/${propId}`);
              
              if (response.data && response.data.status === 'success' && response.data.data) {
                const property = response.data.data;
                
                // Créer un objet Favorite avec la structure attendue
                favoriteProperties.push({
                  favorite_id: propId, // Utiliser l'ID de propriété comme ID temporaire
                  property_id: propId,
                  user_id: currentUser.user_id,
                  created_at: new Date().toISOString(),
                  property: {
                    property_id: property.property_id,
                    title: property.title,
                    description: property.description,
                    price: property.price,
                    surface: property.surface,
                    location: property.location,
                    property_type: property.property_type || '',
                    transaction_type: property.transaction_type || '',
                    category: property.category || 'LITE',
                    status: property.status || 'Disponible',
                    media: property.media || [],
                    rating: property.rating || 0
                  }
                });
              }
            } catch (err) {
              console.error(`[Favorites] Erreur lors du chargement de la propriété #${propId}:`, err);
            }
          }
          
          setFavorites(favoriteProperties);
          console.log("[Favorites] Favoris chargés depuis localStorage:", favoriteProperties);
          setLoading(false);
          return;
        }
        
        // Essayer l'API si localStorage est vide
        try {
          const response = await apiService.get<ApiResponse<Favorite[]>>(`/users/${currentUser.user_id}/favorites`);
          
          if (response.data && response.data.status === 'success') {
            console.log("[Favorites] Favoris chargés depuis l'API:", response.data.data);
            setFavorites(response.data.data);
            
            // Sauvegarder les IDs dans localStorage pour la prochaine fois
            const ids = response.data.data.map(fav => fav.property.property_id);
            localStorage.setItem('userFavorites', JSON.stringify(ids));
          } else {
            throw new Error(response.data?.message || "Erreur lors du chargement des favoris");
          }
        } catch (apiError: any) {
          console.warn("[Favorites] API de favoris non disponible:", apiError.message);
          setFavorites([]);
        }
      } catch (error: any) {
        console.error("[Favorites] Erreur lors du chargement des favoris:", error);
        setError(error.message || "Erreur lors du chargement des favoris");
      } finally {
        setLoading(false);
      }
    };
    
    fetchFavorites();
  }, []);
  
  // Fonction pour supprimer un favori
  const removeFavorite = async (propertyId: number) => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;
    
    setDeletingFavorite(propertyId);
    
    try {
      // D'abord supprimer du localStorage
      const storedFavorites = localStorage.getItem('userFavorites');
      if (storedFavorites) {
        const favoriteIds = JSON.parse(storedFavorites) as number[];
        const updatedFavorites = favoriteIds.filter(id => id !== propertyId);
        localStorage.setItem('userFavorites', JSON.stringify(updatedFavorites));
      }
      
      // Mettre à jour l'état local
      setFavorites(favorites.filter(fav => fav.property.property_id !== propertyId));
      console.log("[Favorites] Favori supprimé avec succès (localStorage)");
      
      // Essayer également avec l'API
      try {
        const response = await apiService.delete<ApiResponse<{ success: boolean }>>(`/favorites/${propertyId}?user_id=${currentUser.user_id}`);
        if (response.data && response.data.status === 'success') {
          console.log("[Favorites] Favori supprimé avec succès (API)");
        }
      } catch (apiError) {
        console.warn("[Favorites] Impossible de supprimer le favori via l'API");
      }
    } catch (error: any) {
      console.error("[Favorites] Erreur lors de la suppression du favori:", error);
    } finally {
      setDeletingFavorite(null);
    }
  };
  
  // Fonction pour obtenir l'URL de l'image principale d'un bien
  const getMainImageUrl = (favorite: Favorite): string => {
    if (favorite.property.media && favorite.property.media.length > 0) {
      const photos = favorite.property.media.filter(m => m.media_type === 'Photo');
      if (photos.length > 0) {
        return getMediaUrl(photos[0].media_url);
      }
    }
    
    // Images par défaut selon la catégorie
    if (favorite.property.category === "LITE") {
      return "/public_Trano/calque-3.png";
    } else if (favorite.property.category === "PREMIUM") {
      return "/public_Trano/maison-01.png";
    }
    
    return "/public_Trano/maison-01.png";
  };
  
  // Formater le prix
  const formatPrice = (price?: number): string => {
    if (!price) return "Prix non spécifié";
    return new Intl.NumberFormat('fr-FR').format(price) + " Ar";
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`${bgColor} min-h-screen relative`}
    >
      <div 
        className="fixed inset-0 opacity-50 z-0" 
        style={{ 
          backgroundImage: `url(${isLightMode ? '/public_Accueil_Sombre/blie-pattern2.jpeg' : '/public_Accueil_Sombre/blie-pattern.png'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'fixed',
          transition: 'background-image 0.5s ease-in-out'
        }}
      ></div>
      <div className="max-w-[1440px] mx-auto px-4 xs:px-6 sm:px-8 md:px-12 lg:px-16 pt-4 xs:pt-6 sm:pt-8 md:pt-10 lg:pt-12 pb-16 relative z-10">
        {/* Navigation Bar */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center py-2 xs:py-4 mb-8 xs:mb-10"
        >
          <div className="flex gap-2 xs:gap-4">
            <HomeIcon 
              className={`w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 ${textColor} cursor-pointer hover:opacity-80 transition-colors`}
              onClick={() => navigate('/home')}
            />
            <NotificationBadge size="lg" accentColor={accentColor} />
            <SettingsIcon 
              className={`w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 ${textColor} cursor-pointer hover:opacity-80 transition-colors`}
              onClick={() => navigate('/parametres')}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md ${viewMode === "grid" ? buttonPrimaryBg + ' ' + buttonPrimaryText : buttonSecondaryBg + ' ' + textColor}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md ${viewMode === "list" ? buttonPrimaryBg + ' ' + buttonPrimaryText : buttonSecondaryBg + ' ' + textColor}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </button>
          </div>
        </motion.header>

        {/* Favorites Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <HeartIcon className={`w-6 h-6 text-red-${isLightMode ? '600' : '400'} fill-red-${isLightMode ? '600' : '400'}`} />
            <h1 className={`text-xl sm:text-2xl font-bold ${textPrimaryColor}`}>Mes favoris</h1>
          </div>
          <p className={textSecondaryColor}>Retrouvez ici tous les biens immobiliers que vous avez ajoutés à vos favoris.</p>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className={`w-12 h-12 border-4 border-${accentColor.replace('#', '')} border-t-transparent rounded-full animate-spin`}></div>
          </div>
        ) : error ? (
          // Error State
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`${isLightMode ? "bg-red-50" : "bg-red-950/20"} ${isLightMode ? "text-red-600" : "text-red-400"} p-6 rounded-xl text-center`}
          >
            <AlertCircleIcon className="w-16 h-16 mx-auto mb-4" />
            <p className="mb-4">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className={`${buttonPrimaryBg} ${buttonPrimaryText} px-6 py-2 rounded-lg font-medium`}
            >
              Se connecter
            </button>
          </motion.div>
        ) : favorites.length === 0 ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`${cardBgColor} rounded-2xl p-6 sm:p-10 text-center ${cardBorder}`}
          >
            <HeartIcon className={`w-16 h-16 ${isLightMode ? 'text-gray-400' : 'text-gray-500'} mx-auto mb-4`} />
            <h2 className={`text-xl font-semibold ${textPrimaryColor} mb-2`}>Vous n'avez pas de favoris</h2>
            <p className={`${textSecondaryColor} mb-6`}>Parcourez nos propriétés et ajoutez-les à vos favoris pour les retrouver ici.</p>
            <button
              onClick={() => navigate('/trano')}
              className={`${buttonPrimaryBg} ${buttonPrimaryText} px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-colors`}
            >
              Parcourir les propriétés
            </button>
          </motion.div>
        ) : (
          // Favorites List
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}
          >
            {favorites.map((favorite) => (
              <motion.div
                key={favorite.favorite_id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className={`${cardBgColor} rounded-lg overflow-hidden ${viewMode === "list" ? "flex" : ""} ${cardBorder}`}
              >
                <div 
                  className={`${viewMode === "grid" ? "h-48" : "w-[120px] flex-shrink-0"} relative cursor-pointer`}
                  onClick={() => navigate(`/property/${favorite.property.property_id}`)}
                >
                  <img
                    src={getMainImageUrl(favorite)}
                    alt={favorite.property.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavorite(favorite.property.property_id);
                    }}
                    className="absolute top-2 right-2 p-2 rounded-full bg-[#0f172a]/70 hover:bg-[#0f172a]"
                    disabled={deletingFavorite === favorite.property.property_id}
                  >
                    {deletingFavorite === favorite.property.property_id ? (
                      <div className={`w-4 h-4 border-2 border-${accentColor.replace('#', '')} border-t-transparent rounded-full animate-spin`}></div>
                    ) : (
                      <TrashIcon className="w-4 h-4 text-red-400" />
                    )}
                  </button>
                </div>
                <div className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                  <div className="flex justify-between items-start">
                    <h3 
                      className={`${textColor} font-semibold mb-1 hover:underline cursor-pointer`}
                      onClick={() => navigate(`/property/${favorite.property.property_id}`)}
                    >
                      {favorite.property.title}
                    </h3>
                    <div className="flex items-center">
                      <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className={`${textSecondaryColor} text-xs`}>{favorite.property.rating || '-'}</span>
                    </div>
                  </div>
                  <p className={`${textPrimaryColor} font-medium mb-2`}>{formatPrice(favorite.property.price)}</p>
                  <p className={`${textSecondaryColor} text-sm mb-3`}>{favorite.property.location || "Emplacement non spécifié"}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {favorite.property.property_type && (
                      <span className={`text-xs ${isLightMode ? "bg-[#EFF6FF]" : "bg-[#0f172a]"} ${textSecondaryColor} px-2 py-1 rounded`}>
                        {favorite.property.property_type}
                      </span>
                    )}
                    {favorite.property.transaction_type && (
                      <span className={`text-xs ${isLightMode ? "bg-[#EFF6FF]" : "bg-[#0f172a]"} ${textSecondaryColor} px-2 py-1 rounded`}>
                        {favorite.property.transaction_type}
                      </span>
                    )}
                    <span className={`text-xs ${isLightMode ? "bg-[#EFF6FF]" : "bg-[#0f172a]"} ${textSecondaryColor} px-2 py-1 rounded`}>
                      {favorite.property.surface || "?"} m²
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Back to Listings Button */}
        {!loading && !error && favorites.length > 0 && (
          <div className="text-center mt-10">
            <button
              onClick={() => navigate('/trano')}
              className={`${textColor} hover:underline transition-colors inline-flex items-center gap-2`}
            >
              <span>Voir plus de propriétés</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Favorites; 