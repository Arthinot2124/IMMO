import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BellIcon, HomeIcon, SettingsIcon, UserIcon, LogOutIcon, Edit2Icon, SaveIcon, AlertCircleIcon, XIcon, SunIcon, MoonIcon, LayoutDashboardIcon } from "lucide-react";
import authService, { UserData } from "../../services/authService";
import apiService from "../../services/apiService";
import { getMediaUrl } from "../../config/api";
import NotificationBadge from "../../components/NotificationBadge";

// Type pour les réponses API
interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

// Étendre l'interface UserData pour ajouter les propriétés manquantes
interface ExtendedUserData extends UserData {
  profile_image?: string;
  local_profile_image?: boolean;
}

export const Parametres = (): JSX.Element => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userData, setUserData] = useState<ExtendedUserData | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLightMode, setIsLightMode] = useState(() => {
    // Récupérer la préférence depuis localStorage
    const savedMode = localStorage.getItem('isLightMode');
    return savedMode !== null ? savedMode === 'true' : true;
  });
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(() => {
    // Récupérer l'image du localStorage au chargement
    return localStorage.getItem('userProfileImage');
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fonction pour rediriger vers le tableau de bord approprié selon le rôle de l'utilisateur
  const navigateToDashboard = () => {
    // Vérifier si l'utilisateur est un administrateur (role_id = 1)
    const isAdmin = userData?.role_id === 1 || (userData?.role && userData.role.role_id === 1);
    
    if (isAdmin) {
      // Rediriger vers le tableau de bord administrateur
      navigate('/admin/dashboard');
    } else {
      // Rediriger vers le tableau de bord client
      navigate('/dashboard');
    }
  };

  // Couleurs qui changent en fonction du mode
  const accentColor = isLightMode ? "#0150BC" : "#59e0c5";
  const bgColor = isLightMode ? "bg-white" : "bg-[#0f172a]";
  const cardBgColor = isLightMode ? "bg-[#F8FAFC]" : "bg-[#1E2B47]";
  const darkBgColor = isLightMode ? "bg-[#EFF6FF]" : "bg-[#0f172a]";
  const textColor = isLightMode ? "text-[#0150BC]" : "text-[#59e0c5]";
  const textPrimaryColor = isLightMode ? "text-[#1E293B]" : "text-white";
  const textSecondaryColor = isLightMode ? "text-gray-700" : "text-gray-300";
  const buttonPrimaryBg = isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]";
  const buttonPrimaryText = isLightMode ? "text-white" : "text-[#0f172a]";
  const borderColor = isLightMode ? "border-[#0150BC]" : "border-[#59e0c5]";
  const modalBgColor = isLightMode ? "bg-white" : "bg-[#1e293b]";
  const cardBorder = isLightMode ? "border border-[#0150BC]/30" : "border border-[#59e0c5]/30";
  const inputBgColor = isLightMode ? "bg-white" : "bg-[#0f172a]";

  // Effacer automatiquement le message de succès après 3 secondes
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
      // Nettoyer le timer si le composant est démonté ou si le message change
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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

  // Écouter les changements d'image de profil depuis d'autres composants
  useEffect(() => {
    const handleProfileImageUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{imageUrl: string | null}>;
      setImagePreview(customEvent.detail.imageUrl);
    };
    
    // Ajouter l'écouteur d'événement
    window.addEventListener('profileImageUpdated', handleProfileImageUpdate as EventListener);
    
    // Nettoyer l'écouteur d'événement
    return () => {
      window.removeEventListener('profileImageUpdated', handleProfileImageUpdate as EventListener);
    };
  }, []);

  // Récupérer les données de l'utilisateur au chargement du composant
  useEffect(() => {
    // D'abord, vérifier si l'utilisateur est connecté
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser) {
      // Si non connecté, rediriger vers la page de connexion
      navigate('/');
      return;
    }
    
    // Traiter currentUser comme ExtendedUserData
    const extendedUser = currentUser as ExtendedUserData;
    
    // Charger les données utilisateur depuis l'API pour obtenir les informations les plus récentes
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Récupérer les données de l'utilisateur connecté depuis l'API
        const response = await apiService.get<ApiResponse<ExtendedUserData>>(`/users/${currentUser.user_id}`);
        
        if (response.data && response.data.status === "success" && response.data.data) {
          const user = response.data.data;
          setUserData(user);
          // Initialiser le formulaire avec les données de l'utilisateur
          setFormData({
            full_name: user.full_name || "",
            email: user.email || "",
            phone: user.phone || "",
            address: user.address || ""
          });
          
          // Si l'utilisateur a une image de profil, l'afficher
          if (user.profile_image) {
            setImagePreview(getMediaUrl(user.profile_image));
          }
        } else {
          // Utiliser les données du localStorage si l'API échoue
          setUserData(extendedUser);
          setFormData({
            full_name: extendedUser.full_name || "",
            email: extendedUser.email || "",
            phone: extendedUser.phone || "",
            address: extendedUser.address || ""
          });
          
          // Si l'utilisateur a une image de profil, l'afficher
          if (extendedUser.profile_image) {
            setImagePreview(getMediaUrl(extendedUser.profile_image));
          }
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données utilisateur:", err);
        // En cas d'erreur, utiliser les données du localStorage
        setUserData(extendedUser);
        setFormData({
          full_name: extendedUser.full_name || "",
          email: extendedUser.email || "",
          phone: extendedUser.phone || "",
          address: extendedUser.address || ""
        });
        
        // Si l'utilisateur a une image de profil, l'afficher
        if (extendedUser.profile_image) {
          setImagePreview(getMediaUrl(extendedUser.profile_image));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);

  // Fonction pour gérer la sélection d'une image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Sélection de fichier déclenchée");
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log("Fichier sélectionné:", files[0].name);
      const selectedFile = files[0];
      setImageFile(selectedFile);
      
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          console.log("Image chargée avec succès");
          const imageDataUrl = event.target.result as string;
          setImagePreview(imageDataUrl);
          // Sauvegarder l'image dans localStorage
          localStorage.setItem('userProfileImage', imageDataUrl);
          
          // Si nous avons les données utilisateur, mettons à jour le localStorage
          if (userData) {
            const updatedUser = { 
              ...userData, 
              local_profile_image: true // Indicateur que nous avons une image locale
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUserData(updatedUser);
          }
          
          // Déclencher un événement personnalisé pour informer les autres composants du changement
          window.dispatchEvent(new CustomEvent('profileImageUpdated', { 
            detail: { imageUrl: imageDataUrl } 
          }));
          
          // Afficher un message de confirmation
          setSuccessMessage("Image de profil sélectionnée avec succès");
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  // Fonction pour ouvrir la boîte de dialogue de sélection de fichier
  const openFileSelector = () => {
    console.log("Tentative d'ouverture du sélecteur de fichier dans Parametres");
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error("Référence au fileInput non disponible dans Parametres");
    }
  };
  
  // Fonction pour supprimer l'image de profil
  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
    localStorage.removeItem('userProfileImage');
    
    // Mettre à jour les données utilisateur
    if (userData) {
      const updatedUser = { 
        ...userData, 
        local_profile_image: false 
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUserData(updatedUser);
    }
    
    // Informer les autres composants de la suppression de l'image
    window.dispatchEvent(new CustomEvent('profileImageUpdated', { 
      detail: { imageUrl: null } 
    }));
    
    setSuccessMessage("Image de profil supprimée");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!userData) return;
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Envoyer les modifications au backend
      const response = await apiService.put<ApiResponse<ExtendedUserData>>(`/users/${userData.user_id}`, formData);
      
      if (response.data && response.data.status === "success") {
        // Mettre à jour les données stockées localement
        const updatedUser = { ...userData, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUserData(updatedUser);
        setSuccessMessage("Profil mis à jour avec succès");
        
        // Désactiver le mode édition
        setIsEditing(false);
      } else {
        throw new Error("Échec de la mise à jour du profil");
      }
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du profil:", err);
      setError(err.response?.data?.message || err.message || "Une erreur est survenue lors de la mise à jour du profil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const showLogoutConfirmation = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Fonction pour basculer entre le mode clair et sombre
  const toggleLightMode = () => {
    const newMode = !isLightMode;
    setIsLightMode(newMode);
    localStorage.setItem('isLightMode', newMode.toString());
  };

  // Afficher un état de chargement pendant la récupération des données
  if (isLoading && !userData) {
    return (
      <div className={`${bgColor} min-h-screen flex items-center justify-center`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${borderColor}`}></div>
      </div>
    );
  }

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
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className={`${modalBgColor} rounded-lg p-6 max-w-md w-full`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${textPrimaryColor}`}>Confirmation</h3>
              <button 
                onClick={cancelLogout}
                className={`${textSecondaryColor} hover:${textPrimaryColor}`}
              >
                <XIcon size={24} />
              </button>
            </div>
            
            <p className={textPrimaryColor}>Êtes-vous sûr de vouloir vous déconnecter ?</p>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={cancelLogout}
                className={`px-4 py-2 border ${borderColor} ${textColor} rounded-lg`}
              >
                Annuler
              </button>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-4 xs:px-6 sm:px-8 md:px-12 lg:px-16 pt-4 xs:pt-6 sm:pt-8 md:pt-10 lg:pt-12 relative z-10">
        {/* Navigation Bar */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center py-2 xs:py-4 mb-4 xs:mb-6"
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

        {/* Messages */}
        {error && (
          <div className={`${isLightMode ? "bg-red-100" : "bg-red-500/20"} border border-red-500 rounded-lg p-4 mb-6 ${isLightMode ? "text-red-700" : "text-white"} flex items-start`}>
            <AlertCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className={`${isLightMode ? "bg-green-100" : "bg-green-500/20"} border border-green-500 rounded-lg p-4 mb-6 ${isLightMode ? "text-green-700" : "text-white"}`}>
            <p>{successMessage}</p>
          </div>
        )}

        {/* Profile Container */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`${cardBgColor} rounded-2xl p-5 sm:p-8 mb-4 ${cardBorder}`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold ${textPrimaryColor}`}>Mon Profil</h2>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className={`flex items-center gap-2 ${buttonPrimaryBg} ${buttonPrimaryText} px-3 py-1.5 rounded-lg hover:opacity-90 transition-colors`}
              >
                <Edit2Icon size={16} />
                <span>Modifier</span>
              </button>
            ) : (
              <button 
                onClick={handleSave}
                disabled={isLoading}
                className={`flex items-center gap-2 ${buttonPrimaryBg} ${buttonPrimaryText} px-3 py-1.5 rounded-lg ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 transition-colors'}`}
              >
                {isLoading ? (
                  <>
                    <div className={`w-4 h-4 border-2 ${buttonPrimaryText} border-t-transparent rounded-full animate-spin mr-1`}></div>
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <SaveIcon size={16} />
                    <span>Enregistrer</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-5">
            <div className="flex flex-col items-center">
              <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full ${isLightMode ? "bg-[#0150BC]/10" : "bg-[#59e0c5]/20"} border-4 ${borderColor} flex items-center justify-center overflow-hidden relative`}>
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                   
                  </>
                ) : (
                  <UserIcon 
                   onClick={openFileSelector}
                   className={`w-14 h-14 ${textColor}`} />
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="parametres-profile-image-input"
              />
              <button 
                onClick={openFileSelector}
                className={`mt-2 text-sm ${textColor} hover:underline`}
                disabled={isUploadingImage}
                type="button"
              >
                {isUploadingImage ? (
                  <span className="flex items-center">
                    <div className={`w-3 h-3 border-2 ${textColor} border-t-transparent rounded-full animate-spin mr-1`}></div>
                    Téléchargement...
                  </span>
                ) : (
                  "Changer l'avatar"
                )}
              </button>
              <label 
                htmlFor="parametres-profile-image-input" 
                className={`mt-1 text-xs ${textSecondaryColor} hover:underline cursor-pointer`}
              >
                ou cliquez ici pour changer
              </label>
            </div>

            <div className="flex-1 space-y-2">
              <div>
                <label className={`block text-sm ${textColor} mb-1`}>Nom Complet</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className={`w-full ${inputBgColor} border ${borderColor} rounded-lg px-4 py-2 ${textPrimaryColor}`}
                  />
                ) : (
                  <p className={textPrimaryColor}>{userData?.full_name}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm ${textColor} mb-1`}>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full ${inputBgColor} border ${borderColor} rounded-lg px-4 py-2 ${textPrimaryColor}`}
                  />
                ) : (
                  <p className={textPrimaryColor}>{userData?.email}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm ${textColor} mb-1`}>Téléphone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full ${inputBgColor} border ${borderColor} rounded-lg px-4 py-2 ${textPrimaryColor}`}
                  />
                ) : (
                  <p className={textPrimaryColor}>{userData?.phone || "Non spécifié"}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm ${textColor} mb-1`}>Adresse</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full ${inputBgColor} border ${borderColor} rounded-lg px-4 py-2 ${textPrimaryColor}`}
                  />
                ) : (
                  <p className={textPrimaryColor}>{userData?.address || "Non spécifié"}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`${cardBgColor} rounded-2xl p-5 sm:p-8 mb-8 ${cardBorder}`}
        >
          {/* <h3 className={`text-lg sm:text-xl font-semibold ${textPrimaryColor} mb-4`}>Sécurité du compte</h3> */}
          
          <button 
            className={`w-full flex items-center justify-between ${textPrimaryColor} ${darkBgColor} p-3 rounded-lg mb-3 hover:opacity-90`}
            onClick={navigateToDashboard}
          >
            <span>Mon tableau de bord</span>
            <LayoutDashboardIcon size={26} className={`${buttonPrimaryBg} ${buttonPrimaryText} p-1 rounded`} />
          </button>
          
          
          <button 
            onClick={showLogoutConfirmation}
            className={`w-full flex items-center justify-between text-red-500 ${darkBgColor} p-3 rounded-lg hover:opacity-90`}
          >
            <span>Se déconnecter</span>
            <LogOutIcon size={20} />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Parametres; 