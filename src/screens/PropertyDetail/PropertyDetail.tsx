import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { HomeIcon, SettingsIcon } from "lucide-react";
import NotificationBadge from "../../components/NotificationBadge";
import StarRating from "../../components/StarRating";
import apiService from "../../services/apiService";
import authService from "../../services/authService";
import notificationService from "../../services/notificationService";
import { getMediaUrl } from "../../config/api";
import { formatCurrency } from "../../services/currencyService";
import { BellIcon, HeartIcon, CalendarIcon, StarIcon, MessageSquareIcon, ShareIcon, ImageIcon, ArrowLeftIcon, LockIcon, UnlockIcon, KeyIcon, AlertTriangleIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";

// Types pour les propriétés
interface PropertyMedia {
  media_id: number;
  property_id: number;
  media_type: string;
  media_url: string;
  uploaded_at: string;
}

interface Rating {
  rating_id: number;
  property_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at: string;
}

interface Property {
  property_id: number;
  title: string;
  description: string;
  price: number;
  surface: number;
  location: string;
  category: string;
  status: string;
  transaction_type: string;
  media?: PropertyMedia[];
  // Autres champs
  rating?: number;
  reviews?: number;
  user_id: number;
  additional_details?: string;
}

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

interface RatingData {
  average_rating: number;
  ratings_count: number;
}

// Données de secours en cas d'erreur
const fallbackProperty = {
  property_id: 1,
  title: "Villa moderne (données hors ligne)",
  description: "Cette propriété est affichée en mode hors ligne car nous n'avons pas pu charger les données réelles.",
  price: 450000000,
  surface: 120,
  location: "Tambohobe, Fianarantsoa",
  category: "PREMIUM",
  status: "Disponible",
  transaction_type: "AMIDY",
  features: ["4 pièces", "3 chambres", "2 salles de bain", "Jardin", "Garage"],
  rating: 4.8,
  reviews: 12,
  user_id: 1
};

export const PropertyDetail = (): JSX.Element => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Récupérer l'ID de la propriété depuis l'URL
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});
  const [isLightMode, setIsLightMode] = useState(() => {
    // Récupérer la préférence depuis localStorage au montage (ou true par défaut)
    const savedMode = localStorage.getItem('isLightMode');
    return savedMode !== null ? savedMode === 'true' : true;
  });
  const [isEuro, setIsEuro] = useState(() => {
    // Récupérer la préférence de devise depuis localStorage
    const savedCurrency = localStorage.getItem('isEuro');
    return savedCurrency !== null ? savedCurrency === 'true' : false;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [ratingsCount, setRatingsCount] = useState<number>(0);
  const [userRating, setUserRating] = useState<number>(0);
  const [propertyLoading, setPropertyLoading] = useState(true);
  const [addingToFavorites, setAddingToFavorites] = useState(false); // Nouvel état pour le chargement des favoris
  // Nouveaux états pour le verrouillage des vidéos
  const [isVideoLocked, setIsVideoLocked] = useState(true);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 361);

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
  const buttonSecondaryText = isLightMode ? "text-[#0150BC]" : "text-white";
  const borderColor = isLightMode ? "border-[#0150BC]" : "border-[#59e0c5]";
  const borderColorLight = isLightMode ? "border-[#0150BC]/30" : "border-[#59e0c5]/30";
  const imageBgColor = isLightMode ? "bg-[#EFF6FF]" : "bg-[#1e293b]";
  const favoriteButtonBg = isLightMode ? "bg-white/70" : "bg-[#0f172a]/70";
  const cardBorder = isLightMode ? "border border-[#0150BC]/30" : "border border-[#59e0c5]/30";
  const imageBorder = isLightMode ? "border border-[#0150BC]/30" : "";

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

  // Mettre à jour le mode de devise quand il change dans localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const savedCurrency = localStorage.getItem('isEuro');
      if (savedCurrency !== null) {
        setIsEuro(savedCurrency === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Vérifier régulièrement si la devise a changé
    const interval = setInterval(() => {
      const savedCurrency = localStorage.getItem('isEuro');
      if (savedCurrency !== null && (savedCurrency === 'true') !== isEuro) {
        setIsEuro(savedCurrency === 'true');
      }
    }, 1000); // Vérifier chaque seconde

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [isEuro]);

  // Vérifier une seule fois au montage si l'utilisateur est connecté
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setIsLoggedIn(!!currentUser);
    console.log("[PropertyDetail] Utilisateur connecté:", !!currentUser);
  }, []);
  
  // Fonction pour charger les notations pour la propriété actuelle
  const loadRatings = async (propertyId: string | undefined) => {
    if (!propertyId) return;
    
    console.log(`[PropertyDetail] Chargement des notations pour propriété #${propertyId}`);
    
    try {
      // 1. Charger la note moyenne
      const avgResponse = await apiService.get<ApiResponse<RatingData>>(`/properties/${propertyId}/average-rating`);
      
      if (avgResponse.data.status === 'success') {
        const avgRating = Number(avgResponse.data.data?.average_rating || 0);
        const ratingCount = Number(avgResponse.data.data?.ratings_count || 0);
        
        setAverageRating(avgRating);
        setRatingsCount(ratingCount);
        
        console.log(`[PropertyDetail] Note moyenne: ${avgRating}, Nombre d'avis: ${ratingCount}`);
      }
      
      // 2. Vérifier si l'utilisateur a déjà noté cette propriété
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        try {
          const userRatingResponse = await apiService.get<ApiResponse<Rating[]>>(
            `/users/${currentUser.user_id}/ratings?property_id=${propertyId}`
          );
          
          if (userRatingResponse.data.status === 'success') {
            if (userRatingResponse.data.data && userRatingResponse.data.data.length > 0) {
              const userNote = Number(userRatingResponse.data.data[0].rating);
              setUserRating(userNote);
              console.log(`[PropertyDetail] Note de l'utilisateur trouvée: ${userNote}`);
            } else {
              setUserRating(0);
              console.log(`[PropertyDetail] Aucune note de l'utilisateur trouvée`);
            }
          }
        } catch (error: any) {
          console.error(`[PropertyDetail] Erreur lors de la vérification des notes de l'utilisateur:`, error);
          // Spécifiquement pour l'erreur 429
          if (error.response?.status === 429) {
            console.warn("Trop de requêtes effectuées, veuillez réessayer plus tard");
          }
          setUserRating(0);
        }
      } else {
        setUserRating(0);
      }
    } catch (error: any) {
      console.error(`[PropertyDetail] Erreur lors du chargement des notations:`, error);
      // Spécifiquement pour l'erreur 429
      if (error.response?.status === 429) {
        console.warn("Trop de requêtes effectuées, veuillez réessayer plus tard");
      }
      setAverageRating(0);
      setRatingsCount(0);
      setUserRating(0);
    }
  };
  
  // Fonction pour vérifier si la propriété est dans les favoris de l'utilisateur
  const checkFavoriteStatus = async (propertyId: string) => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      setIsFavorite(false);
      return;
    }
    
    try {
      // Vérifier d'abord dans localStorage
      const favoritesInStorage = localStorage.getItem('userFavorites');
      if (favoritesInStorage) {
        const favorites = JSON.parse(favoritesInStorage);
        const isInFavorites = favorites.some((fav: number) => fav === Number(propertyId));
        setIsFavorite(isInFavorites);
        console.log(`[PropertyDetail] Statut favori (localStorage): ${isInFavorites}`);
        return;
      }
      
      // Essayer avec l'API si disponible
      try {
        const response = await apiService.get<ApiResponse<any>>(`/properties/${propertyId}/favorites`);
        
        if (response.data && response.data.status === 'success') {
          // Si des données sont retournées, cela signifie que la propriété est dans les favoris
          setIsFavorite(response.data.data && response.data.data.length > 0);
          console.log(`[PropertyDetail] Statut favori (API): ${response.data.data && response.data.data.length > 0}`);
        } else {
          setIsFavorite(false);
        }
      } catch (apiError) {
        console.warn("[PropertyDetail] API de favoris non disponible, utilisation du localStorage");
        setIsFavorite(false);
      }
    } catch (error) {
      console.error("[PropertyDetail] Erreur lors de la vérification des favoris:", error);
      setIsFavorite(false);
    }
  };
  
  // Fonction pour ajouter/supprimer des favoris
  const toggleFavorite = async () => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !id) {
      // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
      if (!currentUser) {
        navigate('/login');
      }
      return;
    }
    
    setAddingToFavorites(true);
    
    try {
      // Utilisation de localStorage comme solution de repli
      const favoritesKey = 'userFavorites';
      let favorites: number[] = [];
      const storedFavorites = localStorage.getItem(favoritesKey);
      
      if (storedFavorites) {
        favorites = JSON.parse(storedFavorites);
      }
      
      if (isFavorite) {
        // Supprimer des favoris dans localStorage
        favorites = favorites.filter(fav => fav !== Number(id));
        localStorage.setItem(favoritesKey, JSON.stringify(favorites));
        setIsFavorite(false);
        console.log("[PropertyDetail] Bien retiré des favoris (localStorage)");
        
        // Essayer aussi avec l'API si disponible
        try {
          const response = await apiService.delete<ApiResponse<{ success: boolean }>>(`/favorites/${id}?user_id=${currentUser.user_id}`);
          if (response.data && response.data.status === 'success') {
            console.log("[PropertyDetail] Bien retiré des favoris (API)");
          }
        } catch (apiError) {
          console.warn("[PropertyDetail] Impossible d'utiliser l'API pour supprimer le favori");
        }
      } else {
              // Ajouter aux favoris dans localStorage
      favorites.push(Number(id));
      localStorage.setItem(favoritesKey, JSON.stringify(favorites));
      setIsFavorite(true);
      console.log("[PropertyDetail] Bien ajouté aux favoris (localStorage)");
      
      // Essayer aussi avec l'API si disponible
      try {
        const response = await apiService.post<ApiResponse<{ favorite_id: number }>>(`/favorites`, {
          property_id: Number(id),
          user_id: currentUser.user_id
        });
        if (response.data && response.data.status === 'success') {
          console.log("[PropertyDetail] Bien ajouté aux favoris (API)");
          
          // Envoyer une notification au propriétaire du bien
          if (property && property.user_id && property.user_id !== currentUser.user_id) {
            try {
              await notificationService.createNotification(
                property.user_id,
                `Un utilisateur a ajouté votre bien "${property.title}" à ses favoris.`
              );
              console.log("[PropertyDetail] Notification envoyée au propriétaire du bien");
            } catch (notifErr) {
              console.error("[PropertyDetail] Erreur lors de l'envoi de la notification:", notifErr);
              // On continue même en cas d'erreur de notification
            }
          }
        }
      } catch (apiError) {
        console.warn("[PropertyDetail] Impossible d'utiliser l'API pour ajouter le favori");
      }
      }
    } catch (error) {
      console.error("[PropertyDetail] Erreur lors de la mise à jour des favoris:", error);
    } finally {
      setAddingToFavorites(false);
    }
  };
  
  // Chargement initial des données de la propriété et des notations
  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!id) {
        setError("ID de propriété non spécifié");
        setLoading(false);
        return;
      }
      
      console.log(`[PropertyDetail] Chargement de la propriété #${id}`);
      setPropertyLoading(true);
      
      // Réinitialiser les états au changement de propriété - immédiatement avant de charger
      setAverageRating(0);
      setRatingsCount(0);
      setUserRating(0);
      
      try {
        // Charger la propriété
        const response = await apiService.get<ApiResponse<Property>>(`/properties/${id}`);
        
        if (response.data && response.data.status === "success" && response.data.data) {
          console.log(`[PropertyDetail] Propriété chargée:`, response.data.data);
          setProperty(response.data.data);
        } else {
          throw new Error("Format de réponse inattendu");
        }

        // Vérifier si la propriété est dans les favoris
        await checkFavoriteStatus(id);
      } catch (err: any) {
        console.error(`[PropertyDetail] Erreur lors du chargement de la propriété:`, err);
        
        // Spécifiquement pour l'erreur 429
        if (err.response?.status === 429) {
          setError("Trop de requêtes. Veuillez patienter quelques instants et rafraîchir la page.");
        } else {
          setError(err.response?.data?.message || err.message || "Erreur lors du chargement des données");
        }
        
        // Utiliser les données de secours
        setProperty({
          ...fallbackProperty, 
          property_id: parseInt(id)
        } as Property);
      } finally {
        setLoading(false);
        setPropertyLoading(false);
      }
      
      // Charger les notations une fois la propriété chargée
      await loadRatings(id);
    };
    
    fetchPropertyData();
  }, [id]);
  
  // Gestionnaire pour mettre à jour la note après notation par l'utilisateur
  const handleRatingChange = async (newRating: number) => {
    console.log(`[PropertyDetail] Notation reçue: ${newRating} pour propriété #${id}`);
    
    // Mettre à jour localement pour feedback immédiat
    setUserRating(newRating);
    
    // Attendre un peu puis recharger les notes depuis le serveur
    setTimeout(() => {
      loadRatings(id);
    }, 1000);
  };

  // Gérer les erreurs d'images
  const handleImageError = (index: number) => {
    setImageErrors(prev => ({
      ...prev,
      [index]: true
    }));
  };

  // Obtenir les URLs des images
  const getImageUrls = (): string[] => {
    if (property && property.media && property.media.length > 0) {
      // Filtrer uniquement les médias de type Photo
      return property.media
        .filter(media => media.media_type === 'Photo')
        .map(media => getMediaUrl(media.media_url));
    }
    
    // Images par défaut selon la catégorie
    if (property?.category === "LITE") {
      return ["/public_Trano/calque-3.png"];
    } else if (property?.category === "PREMIUM") {
      return ["/public_Trano/maison-01.png"];
    }
    
    // Images de secours
    return [
      "/public_Trano/maison-01.png",
      "/public_Trano/calque-3.png",
      "/public_Trano/calque-4.png",
      "/public_Trano/calque-5.png"
    ];
  };

  // Récupérer les vidéos
  const getVideos = (): string[] => {
    if (property && property.media && property.media.length > 0) {
      // Filtrer uniquement les médias de type Vidéo
      return property.media
        .filter(media => media.media_type === 'Vidéo')
        .map(media => getMediaUrl(media.media_url));
    }
    return [];
  };

  // Formater le prix
  const formatPrice = (price?: number): string => {
    if (!price) return "Prix non spécifié";
    return formatCurrency(price, isEuro); // Utiliser formatCurrency pour respecter le mode euro
  };

  // Fonction pour vérifier si l'utilisateur est le propriétaire d'une propriété
  const isPropertyOwner = (): boolean => {
    const currentUser = authService.getCurrentUser();
    // Si l'utilisateur n'est pas connecté ou si property n'est pas chargé, retourner false
    if (!currentUser || !property) return false;
    
    return Number(property.user_id) === Number(currentUser.user_id);
  };

  // Vérifier si l'utilisateur a déjà déverrouillé la vidéo
  useEffect(() => {
    if (!property || !id) return;
    
    // Vérifier dans localStorage si la vidéo a déjà été déverrouillée
    const unlockedVideos = localStorage.getItem('unlockedVideos');
    if (unlockedVideos) {
      try {
        const videosData = JSON.parse(unlockedVideos);
        const propertyId = Number(id);
        
        // Nouvelle structure: { "propertyId": expireTimestamp }
        if (videosData[propertyId]) {
          const expireTime = videosData[propertyId];
          const currentTime = Date.now();
          
          if (currentTime < expireTime) {
            // La période d'accès est encore valide
            setIsVideoLocked(false);
            
            // Envoyer une notification au propriétaire pour l'informer qu'un utilisateur regarde sa vidéo
            const currentUser = authService.getCurrentUser();
            if (property && property.user_id && currentUser && property.user_id !== currentUser.user_id) {
              try {
                // Utiliser une fonction immédiatement invoquée pour pouvoir utiliser async/await dans useEffect
                (async () => {
                  await notificationService.createNotification(
                    property.user_id,
                    `Un utilisateur visionne la visite virtuelle de votre bien "${property.title}".`
                  );
                  console.log("[PropertyDetail] Notification envoyée au propriétaire pour visionnage vidéo (déjà déverrouillée)");
                })().catch(notifErr => {
                  console.error("[PropertyDetail] Erreur lors de l'envoi de la notification de visionnage:", notifErr);
                });
              } catch (notifErr) {
                console.error("[PropertyDetail] Erreur lors de l'envoi de la notification de visionnage:", notifErr);
              }
            }
            
            // Configurer un timer pour reverouiller la vidéo à l'expiration
            const timeLeft = expireTime - currentTime;
            const timer = setTimeout(() => {
              setIsVideoLocked(true);
              console.log("Accès à la vidéo expiré");
              
              // Notification à l'utilisateur que l'accès a expiré
              const notificationElement = document.createElement('div');
              notificationElement.className = `fixed top-4 right-4 ${isLightMode ? 'bg-red-100 text-red-800' : 'bg-red-900/80 text-white'} p-3 rounded-lg shadow-lg z-50 animate-fade-in-down`;
              notificationElement.innerHTML = `<div class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10a8 8 0 01-14 0"></path><path d="M12 22v-4"></path><path d="M12 6v-4"></path></svg><span>Accès à la vidéo expiré</span></div>`;
              document.body.appendChild(notificationElement);
              
              setTimeout(() => {
                document.body.removeChild(notificationElement);
              }, 6000);
            }, timeLeft);
            
            // Nettoyer le timer si le composant est démonté
            return () => clearTimeout(timer);
          } else {
            // La période d'accès a expiré
            setIsVideoLocked(true);
            
            // Supprimer l'entrée expirée
            delete videosData[propertyId];
            localStorage.setItem('unlockedVideos', JSON.stringify(videosData));
          }
        }
      } catch (error) {
        console.error("Erreur lors de la lecture des données de déverrouillage:", error);
      }
    }
  }, [property, id, isLightMode]);
  
  // Fonction pour valider le coupon en utilisant l'API backend
  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Veuillez entrer un code");
      return;
    }
    
    setValidatingCoupon(true);
    setCouponError(null);
    
    try {
      // Appel API pour valider le coupon
      const response = await apiService.post<ApiResponse<any>>('/coupons/validate', {
        code: couponCode,
        property_id: Number(id)
      });
      
      if (response.data.status === 'success') {
        // Coupon valide trouvé
        console.log("[PropertyDetail] Coupon validé avec succès:", response.data);
        
        // Appliquer le coupon
        const applyResponse = await apiService.post<ApiResponse<any>>('/coupons/apply', {
          code: couponCode,
          property_id: Number(id)
        });
        
                   if (applyResponse.data.status === 'success') {
             setIsVideoLocked(false);
             setShowCouponModal(false);
             
             // Calculer le timestamp d'expiration (1 minute)
             const expireTime = Date.now() + (60 * 1000); // Temps actuel + 60 secondes
             
             // Enregistrer le déverrouillage avec timestamp d'expiration dans localStorage
             const unlockedVideos = localStorage.getItem('unlockedVideos');
             let videosData = unlockedVideos ? JSON.parse(unlockedVideos) : {};
             
             if (id) {
               // Stocker avec format { "propertyId": expireTimestamp }
               videosData[Number(id)] = expireTime;
               localStorage.setItem('unlockedVideos', JSON.stringify(videosData));
               
               // Notification à l'utilisateur que l'accès est limité
               const notificationElement = document.createElement('div');
               notificationElement.className = `fixed top-4 right-4 ${isLightMode ? 'bg-blue-100 text-blue-800' : 'bg-blue-900/80 text-white'} p-3 rounded-lg shadow-lg z-50 animate-fade-in-down`;
               notificationElement.innerHTML = `<div class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3"></path><circle cx="12" cy="12" r="10"></circle></svg><span>Accès déverrouillé pour 1 minute</span></div>`;
               document.body.appendChild(notificationElement);
               
               setTimeout(() => {
                 document.body.removeChild(notificationElement);
               }, 6000);
               
               // Configurer un timer pour reverouiller après expiration
               setTimeout(() => {
                 setIsVideoLocked(true);
               }, 60 * 1000);
               
               // Envoyer une notification au propriétaire du bien
               const currentUser = authService.getCurrentUser();
               if (property && property.user_id && currentUser && property.user_id !== currentUser.user_id) {
                 try {
                   await notificationService.createNotification(
                     property.user_id,
                     `Un client a consulté la visite virtuelle de votre propriété "${property.title}".`
                   );
                   console.log("[PropertyDetail] Notification envoyée au propriétaire pour visionnage vidéo");
                 } catch (notifErr) {
                   console.error("[PropertyDetail] Erreur lors de l'envoi de la notification de visionnage:", notifErr);
                   // On continue même en cas d'erreur de notification
                 }
               }
          }
        } else {
          setCouponError(applyResponse.data.message || "Erreur lors de l'application du coupon");
        }
      } else {
        setCouponError(response.data.message || "Code coupon invalide");
      }
    } catch (error: any) {
      console.error("Erreur lors de la validation du coupon:", error);
      
      // Fallback pour la démo : codes de secours en cas d'erreur d'API
      if (couponCode === "Arthi2124") {
        setIsVideoLocked(false);
        setShowCouponModal(false);
        
        // Calculer le timestamp d'expiration (1 minute)
        const expireTime = Date.now() + (60 * 1000);
        
        // Enregistrer le déverrouillage avec timestamp d'expiration
        const unlockedVideos = localStorage.getItem('unlockedVideos');
        let videosData = unlockedVideos ? JSON.parse(unlockedVideos) : {};
        
        if (id) {
          videosData[Number(id)] = expireTime;
          localStorage.setItem('unlockedVideos', JSON.stringify(videosData));
          
          // Notification pour les codes de secours
          const notificationElement = document.createElement('div');
          notificationElement.className = `fixed top-4 right-4 ${isLightMode ? 'bg-yellow-100 text-yellow-800' : 'bg-yellow-900/80 text-white'} p-3 rounded-lg shadow-lg z-50 animate-fade-in-down`;
          notificationElement.innerHTML = `<div class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3"></path><circle cx="12" cy="12" r="10"></circle></svg><span>Code de secours accepté (1 minute)</span></div>`;
          document.body.appendChild(notificationElement);
          
          setTimeout(() => {
            document.body.removeChild(notificationElement);
          }, 6000);
          
          setTimeout(() => {
            setIsVideoLocked(true);
          }, 60 * 1000);
          
          // Envoyer une notification au propriétaire du bien (pour les codes de secours)
          const currentUser = authService.getCurrentUser();
          if (property && property.user_id && currentUser && property.user_id !== currentUser.user_id) {
            try {
              await notificationService.createNotification(
                property.user_id,
                `Un utilisateur a déverrouillé et visionne la visite virtuelle de votre bien "${property.title}".`
              );
              console.log("[PropertyDetail] Notification envoyée au propriétaire pour visionnage vidéo (code de secours)");
            } catch (notifErr) {
              console.error("[PropertyDetail] Erreur lors de l'envoi de la notification de visionnage:", notifErr);
              // On continue même en cas d'erreur de notification
            }
          }
        }
      } else {
        setCouponError(error.response?.data?.message || "Une erreur est survenue lors de la vérification du coupon");
      }
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Propriétés extraites pour simplifier le template
  const images = getImageUrls();
  const videos = getVideos();
  const selectedVideo = selectedImage < videos.length ? selectedImage : 0;
  const propertyId = property?.property_id ? Number(property.property_id) : 0;

  // Mise à jour pour la section de notation
  const renderRatingSection = () => {
    const isOwner = isPropertyOwner();
    const isAdmin = authService.isAdmin();
    
    // Déterminer quelle note afficher dans les étoiles
    const displayRating = isAdmin ? userRating : averageRating;
    
    // Un admin peut toujours noter, un utilisateur normal ne peut pas noter son propre bien
    const canRate = isAdmin || (isLoggedIn && !isOwner);
    
    return (
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-2 mb-2">
          <span className={`${textSecondaryColor} text-sm font-medium`}>
            {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
          </span>
          <StarIcon className={`w-5 h-5 ${textColor}`} fill="currentColor" />
        </div>
        <div className={`${!canRate ? '' : 'border border-dashed border-gray-300 hover:border-gray-400 p-2 rounded-lg transition-colors'}`}>
          <StarRating 
            key={`property-rating-${id}`}
            propertyId={Number(id)} 
            userRating={displayRating}
            onRatingChange={handleRatingChange}
            readOnly={!canRate}
            size="md"
            isLightMode={isLightMode}
          />
        </div>
        {!isLoggedIn && (
          <span className={`text-xs ${textSecondaryColor} mt-2`}>Connectez-vous pour voir les notes</span>
        )}
        {isLoggedIn && isAdmin && canRate && userRating === 0 && (
          <span className={`text-xs ${textSecondaryColor} mt-2`}>Cliquez pour noter</span>
        )}
      </div>
    );
  };

  // Ajout d'un effet pour détecter les changements de taille d'écran
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 361);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
      <div className="max-w-[1440px] mx-auto px-4 xs:px-6 sm:px-8 md:px-12 lg:px-16 pt-4 xs:pt-6 sm:pt-8 md:pt-10 lg:pt-12 relative z-10">
        {/* Navigation Bar */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center py-2 xs:py-4 mb-4 sm:mb-6"
        >
           <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-colors" onClick={() => navigate('/trano')}>
             <img 
              src={isLightMode ? "/public_Trano/fleche_retour_b.png" : "/public_Trano/fleche_retour_v.png"} 
              alt="Retour" 
              className="w-7 h-7 xs:w-7 xs:h-7 sm:w-8 sm:h-8" 
            />
            <span className={`${textColor} font-medium`}>Annonces</span>
           </div>

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
         
        </motion.header>

        {loading ? (
          // État de chargement
          <div className="flex justify-center items-center py-20">
            <div className={`w-12 h-12 border-4 ${borderColor} border-t-transparent rounded-full animate-spin`}></div>
          </div>
        ) : error ? (
          // Message d'erreur
          <div className={`${isLightMode ? "bg-red-100" : "bg-red-500/20"} ${isLightMode ? "text-red-700" : "text-white"} p-5 rounded-xl text-center`}>
            <p>{error}</p>
            <button 
              onClick={() => navigate('/trano')}
              className={`mt-4 px-4 py-2 ${buttonPrimaryBg} ${buttonPrimaryText} rounded-lg`}
            >
              Retour aux annonces
            </button>
          </div>
        ) : property ? (
          // Contenu principal
          <>
            {/* Property Images Section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-2 sm:mb-4"
            >
              <div className={`relative ${imageBgColor} rounded-2xl overflow-hidden ${isSmallScreen ? 'h-[180px]' : 'h-[200px]'} xs:h-[250px] sm:h-[350px] md:h-[450px] ${imageBorder}`}>
                {videos.length > 0 ? (
                  isVideoLocked ? (
                    // Afficher le cadenas et l'overlay de verrouillage
                    <div className="w-full h-full relative">
                      {/* Aperçu de la vidéo verrouillée (image floutée) */}
                      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                        {/* Icône de cadenas */}
                        <LockIcon size={64} className={`${textColor} mb-4`} />
                        <h3 className={`text-xl font-bold ${textPrimaryColor} mb-2 text-center px-4`}>
                          Cette vidéo est verrouillée
                        </h3>
                        <p className={`${textSecondaryColor} text-center mb-4 px-4 text-sm`}>
                          Contactez l'agence ou utilisez un code de coupon pour accéder à cette vidéo
                        </p>
                        <button
                          onClick={() => setShowCouponModal(true)}
                          className={`${buttonPrimaryBg} ${buttonPrimaryText} px-6 py-2 rounded-full font-medium hover:opacity-90 transition-all flex items-center gap-2 z-20`}
                        >
                          <KeyIcon size={16} />
                          Entrer un code
                        </button>
                      </div>
                      
                      {/* Image d'aperçu (si disponible) ou icône vidéo */}
                      <div className="w-full h-full flex items-center justify-center opacity-50">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-20 h-20 text-gray-400">
                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                      </div>
                    </div>
                  ) : (
                    // Vidéo déverrouillée
                    <video 
                      src={videos[selectedVideo]} 
                      className="w-full h-full object-contain"
                      controls
                      autoPlay={false}
                    />
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon size={48} />
                    <p className="mt-4 text-xl">Aucune vidéo disponible</p>
                  </div>
                )}
                <button 
                  onClick={toggleFavorite}
                  disabled={addingToFavorites || !isLoggedIn}
                  className={`absolute top-4 right-4 ${favoriteButtonBg} p-2 rounded-full ${!isLoggedIn ? 'opacity-70' : ''}`}
                >
                  {addingToFavorites ? (
                    <div className={`w-6 h-6 border-2 ${borderColor} border-t-transparent rounded-full animate-spin`}></div>
                  ) : (
                    <HeartIcon 
                      className={`w-6 h-6 ${isFavorite ? 'text-red-500 fill-red-500' : isLightMode ? 'text-[#0f172a]' : 'text-white'}`} 
                    />
                  )}
                </button>
              </div>
              
              {/* Video Gallery */}
              {videos.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  {videos.map((video, index) => (
                    <div 
                      key={`video-${index}`}
                      className={`w-16 h-16 xs:w-20 xs:h-20 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 ${selectedVideo === index ? borderColor : 'border-transparent'}`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <div className={`w-full h-full ${imageBgColor} flex items-center justify-center`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-gray-400">
                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Property Details Section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`${cardBgColor} rounded-2xl p-2 sm:p-8 mb-4 sm:mb-6 ${cardBorder}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold ${textPrimaryColor}`}>{property.title}</h1>
                  <p className={`${textColor} text-lg sm:text-xl font-semibold`}>{formatPrice(property.price)}</p>
                  <p className={`${textSecondaryColor} text-sm`}>{property.location || "Emplacement non spécifié"}</p>
                </div>
                {renderRatingSection()}
              </div>
              
              <div className={`border-t ${borderColorLight} my-2`}>
                <h3 className={`${textColor} font-semibold mb-2`}>Description</h3>
                <p className={`${textSecondaryColor} text-sm`}>{property.description || "Aucune description disponible."}</p>
              </div>
              
              {/* Affichage des détails supplémentaires s'ils existent */}
              {property.additional_details && (
                <div className={`border-t ${borderColorLight} my-2`}>
                  <h3 className={`${textColor} font-semibold mb-2`}>Détails supplémentaires</h3>
                  <p className={`${textSecondaryColor} text-sm`}>{property.additional_details}</p>
                </div>
              )}
              
              <div className={`border-t ${borderColorLight} my-2`}>
                <h3 className={`${textColor} font-semibold mb-2`}>Caractéristiques</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {/* Caractéristiques extraites des propriétés */}
                  {property.surface && Number(property.surface) > 0 && (
                    <div className={`flex items-center ${textSecondaryColor} text-sm`}>
                      <div className={`w-2 h-2 ${isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]"} rounded-full mr-2`}></div>
                      Surface: {property.surface} m²
                    </div>
                  )}
                  <div className={`flex items-center ${textSecondaryColor} text-sm`}>
                    <div className={`w-2 h-2 ${isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]"} rounded-full mr-2`}></div>
                    Catégorie: {property.category}
                  </div>
                  <div className={`flex items-center ${textSecondaryColor} text-sm`}>
                    <div className={`w-2 h-2 ${isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]"} rounded-full mr-2`}></div>
                    Statut: {property.status}
                  </div>
                  <div className={`flex items-center ${textSecondaryColor} text-sm`}>
                    <div className={`w-2 h-2 ${isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]"} rounded-full mr-2`}></div>
                    Type: {property.transaction_type || "Non spécifié"}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col gap-4 mb-8"
            >
              {property.status === "Réservé" || property.status === "Vendu" || property.status === "Loué" ? (
                <div className={`w-full text-center ${isLightMode ? "text-red-600" : "text-red-400"} font-semibold py-4 ${isLightMode ? "bg-red-50" : "bg-red-900/20"} rounded-lg border ${isLightMode ? "border-red-200" : "border-red-800/30"}`}>
                  {property.status === "Réservé" && "Le bien que vous consultez est déjà Réservé"}
                  {property.status === "Vendu" && "Le bien que vous consultez est déjà Vendu"}
                  {property.status === "Loué" && "Le bien que vous consultez est déjà Loué"}
                </div>
              ) : (
                <div className="flex flex-row gap-4">
                  <button 
                    className={`flex-1 flex items-center justify-center gap-2 ${buttonPrimaryBg} ${buttonPrimaryText} font-bold py-3 rounded-lg hover:opacity-90 transition-colors border ${isLightMode ? "border-[#0150BC]" : "border-transparent"}`}
                    onClick={() => navigate(`/property/${propertyId}/book`)}
                  >
                    <CalendarIcon size={20} />
                    <span>{isSmallScreen ? "Visite" : "Réserver une visite"}</span>
                  </button>
                  
                  <button 
                    className={`flex-1 flex items-center justify-center gap-2 ${buttonPrimaryBg} ${buttonPrimaryText} font-bold py-3 rounded-lg hover:opacity-90 transition-colors border ${isLightMode ? "border-[#0150BC]" : "border-transparent"}`}
                    onClick={() => navigate(`/property/${propertyId}/order`)}
                  >
                    {property.transaction_type === "AHOFA" ? (
                      <>
                        <HomeIcon size={20} />
                        <span>{isSmallScreen ? "Louer" : "Louer ce bien"}</span>
                      </>
                    ) : (
                      <>
                        <HomeIcon size={20} />
                        <span>{isSmallScreen ? "Acheter" : "Acheter ce bien"}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
              
              <button 
                className={`w-full flex items-center justify-center gap-2 ${buttonSecondaryBg} ${buttonSecondaryText} font-bold py-3 rounded-lg hover:opacity-90 transition-colors border ${isLightMode ? "border-[#0150BC]" : "border-transparent"}`}
                onClick={() => navigate(`/property/${propertyId}/contact`)}
              >
                <MessageSquareIcon size={20} className={textColor} />
                <span>"Contacter l'agence"</span>
              </button>
            </motion.div>

            {/* Share Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center mb-12"
            >
              {/* <button className={`inline-flex items-center gap-2 ${textColor} hover:underline`}>
                <ShareIcon size={18} />
                <span>Partager cette annonce</span>
              </button> */}
            </motion.div>
          </>
        ) : null}

        {/* Modal pour entrer le code coupon */}
        {showCouponModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className={`${cardBgColor} rounded-xl p-5 w-full max-w-md ${cardBorder}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-bold ${textPrimaryColor}`}>
                  Déverrouiller la vidéo
                </h3>
                <button 
                  onClick={() => setShowCouponModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircleIcon size={24} />
                </button>
              </div>
              
              <div className={`mb-4 p-3 ${isLightMode ? "bg-yellow-50" : "bg-yellow-900/20"} ${isLightMode ? "text-yellow-800" : "text-yellow-200"} rounded-lg flex items-start gap-3`}>
                <AlertTriangleIcon size={20} className="flex-shrink-0 mt-1" />
                <p className="text-sm">
                  Pour accéder à cette vidéo, veuillez entrer le code de coupon fourni par l'administrateur.
                </p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="couponCode" className={`block mb-2 text-sm font-medium ${textSecondaryColor}`}>
                  Code de coupon
                </label>
                <input
                  type="text"
                  id="couponCode"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Entrez le code de coupon"
                  className={`w-full p-3 rounded-lg border ${borderColorLight} bg-transparent text-sm ${textPrimaryColor} focus:outline-none focus:border-2 ${borderColor}`}
                />
                {couponError && (
                  <p className="mt-2 text-sm text-red-500">{couponError}</p>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCouponModal(false)}
                  className={`flex-1 py-2 px-4 border ${borderColor} rounded-lg ${textColor} font-medium`}
                  disabled={validatingCoupon}
                >
                  Annuler
                </button>
                <button
                  onClick={validateCoupon}
                  disabled={validatingCoupon}
                  className={`flex-1 py-2 px-4 ${buttonPrimaryBg} ${buttonPrimaryText} rounded-lg font-medium flex items-center justify-center gap-2`}
                >
                  {validatingCoupon ? (
                    <>
                      <div className={`w-4 h-4 border-2 ${buttonPrimaryText} border-t-transparent rounded-full animate-spin`}></div>
                      <span>Validation...</span>
                    </>
                  ) : (
                    <>
                      <KeyIcon size={16} />
                      <span>Valider</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PropertyDetail; 