import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { HomeIcon, SettingsIcon, ArrowLeft, Check, X } from "lucide-react";
import NotificationBadge from "../../components/NotificationBadge";
import apiService from "../../services/apiService";
import { formatPrice } from "../../utils/formatters";
import { formatCurrency } from "../../services/currencyService";

// Types
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
  user_id: number;
}

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
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
  user_id: 1
};

const PropertyOrder = (): JSX.Element => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Récupérer l'ID de la propriété depuis l'URL
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
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
  const cardBorder = isLightMode ? "border border-[#0150BC]/30" : "border border-[#59e0c5]/30";

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

  // Charger les données de la propriété
  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!id) {
        setError("ID de propriété non spécifié");
        setLoading(false);
        return;
      }

      try {
        const response = await apiService.get<ApiResponse<Property>>(`/properties/${id}`);

        if (response.data && response.data.status === "success" && response.data.data) {
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

  // Gérer la soumission de la commande
  const handleSubmitOrder = async () => {
    if (!property) return;
    
    setOrderError(null);
    
    try {
      // Récupérer l'ID de l'utilisateur connecté
      const userId = localStorage.getItem('user_id');
      
      if (!userId) {
        // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
        navigate('/login?redirect=' + encodeURIComponent(`/property/${id}/order`));
        return;
      }
      
      const orderData = {
        property_id: property.property_id,
        user_id: parseInt(userId),
        order_type: property.transaction_type === "AHOFA" ? "Location" : "Achat"
      };
      
      const response = await apiService.post<ApiResponse<any>>('/orders', orderData);
      
      if (response.data && response.data.status === "success") {
        setOrderSubmitted(true);
      } else {
        throw new Error("Erreur lors de la soumission de la commande");
      }
    } catch (err: any) {
      console.error("Erreur lors de la soumission de la commande:", err);
      setOrderError(err.response?.data?.message || err.message || "Erreur lors de la soumission de la commande");
    }
  };

  // Titre de la page selon le type de transaction
  const getPageTitle = () => {
    if (!property) return "Commande";
    return property.transaction_type === "AHOFA" ? "Louer ce bien" : "Acheter ce bien";
  };

  // Fonction pour formater les prix en euros ou en ariary
  const formatPropertyPrice = (price?: number): string => {
    if (!price) return "Prix non spécifié";
    return formatCurrency(price, isEuro);
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
          className="flex justify-between items-center py-2 xs:py-4 mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-colors" onClick={() => navigate(`/property/${id}`)}>
            <img 
              src={isLightMode ? "/public_Trano/fleche_retour_b.png" : "/public_Trano/fleche_retour_v.png"} 
              alt="Retour" 
              className="w-7 h-7 xs:w-7 xs:h-7 sm:w-8 sm:h-8" 
            />
            <span className={`${textColor} font-medium`}>Detail</span>
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
            {orderSubmitted ? (
              // Confirmation de commande
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`${cardBgColor} rounded-2xl p-8 mb-8 text-center max-w-2xl mx-auto ${cardBorder}`}
              >
                <div className={`w-20 h-20 mx-auto flex items-center justify-center rounded-full ${buttonPrimaryBg} mb-6`}>
                  <Check className={`w-10 h-10 ${buttonPrimaryText}`} />
                </div>
                <h1 className={`text-2xl sm:text-3xl font-bold ${textPrimaryColor} mb-4`}>
                  Commande envoyée avec succès !
                </h1>
                <p className={`${textSecondaryColor} text-lg mb-6`}>
                  Votre demande de {property.transaction_type === "AHOFA" ? "location" : "achat"} pour "{property.title}" a bien été enregistrée.
                  Notre équipe va vous contacter très prochainement pour finaliser la transaction.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className={`${buttonPrimaryBg} ${buttonPrimaryText} font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-colors`}
                  >
                    Voir mes commandes
                  </button>
                  <button 
                    onClick={() => navigate('/trano')}
                    className={`${buttonSecondaryBg} ${buttonSecondaryText} font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-colors border ${borderColorLight}`}
                  >
                    Retour aux annonces
                  </button>
                </div>
              </motion.div>
            ) : (
              // Formulaire de commande
              <>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="mb-8"
                >
                  <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${textPrimaryColor} mb-2`}>
                    {getPageTitle()}
                  </h1>
                  <p className={`${textSecondaryColor}`}>
                    Veuillez confirmer votre demande de {property.transaction_type === "AHOFA" ? "location" : "achat"} pour le bien suivant
                  </p>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className={`${cardBgColor} rounded-2xl p-5 sm:p-8 mb-6 sm:mb-8 ${cardBorder}`}
                >
                  <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
                    <div>
                      <h2 className={`text-xl font-bold ${textPrimaryColor} mb-1`}>{property.title}</h2>
                      <p className={`${textSecondaryColor} text-sm`}>{property.location || "Emplacement non spécifié"}</p>
                    </div>
                    <div className={`mt-2 md:mt-0 ${textColor} text-lg sm:text-xl font-semibold`}>
                      {formatPropertyPrice(property.price)} {property.transaction_type === "AHOFA" ? "/mois" : ""}
                    </div>
                  </div>
                  
                  <div className={`border-t ${borderColorLight} my-4 pt-4`}>
                    <h3 className={`${textColor} font-semibold mb-2`}>Résumé</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span className={textSecondaryColor}>Type de transaction</span>
                        <span className={textPrimaryColor}>
                          {property.transaction_type === "AHOFA" ? "Location" : "Achat"}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className={textSecondaryColor}>Catégorie</span>
                        <span className={textPrimaryColor}>{property.category}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className={textSecondaryColor}>Surface</span>
                        <span className={textPrimaryColor}>{property.surface} m²</span>
                      </li>
                      <li className="flex justify-between">
                        <span className={textSecondaryColor}>Statut</span>
                        <span className={textPrimaryColor}>{property.status}</span>
                      </li>
                      <li className={`border-t ${borderColorLight} pt-2 flex justify-between font-bold`}>
                        <span className={textSecondaryColor}>Montant</span>
                        <span className={textColor}>{formatPropertyPrice(property.price)} {property.transaction_type === "AHOFA" ? "/mois" : ""}</span>
                      </li>
                    </ul>
                  </div>
                  
                  {orderError && (
                    <div className={`${isLightMode ? "bg-red-100" : "bg-red-500/20"} ${isLightMode ? "text-red-700" : "text-white"} p-3 rounded-lg my-4`}>
                      <p className="flex items-center">
                        <X size={18} className="min-w-[18px] mr-2" />
                        {orderError}
                      </p>
                    </div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mb-8 max-w-2xl mx-auto"
                >
                  <p className={`${textSecondaryColor} text-sm mb-4`}>
                    En confirmant cette commande, vous acceptez d'être contacté par notre équipe pour finaliser la {property.transaction_type === "AHOFA" ? "location" : "transaction"}. 
                    Des documents supplémentaires pourront vous être demandés.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={handleSubmitOrder}
                      className={`flex-1 ${buttonPrimaryBg} ${buttonPrimaryText} font-bold py-3 rounded-lg hover:opacity-90 transition-colors border ${isLightMode ? "border-[#0150BC]" : "border-transparent"}`}
                    >
                      Confirmer ma demande
                    </button>
                    
                    <button 
                      onClick={() => navigate(`/property/${id}`)}
                      className={`flex-1 ${buttonSecondaryBg} ${buttonSecondaryText} font-bold py-3 rounded-lg hover:opacity-90 transition-colors border ${isLightMode ? "border-[#0150BC]" : "border-transparent"}`}
                    >
                      Annuler
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </>
        ) : null}
      </div>
    </motion.div>
  );
};

export default PropertyOrder; 