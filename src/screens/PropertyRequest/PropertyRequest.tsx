import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HomeIcon, SettingsIcon, BuildingIcon, AlertCircleIcon, CheckCircleIcon, InfoIcon, XIcon, ImagePlusIcon, SunIcon, MoonIcon } from "lucide-react";
import NotificationBadge from "../../components/NotificationBadge";
import axios from "axios";

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
    property_status: "Disponible"
  });
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

  // Fonction pour basculer entre le mode clair et sombre
  const toggleLightMode = () => {
    const newMode = !isLightMode;
    setIsLightMode(newMode);
    localStorage.setItem('isLightMode', newMode.toString());
  };

  // Récupérer l'ID utilisateur au chargement
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
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Effacer l'erreur de validation pour ce champ
    if (validationErrors[name]) {
      const newErrors = {...validationErrors};
      delete newErrors[name];
      setValidationErrors(newErrors);
    }
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
        price: formData.price ? parseFloat(formData.price) : 0,
        surface: formData.surface ? parseFloat(formData.surface) : 0,
        location: formData.location || "",
        category: formData.category || "LITE",
        property_status: formData.property_status || "Disponible",
        additional_details: formData.additional_details || "",
        status: "En attente"
      };
      
      console.log("Données envoyées:", requestData);
      
      // Configuration Axios avec CSRF protection pour Laravel
      const axiosInstance = axios.create({
        baseURL: 'http://localhost:8000',
        withCredentials: true
      });
      
      // Récupérer le token CSRF si nécessaire
      await axiosInstance.get('/sanctum/csrf-cookie');
      
      // Appel API
      const response = await axiosInstance.post(
        '/api/property-requests',
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        }
      );
      
      console.log("API Response:", response.data);
      
      // Gestion des images (si votre API le supporte)
      if (images.length > 0 && response.data?.data?.request_id) {
        const formData = new FormData();
        
        images.forEach(image => {
          formData.append('images[]', image);
        });
        
        try {
          const uploadResponse = await axiosInstance.post(
            `/api/property-requests/${response.data.data.request_id}/images`,
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
          className="flex justify-between items-center py-2 xs:py-4 mb-8 xs:mb-10"
        >
          <div className="flex gap-2 xs:gap-4">
            <HomeIcon 
              className={`w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 ${textColor} cursor-pointer hover:opacity-80 transition-colors`}
              onClick={() => navigate('/home')}
            />
            <NotificationBadge size="lg" accentColor={accentColor} />
            <SettingsIcon className={`w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 ${textColor}`} />
          </div>
          
          {/* Bouton pour basculer entre les modes */}
          <button 
            onClick={toggleLightMode}
            className={`${buttonPrimaryBg} ${buttonPrimaryText} p-2 rounded-full flex items-center justify-center`}
            aria-label={isLightMode ? "Passer au mode sombre" : "Passer au mode clair"}
          >
            {isLightMode ? (
              <MoonIcon className="w-5 h-5 xs:w-6 xs:h-6" />
            ) : (
              <SunIcon className="w-5 h-5 xs:w-6 xs:h-6" />
            )}
          </button>
        </motion.header>

        {/* Main Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`${cardBgColor} rounded-2xl p-5 sm:p-8 mb-6 ${cardBorder}`}
        >
          <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold ${textPrimaryColor} mb-6`}>
            Soumettre votre bien immobilier
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                    placeholder="Ex: Villa moderne à Tambohobe"
                    required
                    maxLength={150}
                  />
                  {getFieldError('title') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('title')}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="category" className={`block text-sm ${textColor} mb-1`}>
                    Catégorie*
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full ${inputBgColor} border ${borderColor} rounded-lg px-4 py-2 ${textPrimaryColor}`}
                    required
                  >
                    <option value="LITE">LITE</option>
                    <option value="ESSENTIEL">ESSENTIEL</option>
                    <option value="PREMIUM">PREMIUM</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="price" className={`block text-sm ${textColor} mb-1`}>
                    Prix*
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`w-full ${inputBgColor} border ${borderColor} rounded-lg px-4 py-2 ${textPrimaryColor}`}
                    placeholder="Ex: 450000000"
                    required
                  />
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
                
                <div>
                  <label htmlFor="property_status" className={`block text-sm ${textColor} mb-1`}>
                    Statut
                  </label>
                  <select
                    id="property_status"
                    name="property_status"
                    value={formData.property_status}
                    onChange={handleInputChange}
                    className={`w-full ${inputBgColor} border ${borderColor} rounded-lg px-4 py-2 ${textPrimaryColor}`}
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Réservé">Réservé</option>
                    <option value="Vendu">Vendu</option>
                    <option value="Loué">Loué</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="description" className={`block text-sm ${textColor} mb-1`}>
                  Description détaillée
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`w-full ${inputBgColor} border ${getFieldError('description') ? 'border-red-500' : borderColor} rounded-lg px-4 py-2 ${textPrimaryColor} min-h-[120px]`}
                  placeholder="Décrivez votre bien immobilier en détail..."
                />
                {getFieldError('description') && (
                  <p className="text-red-500 text-xs mt-1">{getFieldError('description')}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="additional_details" className={`block text-sm ${textColor} mb-1`}>
                  Détails supplémentaires
                </label>
                <textarea
                  id="additional_details"
                  name="additional_details"
                  value={formData.additional_details}
                  onChange={handleInputChange}
                  className={`w-full ${inputBgColor} border ${getFieldError('additional_details') ? 'border-red-500' : borderColor} rounded-lg px-4 py-2 ${textPrimaryColor} min-h-[80px]`}
                  placeholder="Autres informations importantes..."
                />
                {getFieldError('additional_details') && (
                  <p className="text-red-500 text-xs mt-1">{getFieldError('additional_details')}</p>
                )}
              </div>
              
              <div>
                <label className={`block text-sm ${textColor} mb-3`}>
                  Photos du bien (maximum 6)
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