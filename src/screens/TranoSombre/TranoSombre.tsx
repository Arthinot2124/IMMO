import { BellIcon, HomeIcon, SettingsIcon } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import apiService from "../../services/apiService";
import NotificationBadge from "../../components/NotificationBadge";
import { getMediaUrl } from "../../config/api";
import { formatCurrency } from "../../services/currencyService";

// Types pour les propriétés
interface PropertyMedia {
  media_id: number;
  property_id: number;
  media_type: string;
  media_url: string;
  uploaded_at: string;
}

interface Property {
  property_id: number;
  title: string;
  description: string;
  price: number;
  surface: number; 
  location: string;
  property_type?: string;
  transaction_type?: string;
  category: string;
  status: string;
  media?: PropertyMedia[];
  views: number;
}

// Interface pour l'utilisateur connecté
interface CurrentUser {
  user_id: number;
  email?: string;
  full_name?: string;
  role_id?: number;
  [key: string]: any; // Pour les autres propriétés
}

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
  meta?: {
    last_page: number;
    current_page: number;
    total: number;
    per_page: number;
  };
  // Propriétés de pagination standard Laravel
  current_page?: number;
  last_page?: number;
  total?: number;
  per_page?: number;
  from?: number;
  to?: number;
}

export const TranoSombre = (): JSX.Element => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("VILLAS");
  const [priceFilter, setPriceFilter] = useState<boolean>(false);
  const [ahofaFilter, setAhofaFilter] = useState<boolean>(true);
  const [amidyFilter, setAmidyFilter] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLightMode, setIsLightMode] = useState(() => {
    const savedMode = localStorage.getItem('isLightMode');
    return savedMode !== null ? savedMode === 'true' : true;
  });
  const [isEuro, setIsEuro] = useState(() => {
    const savedCurrency = localStorage.getItem('isEuro');
    return savedCurrency !== null ? savedCurrency === 'true' : false;
  });
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  // Images pour le carrousel avec leur type
  const allCarouselImages = [
    { url: "/public_Trano/FIANARANTSOA.png", type: "VILLAS" },
    { url: "/public_Trano/tany.png", type: "TERRAINS" },
    { url: "/public_Trano/pub.jpg", type: "BOTH" },
    { url: "/public_Trano/pub2.jpg", type: "BOTH" },
    { url: "/public_Trano/pub3.jpg", type: "BOTH" },
    { url: "/public_Trano/pubTany1.png", type: "BOTH" },
    { url: "/public_Trano/pubTany2.png", type: "BOTH" }
  ];

  // Filtrer les images selon le type actif
  const filteredImages = allCarouselImages.filter(img => 
    img.type === activeFilter || img.type === "BOTH"
  );

  // Couleurs qui changent en fonction du mode
  const accentColor = isLightMode ? "#0150BC" : "#59e0c5";
  const bgColor = isLightMode ? "bg-white" : "bg-[#0f172a]";
  const cardBgColor = isLightMode ? "bg-[rgba(240,240,240,0.85)]" : "bg-[#1e293b]/50";
  const textColor = isLightMode ? "text-[#0150BC]" : "text-[#59e0c5]";
  const textSecondaryColor = isLightMode ? "text-gray-700" : "text-gray-300";
  const buttonHoverBg = isLightMode ? "hover:bg-[#0150BC]" : "hover:bg-[#59e0c5]";
  const buttonBg = isLightMode ? "bg-[#EFF6FF]" : "bg-[#1e293b]";
  const buttonBorder = isLightMode ? "border border-[#0150BC]" : "";
  const buttonShadow = isLightMode ? "shadow-sm" : "";
  const borderColor = isLightMode ? "border-[#0150BC]" : "border-[#59e0c5]";
  const borderColorLight = isLightMode ? "border-[#0150BC]/30" : "border-[#59e0c5]/30";

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

  // Fonction pour gérer les erreurs d'images
  const handleImageError = (propertyId: number) => {
    setImageErrors(prev => ({
      ...prev,
      [propertyId]: true
    }));
  };

  // Fonction pour charger les propriétés depuis l'API
  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Début du chargement des propriétés");
      // Construction des paramètres de requête de pagination
      let params: any = { 
        page: currentPage,
        include: 'media',
        per_page: 5
      };
      
      // Ajout des filtres selon le type de propriété
      if (activeFilter === "TERRAINS") {
        params.property_type = "TERRAIN";
        // Format alternatif au cas où l'API attend une autre forme
        params.filter = params.filter || {};
        params.filter.property_type = "TERRAIN";
      } else if (activeFilter === "VILLAS") {
        params.property_type = "VILLA";
        // Format alternatif au cas où l'API attend une autre forme
        params.filter = params.filter || {};
        params.filter.property_type = "VILLA";
      }
      
      // Ajout du terme de recherche s'il existe
      if (searchTerm && searchTerm.trim() !== "") {
        params.search = searchTerm.trim();
        // Format alternatif pour le backend
        params.filter = params.filter || {};
        params.filter.search = searchTerm.trim();
      }
      
      if (priceFilter) {
        params.min_price = 10000000;
        // Format alternatif au cas où l'API attend une autre forme
        params.filter = params.filter || {};
        params.filter.min_price = 10000000;
      }
      
      // Ajout des filtres AHOFA et AMIDY
      if (ahofaFilter && !amidyFilter) {
        params.transaction_type = "AHOFA";
        // Format alternatif au cas où l'API attend une autre forme
        params.filter = params.filter || {};
        params.filter.transaction_type = "AHOFA";
      } else if (amidyFilter && !ahofaFilter) {
        params.transaction_type = "AMIDY";
        // Format alternatif au cas où l'API attend une autre forme
        params.filter = params.filter || {};
        params.filter.transaction_type = "AMIDY";
      }
      // Si les deux filtres sont actifs ou inactifs, ne pas filtrer par transaction_type
      
      // Log détaillé pour vérifier les paramètres exactement tels qu'ils sont envoyés
      console.log("Appel API avec params:", JSON.stringify(params, null, 2));
      const url = `/properties?${new URLSearchParams(params).toString()}`;
      console.log("URL complète de la requête:", url);
      
      // Utilisation de apiService pour récupérer les propriétés
      const response = await apiService.get<ApiResponse<{data: Property[], meta: {last_page: number}}>>('/properties', { params });
      
      console.log("Réponse API reçue:", response.data);
      
      // Analyse avancée de la structure de la réponse pour le débogage de pagination
      const analyzeApiResponse = (data: any, prefix = "") => {
        if (!data) return;
        
        if (typeof data === 'object') {
          // Rechercher spécifiquement des propriétés relatives à la pagination
          const paginationKeys = ['current_page', 'last_page', 'total', 'per_page'];
          const hasPaginationInfo = paginationKeys.some(key => key in data);
          
          if (hasPaginationInfo) {
            console.log(`${prefix}🔍 INFO PAGINATION TROUVÉE:`, 
              paginationKeys.reduce((acc, key) => {
                if (key in data) acc[key] = data[key];
                return acc;
              }, {} as any)
            );
          }
          
          // Explorer récursivement les propriétés
          Object.keys(data).forEach(key => {
            if (data[key] && typeof data[key] === 'object') {
              analyzeApiResponse(data[key], `${prefix}${key}.`);
            }
          });
        }
      };
      
      // Analyser la réponse pour déboguer
      console.log("🔎 Analyse de la structure de la réponse API:");
      analyzeApiResponse(response.data);
      
      // Vérifier la structure et extraire les données correctement
      let propertyArray: Property[] = [];
      let lastPageFound = false;
      
      if (response.data) {
        // Cas 1: { status: "success", data: [...], meta: {...} }
        if (response.data.meta && response.data.meta.last_page) {
          setTotalPages(response.data.meta.last_page);
          console.log("Pagination via meta:", response.data.meta);
          lastPageFound = true;
        }
        
        // Cas 2: { status: "success", data: { data: [...], meta: {...} } }
        if (response.data.data && response.data.data.meta && response.data.data.meta.last_page) {
          setTotalPages(response.data.data.meta.last_page);
          console.log("Pagination via data.meta:", response.data.data.meta);
          lastPageFound = true;
        }
        
        // Cas 3: Format Laravel standard { data: [...], current_page: X, last_page: Y, ...}
        if (response.data.last_page) {
          setTotalPages(response.data.last_page);
          console.log("Pagination via format Laravel standard:", { 
            current_page: response.data.current_page,
            last_page: response.data.last_page,
            total: response.data.total
          });
          lastPageFound = true;
        }
        
        // Extraire les données
        if (Array.isArray(response.data.data)) {
          propertyArray = response.data.data;
        } else if (response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
          propertyArray = response.data.data.data;
        } else if (Array.isArray(response.data)) {
          propertyArray = response.data;
        }
      }
      
      // Si aucune info de pagination n'a été trouvée mais nous avons des données
      if (!lastPageFound && propertyArray.length > 0) {
        // Estimer le nombre total de pages en fonction du nombre d'éléments retournés
        // Assume une taille de page constante
        const estimatedTotalPages = Math.max(2, Math.ceil(propertyArray.length / 5));
        console.log(`Aucune information de pagination trouvée. Estimation: ${estimatedTotalPages} pages`);
        setTotalPages(estimatedTotalPages);
      }
      
      // Filtrage côté client (solution de secours si l'API ne filtre pas correctement)
      if (propertyArray.length > 0) {
        let needsClientSideFiltering = false;
        
        // Vérifier si le filtrage par type de propriété est nécessaire
        if (activeFilter === "TERRAINS" || activeFilter === "VILLAS") {
          // Vérifie si les données semblent déjà filtrées par le backend
          const alreadyFiltered = propertyArray.every(p => {
            if (activeFilter === "TERRAINS") return p.property_type === "TERRAIN";
            if (activeFilter === "VILLAS") return p.property_type === "VILLA";
            return true;
          });
          
          if (!alreadyFiltered) {
            console.log("Application d'un filtrage côté client pour property_type");
            needsClientSideFiltering = true;
            propertyArray = propertyArray.filter(p => {
              if (activeFilter === "TERRAINS") return p.property_type === "TERRAIN";
              if (activeFilter === "VILLAS") return p.property_type === "VILLA";
              return true;
            });
          }
        }
        
        // Filtrage côté client pour AHOFA/AMIDY si nécessaire
        if (ahofaFilter && !amidyFilter) {
          const filteredByTransactionType = propertyArray.some(p => p.transaction_type === "AHOFA");
          
          if (!filteredByTransactionType) {
            console.log("Application d'un filtrage côté client pour AHOFA");
            propertyArray = propertyArray.filter(p => p.transaction_type === "AHOFA");
          }
        } else if (amidyFilter && !ahofaFilter) {
          const filteredByTransactionType = propertyArray.some(p => p.transaction_type === "AMIDY");
          
          if (!filteredByTransactionType) {
            console.log("Application d'un filtrage côté client pour AMIDY");
            propertyArray = propertyArray.filter(p => p.transaction_type === "AMIDY");
          }
        }
        
        // Filtrage côté client pour la recherche
        if (searchTerm && searchTerm.trim() !== "") {
          const term = searchTerm.trim().toLowerCase();
          
          // Vérifier si les résultats semblent déjà filtrés par la recherche
          const searchTermFound = propertyArray.some(p => 
            p.title.toLowerCase().includes(term) || 
            (p.description && p.description.toLowerCase().includes(term))
          );
          
          // Si aucun résultat ne contient le terme de recherche, on filtre côté client
          if (!searchTermFound || propertyArray.length > 20) {
            console.log("Application d'un filtrage côté client pour la recherche");
            propertyArray = propertyArray.filter(p => 
              p.title.toLowerCase().includes(term) || 
              (p.description && p.description.toLowerCase().includes(term))
            );
          }
        }
      }
      
      setProperties(propertyArray);
      console.log("Données traitées:", propertyArray);
    } catch (err: any) {
      console.error("Erreur détaillée lors du chargement des propriétés:", err);
      if (err.response) {
        console.error("Erreur de réponse:", err.response.status, err.response.data);
        setError(`Erreur ${err.response.status}: ${err.response.data?.message || "Erreur serveur"}`);
      } else if (err.request) {
        console.error("Erreur de requête - pas de réponse du serveur:", err.request);
        setError("Impossible de se connecter au serveur. Vérifiez que le backend est en cours d'exécution.");
      } else {
        console.error("Erreur de configuration:", err.message);
        setError(`Erreur: ${err.message}`);
      }
      
      // Définir un tableau vide au lieu des données de test
      setProperties([]);
    } finally {
      setLoading(false);
      console.log("Chargement terminé");
    }
  };

  // Charger les propriétés au montage initial
  useEffect(() => {
    fetchProperties();
  }, []);

  // Charger les propriétés lorsque les filtres ou la page changent
  useEffect(() => {
    fetchProperties();
  }, [currentPage, activeFilter, priceFilter, ahofaFilter, amidyFilter]);

  // Gérer le changement de filtre
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    // Réinitialiser le carrousel à 0 pour afficher la première image du type actif
    setCurrentImageIndex(0);
    setCurrentPage(1);
  };

  // Gérer le changement de filtre de prix
  const handlePriceFilterChange = () => {
    setPriceFilter(!priceFilter);
    setCurrentPage(1);
  };

  // Gérer le changement de filtre AHOFA
  const handleAhofaFilterChange = () => {
    setAhofaFilter(true);
    setAmidyFilter(false);
    setCurrentPage(1);
  };

  // Gérer le changement de filtre AMIDY
  const handleAmidyFilterChange = () => {
    setAmidyFilter(true);
    setAhofaFilter(false);
    setCurrentPage(1);
  };

  // Pagination
  const handlePageChange = (page: number) => {
    console.log(`Tentative de changement de page: ${currentPage} -> ${page}`);
    if (page > 0 && page <= totalPages) {
      console.log(`Changement de page à: ${page}`);
      setCurrentPage(page);
    } else {
      console.log(`Page ${page} hors limites (1-${totalPages})`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  // Fonction pour obtenir l'image principale d'une propriété
  const getPropertyImage = (property: Property) => {
    if (property.media && property.media.length > 0) {
      const mediaUrl = property.media[0].media_url;
      return getMediaUrl(mediaUrl);
    }
    // Utiliser une image générique au lieu d'une image par catégorie
    return "/public_Trano/maison-01.png";
  };

  // Afficher l'état actuel du composant pour debugging
  console.log("État actuel:", {
    loading,
    error,
    propertiesCount: Array.isArray(properties) ? properties.length : "Non tableau",
    currentPage,
    totalPages,
    activeFilter,
    priceFilter,
    ahofaFilter,
    amidyFilter
  });

  // Corriger le rendu de la pagination qui peut causer des erreurs
  const renderPaginationNumbers = () => {
    if (!totalPages || totalPages <= 1) return null;
    
    try {
      return Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        // Afficher les pages autour de la page courante
        let pageNum = i + 1;
        
        if (totalPages > 5) {
          if (currentPage <= 3) {
            // Pour les premières pages, montrer 1,2,3,4,...,N
            if (i === 3) return null;
            if (i === 4) pageNum = totalPages;
          } else if (currentPage >= totalPages - 2) {
            // Pour les dernières pages, montrer 1,...,N-3,N-2,N-1,N
            if (i === 1) return null;
            if (i === 0) pageNum = 1;
            else pageNum = totalPages - (4 - i);
          } else {
            // Pour les pages au milieu, montrer 1,...,currentPage-1,currentPage,currentPage+1,...,N
            if (i === 0) pageNum = 1;
            else if (i === 1) return null;
            else if (i === 4) pageNum = totalPages;
            else pageNum = currentPage + (i - 2);
          }
        }
        
        // Rendre null pour "..."
        if (pageNum === null) {
          return (
            <span key={`ellipsis-${i}`} className="text-[#59e0c5] text-sm xs:text-lg sm:text-2xl">...</span>
          );
        }
        
        return (
          <span 
            key={pageNum}
            className={`${
              currentPage === pageNum 
                ? "w-6 h-6 xs:w-8 xs:h-8 sm:w-12 sm:h-12 rounded-full bg-[#1e293b] flex items-center justify-center" 
                : ""
            } text-[#59e0c5] text-sm xs:text-lg sm:text-2xl cursor-pointer`}
            onClick={() => handlePageChange(pageNum)}
          >
            {pageNum}
          </span>
        );
      }).filter(Boolean);
    } catch (err) {
      console.error("Erreur dans le rendu de la pagination:", err);
      return null;
    }
  };

  // Utilitaire de debounce pour éviter trop d'appels API pendant la saisie
  function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
    useEffect(() => {
      // Mettre à jour la valeur debounced après le délai
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
  
      // Annuler le timeout si la valeur change ou si le composant est démonté
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
  
    return debouncedValue;
  }

  // Valeur de recherche avec debounce
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms de délai

  // Déclencher la recherche quand le terme de recherche debounced change
  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      fetchProperties();
    }
  }, [debouncedSearchTerm]);

  // Fonction pour gérer l'ouverture du modal d'aperçu
  const handlePreviewClick = (property: Property) => {
    setSelectedProperty(property);
    setShowPreviewModal(true);
    setCurrentImageIndex(0);
    
    // Incrémenter les vues
    incrementPropertyView(property.property_id);
  };

  // Fonction pour fermer le modal
  const handleCloseModal = () => {
    setShowPreviewModal(false);
    setSelectedProperty(null);
    setCurrentImageIndex(0);
  };

  // Effet pour le défilement automatique du carrousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === filteredImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [filteredImages.length]);

  // Fonction pour incrémenter le nombre de vues d'une propriété
  const incrementPropertyView = async (propertyId: number) => {
    try {
      // Récupérer l'utilisateur connecté depuis le localStorage ou le service d'authentification
      const currentUser = localStorage.getItem('user') 
        ? JSON.parse(localStorage.getItem('user') || '{}') as CurrentUser 
        : null;
        
      // Préparer les données et headers pour l'API
      const headers: Record<string, string> = {};
      const params: Record<string, any> = {};
      
      // Si un utilisateur est connecté, on ajoute son ID
      if (currentUser && currentUser.user_id) {
        params['user_id'] = currentUser.user_id;
        headers['X-User-ID'] = currentUser.user_id.toString();
      }
      
      console.log('Incrementing view with user data:', { currentUser, params, headers });
      
      // Appel à l'API pour incrémenter le nombre de vues avec les informations d'utilisateur
      const response = await apiService.post<{status: string, views: number, debug_auth: any}>(
        `/properties/${propertyId}/view`, 
        params,
        { headers }
      );
      
      console.log('View increment response:', response.data);
      
      // Si la requête réussit, mettre à jour les vues dans le state local
      if (response.data && response.data.status === "success") {
        // Mise à jour du compteur de vues dans les propriétés locales
        setProperties(properties.map(prop => 
          prop.property_id === propertyId 
            ? { ...prop, views: response.data.views } 
            : prop
        ));
      }
    } catch (error) {
      console.error("Erreur lors de l'incrémentation des vues:", error);
    }
  };

  // Fonction pour passer à l'image suivante
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === filteredImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Fonction pour revenir à l'image précédente
  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? filteredImages.length - 1 : prevIndex - 1
    );
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
      <div className="max-w-[1440px] mx-auto px-4 xs:px-6 sm:px-8 md:px-12 lg:px-16 pt-4 xs:pt-6 sm:pt-8 md:pt-10 lg:pt-12 relative z-10">
        {/* Navigation Bar */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center py-2 xs:py-4 mb-8 xs:mb-10 sticky top-0 z-20 bg-inherit"
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
          <div className="relative">
            <input
              type="search"
              className={`w-[140px] xs:w-[200px] sm:w-[300px] h-8 xs:h-10 bg-transparent rounded-full px-3 xs:px-4 pr-8 text-xs xs:text-sm ${textColor} ${borderColor} border outline-none`}
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${textColor}`}
            >
              {searchTerm ? (
                <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm("");
                  }}
                >
                  
                </span>
              ) : (
                <span> </span>
              )}
            </button>
          </div>
        </motion.header>

        {/* Hero Section avec Carrousel */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative mt-2 xs:mt-3 mb-3 xs:mb-6 rounded-[24px] xs:rounded-[32px] overflow-hidden"
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={`carousel-image-${currentImageIndex}`}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full"
            >
              {filteredImages[currentImageIndex] && (
                <img
                  src={filteredImages[currentImageIndex].url}
                  alt="Hero"
                  className="w-full h-[150px] xs:h-[190px] sm:h-[230px] object-cover"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Overlay et Logo */}
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <img 
              src="/public_Trano/tafo-immo-logo.png" 
              alt="" 
              className="h-7 xs:h-10 sm:h-14" 
            />
          </div>

          {/* Indicateurs de position pour le carrousel */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {filteredImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex 
                    ? 'bg-white w-4' 
                    : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Filter Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mb-4 xs:mb-12 sticky top-[80px] z-20 bg-inherit"
        >
          <div className="inline-flex items-center gap-2 xs:gap-4 mb-2 xs:mb-4">
            <button 
              onClick={() => handleFilterChange("VILLAS")}
              className={`text-base xs:text-xl sm:text-2xl font-bold transition-colors ${
                activeFilter === "VILLAS" 
                  ? textColor 
                  : `${textColor} opacity-50 hover:opacity-70`
              }`}
            >
              TRANO
            </button>
            <div className={`w-0.5 h-4 xs:h-6 sm:h-8 ${isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]"}`}></div>
            <button 
              onClick={() => handleFilterChange("TERRAINS")}
              className={`text-base xs:text-xl sm:text-2xl font-bold transition-colors ${
                activeFilter === "TERRAINS" 
                  ? textColor 
                  : `${textColor} opacity-50 hover:opacity-70`
              }`}
            >
              TANY
            </button>
          </div>
          <div className={`border-t ${borderColor} w-40 sm:w-58 md:w-70 mx-auto mb-1 sm:mb-2`}></div>
          <div className="flex justify-center items-center gap-4 xs:gap-8 sm:gap-12">
            <div className="flex gap-4 xs:gap-8 sm:gap-12">
              <div 
                className="flex items-center gap-2 cursor-pointer" 
                onClick={handleAhofaFilterChange}
              >
                <div className={`w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 rounded-full ${
                  ahofaFilter 
                    ? `${isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]"} flex items-center justify-center` 
                    : `border-2 ${borderColor}`
                }`}>
                  {ahofaFilter && (
                    <div className={`w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 rounded-full ${isLightMode ? "bg-white" : "bg-[#0f172a]"}`}></div>
                  )}
                </div>
                <span className={`text-sm xs:text-base sm:text-xl ${textColor} whitespace-nowrap`}>
                  AHOFA
                </span>
              </div>

              <div 
                className="flex items-center gap-2 cursor-pointer" 
                onClick={handleAmidyFilterChange}
              >
                <div className={`w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 rounded-full ${
                  amidyFilter 
                    ? `${isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]"} flex items-center justify-center` 
                    : `border-2 ${borderColor}`
                }`}>
                  {amidyFilter && (
                    <div className={`w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 rounded-full ${isLightMode ? "bg-white" : "bg-[#0f172a]"}`}></div>
                  )}
                </div>
                <span className={`text-sm xs:text-base sm:text-xl ${textColor} whitespace-nowrap`}>
                  AMIDY
                </span>
              </div>
            </div>

            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={handlePriceFilterChange}
            >
              <div className={`w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 rounded-full ${
                priceFilter 
                  ? `${isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]"} flex items-center justify-center` 
                  : `border-2 ${borderColor}`
              }`}>
                {priceFilter && (
                  <div className={`w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 rounded-full ${isLightMode ? "bg-white" : "bg-[#0f172a]"}`}></div>
                )}
              </div>
              <span className={`text-sm xs:text-base sm:text-xl ${textColor} whitespace-nowrap`}>
                + de {isEuro ? formatCurrency(10116000, true).replace('.00', '') : "10 116 000 Ar"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* État de chargement */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className={`w-12 h-12 border-4 ${borderColor} border-t-transparent rounded-full animate-spin`}></div>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 text-center">
            <p className={isLightMode ? "text-red-700" : "text-white"}>{error}</p>
            <button 
              onClick={fetchProperties}
              className={`mt-2 px-4 py-1 ${isLightMode ? "bg-[#0150BC] text-white" : "bg-[#59e0c5] text-[#0f172a]"} rounded-full text-sm`}
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Pas de résultats */}
        {!loading && !error && properties.length === 0 && (
          <div className={`${cardBgColor} rounded-lg p-6 text-center`}>
            <p className={textColor}>Aucune propriété trouvée avec les filtres actuels.</p>
          </div>
        )}

        {/* Property Listings */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-5 xs:space-y-6 sm:space-y-8 max-h-[calc(102vh-400px)] overflow-y-auto pr-2"
        >
          {!loading && properties.map((property) => (
            <motion.div
              key={property.property_id}
              variants={itemVariants}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className={`${cardBgColor} rounded-lg xs:rounded-xl overflow-hidden border ${borderColorLight}`}
            >
              <div className="flex">
                <div className={`w-[130px] xs:w-[150px] sm:w-[180px] h-[90px] xs:h-[100px] sm:h-[120px] flex-shrink-0 ${buttonBg} flex items-center justify-center`}>
                  {imageErrors[property.property_id] ? (
                    <img
                      src="/public_Trano/maison-01.png"
                      alt={property.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src={getPropertyImage(property)}
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(property.property_id)}
                    />
                  )}
                </div>
                <div className="flex-1 p-2 xs:p-3 sm:p-4 flex flex-col justify-between h-[90px] xs:h-[100px] sm:h-[120px]">
                  <div>
                    <h3 className={`text-xs xs:text-sm sm:text-base font-semibold ${textColor} mb-1`}>
                      {property.title}
                    </h3>
                    <p className={`text-[10px] xs:text-xs sm:text-sm ${textSecondaryColor} line-clamp-1`}>
                      {property.description || `Située à ${property.location}, surface: ${property.surface}m²`}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] xs:text-xs sm:text-sm ${textColor} font-medium`}>
                        {formatCurrency(property.price, isEuro).replace('.00', '')}
                      </span>
                      <span className={`text-[10px] xs:text-xs sm:text-sm ${textSecondaryColor}`}>
                        • {property.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-1.5 xs:gap-2 sm:gap-3">
                    <button 
                      className={`px-2 xs:px-3 sm:px-4 py-0.5 xs:py-1 ${buttonBg} ${textColor} rounded-full ${buttonHoverBg} hover:text-white transition-all ${buttonBorder} ${buttonShadow} text-[10px] xs:text-xs sm:text-sm`}
                      onClick={() => handlePreviewClick(property)}
                    >
                      Aperçu
                    </button>
                    <button 
                      onClick={() => {
                        incrementPropertyView(property.property_id);
                        navigate(`/property/${property.property_id}`);
                      }}
                      className={`px-2 xs:px-3 sm:px-4 py-0.5 xs:py-1 ${buttonBg} ${textColor} rounded-full ${buttonHoverBg} hover:text-white transition-all ${buttonBorder} ${buttonShadow} text-[10px] xs:text-xs sm:text-sm`}
                    >
                      Visite virtuel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Pagination - toujours visible si totalPages > 1, même pour TOUS */}
        {!loading && !error && totalPages > 1 && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative mt-2 mb-2 flex flex-col items-center gap-2 sticky bottom-0 z-20 bg-inherit py-4"
          >
            <div className="flex justify-center items-center gap-1 xs:gap-2 sm:gap-4 py-4">
              <button 
                className={`w-6 h-6 xs:w-8 xs:h-8 sm:w-12 sm:h-12 rounded-full ${
                  currentPage > 1 
                    ? `${isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]"} cursor-pointer` 
                    : `${isLightMode ? "bg-[#0150BC]/50" : "bg-[#59e0c5]/50"} cursor-not-allowed`
                } flex items-center justify-center`}
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <span className={isLightMode ? "text-white" : "text-[#0f172a]"}>←</span>
              </button>
              
              <div className="flex items-center gap-1 xs:gap-2 sm:gap-4">
                {totalPages > 0 ? (
                  <>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <span 
                        key={page}
                        className={`${
                          currentPage === page 
                            ? `w-6 h-6 xs:w-8 xs:h-8 sm:w-12 sm:h-12 rounded-full ${isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]"} flex items-center justify-center ${isLightMode ? "text-white" : "text-[#0f172a]"}` 
                            : `text-[${isLightMode ? "#0150BC" : "#59e0c5"}] hover:opacity-80`
                        } text-sm xs:text-lg sm:text-2xl cursor-pointer`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </span>
                    ))}
                  </>
                ) : renderPaginationNumbers()}
              </div>
              
              <button 
                className={`w-6 h-6 xs:w-8 xs:h-8 sm:w-12 sm:h-12 rounded-full ${
                  currentPage < totalPages 
                    ? `${isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]"} cursor-pointer` 
                    : `${isLightMode ? "bg-[#0150BC]/50" : "bg-[#59e0c5]/50"} cursor-not-allowed`
                } flex items-center justify-center`}
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                <span className={isLightMode ? "text-white" : "text-[#0f172a]"}>→</span>
              </button>
            </div>
            
           
          </motion.div>
        )}
        
        {/* Ajouter une pagination simplifiée lorsqu'il n'y a qu'une seule page */}
        {!loading && !error && properties.length > 0 && totalPages <= 1 && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative mt-8 mb-12 flex justify-center items-center py-4"
          >
            <div className={`px-6 py-2 ${buttonBg} rounded-full ${textColor} text-sm`}>
              Page 1 sur 1
            </div>
          </motion.div>
        )}

        {/* Modal d'aperçu */}
        <AnimatePresence>
          {showPreviewModal && selectedProperty && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
              onClick={handleCloseModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`relative w-[90%] max-w-4xl ${cardBgColor} rounded-xl overflow-hidden`}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                {/* En-tête du modal */}
                <div className={`p-4 border-b ${borderColorLight}`}>
                  <h3 className={`text-lg font-semibold ${textColor}`}>{selectedProperty.title}</h3>
                </div>

                {/* Conteneur des images */}
                <div className="relative h-[300px] overflow-hidden">
                  <AnimatePresence initial={false} mode="wait">
                    {selectedProperty.media && selectedProperty.media.length > 0 ? (
                      (() => {
                        // Filtrer seulement les médias de type Photo
                        const photoMedia = selectedProperty.media.filter(media => media.media_type === 'Photo');
                        
                        // Si aucune photo, utiliser l'image par défaut
                        if (photoMedia.length === 0) {
                          return (
                            <motion.img
                              key="default-image"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              src="/public_Trano/maison-01.png"
                              alt="Image par défaut"
                              className="w-full h-full object-cover"
                            />
                          );
                        }
                        
                        // S'assurer que l'index est valide
                        const validIndex = currentImageIndex % photoMedia.length;
                        const currentMedia = photoMedia[validIndex];
                        
                        if (!currentMedia || !currentMedia.media_url) {
                          return (
                            <motion.img
                              key="fallback-image"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              src="/public_Trano/maison-01.png"
                              alt="Image par défaut"
                              className="w-full h-full object-cover"
                            />
                          );
                        }
                        
                        return (
                          <motion.img
                            key={`property-image-${validIndex}-${currentMedia.media_id}`}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.3 }}
                            src={getMediaUrl(currentMedia.media_url)}
                            alt={`Image ${validIndex + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = "/public_Trano/maison-01.png";
                            }}
                          />
                        );
                      })()
                    ) : (
                      <motion.img
                        key="no-media-image"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        src="/public_Trano/maison-01.png"
                        alt="Image par défaut"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </AnimatePresence>

                  {/* Flèches de navigation */}
                  {selectedProperty.media && selectedProperty.media.filter(media => media.media_type === 'Photo').length > 1 && (
                    <>
                      <button
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          const photoMedia = selectedProperty.media!.filter(media => media.media_type === 'Photo');
                          if (photoMedia.length > 0) {
                            setCurrentImageIndex((prev) => 
                              prev === 0 ? photoMedia.length - 1 : prev - 1
                            );
                          }
                        }}
                        className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full ${buttonBg} ${textColor} hover:opacity-80 transition-opacity`}
                      >
                        ←
                      </button>
                      <button
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          const photoMedia = selectedProperty.media!.filter(media => media.media_type === 'Photo');
                          if (photoMedia.length > 0) {
                            setCurrentImageIndex((prev) => 
                              prev === photoMedia.length - 1 ? 0 : prev + 1
                            );
                          }
                        }}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full ${buttonBg} ${textColor} hover:opacity-80 transition-opacity`}
                      >
                        →
                      </button>
                    </>
                  )}

                  {/* Indicateurs de navigation */}
                  {selectedProperty.media && selectedProperty.media.filter(media => media.media_type === 'Photo').length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {selectedProperty.media.filter(media => media.media_type === 'Photo').map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex 
                              ? `${isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]"} w-4` 
                              : "bg-white/50"
                          }`}
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            setCurrentImageIndex(index);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Bouton de fermeture */}
                <button
                  onClick={handleCloseModal}
                  className={`absolute top-4 right-4 p-2 rounded-full ${buttonBg} ${textColor} hover:opacity-80 transition-opacity`}
                >
                  ✕
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};