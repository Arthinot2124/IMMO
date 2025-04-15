import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { HomeIcon, SettingsIcon } from "lucide-react";
import NotificationBadge from "../../components/NotificationBadge";
import axios from "axios";
import { BellIcon, HeartIcon, CalendarIcon, StarIcon, MessageSquareIcon, ShareIcon, ImageIcon } from "lucide-react";

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
  // Autres champs
  rating?: number;
  reviews?: number;
  user_id: number;
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

  // Charger les données de la propriété
  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!id) {
        setError("ID de propriété non spécifié");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8000/api/properties/${id}`, {
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.data && response.data.status === "success" && response.data.data) {
          console.log("Propriété chargée:", response.data.data);
          setProperty(response.data.data);
        } else {
          throw new Error("Format de réponse inattendu");
        }
      } catch (err: any) {
        console.error("Erreur lors du chargement de la propriété:", err);
        setError(err.response?.data?.message || err.message || "Erreur lors du chargement des données");
        // Utiliser les données de secours
        setProperty({
          ...fallbackProperty, 
          property_id: parseInt(id)
        } as Property);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
  }, [id]);

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
      // Convertir les URLs des médias en URLs complètes
      return property.media.map(media => {
        if (media.media_url.startsWith('/')) {
          return `http://localhost:8000${media.media_url}`;
        }
        if (media.media_url.startsWith('http')) {
          return media.media_url;
        }
        return `http://localhost:8000/${media.media_url}`;
      });
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

  // Formater le prix
  const formatPrice = (price?: number): string => {
    if (!price) return "Prix non spécifié";
    return new Intl.NumberFormat('fr-FR').format(price) + " Ar";
  };

  // Fonction pour déterminer si l'utilisateur est le propriétaire de ce bien
  const isPropertyOwner = (): boolean => {
    const currentUserId = localStorage.getItem('user_id');
    return !!currentUserId && property?.user_id === parseInt(currentUserId);
  };

  // Propriétés extraites pour simplifier le template
  const images = getImageUrls();
  const propertyId = property?.property_id || 1;

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
          className="flex justify-between items-center py-2 xs:py-4 mb-6 sm:mb-8"
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
          <button 
            onClick={() => navigate('/trano')}
            className={`${buttonPrimaryBg} ${buttonPrimaryText} px-3 py-1.5 rounded-lg hover:opacity-90 transition-colors text-sm`}
          >
            Retour aux annonces
          </button>
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
              className="mb-6 sm:mb-8"
            >
              <div className={`relative ${imageBgColor} rounded-2xl overflow-hidden h-[200px] xs:h-[250px] sm:h-[350px] md:h-[450px] ${imageBorder}`}>
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]}
                    alt={property.title}
                    className="w-full h-full object-contain"
                    onError={() => handleImageError(selectedImage)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon size={48} />
                    <p className="mt-4 text-xl">Aucune image disponible</p>
                  </div>
                )}
                <button 
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`absolute top-4 right-4 ${favoriteButtonBg} p-2 rounded-full`}
                >
                  <HeartIcon 
                    className={`w-6 h-6 ${isFavorite ? 'text-red-500 fill-red-500' : isLightMode ? 'text-[#0f172a]' : 'text-white'}`} 
                  />
                </button>
              </div>
              
              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <div 
                      key={index}
                      className={`w-16 h-16 xs:w-20 xs:h-20 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 ${selectedImage === index ? borderColor : 'border-transparent'}`}
                      onClick={() => setSelectedImage(index)}
                    >
                      {imageErrors[index] ? (
                        <div className={`w-full h-full ${imageBgColor} flex items-center justify-center`}>
                          <ImageIcon size={20} className="text-gray-400" />
                        </div>
                      ) : (
                        <img 
                          src={image} 
                          alt={`Miniature ${index + 1}`} 
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(index)}
                        />
                      )}
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
              className={`${cardBgColor} rounded-2xl p-5 sm:p-8 mb-6 sm:mb-8 ${cardBorder}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold ${textPrimaryColor} mb-2`}>{property.title}</h1>
                  <p className={`${textColor} text-lg sm:text-xl font-semibold`}>{formatPrice(property.price)}</p>
                  <p className={`${textSecondaryColor} text-sm`}>{property.location || "Emplacement non spécifié"}</p>
                </div>
                {(property.rating && property.reviews) && (
                  <div className="flex items-center">
                    <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
                    <span className={textPrimaryColor}>{property.rating} ({property.reviews} avis)</span>
                  </div>
                )}
              </div>
              
              <div className={`border-t ${borderColorLight} my-4 pt-4`}>
                <h3 className={`${textColor} font-semibold mb-2`}>Description</h3>
                <p className={`${textSecondaryColor} text-sm`}>{property.description || "Aucune description disponible."}</p>
              </div>
              
              <div className={`border-t ${borderColorLight} my-4 pt-4`}>
                <h3 className={`${textColor} font-semibold mb-2`}>Caractéristiques</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {/* Caractéristiques extraites des propriétés */}
                  <div className={`flex items-center ${textSecondaryColor} text-sm`}>
                    <div className={`w-2 h-2 ${isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]"} rounded-full mr-2`}></div>
                    Surface: {property.surface || "Non spécifiée"} m²
                  </div>
                  <div className={`flex items-center ${textSecondaryColor} text-sm`}>
                    <div className={`w-2 h-2 ${isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]"} rounded-full mr-2`}></div>
                    Catégorie: {property.category}
                  </div>
                  <div className={`flex items-center ${textSecondaryColor} text-sm`}>
                    <div className={`w-2 h-2 ${isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]"} rounded-full mr-2`}></div>
                    Statut: {property.status}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-2 gap-4 mb-8"
            >
              <button 
                className={`flex items-center justify-center gap-2 ${buttonPrimaryBg} ${buttonPrimaryText} font-bold py-3 rounded-lg hover:opacity-90 transition-colors border ${isLightMode ? "border-[#0150BC]" : "border-transparent"}`}
                onClick={() => window.location.href = `/property/${propertyId}/book`}
              >
                <CalendarIcon size={20} />
                <span>Réserver une visite</span>
              </button>
              
              <button className={`flex items-center justify-center gap-2 ${buttonSecondaryBg} ${buttonSecondaryText} font-bold py-3 rounded-lg hover:opacity-90 transition-colors border ${isLightMode ? "border-[#0150BC]" : "border-transparent"}`}>
                <MessageSquareIcon size={20} className={textColor} />
                <span>Contacter l'agence</span>
              </button>
            </motion.div>

            {/* Share Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center mb-12"
            >
              <button className={`inline-flex items-center gap-2 ${textColor} hover:underline`}>
                <ShareIcon size={18} />
                <span>Partager cette annonce</span>
              </button>
            </motion.div>
          </>
        ) : null}
      </div>
    </motion.div>
  );
};

export default PropertyDetail; 