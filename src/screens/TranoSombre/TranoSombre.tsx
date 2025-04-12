import { BellIcon, HomeIcon, SettingsIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/ComponentTrano/button";
import { Card, CardContent } from "../../components/ui/ComponentTrano/card";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import NotificationBadge from "../../components/NotificationBadge";

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
  media?: PropertyMedia[]; // Ajout du champ pour les médias
  // Ajoutez ici d'autres champs de votre table 'properties' si nécessaire
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
      let url = 'http://localhost:8000/api/properties';
      let params: any = { 
        page: currentPage,
        include: 'media' // Ajouter l'inclusion des médias
      };
      
      // Ajouter la pagination seulement pour les filtres spécifiques, pas pour "TOUS"
      if (activeFilter !== "TOUS") {
        params.per_page = 5; // 5 propriétés par page pour les filtres spécifiques
      } else {
        params.per_page = 100; // Nombre élevé pour simuler "tous" sans désactiver la pagination
      }
      
      // Ajout des filtres si sélectionnés et si ce n'est pas "TOUS"
      if (activeFilter === "TERRAINS") {
        params.category = "LITE"; // Ajustez selon la valeur correspondante dans votre DB
      } else if (activeFilter === "VILLAS") {
        params.category = "PREMIUM"; // Ajustez selon la valeur correspondante dans votre DB
      }
      // Pas de filtre de catégorie si "TOUS" est sélectionné
      
      if (priceFilter) {
        params.min_price = 10000000; // 10 millions Ar
      }
      
      console.log("Appel API avec params:", params);
      
      // Exécution de la requête
      const response = await axios.get(url, { 
        params,
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Réponse API reçue:", response.data);
      
      // Vérifier la structure et extraire les données correctement
      let propertyArray: Property[] = [];
      
      if (response.data && response.data.data) {
        // Structure: { status: "success", data: [...] }
        if (Array.isArray(response.data.data)) {
          propertyArray = response.data.data;
        } 
        // Structure: { status: "success", data: { data: [...], ... } } (pagination Laravel)
        else if (response.data.data.data && Array.isArray(response.data.data.data)) {
          propertyArray = response.data.data.data;
          // Gestion de la pagination
          if (response.data.data.meta) {
            setTotalPages(response.data.data.meta.last_page || 1);
          } else if (response.data.data.last_page) {
            setTotalPages(response.data.data.last_page || 1);
          }
        }
        // Structure inconnue mais valide
        else {
          console.warn("Structure de données inattendue:", response.data);
          propertyArray = [];
        }
      } else if (Array.isArray(response.data)) {
        // L'API renvoie directement un tableau
        propertyArray = response.data;
      } else {
        console.error("Format de réponse API inattendu:", response.data);
        setError("Format de données inattendu");
        propertyArray = [];
      }
      
      // S'assurer que propertyArray est bien un tableau avant de le mettre dans l'état
      if (!Array.isArray(propertyArray)) {
        console.error("Les données ne sont pas un tableau:", propertyArray);
        propertyArray = [];
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
    if (category === "LITE") return "/public_Trano/calque-3.png"; // Terrains
    if (category === "PREMIUM") return "/public_Trano/maison-01.png"; // Villas
    return "/public_Trano/calque-4.png"; // Autres
  };

  // Fonction pour obtenir l'image principale d'une propriété
  const getPropertyImage = (property: Property) => {
    // Si la propriété a des médias, utilisez le premier
    if (property.media && property.media.length > 0) {
      const mediaUrl = property.media[0].media_url;
      // Si l'URL commence par "/", ajoutez la base URL
      if (mediaUrl.startsWith('/')) {
        return `http://localhost:8000${mediaUrl}`;
      }
      // Si l'URL commence déjà par http://, utilisez-la telle quelle
      if (mediaUrl.startsWith('http')) {
        return mediaUrl;
      }
      // Sinon, supposez qu'il s'agit d'un chemin relatif et ajoutez la base URL
      return `http://localhost:8000/${mediaUrl}`;
    }
    
    // Si pas d'image, utilisez l'image par défaut selon la catégorie
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
      className="bg-[#0f172a] min-h-screen"
    >
      <div className="max-w-[1440px] mx-auto px-4 xs:px-6 sm:px-8 md:px-12 lg:px-16 pt-4 xs:pt-6 sm:pt-8 md:pt-10 lg:pt-12">
        {/* Navigation Bar */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center py-2 xs:py-4 mb-8 xs:mb-10"
        >
          <div className="flex gap-2 xs:gap-4">
            <HomeIcon 
              className="w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-[#59e0c5] cursor-pointer hover:text-[#59e0c5]/80 transition-colors" 
              onClick={() => navigate('/home')}
            />
            <NotificationBadge size="lg" />
            <SettingsIcon 
              className="w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-[#59e0c5] cursor-pointer hover:text-[#59e0c5]/80 transition-colors" 
              onClick={() => navigate('/profile')}
            />
          </div>
          <div className="relative">
            <input
              type="search"
              className="w-[140px] xs:w-[200px] sm:w-[300px] h-8 xs:h-10 bg-transparent rounded-full px-3 xs:px-4 text-xs xs:text-sm text-[#59e0c5] border border-[#59e0c5] outline-none"
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
            <span className="text-base xs:text-xl sm:text-2xl font-bold text-[#59e0c5]">TRANO</span>
            <div className="w-0.5 h-4 xs:h-6 sm:h-8 bg-[#59e0c5]"></div>
            <span className="text-base xs:text-xl sm:text-2xl font-bold text-[#59e0c5]">TANY</span>
          </div>
          <div className="border-t border-[#59e0c5] w-40 sm:w-58 md:w-70 mx-auto mb-1 sm:mb-2"></div>
          <div className="flex justify-center gap-4 xs:gap-8 sm:gap-12">
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => handleFilterChange("TOUS")}
            >
              <div className={`w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 rounded-full ${
                activeFilter === "TOUS" 
                  ? "bg-[#59e0c5] flex items-center justify-center" 
                  : "border-2 border-[#59e0c5]"
              }`}>
                {activeFilter === "TOUS" && (
                  <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#0f172a]"></div>
                )}
              </div>
              <span className="text-sm xs:text-base sm:text-xl text-[#59e0c5]">TOUS</span>
            </div>

            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => handleFilterChange("TERRAINS")}
            >
              <div className={`w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 rounded-full ${
                activeFilter === "TERRAINS" 
                  ? "bg-[#59e0c5] flex items-center justify-center" 
                  : "border-2 border-[#59e0c5]"
              }`}>
                {activeFilter === "TERRAINS" && (
                  <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#0f172a]"></div>
                )}
              </div>
              <span className="text-sm xs:text-base sm:text-xl text-[#59e0c5]">TERRAINS</span>
            </div>

            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => handleFilterChange("VILLAS")}
            >
              <div className={`w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 rounded-full ${
                activeFilter === "VILLAS" 
                  ? "bg-[#59e0c5] flex items-center justify-center" 
                  : "border-2 border-[#59e0c5]"
              }`}>
                {activeFilter === "VILLAS" && (
                  <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#0f172a]"></div>
                )}
              </div>
              <span className="text-sm xs:text-base sm:text-xl text-[#59e0c5]">VILLAS</span>
            </div>
            
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={handlePriceFilterChange}
            >
              <div className={`w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 rounded-full ${
                priceFilter 
                  ? "bg-[#59e0c5] flex items-center justify-center" 
                  : "border-2 border-[#59e0c5]"
              }`}>
                {priceFilter && (
                  <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#0f172a]"></div>
                )}
              </div>
              <span className="text-sm xs:text-base sm:text-xl text-[#59e0c5] whitespace-nowrap">+ de 10 000 000 Ar</span>
            </div>
          </div>
        </motion.div>

        {/* État de chargement */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-[#59e0c5] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 text-center">
            <p className="text-white">{error}</p>
            <button 
              onClick={fetchProperties}
              className="mt-2 px-4 py-1 bg-[#59e0c5] text-[#0f172a] rounded-full text-sm"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Pas de résultats */}
        {!loading && !error && properties.length === 0 && (
          <div className="bg-[#1e293b]/50 rounded-lg p-6 text-center">
            <p className="text-[#59e0c5]">Aucune propriété trouvée avec les filtres actuels.</p>
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
              className="bg-[#1e293b]/50 rounded-lg xs:rounded-xl overflow-hidden border border-[#59e0c5]/30"
            >
              <div className="flex">
                <div className="w-[130px] xs:w-[150px] sm:w-[180px] h-[90px] xs:h-[100px] sm:h-[120px] flex-shrink-0 bg-[#1e293b] flex items-center justify-center">
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
                    <h3 className="text-xs xs:text-sm sm:text-base font-semibold text-[#59e0c5] mb-1">
                      {property.title}
                    </h3>
                    <p className="text-[10px] xs:text-xs sm:text-sm text-gray-300 line-clamp-2">
                      {property.description || `Située à ${property.location}, surface: ${property.surface}m²`}
                    </p>
                  </div>
                  <div className="flex justify-end gap-1.5 xs:gap-2 sm:gap-3">
                    <button className="px-2 xs:px-3 sm:px-4 py-0.5 xs:py-1 bg-[#1e293b] text-[#59e0c5] rounded-full hover:bg-[#59e0c5] hover:text-[#1e293b] transition-colors text-[10px] xs:text-xs sm:text-sm">
                      Apérçu
                    </button>
                    <button 
                      className="px-2 xs:px-3 sm:px-4 py-0.5 xs:py-1 bg-[#1e293b] text-[#59e0c5] rounded-full hover:bg-[#59e0c5] hover:text-[#1e293b] transition-colors text-[10px] xs:text-xs sm:text-sm"
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
                currentPage > 1 ? "bg-[#59e0c5] cursor-pointer" : "bg-[#59e0c5]/50 cursor-not-allowed"
              } flex items-center justify-center`}
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <span className="text-[#0f172a] text-xs xs:text-sm sm:text-base">←</span>
            </button>
            
            <div className="flex items-center gap-1 xs:gap-2 sm:gap-4">
              {renderPaginationNumbers()}
            </div>
            
            <button 
              className={`w-6 h-6 xs:w-8 xs:h-8 sm:w-12 sm:h-12 rounded-full ${
                currentPage < totalPages ? "bg-[#59e0c5] cursor-pointer" : "bg-[#59e0c5]/50 cursor-not-allowed"
              } flex items-center justify-center`}
              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              <span className="text-[#0f172a] text-xs xs:text-sm sm:text-base">→</span>
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
            <div className="px-6 py-2 bg-[#1e293b] rounded-full text-[#59e0c5] text-sm">
              Page 1 sur 1
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};