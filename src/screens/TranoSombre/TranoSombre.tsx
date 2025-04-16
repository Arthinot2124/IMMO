import { BellIcon, HomeIcon, SettingsIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/ComponentTrano/button";
import { Card, CardContent } from "../../components/ui/ComponentTrano/card";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import apiService from "../../services/apiService";
import NotificationBadge from "../../components/NotificationBadge";
import { getMediaUrl } from "../../config/api";

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
  category: string;
  status: string;
  media?: PropertyMedia[];
}

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export const TranoSombre = (): JSX.Element => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("TOUS");
  const [priceFilter, setPriceFilter] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});
  const [isLightMode, setIsLightMode] = useState(() => {
    const savedMode = localStorage.getItem('isLightMode');
    return savedMode !== null ? savedMode === 'true' : true;
  });

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
      // Construction des paramètres de requête
      let params: any = { 
        page: currentPage,
        include: 'media'
      };
      
      // Ajouter la pagination seulement pour les filtres spécifiques, pas pour "TOUS"
      if (activeFilter !== "TOUS") {
        params.per_page = 5;
      } else {
        params.per_page = 100;
      }
      
      // Ajout des filtres si sélectionnés et si ce n'est pas "TOUS"
      if (activeFilter === "TERRAINS") {
        params.category = "LITE";
      } else if (activeFilter === "VILLAS") {
        params.category = "PREMIUM";
      }
      
      if (priceFilter) {
        params.min_price = 10000000;
      }
      
      console.log("Appel API avec params:", params);
      
      // Utilisation de apiService pour récupérer les propriétés
      const response = await apiService.get<ApiResponse<{data: Property[], meta: {last_page: number}}>>('/properties', { params });
      
      console.log("Réponse API reçue:", response.data);
      
      // Vérifier la structure et extraire les données correctement
      let propertyArray: Property[] = [];
      
      if (response.data && response.data.data) {
        if (Array.isArray(response.data.data)) {
          propertyArray = response.data.data;
        } else if (response.data.data.data && Array.isArray(response.data.data.data)) {
          propertyArray = response.data.data.data;
          if (response.data.data.meta) {
            setTotalPages(response.data.data.meta.last_page || 1);
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
      
      // Charger des données de test pour éviter une page blanche en cas d'erreur
      setProperties([
        {
          property_id: 1,
          title: "Villa 4 pièces (Données hors ligne)",
          description: "Données de test en mode hors ligne",
          price: 45000000,
          surface: 120,
          location: "Tambohobe",
          category: "PREMIUM",
          status: "Disponible"
        },
        {
          property_id: 2,
          title: "Terrain 500m² (Données hors ligne)",
          description: "Données de test en mode hors ligne",
          price: 15000000,
          surface: 500,
          location: "Antarandolo",
          category: "LITE",
          status: "Disponible"
        }
      ]);
    } finally {
      setLoading(false);
      console.log("Chargement terminé");
    }
  };

  // Charger les propriétés au montage du composant et lorsque les filtres changent
  useEffect(() => {
    fetchProperties();
  }, [currentPage, activeFilter, priceFilter]);

  // Gérer le changement de filtre
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Réinitialiser à la première page lors du changement de filtre
  };

  // Gérer le changement de filtre de prix
  const handlePriceFilterChange = () => {
    setPriceFilter(!priceFilter);
    setCurrentPage(1);
  };

  // Pagination
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
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

  // Fonction pour obtenir l'image par défaut selon la catégorie
  const getDefaultImage = (category: string) => {
    if (category === "LITE") return "/public_Trano/calque-3.png";
    if (category === "PREMIUM") return "/public_Trano/maison-01.png";
    return "/public_Trano/calque-4.png";
  };

  // Fonction pour obtenir l'image principale d'une propriété
  const getPropertyImage = (property: Property) => {
    if (property.media && property.media.length > 0) {
      const mediaUrl = property.media[0].media_url;
      return getMediaUrl(mediaUrl);
    }
    return getDefaultImage(property.category);
  };

  // Afficher l'état actuel du composant pour debugging
  console.log("État actuel:", {
    loading,
    error,
    propertiesCount: Array.isArray(properties) ? properties.length : "Non tableau",
    currentPage,
    totalPages,
    activeFilter,
    priceFilter
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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`${bgColor} min-h-screen`}
    >
      <div 
        className="absolute inset-0 opacity-50 z-0" 
        style={{ 
          backgroundImage: `url(${isLightMode ? '/public_Accueil_Sombre/blie-pattern2.jpeg' : '/public_Accueil_Sombre/blie-pattern.png'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 0.5s ease-in-out'
        }}
      ></div>
      <div className="max-w-[1440px] mx-auto px-4 xs:px-6 sm:px-8 md:px-12 lg:px-16 pt-4 xs:pt-6 sm:pt-8 md:pt-10 lg:pt-12 relative z-10">
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
              onClick={() => navigate('/profile')}
            />
          </div>
          <div className="relative">
            <input
              type="search"
              className={`w-[140px] xs:w-[200px] sm:w-[300px] h-8 xs:h-10 bg-transparent rounded-full px-3 xs:px-4 text-xs xs:text-sm ${textColor} ${borderColor} border outline-none`}
              placeholder="Rechercher..."
            />
          </div>
        </motion.header>

        {/* Hero Section */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative mt-2 xs:mt-3 mb-3 xs:mb-6 rounded-[24px] xs:rounded-[32px] overflow-hidden"
        >
          <img
            src="/public_Trano/FIANARANTSOA.png"
            alt="Hero"
            className="w-full h-[150px] xs:h-[190px] sm:h-[230px] object-cover"
          />
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <img 
              src="/public_Trano/tafo-immo-logo.png" 
              alt="" 
              className="h-7 xs:h-10 sm:h-14" 
            />
          </div>
        </motion.div>

        {/* Filter Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mb-8 xs:mb-16"
        >
          <div className="inline-flex items-center gap-2 xs:gap-4 mb-2 xs:mb-4">
            <span className={`text-base xs:text-xl sm:text-2xl font-bold ${textColor}`}>TRANO</span>
            <div className={`w-0.5 h-4 xs:h-6 sm:h-8 ${isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]"}`}></div>
            <span className={`text-base xs:text-xl sm:text-2xl font-bold ${textColor}`}>TANY</span>
          </div>
          <div className={`border-t ${borderColor} w-40 sm:w-58 md:w-70 mx-auto mb-1 sm:mb-2`}></div>
          <div className="flex justify-center gap-4 xs:gap-8 sm:gap-12">
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => handleFilterChange("TOUS")}
            >
              <div className={`w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 rounded-full ${
                activeFilter === "TOUS" 
                  ? `${isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]"} flex items-center justify-center` 
                  : `border-2 ${borderColor}`
              }`}>
                {activeFilter === "TOUS" && (
                  <div className={`w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 rounded-full ${isLightMode ? "bg-white" : "bg-[#0f172a]"}`}></div>
                )}
              </div>
              <span className={`text-sm xs:text-base sm:text-xl ${textColor}`}>TOUS</span>
            </div>

            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => handleFilterChange("TERRAINS")}
            >
              <div className={`w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 rounded-full ${
                activeFilter === "TERRAINS" 
                  ? `${isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]"} flex items-center justify-center` 
                  : `border-2 ${borderColor}`
              }`}>
                {activeFilter === "TERRAINS" && (
                  <div className={`w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 rounded-full ${isLightMode ? "bg-white" : "bg-[#0f172a]"}`}></div>
                )}
              </div>
              <span className={`text-sm xs:text-base sm:text-xl ${textColor}`}>TERRAINS</span>
            </div>

            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => handleFilterChange("VILLAS")}
            >
              <div className={`w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 rounded-full ${
                activeFilter === "VILLAS" 
                  ? `${isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]"} flex items-center justify-center` 
                  : `border-2 ${borderColor}`
              }`}>
                {activeFilter === "VILLAS" && (
                  <div className={`w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 rounded-full ${isLightMode ? "bg-white" : "bg-[#0f172a]"}`}></div>
                )}
              </div>
              <span className={`text-sm xs:text-base sm:text-xl ${textColor}`}>VILLAS</span>
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
              <span className={`text-sm xs:text-base sm:text-xl ${textColor} whitespace-nowrap`}>+ de 10 000 000 Ar</span>
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
          className="space-y-5 xs:space-y-6 sm:space-y-8"
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
                      src={getDefaultImage(property.category)}
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
                    <p className={`text-[10px] xs:text-xs sm:text-sm ${textSecondaryColor} line-clamp-2`}>
                      {property.description || `Située à ${property.location}, surface: ${property.surface}m²`}
                    </p>
                  </div>
                  <div className="flex justify-end gap-1.5 xs:gap-2 sm:gap-3">
                    <button className={`px-2 xs:px-3 sm:px-4 py-0.5 xs:py-1 ${buttonBg} ${textColor} rounded-full ${buttonHoverBg} hover:text-white transition-all ${buttonBorder} ${buttonShadow} text-[10px] xs:text-xs sm:text-sm`}>
                      Apérçu
                    </button>
                    <button 
                      className={`px-2 xs:px-3 sm:px-4 py-0.5 xs:py-1 ${buttonBg} ${textColor} rounded-full ${buttonHoverBg} hover:text-white transition-all ${buttonBorder} ${buttonShadow} text-[10px] xs:text-xs sm:text-sm`}
                      onClick={() => navigate(`/property/${property.property_id}`)}
                    >
                      Détails
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
            className="flex justify-center items-center gap-1 xs:gap-2 sm:gap-4 my-8 xs:my-12 sm:my-16"
          >
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
              {renderPaginationNumbers()}
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
          </motion.div>
        )}
        
        {/* Ajouter une pagination simplifiée lorsqu'il n'y a qu'une seule page */}
        {!loading && !error && properties.length > 0 && totalPages <= 1 && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex justify-center items-center my-8 xs:my-12 sm:my-16"
          >
            <div className={`px-6 py-2 ${buttonBg} rounded-full ${textColor} text-sm`}>
              Page 1 sur 1
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};