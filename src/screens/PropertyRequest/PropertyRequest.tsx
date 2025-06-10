import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HomeIcon, SettingsIcon, BuildingIcon, AlertCircleIcon, CheckCircleIcon, InfoIcon, XIcon, ImagePlusIcon, SunIcon, MoonIcon, PlusCircleIcon, MinusCircleIcon, ChevronDown, ChevronUp } from "lucide-react";
import NotificationBadge from "../../components/NotificationBadge";
import apiService from "../../services/apiService";
import axios from "axios";
import { API_URL } from "../../config/api";

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

// Interface pour les caractéristiques du bien immobilier
interface PropertyFeatures {
  // Caractéristiques générales
  meuble: boolean;
  cuisineEquipee: boolean;
  salonSpacieux: boolean;
  climatisation: boolean;
  balconTerrasse: boolean;
  jardin: boolean;
  piscine: boolean;
  garageParking: boolean;
  accesVehicule: boolean;
  portailSecurite: boolean;
  
  // Détails des pièces
  nombreChambres: number;
  nombreSallesDeBain: number;
  
  // WC
  wcInterne: boolean;
  wcExterne: boolean;
  wcPrivatif: boolean;
  wcCommun: boolean;
  
  // Autres commodités
  eauCourante: boolean;
  electriciteJirama: boolean;
  foragePuits: boolean;
  reservoirEau: boolean;
  chauffeEau: boolean;
  internetDisponible: boolean;
  reseauMobileFort: boolean;
  routePraticable: boolean;
}

export const PropertyRequest = (): JSX.Element => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    additional_details: "",
    price: "",
    surface: "",
    location: "",
    category: "LITE",
    property_status: "Disponible",
    property_type: "VILLA",
    transaction_type: "AHOFA"
  });
  
  // État pour les caractéristiques du bien
  const [features, setFeatures] = useState<PropertyFeatures>({
    // Caractéristiques générales
    meuble: false,
    cuisineEquipee: false,
    salonSpacieux: false,
    climatisation: false,
    balconTerrasse: false,
    jardin: false,
    piscine: false,
    garageParking: false,
    accesVehicule: false,
    portailSecurite: false,
    
    // Détails des pièces
    nombreChambres: 0,
    nombreSallesDeBain: 0,
    
    // WC
    wcInterne: false,
    wcExterne: false,
    wcPrivatif: false,
    wcCommun: false,
    
    // Autres commodités
    eauCourante: false,
    electriciteJirama: false,
    foragePuits: false,
    reservoirEau: false,
    chauffeEau: false,
    internetDisponible: false,
    reseauMobileFort: false,
    routePraticable: false
  });
  
  // États pour contrôler les sections pliées/dépliées
  const [sectionsExpanded, setSectionsExpanded] = useState({
    caracteristiques: false,
    pieces: false,
    commodites: false
  });
  const [activePropertyType, setActivePropertyType] = useState<string>("VILLA");
  const [ahofaFilter, setAhofaFilter] = useState<boolean>(true);
  const [amidyFilter, setAmidyFilter] = useState<boolean>(false);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string[]}>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [isLightMode, setIsLightMode] = useState(() => {
    // Récupérer la préférence depuis localStorage
    const savedMode = localStorage.getItem('isLightMode');
    return savedMode !== null ? savedMode === 'true' : true;
  });

  // Couleurs qui changent en fonction du mode
  const accentColor = isLightMode ? "#0150BC" : "#59e0c5";
  const bgColor = isLightMode ? "bg-white" : "bg-[#0f172a]";
  const cardBgColor = isLightMode ? "bg-[#F8FAFC]" : "bg-[#1E2B47]";
  const darkBgColor = isLightMode ? "bg-[#EFF6FF]" : "bg-[#0f172a]";
  const inputBgColor = isLightMode ? "bg-white" : "bg-[#0f172a]";
  const textColor = isLightMode ? "text-[#0150BC]" : "text-[#59e0c5]";
  const textPrimaryColor = isLightMode ? "text-[#1E293B]" : "text-white";
  const textSecondaryColor = isLightMode ? "text-gray-700" : "text-gray-300";
  const buttonPrimaryBg = isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]";
  const buttonPrimaryText = isLightMode ? "text-white" : "text-[#0f172a]";
  const borderColor = isLightMode ? "border-[#0150BC]" : "border-[#59e0c5]";
  const cardBorder = isLightMode ? "border border-[#0150BC]/30" : "border border-[#59e0c5]/30";
  const successBgColor = isLightMode ? "bg-green-100" : "bg-green-500/20";
  const successTextColor = isLightMode ? "text-green-700" : "text-white";
  const errorBgColor = isLightMode ? "bg-red-100" : "bg-red-500/20";
  const errorTextColor = isLightMode ? "text-red-700" : "text-white";
  const hintTextColor = isLightMode ? "text-gray-500" : "text-gray-400";
  const uploadBgColor = isLightMode ? "bg-white" : "bg-[#0f172a]";
  const uploadBorderColor = isLightMode ? "border-[#0150BC]" : "border-[#59e0c5]";

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
  
  // Mettre à jour la description quand les caractéristiques changent
  useEffect(() => {
    const newDescription = generateDescription();
    setFormData(prev => ({
      ...prev,
      description: newDescription,
      // Assurez-vous que additional_details reste ce que l'utilisateur a entré
      additional_details: prev.additional_details
    }));
  }, [features]);

  // Fonction pour basculer entre le mode clair et sombre
  const toggleLightMode = () => {
    const newMode = !isLightMode;
    setIsLightMode(newMode);
    localStorage.setItem('isLightMode', newMode.toString());
  };

  // Récupérer l'ID utilisateur et la catégorie sélectionnée au chargement
  useEffect(() => {
    // Récupérer l'ID utilisateur depuis le localStorage
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      // Si aucun utilisateur n'est connecté, rediriger vers la page de connexion
      navigate('/');
      setError("Vous devez être connecté pour soumettre une demande de propriété");
    }
    
    // Récupérer la catégorie sélectionnée depuis le localStorage
    const selectedCategory = localStorage.getItem('selected_category');
    if (selectedCategory) {
      setFormData(prev => ({
        ...prev,
        category: selectedCategory
      }));
      console.log("Catégorie récupérée du localStorage:", selectedCategory);
    }
  }, [navigate]);

  // Fonction pour formater le prix avec séparation par milliers
  const formatPrice = (price: string): string => {
    // Supprimer tous les caractères non numériques
    const numericValue = price.replace(/[^\d]/g, '');
    // Formater avec séparation par groupes de 3 chiffres
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Traitement spécial pour le champ prix
    if (name === 'price') {
      const formattedPrice = formatPrice(value);
      // Pour l'affichage, on utilise le prix formaté
      e.target.value = formattedPrice;
      // Pour le state, on garde seulement les chiffres
      setFormData({
        ...formData,
        [name]: formattedPrice.replace(/\s/g, '')
      });
    }
    // Si c'est le champ description, on met à jour aussi additional_details
    else if (name === 'description') {
      setFormData({
        ...formData,
        description: value
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Effacer l'erreur de validation pour ce champ
    if (validationErrors[name]) {
      const newErrors = {...validationErrors};
      delete newErrors[name];
      setValidationErrors(newErrors);
    }
  };

  // Gérer le changement de type de propriété (VILLA/TERRAIN)
  const handlePropertyTypeChange = (type: string) => {
    setActivePropertyType(type);
    setFormData({
      ...formData,
      property_type: type
    });
  };

  // Gérer le changement de type de transaction (AHOFA/AMIDY)
  const handleAhofaFilterChange = () => {
    const newValue = !ahofaFilter;
    setAhofaFilter(newValue);
    setAmidyFilter(!newValue); // Toujours opposé à AHOFA
    setFormData({
      ...formData,
      transaction_type: newValue ? "AHOFA" : "AMIDY"
    });
  };

  const handleAmidyFilterChange = () => {
    const newValue = !amidyFilter;
    setAmidyFilter(newValue);
    setAhofaFilter(!newValue); // Toujours opposé à AMIDY
    setFormData({
      ...formData,
      transaction_type: newValue ? "AMIDY" : "AHOFA"
    });
  };
  
  // Gérer les changements de cases à cocher des caractéristiques
  const handleFeatureToggle = (feature: keyof PropertyFeatures) => {
    setFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  // Gérer les compteurs (chambre, salles de bain)
  const handleCounterChange = (feature: keyof PropertyFeatures, increment: boolean) => {
    setFeatures(prev => {
      const currentValue = prev[feature] as number;
      let newValue = increment ? currentValue + 1 : currentValue - 1;
      
      // Assurer que les valeurs restent positives
      if (newValue < 0) newValue = 0;
      if (newValue > 10) newValue = 10; // Maximum raisonnable
      
      return {
        ...prev,
        [feature]: newValue
      };
    });
  };
  
  // Fonction pour générer la description complète à partir des caractéristiques
  // Fonction pour basculer les sections pliées/dépliées
  const toggleSection = (section: 'caracteristiques' | 'pieces' | 'commodites') => {
    setSectionsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const generateDescription = () => {
    let description = "";
    
    // Caractéristiques générales
    const generalFeatures = [];
    if (features.meuble) generalFeatures.push("Meublé");
    if (features.cuisineEquipee) generalFeatures.push("Cuisine équipée");
    if (features.salonSpacieux) generalFeatures.push("Salon spacieux");
    if (features.climatisation) generalFeatures.push("Climatisation");
    if (features.balconTerrasse) generalFeatures.push("Balcon/Terrasse");
    if (features.jardin) generalFeatures.push("Jardin");
    if (features.piscine) generalFeatures.push("Piscine");
    if (features.garageParking) generalFeatures.push("Garage/Parking");
    if (features.accesVehicule) generalFeatures.push("Accès véhicule");
    if (features.portailSecurite) generalFeatures.push("Portail/Sécurité");
    
    if (generalFeatures.length > 0) {
      description += "📋 Caractéristiques générales: " + generalFeatures.join(", ") + ".\n\n";
    }
    
    // Détails des pièces
    description += `🏠 Détails des pièces: ${features.nombreChambres} chambre(s), ${features.nombreSallesDeBain} salle(s) de bain`;
    
    // WC
    const wcFeatures = [];
    if (features.wcInterne) wcFeatures.push("interne");
    if (features.wcExterne) wcFeatures.push("externe");
    if (features.wcPrivatif) wcFeatures.push("privatif");
    if (features.wcCommun) wcFeatures.push("commun");
    
    if (wcFeatures.length > 0) {
      description += `, WC ${wcFeatures.join(" et ")}`;
    }
    description += ".\n\n";
    
    // Autres commodités
    const otherFeatures = [];
    if (features.eauCourante) otherFeatures.push("Eau courante");
    if (features.electriciteJirama) otherFeatures.push("Électricité Jirama");
    if (features.foragePuits) otherFeatures.push("Forage/Puits");
    if (features.reservoirEau) otherFeatures.push("Réservoir d'eau");
    if (features.chauffeEau) otherFeatures.push("Chauffe-eau");
    if (features.internetDisponible) otherFeatures.push("Internet disponible");
    if (features.reseauMobileFort) otherFeatures.push("Bon réseau mobile");
    if (features.routePraticable) otherFeatures.push("Route praticable");
    
    if (otherFeatures.length > 0) {
      description += "🔌 Commodités: " + otherFeatures.join(", ") + ".";
    }
    
    return description;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Create preview URLs
      const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
      
      setImages([...images, ...filesArray]);
      setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newPreviewUrls = [...previewUrls];
    
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    newImages.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    setImages(newImages);
    setPreviewUrls(newPreviewUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setValidationErrors({});
    
    try {
      // Vérifications basiques
      if (!userId) {
        throw new Error("Vous devez être connecté pour soumettre une demande");
      }
      
      // Préparer les données pour l'API (selon le schema de la base de données)
      const requestData = {
        user_id: parseInt(userId),
        title: formData.title,
        description: formData.description,
        // Convertir le prix en supprimant les espaces d'abord
        price: formData.price ? parseFloat(formData.price.replace(/\s/g, '')) : 0,
        surface: formData.surface ? parseFloat(formData.surface) : 0,
        location: formData.location || "",
        category: formData.category || "LITE",
        property_status: formData.property_status || "Disponible",
        property_type: formData.property_type || "VILLA",
        additional_details: formData.additional_details || "",
        transaction_type: formData.transaction_type || "AHOFA",
        status: "En attente"
      };
      
      console.log("Données envoyées:", requestData);
      
      // Utilisation de apiService pour créer la demande de propriété
      const response = await apiService.post<ApiResponse<{request_id: number}>>('/property-requests', requestData);
      
      console.log("API Response:", response.data);
      
      // Gestion des images avec FormData (nécessite une approche différente)
      if (images.length > 0 && response.data?.data?.request_id) {
        const formData = new FormData();
        
        images.forEach(image => {
          formData.append('images[]', image);
        });
        
        try {
          // Pour l'upload de fichiers, on utilise axios directement car apiService
          // est configuré avec des headers spécifiques pour JSON
          const uploadResponse = await axios.post(
            `${API_URL}/api/property-requests/${response.data.data.request_id}/images`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
              }
            }
          );
          
          console.log("Images uploaded successfully:", uploadResponse.data);
        } catch (uploadError) {
          console.error("Error uploading images:", uploadError);
          // We continue even if image upload fails
        }
      }
      
      // Afficher le message de succès
      setSubmitSuccess(true);
      
      // Réinitialiser le formulaire et rediriger après 3 secondes
      setTimeout(() => {
        setSubmitSuccess(false);
        navigate('/home');
      }, 3000);
    } catch (err: any) {
      console.error("Erreur lors de l'envoi de la demande:", err);
      
      // Traitement des erreurs de validation (422)
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
        setError("Veuillez corriger les erreurs de validation dans le formulaire.");
      } else {
        setError(err.response?.data?.message || err.message || "Une erreur est survenue lors de l'envoi de votre demande. Veuillez réessayer.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction utilitaire pour afficher les erreurs de validation
  const getFieldError = (fieldName: string) => {
    return validationErrors[fieldName] ? validationErrors[fieldName][0] : null;
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
          className="flex justify-between items-center py-2 xs:py-4 mb-6 xs:mb-10"
        >
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-colors" onClick={() => navigate('/category-selection')}>
            <img 
              src={isLightMode ? "/public_Trano/fleche_retour_b.png" : "/public_Trano/fleche_retour_v.png"} 
              alt="Retour" 
              className="w-7 h-7 xs:w-7 xs:h-7 sm:w-8 sm:h-8" 
            />
            <span className={`${textColor} font-medium`}>Catégories</span>
          </div>
          <div className="flex gap-2 xs:gap-4">
            <HomeIcon 
              className={`w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 ${textColor} cursor-pointer hover:opacity-80 transition-colors`}
              onClick={() => navigate('/home')}
            />
            <NotificationBadge size="lg" accentColor={accentColor} />
            <SettingsIcon className={`w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 ${textColor}`}
            onClick={() => navigate('/parametres')}
            />
          </div>
         
        </motion.header>

        {/* Main Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`${cardBgColor} rounded-2xl p-5 sm:p-8 mb-6 ${cardBorder}`}
        >
          <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold ${textPrimaryColor} mb-6`}>
            Soumettre votre Bien immobilier
          </h1>
          
          {submitSuccess ? (
            <div className={`${successBgColor} border border-green-500 rounded-lg p-4 mb-6`}>
              <p className={successTextColor + " text-center"}>
                Votre demande a été soumise avec succès! L'agence vous contactera bientôt.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className={`${errorBgColor} border border-red-500 rounded-lg p-4 mb-4`}>
                  <p className={`${errorTextColor} text-center`}>{error}</p>
                </div>
              )}
              
             
              
              {/* Sélection du type de bien */}
              <div>
                {/* <label className={`block text-sm ${textColor} mb-1`}>
                  Type de bien*
                </label> */}
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 xs:gap-4 mb-2 xs:mb-4">
                    <button 
                      type="button"
                      onClick={() => handlePropertyTypeChange("VILLA")}
                      className={`text-base xs:text-xl font-bold transition-colors ${
                        activePropertyType === "VILLA" 
                          ? textColor 
                          : `${textColor} opacity-20 hover:opacity-60`
                      }`}
                    >
                      TRANO
                    </button>
                    <div className={`w-0.5 h-4 xs:h-6 ${isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]"}`}></div>
                    <button 
                      type="button"
                      onClick={() => handlePropertyTypeChange("TERRAIN")}
                      className={`text-base xs:text-xl font-bold transition-colors ${
                        activePropertyType === "TERRAIN" 
                          ? textColor 
                          : `${textColor} opacity-20 hover:opacity-60`
                      }`}
                    >
                      TANY
                    </button>
                  </div>
                  <div className={`border-t ${borderColor} w-40 sm:w-58 mx-auto mb-1 sm:mb-2`}></div>
                </div>
              </div>

              {/* Sélection de type de transaction */}
              <div>
                {/* <label className={`block text-sm ${textColor} mb-1`}>
                  Type de transaction*
                </label> */}
                <div className="flex justify-center gap-8 sm:gap-12 mb-4">
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
                      AHOFA (Location)
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
                      AMIDY (Achat)
                    </span>
                  </div>
                </div>
              </div>

                <div>
                  <label htmlFor="title" className={`block text-sm ${textColor} mb-1`}>
                    Titre de l'annonce*
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full ${inputBgColor} border ${getFieldError('title') ? 'border-red-500' : borderColor} rounded-lg px-4 py-2 ${textPrimaryColor}`}
                    placeholder="Ex: Villa moderne (ou Terrain)"
                    required
                    maxLength={150}
                  />
                  {getFieldError('title') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('title')}</p>
                  )}
                </div>
                
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label htmlFor="price" className={`block text-sm ${textColor} mb-1`}>
                    Prix*
                  </label>
                  <div className="relative">
                    <input
                      id="price"
                      name="price"
                      type="text"
                      inputMode="numeric"
                      value={formatPrice(formData.price)}
                      onChange={handleInputChange}
                      className={`w-full ${inputBgColor} border ${borderColor} rounded-lg px-4 py-2 ${textPrimaryColor} pr-12`}
                      placeholder="Ex: 450 000 000"
                      required
                    />
                    <span className={`absolute right-4 top-1/2 -translate-y-1/2 ${textColor} font-medium`}>Ar</span>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="location" className={`block text-sm ${textColor} mb-1`}>
                    Emplacement
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full ${inputBgColor} border ${borderColor} rounded-lg px-4 py-2 ${textPrimaryColor}`}
                    placeholder="Ex: Tambohobe, Fianarantsoa"
                    maxLength={255}
                  />
                </div>
                
                <div>
                  <label htmlFor="surface" className={`block text-sm ${textColor} mb-1`}>
                    Surface (m²)
                  </label>
                  <input
                    id="surface"
                    name="surface"
                    type="number"
                    min="0"
                    value={formData.surface}
                    onChange={handleInputChange}
                    className={`w-full ${inputBgColor} border ${borderColor} rounded-lg px-4 py-2 ${textPrimaryColor}`}
                    placeholder="Ex: 120"
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm ${textColor} mb-1`}>
                  Description détaillée
                </label>
                
                <div className={`${cardBgColor} border ${borderColor} rounded-lg p-4 divide-y ${borderColor}`}>
                  {/* Caractéristiques générales */}
                  <div className="pb-4">
                    <div 
                      className={`flex items-center justify-between cursor-pointer mb-3`}
                      onClick={() => toggleSection('caracteristiques')}
                    >
                      <h3 className={`text-base font-semibold ${textPrimaryColor}`}>
                        ✅ Caractéristiques générales :
                      </h3>
                      {sectionsExpanded.caracteristiques ? 
                        <ChevronUp className={`w-5 h-5 ${textColor}`} /> : 
                        <ChevronDown className={`w-5 h-5 ${textColor}`} />
                      }
                    </div>
                    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 transition-all duration-300 ${sectionsExpanded.caracteristiques ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                      <label className={`flex items-center gap-2 cursor-pointer`}>
                        <div 
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${
                            features.meuble 
                              ? `${buttonPrimaryBg} flex items-center justify-center` 
                              : `border ${borderColor}`
                          }`}
                          onClick={() => handleFeatureToggle('meuble')}
                        >
                          {features.meuble && <CheckCircleIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${buttonPrimaryText}`} />}
                        </div>
                        <span className={`text-sm ${textPrimaryColor}`}>Meublé</span>
                      </label>
                      
                      <label className={`flex items-center gap-2 cursor-pointer`}>
                        <div 
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${
                            features.cuisineEquipee 
                              ? `${buttonPrimaryBg} flex items-center justify-center` 
                              : `border ${borderColor}`
                          }`}
                          onClick={() => handleFeatureToggle('cuisineEquipee')}
                        >
                          {features.cuisineEquipee && <CheckCircleIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${buttonPrimaryText}`} />}
                        </div>
                        <span className={`text-sm ${textPrimaryColor}`}>Cuisine équipée</span>
                      </label>
                      
                      <label className={`flex items-center gap-2 cursor-pointer`}>
                        <div 
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${
                            features.salonSpacieux 
                              ? `${buttonPrimaryBg} flex items-center justify-center` 
                              : `border ${borderColor}`
                          }`}
                          onClick={() => handleFeatureToggle('salonSpacieux')}
                        >
                          {features.salonSpacieux && <CheckCircleIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${buttonPrimaryText}`} />}
                        </div>
                        <span className={`text-sm ${textPrimaryColor}`}>Salon spacieux</span>
                      </label>
                      
                      <label className={`flex items-center gap-2 cursor-pointer`}>
                        <div 
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${
                            features.climatisation 
                              ? `${buttonPrimaryBg} flex items-center justify-center` 
                              : `border ${borderColor}`
                          }`}
                          onClick={() => handleFeatureToggle('climatisation')}
                        >
                          {features.climatisation && <CheckCircleIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${buttonPrimaryText}`} />}
                        </div>
                        <span className={`text-sm ${textPrimaryColor}`}>Climatisation</span>
                      </label>
                      
                      <label className={`flex items-center gap-2 cursor-pointer`}>
                        <div 
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${
                            features.balconTerrasse 
                              ? `${buttonPrimaryBg} flex items-center justify-center` 
                              : `border ${borderColor}`
                          }`}
                          onClick={() => handleFeatureToggle('balconTerrasse')}
                        >
                          {features.balconTerrasse && <CheckCircleIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${buttonPrimaryText}`} />}
                        </div>
                        <span className={`text-sm ${textPrimaryColor}`}>Balcon / Terrasse</span>
                      </label>
                      
                      <label className={`flex items-center gap-2 cursor-pointer`}>
                        <div 
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${
                            features.jardin 
                              ? `${buttonPrimaryBg} flex items-center justify-center` 
                              : `border ${borderColor}`
                          }`}
                          onClick={() => handleFeatureToggle('jardin')}
                        >
                          {features.jardin && <CheckCircleIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${buttonPrimaryText}`} />}
                        </div>
                        <span className={`text-sm ${textPrimaryColor}`}>Jardin</span>
                      </label>
                      
                      <label className={`flex items-center gap-2 cursor-pointer`}>
                        <div 
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${
                            features.piscine 
                              ? `${buttonPrimaryBg} flex items-center justify-center` 
                              : `border ${borderColor}`
                          }`}
                          onClick={() => handleFeatureToggle('piscine')}
                        >
                          {features.piscine && <CheckCircleIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${buttonPrimaryText}`} />}
                        </div>
                        <span className={`text-sm ${textPrimaryColor}`}>Piscine</span>
                      </label>
                      
                      <label className={`flex items-center gap-2 cursor-pointer`}>
                        <div 
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${
                            features.garageParking 
                              ? `${buttonPrimaryBg} flex items-center justify-center` 
                              : `border ${borderColor}`
                          }`}
                          onClick={() => handleFeatureToggle('garageParking')}
                        >
                          {features.garageParking && <CheckCircleIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${buttonPrimaryText}`} />}
                        </div>
                        <span className={`text-sm ${textPrimaryColor}`}>Garage / Parking</span>
                      </label>
                      
                      <label className={`flex items-center gap-2 cursor-pointer`}>
                        <div 
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${
                            features.accesVehicule 
                              ? `${buttonPrimaryBg} flex items-center justify-center` 
                              : `border ${borderColor}`
                          }`}
                          onClick={() => handleFeatureToggle('accesVehicule')}
                        >
                          {features.accesVehicule && <CheckCircleIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${buttonPrimaryText}`} />}
                        </div>
                        <span className={`text-sm ${textPrimaryColor}`}>Accès véhicule</span>
                      </label>
                      
                      <label className={`flex items-center gap-2 cursor-pointer`}>
                        <div 
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${
                            features.portailSecurite 
                              ? `${buttonPrimaryBg} flex items-center justify-center` 
                              : `border ${borderColor}`
                          }`}
                          onClick={() => handleFeatureToggle('portailSecurite')}
                        >
                          {features.portailSecurite && <CheckCircleIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${buttonPrimaryText}`} />}
                        </div>
                        <span className={`text-sm ${textPrimaryColor}`}>Portail / Sécurité</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Détails des pièces */}
                  <div className="py-4">
                    <div 
                      className={`flex items-center justify-between cursor-pointer mb-3`}
                      onClick={() => toggleSection('pieces')}
                    >
                      <h3 className={`text-base font-semibold ${textPrimaryColor}`}>
                        ✅ Détails des pièces :
                      </h3>
                      {sectionsExpanded.pieces ? 
                        <ChevronUp className={`w-5 h-5 ${textColor}`} /> : 
                        <ChevronDown className={`w-5 h-5 ${textColor}`} />
                      }
                    </div>
                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-300 ${sectionsExpanded.pieces ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                      <div className="flex items-center gap-4">
                        <span className={`text-sm ${textPrimaryColor}`}>🛏 Nombre de chambres</span>
                        <div className="flex items-center gap-2">
                          <button 
                            type="button"
                            onClick={() => handleCounterChange('nombreChambres', false)}
                            className={`${buttonPrimaryBg} w-6 h-6 rounded-full flex items-center justify-center ${buttonPrimaryText}`}
                          >
                            -
                          </button>
                          <span className={`text-sm font-medium ${textPrimaryColor} w-6 text-center`}>
                            {features.nombreChambres}
                          </span>
                          <button 
                            type="button"
                            onClick={() => handleCounterChange('nombreChambres', true)}
                            className={`${buttonPrimaryBg} w-6 h-6 rounded-full flex items-center justify-center ${buttonPrimaryText}`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className={`text-sm ${textPrimaryColor}`}>🚿 Nombre de salles de bain</span>
                        <div className="flex items-center gap-2">
                          <button 
                            type="button"
                            onClick={() => handleCounterChange('nombreSallesDeBain', false)}
                            className={`${buttonPrimaryBg} w-6 h-6 rounded-full flex items-center justify-center ${buttonPrimaryText}`}
                          >
                            -
                          </button>
                          <span className={`text-sm font-medium ${textPrimaryColor} w-6 text-center`}>
                            {features.nombreSallesDeBain}
                          </span>
                          <button 
                            type="button"
                            onClick={() => handleCounterChange('nombreSallesDeBain', true)}
                            className={`${buttonPrimaryBg} w-6 h-6 rounded-full flex items-center justify-center ${buttonPrimaryText}`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <div className="sm:col-span-2">
                        <span className={`text-sm ${textPrimaryColor} block mb-2`}>🚽 WC :</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <label className={`flex items-center gap-2 cursor-pointer`}>
                            <div 
                              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${
                                features.wcInterne 
                                  ? `${buttonPrimaryBg} flex items-center justify-center` 
                                  : `border ${borderColor}`
                              }`}
                              onClick={() => handleFeatureToggle('wcInterne')}
                            >
                              {features.wcInterne && <CheckCircleIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${buttonPrimaryText}`} />}
                            </div>
                            <span className={`text-sm ${textPrimaryColor}`}>Interne</span>
                          </label>
                          
                          <label className={`flex items-center gap-2 cursor-pointer`}>
                            <div 
                              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${
                                features.wcExterne 
                                  ? `${buttonPrimaryBg} flex items-center justify-center` 
                                  : `border ${borderColor}`
                              }`}
                              onClick={() => handleFeatureToggle('wcExterne')}
                            >
                              {features.wcExterne && <CheckCircleIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${buttonPrimaryText}`} />}
                            </div>
                            <span className={`text-sm ${textPrimaryColor}`}>Externe</span>
                          </label>
                          
                          <label className={`flex items-center gap-2 cursor-pointer`}>
                            <div 
                              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${
                                features.wcPrivatif 
                                  ? `${buttonPrimaryBg} flex items-center justify-center` 
                                  : `border ${borderColor}`
                              }`}
                              onClick={() => handleFeatureToggle('wcPrivatif')}
                            >
                              {features.wcPrivatif && <CheckCircleIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${buttonPrimaryText}`} />}
                            </div>
                            <span className={`text-sm ${textPrimaryColor}`}>Privatif</span>
                          </label>
                          
                          <label className={`flex items-center gap-2 cursor-pointer`}>
                            <div 
                              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${
                                features.wcCommun 
                                  ? `${buttonPrimaryBg} flex items-center justify-center` 
                                  : `border ${borderColor}`
                              }`}
                              onClick={() => handleFeatureToggle('wcCommun')}
                            >
                              {features.wcCommun && <CheckCircleIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${buttonPrimaryText}`} />}
                            </div>
                            <span className={`text-sm ${textPrimaryColor}`}>Commun</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Autres commodités */}
                  <div className="pt-4">
                    <div 
                      className={`flex items-center justify-between cursor-pointer mb-3`}
                      onClick={() => toggleSection('commodites')}
                    >
                      <h3 className={`text-base font-semibold ${textPrimaryColor}`}>
                        ✅ Autres commodités :
                      </h3>
                      {sectionsExpanded.commodites ? 
                        <ChevronUp className={`w-5 h-5 ${textColor}`} /> : 
                        <ChevronDown className={`w-5 h-5 ${textColor}`} />
                      }
                    </div>
                    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 transition-all duration-300 ${sectionsExpanded.commodites ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                      <label className={`flex items-center gap-2 cursor-pointer`}>
                        <div 
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${
                            features.eauCourante 
                              ? `${buttonPrimaryBg} flex items-center justify-center` 
                              : `border ${borderColor}`
                          }`}
                          onClick={() => handleFeatureToggle('eauCourante')}
                        >
                          {features.eauCourante && <CheckCircleIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${buttonPrimaryText}`} />}
                        </div>
                        <span className={`text-sm ${textPrimaryColor}`}>Eau courante</span>
                      </label>
                      
                      <label className={`flex items-center gap-2 cursor-pointer`}>
                        <div 
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${
                            features.electriciteJirama 
                              ? `${buttonPrimaryBg} flex items-center justify-center` 
                              : `border ${borderColor}`
                          }`}
                          onClick={() => handleFeatureToggle('electriciteJirama')}
                        >
                          {features.electriciteJirama && <CheckCircleIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${buttonPrimaryText}`} />}
                        </div>
                        <span className={`text-sm ${textPrimaryColor}`}>Électricité Jirama</span>
                      </label>
                      
                      <label className={`flex items-center gap-2 cursor-pointer`}>
                        <div 
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${
                            features.foragePuits 
                              ? `${buttonPrimaryBg} flex items-center justify-center` 
                              : `border ${borderColor}`
                          }`}
                          onClick={() => handleFeatureToggle('foragePuits')}
                        >
                          {features.foragePuits && <CheckCircleIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${buttonPrimaryText}`} />}
                        </div>
                        <span className={`text-sm ${textPrimaryColor}`}>Forage / Puits</span>
                      </label>
                      
                      <label className={`flex items-center gap-2 cursor-pointer`}>
                        <div 
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${
                            features.reservoirEau 
                              ? `${buttonPrimaryBg} flex items-center justify-center` 
                              : `border ${borderColor}`
                          }`}
                          onClick={() => handleFeatureToggle('reservoirEau')}
                        >
                          {features.reservoirEau && <CheckCircleIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${buttonPrimaryText}`} />}
                        </div>
                        <span className={`text-sm ${textPrimaryColor}`}>Réservoir d'eau</span>
                      </label>
                      
                      <label className={`flex items-center gap-2 cursor-pointer`}>
                        <div 
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${
                            features.chauffeEau 
                              ? `${buttonPrimaryBg} flex items-center justify-center` 
                              : `border ${borderColor}`
                          }`}
                          onClick={() => handleFeatureToggle('chauffeEau')}
                        >
                          {features.chauffeEau && <CheckCircleIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${buttonPrimaryText}`} />}
                        </div>
                        <span className={`text-sm ${textPrimaryColor}`}>Chauffe-eau</span>
                      </label>
                      
                      <label className={`flex items-center gap-2 cursor-pointer`}>
                        <div 
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${
                            features.internetDisponible 
                              ? `${buttonPrimaryBg} flex items-center justify-center` 
                              : `border ${borderColor}`
                          }`}
                          onClick={() => handleFeatureToggle('internetDisponible')}
                        >
                          {features.internetDisponible && <CheckCircleIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${buttonPrimaryText}`} />}
                        </div>
                        <span className={`text-sm ${textPrimaryColor}`}>Internet disponible</span>
                      </label>
                      
                      <label className={`flex items-center gap-2 cursor-pointer`}>
                        <div 
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${
                            features.reseauMobileFort 
                              ? `${buttonPrimaryBg} flex items-center justify-center` 
                              : `border ${borderColor}`
                          }`}
                          onClick={() => handleFeatureToggle('reseauMobileFort')}
                        >
                          {features.reseauMobileFort && <CheckCircleIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${buttonPrimaryText}`} />}
                        </div>
                        <span className={`text-sm ${textPrimaryColor}`}>Réseau mobile fort</span>
                      </label>
                      
                      <label className={`flex items-center gap-2 cursor-pointer`}>
                        <div 
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${
                            features.routePraticable 
                              ? `${buttonPrimaryBg} flex items-center justify-center` 
                              : `border ${borderColor}`
                          }`}
                          onClick={() => handleFeatureToggle('routePraticable')}
                        >
                          {features.routePraticable && <CheckCircleIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${buttonPrimaryText}`} />}
                        </div>
                        <span className={`text-sm ${textPrimaryColor}`}>Route praticable</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Afficher la description générée en mode lecture seule */}
                <div className="mt-4">
                <textarea
                    id="description_preview"
                    name="description_preview"
                    value={formData.description}
                    readOnly
                    className={`w-full ${inputBgColor} border ${borderColor} rounded-lg px-4 py-2 ${textPrimaryColor} min-h-[80px]`}
                />
                  <p className={`${hintTextColor} text-xs mt-1`}>
                    Cette description sera envoyée automatiquement selon les caractéristiques sélectionnées.
                  </p>
                </div>
                {getFieldError('description') && (
                  <p className="text-red-500 text-xs mt-1">{getFieldError('description')}</p>
                )}
              </div>
              
              {/* Nouveau champ pour Information supplémentaire */}
              <div>
                <label htmlFor="additional_details" className={`block text-sm ${textColor} mb-1`}>
                  Information supplémentaire
                </label>
                <textarea
                  id="additional_details"
                  name="additional_details"
                  value={formData.additional_details}
                  onChange={handleInputChange}
                  className={`w-full ${inputBgColor} border ${borderColor} rounded-lg px-4 py-2 ${textPrimaryColor} min-h-[100px]`}
                  placeholder="Ajoutez des informations complémentaires sur votre bien immobilier..."
                />
                {getFieldError('additional_details') && (
                  <p className="text-red-500 text-xs mt-1">{getFieldError('additional_details')}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm ${textColor} mb-3`}>
                  Photos du bien (minimum 4)
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className={`relative h-24 sm:h-32 ${uploadBgColor} rounded-lg overflow-hidden`}>
                      <img 
                        src={url} 
                        alt={`Preview ${index}`} 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className={`absolute top-1 right-1 ${darkBgColor}/70 p-1 rounded-full`}
                      >
                        <XIcon className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                  
                  {previewUrls.length < 6 && (
                    <label className={`h-24 sm:h-32 border-2 border-dashed ${uploadBorderColor} rounded-lg flex flex-col items-center justify-center cursor-pointer ${uploadBgColor}`}>
                      <ImagePlusIcon className={`w-8 h-8 ${textColor} mb-1`} />
                      <span className={`text-xs ${textColor}`}>Ajouter</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full ${buttonPrimaryBg} ${buttonPrimaryText} font-bold py-3 rounded-lg flex items-center justify-center gap-2 ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 transition-colors'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className={`animate-spin -ml-1 mr-3 h-5 w-5 ${buttonPrimaryText}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <ImagePlusIcon size={20} />
                      <span>Soumettre ma demande</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
          
          <p className={`${hintTextColor} text-xs mt-4`}>
            * Champs obligatoires. En soumettant ce formulaire, vous acceptez que l'agence vous contacte pour discuter de votre demande.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PropertyRequest; 