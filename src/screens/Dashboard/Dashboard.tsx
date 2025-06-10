import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  BellIcon, HomeIcon, SettingsIcon, ClipboardListIcon, 
  CalendarIcon, BuildingIcon, GridIcon, ListIcon,
  SunIcon, MoonIcon
} from "lucide-react";
import NotificationBadge from "../../components/NotificationBadge";
import apiService from "../../services/apiService";
import authService from "../../services/authService";
import { getMediaUrl } from "../../config/api";
import { formatCurrency } from "../../services/currencyService";

// Types pour les données
interface Property {
  property_id: number;
  title: string;
  status: string;
  price: number;
  views?: number;
  media?: { media_url: string }[];
  location: string;
  description: string;
  user_id?: number;
}

interface PropertyRequest {
  request_id: number;
  title: string;
  status: string;
  submitted_at: string;
}

interface Appointment {
  appointment_id: number;
  property: {
    title: string;
    property_id: number;
  };
  appointment_date: string;
  confirmation_status: string;
}

interface Order {
  order_id: number;
  property: {
    title: string;
    property_id: number;
  };
  order_type: string;
  price: number;
  order_date: string;
  order_status: string;
}

// Interface pour l'utilisateur connecté
interface CurrentUser {
  user_id: number;
  email?: string;
  full_name?: string;
  role_id?: number;
  [key: string]: any; // Pour les autres propriétés
}

// Mock data for dashboard - sera remplacé par des données réelles
const mockProperties = [
  { id: 1, title: "Villa moderne à Tambohobe", status: "En vente", price: "450 000 000 Ar", views: 152, image: "/public_Trano/maison-01.png" },
  { id: 2, title: "Appartement F3 Antarandolo", status: "En visite", price: "250 000 000 Ar", views: 98, image: "/public_Trano/calque-3.png" }
];

const mockRequests = [
  { id: 1, title: "Maison 3 chambres Andrainjato", status: "Acceptée", date: "15 Sept 2023" },
  { id: 2, title: "Terrain 600m² Ambanidia", status: "En attente", date: "10 Oct 2023" }
];

const mockAppointments = [
  { id: 1, property: "Appartement F3 Antarandolo", date: "15 Oct 2023", time: "14:00", status: "Confirmé" },
  { id: 2, property: "Villa moderne à Tambohobe", date: "20 Oct 2023", time: "10:30", status: "En attente" }
];

const mockOrders = [
  { id: 1, property: "Terrain 500m² Isada", type: "Achat", amount: "80 000 000 Ar", date: "05 Sept 2023", status: "Complété" }
];

export const Dashboard = (): JSX.Element => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("properties");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour stocker les données réelles
  const [properties, setProperties] = useState<Property[]>([]);
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // État pour le mode clair/sombre
  const [isLightMode, setIsLightMode] = useState(() => {
    // Récupérer la préférence depuis localStorage
    const savedMode = localStorage.getItem('isLightMode');
    return savedMode !== null ? savedMode === 'true' : false;
  });

  // État pour la devise en euros
  const [isEuro, setIsEuro] = useState(() => {
    // Récupérer la préférence de devise depuis localStorage
    const savedCurrency = localStorage.getItem('isEuro');
    return savedCurrency !== null ? savedCurrency === 'true' : false;
  });

  // États pour la modale de confirmation
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  // Récupérer l'ID de l'utilisateur connecté
  const currentUser = authService.getCurrentUser();
  const userId = currentUser?.user_id;

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

  // Fonction pour basculer entre le mode clair et sombre
  const toggleLightMode = () => {
    const newMode = !isLightMode;
    setIsLightMode(newMode);
    localStorage.setItem('isLightMode', newMode.toString());
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
  const cardBorder = isLightMode ? "border border-[#0150BC]/30" : "border border-[#59e0c5]/30";
  const itemBgColor = isLightMode ? "bg-white" : "bg-[#0f172a]";
  const statCardBg = isLightMode ? "bg-[#F8FAFC]" : "bg-[#0f172a]";
  const tabBgColor = isLightMode ? "bg-[#F8FAFC]" : "bg-[#1E2B47]";

  // Charger les données au chargement du composant
  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Vérifier d'abord si l'API est accessible
        try {
          // Utiliser un endpoint existant au lieu de health-check
          await apiService.get('/roles');
        } catch (healthErr: any) {
          console.error("Erreur de connexion à l'API:", healthErr);
          const errorMessage = healthErr.message === "Network Error" 
            ? "Impossible de se connecter au serveur (192.168.8.114:8000). Vérifiez votre connexion réseau." 
            : `Erreur de connexion au serveur: ${healthErr.message}`;
          setError(errorMessage);
          setIsLoading(false);
          return;
        }

        // Charger les propriétés de l'utilisateur
        try {
          // Essayer une approche différente: récupérer toutes les propriétés et filtrer côté client
          const propertiesResponse = await apiService.get<any>(`/properties`);
          
          if (propertiesResponse.data && propertiesResponse.data.status === "success") {
            // Les propriétés sont dans un format paginé, nous devons extraire les données différemment
            const paginatedData = propertiesResponse.data.data;
            
            if (paginatedData && paginatedData.data) {
              // Filtrer les propriétés uniquement pour l'utilisateur actuel
              const userProperties = paginatedData.data.filter((property: any) => 
                property.user_id == userId // Utiliser == au lieu de === pour la comparaison car les types peuvent différer
              );
              
              setProperties(userProperties);
            } else {
              setProperties([]);
            }
          } else {
            console.warn("Réponse inattendue lors du chargement des propriétés:", propertiesResponse.data);
          }
        } catch (propErr: any) {
          console.error("Erreur lors du chargement des propriétés:", propErr);
        }

        // Charger les demandes de propriété
        try {
          // Correction de la route API selon le backend
          const requestsResponse = await apiService.get<any>(`/users/${userId}/property-requests`);
          if (requestsResponse.data && requestsResponse.data.status === "success") {
            setRequests(requestsResponse.data.data || []);
          } else {
            console.warn("Réponse inattendue lors du chargement des demandes:", requestsResponse.data);
          }
        } catch (reqErr: any) {
          console.error("Erreur lors du chargement des demandes:", reqErr);
        }

        // Charger les rendez-vous
        try {
          // Correction de la route API selon le backend
          const appointmentsResponse = await apiService.get<any>(`/users/${userId}/appointments`);
          if (appointmentsResponse.data && appointmentsResponse.data.status === "success") {
            setAppointments(appointmentsResponse.data.data || []);
          } else {
            console.warn("Réponse inattendue lors du chargement des rendez-vous:", appointmentsResponse.data);
          }
        } catch (apptErr: any) {
          console.error("Erreur lors du chargement des rendez-vous:", apptErr);
        }

        // Charger les commandes/achats
        try {
          // Correction de la route API selon le backend
          const ordersResponse = await apiService.get<any>(`/users/${userId}/orders`);
          if (ordersResponse.data && ordersResponse.data.status === "success") {
            console.log("Orders data:", ordersResponse.data.data);
            setOrders(ordersResponse.data.data || []);
          } else {
            console.warn("Réponse inattendue lors du chargement des commandes:", ordersResponse.data);
          }
        } catch (orderErr: any) {
          console.error("Erreur lors du chargement des commandes:", orderErr);
        }

        setIsLoading(false);
      } catch (err: any) {
        console.error("Erreur globale lors du chargement des données du tableau de bord:", err);
        setError(`Erreur: ${err.message || "Problème de connexion au serveur"}`);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, navigate]);

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Formater l'heure
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formater le prix en Ariary ou en Euro selon la préférence
  const formatPrice = (price: number | null | undefined): string => {
    // Add validation to handle invalid or missing price values
    if (price === null || price === undefined || isNaN(price)) {
      return "Prix non disponible";
    }
    return formatCurrency(price, isEuro);
  };

  // Fonction pour incrémenter le nombre de vues d'une propriété
  const incrementPropertyView = async (propertyId: number) => {
    try {
      // Récupérer l'utilisateur connecté
      const currentUser = authService.getCurrentUser() || 
        (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') as CurrentUser : null);
        
      // Trouver la propriété dans le tableau local
      const property = properties.find(p => p.property_id === propertyId);
      
      // Vérifier de façon plus stricte si l'utilisateur est le propriétaire
      // Ajout de logs détaillés pour déboguer
      console.log('Propriété:', property);
      console.log('Utilisateur actuel:', currentUser);
      
      // Convertir les IDs en nombres pour une comparaison cohérente
      const propertyUserId = property?.user_id !== undefined ? Number(property.user_id) : null;
      const currentUserId = currentUser?.user_id !== undefined ? Number(currentUser.user_id) : null;
      
      console.log('Property user_id (converti):', propertyUserId);
      console.log('Current user_id (converti):', currentUserId);
      
      // Si l'utilisateur est le propriétaire, ajouter un flag dans les paramètres et les headers
      if (propertyUserId !== null && currentUserId !== null && propertyUserId === currentUserId) {
        console.log('Le propriétaire consulte sa propre propriété, pas d\'incrémentation de vue');
        
        // Option 1: Naviguer directement sans appeler l'API
        navigate(`/property/${propertyId}`);
        return;
      }
      
      // Préparer les données et headers pour l'API
      const headers: Record<string, string> = {};
      const params: Record<string, any> = {};
      
      // Si un utilisateur est connecté, on ajoute son ID
      if (currentUser && currentUser.user_id) {
        params['user_id'] = currentUser.user_id;
        headers['X-User-ID'] = currentUser.user_id.toString();
      }
      
      // Ajouter l'ID du propriétaire si disponible
      if (propertyUserId !== null) {
        params['owner_id'] = propertyUserId;
        headers['X-Owner-ID'] = propertyUserId.toString();
      }
      
      console.log('Incrementing view with user data:', { currentUser, propertyUserId, params, headers });
      
      // Appel à l'API pour incrémenter le nombre de vues avec les informations d'utilisateur
      // L'API doit gérer qu'un utilisateur ne peut incrémenter qu'une seule fois
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
        
        // Naviguer vers la page de détails de la propriété
        navigate(`/property/${propertyId}`);
      }
    } catch (error) {
      console.error("Erreur lors de l'incrémentation des vues:", error);
      // En cas d'erreur, naviguer tout de même vers la page de détails
      navigate(`/property/${propertyId}`);
    }
  };

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

  // Fonction pour rafraîchir les données
  const refreshData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Charger les propriétés de l'utilisateur avec forceRefresh
      const propertiesResponse = await apiService.get<any>(`/properties`, {
        params: { timestamp: Date.now() }, // Force le cache à ignorer les données précédentes
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (propertiesResponse.data && propertiesResponse.data.status === "success") {
        // Les propriétés sont dans un format paginé, nous devons extraire les données différemment
        const paginatedData = propertiesResponse.data.data;
        
        if (paginatedData && paginatedData.data) {
          // Filtrer les propriétés uniquement pour l'utilisateur actuel
          const userProperties = paginatedData.data.filter((property: any) => 
            property.user_id == userId // Utiliser == au lieu de === pour la comparaison car les types peuvent différer
          );
          
          setProperties(userProperties);
          console.log("Données rafraîchies:", userProperties);
        } else {
          setProperties([]);
        }
      }
    } catch (err: any) {
      console.error("Erreur lors du rafraîchissement des données:", err);
      setError(`Erreur: ${err.message || "Problème de connexion au serveur"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour réinitialiser les vues d'une propriété
  const resetPropertyViews = async (propertyId: number) => {
    try {
      setIsLoading(true);
      
      // Appel à l'API pour réinitialiser les vues
      const response = await apiService.post<{status: string, message: string, views: number}>(
        `/properties/${propertyId}/reset-views`
      );
      
      console.log('Reset views response:', response.data);
      
      if (response.data && response.data.status === "success") {
        // Mise à jour du compteur de vues dans les propriétés locales
        setProperties(properties.map(prop => 
          prop.property_id === propertyId 
            ? { ...prop, views: 0 } 
            : prop
        ));
        
        // Montrer la modale de succès
        setResetSuccess(true);
        setResetMessage("Le compteur de vues a été réinitialisé avec succès !");
        setShowConfirmModal(true);
      }
    } catch (error) {
      console.error("Erreur lors de la réinitialisation des vues:", error);
      // Montrer la modale d'erreur
      setResetSuccess(false);
      setResetMessage("Erreur lors de la réinitialisation des vues. Veuillez réessayer.");
      setShowConfirmModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Afficher la modale de confirmation
  const showResetConfirmation = (propertyId: number) => {
    setSelectedPropertyId(propertyId);
    setResetSuccess(false);
    setResetMessage("Voulez-vous vraiment réinitialiser le compteur de vues pour cette propriété ?");
    setShowConfirmModal(true);
  };
  
  // Fermer la modale
  const closeModal = () => {
    setShowConfirmModal(false);
    setSelectedPropertyId(null);
  };
  
  // Confirmer la réinitialisation
  const confirmReset = () => {
    if (selectedPropertyId !== null) {
      closeModal();
      resetPropertyViews(selectedPropertyId);
    }
  };

  // Add a function to handle clicks on property cards
  const handlePropertyClick = (order: any) => {
    if (order.property && typeof order.property === 'object') {
      const propertyId = (order.property as any).property_id;
      if (propertyId) {
        incrementPropertyView(propertyId);
      }
    } else if (order.property_id) {
      incrementPropertyView(order.property_id);
    }
  };

  // Generate content based on active tab
  const renderTabContent = () => {
    // Afficher le loader si les données sont en cours de chargement
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#59e0c5]"></div>
        </div>
      );
    }

    // Afficher un message d'erreur si le chargement a échoué
    if (error) {
      return (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 my-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
          <p>{error}</p>
          <div className="mt-4">
            <p className="text-sm opacity-80">Solutions possibles:</p>
            <ul className="list-disc pl-5 text-sm opacity-80 mt-2">
              <li>Vérifiez votre connexion internet</li>
              <li>Assurez-vous que le serveur est accessible (192.168.8.114:8000)</li>
              <li>Reconnectez-vous à votre compte</li>
            </ul>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "properties":
        return (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-6"
          >
            <div className="flex justify-end mb-4">
              <button
                onClick={refreshData}
                className={`px-4 py-2 ${buttonPrimaryBg} ${buttonPrimaryText} rounded-lg text-sm flex items-center gap-2`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Rafraîchir
              </button>
            </div>
            
            {properties.length > 0 ? (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6" 
                : "space-y-4"
              }>
                {properties.map((property) => (
                  <motion.div
                    key={property.property_id}
                    variants={itemVariants}
                    whileHover={{ scale: viewMode === "grid" ? 1.02 : 1.01 }}
                    className={`${itemBgColor} rounded-lg overflow-hidden border ${cardBorder}
                      ${viewMode === "grid" ? "h-full flex flex-col" : "cursor-pointer transform transition-all"}`}
                    onClick={viewMode === "list" ? () => {
                      incrementPropertyView(property.property_id);
                      navigate(`/property/${property.property_id}`);
                    } : undefined}
                  >
                    {viewMode === "grid" ? (
                      // Mode Grille - garder le design existant
                      <div className="flex flex-col h-full">
                        <div className="h-40 w-full flex-shrink-0 bg-[#1e293b]">
                          <img
                            src={property.media && property.media.length > 0 
                              ? getMediaUrl(property.media[0].media_url) 
                              : "/public_Trano/default-property.png"}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-4 flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className={`${textColor} font-semibold text-sm md:text-base truncate max-w-[70%]`}>{property.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                              property.status === "Disponible" ? 
                                isLightMode ? "bg-blue-100 text-blue-700" : "bg-blue-500/20 text-blue-300" : 
                              property.status === "Réservé" ? 
                                isLightMode ? "bg-yellow-100 text-yellow-700" : "bg-yellow-500/20 text-yellow-300" :
                              property.status === "Vendu" ? 
                                isLightMode ? "bg-green-100 text-green-700" : "bg-green-500/20 text-green-300" :
                                isLightMode ? "bg-purple-100 text-purple-700" : "bg-purple-500/20 text-purple-300"
                            }`}>
                              {property.status}
                            </span>
                          </div>
                          <p className={`${textColor} font-medium text-sm md:text-base`}>{formatPrice(property.price)}</p>
                          {property.location && (
                            <p className={`${textSecondaryColor} text-xs mt-1 truncate`}>{property.location}</p>
                          )}
                          <div className="flex justify-between items-center mt-auto pt-3">
                            <div className="flex items-center gap-2">
                              <span className={`${textSecondaryColor} text-xs md:text-sm`}>{property.views !== undefined ? property.views : 0} vues</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  showResetConfirmation(property.property_id);
                                }}
                                className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full hover:bg-red-500/30"
                              >
                                Réinitialiser
                              </button>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                incrementPropertyView(property.property_id);
                                navigate(`/property/${property.property_id}`);
                              }}
                              className={`${textColor} text-xs md:text-sm hover:underline`}
                            >
                              Voir détails
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Mode Liste - nouveau design amélioré
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-[180px] md:w-[220px] h-[140px] md:h-[160px] flex-shrink-0 bg-[#1e293b]">
                          <img
                            src={property.media && property.media.length > 0 
                              ? getMediaUrl(property.media[0].media_url) 
                              : "/public_Trano/default-property.png"}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-4 flex flex-col">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div>
                              <h3 className={`${textColor} font-semibold text-base md:text-lg`}>{property.title}</h3>
                              {property.location && (
                                <p className={`${textSecondaryColor} text-xs md:text-sm mt-1`}>{property.location}</p>
                              )}
                            </div>
                            <span className={`self-start sm:self-auto text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                              property.status === "Disponible" ? 
                                isLightMode ? "bg-blue-100 text-blue-700" : "bg-blue-500/20 text-blue-300" : 
                              property.status === "Réservé" ? 
                                isLightMode ? "bg-yellow-100 text-yellow-700" : "bg-yellow-500/20 text-yellow-300" :
                              property.status === "Vendu" ? 
                                isLightMode ? "bg-green-100 text-green-700" : "bg-green-500/20 text-green-300" :
                                isLightMode ? "bg-purple-100 text-purple-700" : "bg-purple-500/20 text-purple-300"
                            }`}>
                              {property.status}
                            </span>
                          </div>
                          
                          {property.description && (
                            <p className={`${textSecondaryColor} text-xs md:text-sm mt-1 mb-2 line-clamp-1`}>
                              {property.description}
                            </p>
                          )}
                          
                          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mt-auto pt-2">
                            <p className={`${textColor} font-medium text-base md:text-lg`}>{formatPrice(property.price)}</p>
                            
                            <div className="flex items-center justify-between sm:justify-end gap-4">
                              <div className="flex items-center gap-2">
                                <span className={`${textSecondaryColor} text-xs md:text-sm`}>{property.views !== undefined ? property.views : 0} vues</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    showResetConfirmation(property.property_id);
                                  }}
                                  className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full hover:bg-red-500/30"
                                >
                                  Réinitialiser
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className={`${textSecondaryColor}`}>Vous n'avez pas encore de propriétés</p>
              </div>
            )}
          </motion.div>
        );
      
      case "requests":
        return (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-6 space-y-4"
          >
            {requests.length > 0 ? requests.map((request) => (
              <motion.div
                key={request.request_id}
                variants={itemVariants}
                className={`${itemBgColor} rounded-lg p-4 border-l-4 ${borderColor}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`${textColor} font-medium mb-1`}>{request.title}</h3>
                    <p className={`${textSecondaryColor} text-sm`}>Soumis le {formatDate(request.submitted_at)}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    request.status === "Accepté" ? 
                      isLightMode ? "bg-green-100 text-green-700" : "bg-green-500/20 text-green-300" : 
                    request.status === "Refusé" ? 
                      isLightMode ? "bg-red-100 text-red-700" : "bg-red-500/20 text-red-300" :
                      isLightMode ? "bg-yellow-100 text-yellow-700" : "bg-yellow-500/20 text-yellow-300"
                  }`}>
                    {request.status}
                  </span>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-12">
                <p className={`${textSecondaryColor}`}>Vous n'avez pas encore de demandes</p>
              </div>
            )}
          </motion.div>
        );
      
      case "appointments":
        return (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-6 space-y-4"
          >
            {appointments.length > 0 ? appointments.map((appointment) => (
              <motion.div
                key={appointment.appointment_id}
                variants={itemVariants}
                className={`${itemBgColor} rounded-lg p-4`}
              >
                <div className="flex">
                  <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[#1E2B47] flex items-center justify-center mr-3">
                    <CalendarIcon className={`${textColor} w-5 h-5`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`${textColor} font-medium mb-1`}>{appointment.property.title}</h3>
                    <div className="flex justify-between">
                      <p className={`${textSecondaryColor} text-sm`}>
                        {formatDate(appointment.appointment_date)} à {formatTime(appointment.appointment_date)}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        appointment.confirmation_status === "Confirmé" ? 
                          isLightMode ? "bg-green-100 text-green-700" : "bg-green-500/20 text-green-300" : 
                        appointment.confirmation_status === "Annulé" ? 
                          isLightMode ? "bg-red-100 text-red-700" : "bg-red-500/20 text-red-300" :
                          isLightMode ? "bg-yellow-100 text-yellow-700" : "bg-yellow-500/20 text-yellow-300"
                      }`}>
                        {appointment.confirmation_status}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-12">
                <p className={`${textSecondaryColor}`}>Vous n'avez pas encore de visites planifiées</p>
              </div>
            )}
          </motion.div>
        );

      case "orders":
        return (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-6 space-y-4"
          >
            {orders.length > 0 ? orders.map((order) => {
              console.log("Rendering order:", order);
              // Safely access price from property or order
              const propertyPrice = order.property && typeof order.property === 'object' 
                ? (order.property as any).price 
                : undefined;
              const orderPrice = typeof order.price !== 'undefined' ? order.price : undefined;
              const price = propertyPrice || orderPrice;
                
              return (
                <motion.div
                  key={order.order_id}
                  variants={itemVariants}
                  className={`${itemBgColor} rounded-lg p-4 cursor-pointer hover:opacity-90 transition-opacity`}
                  onClick={() => handlePropertyClick(order)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`${textColor} font-medium`}>
                      {order.property && typeof order.property === 'object' 
                        ? (order.property as any).title || 'Propriété'
                        : 'Propriété'}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.order_status === "Terminé" ? 
                        isLightMode ? "bg-green-100 text-green-700" : "bg-green-500/20 text-green-300" : 
                      order.order_status === "Annulé" ? 
                        isLightMode ? "bg-red-100 text-red-700" : "bg-red-500/20 text-red-300" :
                      order.order_status === "Confirmé" ? 
                        isLightMode ? "bg-blue-100 text-blue-700" : "bg-blue-500/20 text-blue-300" :
                        isLightMode ? "bg-yellow-100 text-yellow-700" : "bg-yellow-500/20 text-yellow-300"
                    }`}>
                      {order.order_status}
                    </span>
                  </div>
                  <p className={`${textColor} font-medium`}>
                    {formatPrice(price)} {order.order_type === "Location" ? "/mois" : ""}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`${textSecondaryColor} text-sm`}>{order.order_type}</span>
                    <span className={`${textSecondaryColor} text-sm`}>{formatDate(order.order_date)}</span>
                  </div>
                </motion.div>
              );
            }) : (
              <div className="text-center py-12">
                <p className={`${textSecondaryColor}`}>Vous n'avez pas encore d'achats ou de locations</p>
              </div>
            )}
          </motion.div>
        );
      
      default:
        return <div>Contenu non disponible</div>;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`${bgColor} min-h-screen relative overflow-hidden`}
    >
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 opacity-50" 
        style={{ 
          backgroundImage: `url(${isLightMode ? '/public_Accueil_Sombre/blie-pattern2.jpeg' : '/public_Accueil_Sombre/blie-pattern.png'})`,
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
          transition: 'background-image 0.5s ease-in-out'
        }}
      />
      
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
              className={`w-8 h-8 sm:w-10 sm:h-10 ${textColor} cursor-pointer hover:opacity-80 transition-colors`}
              onClick={() => navigate('/home')}
            />
            <NotificationBadge size="lg" accentColor={accentColor} />
            <SettingsIcon 
              className={`w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 ${textColor} cursor-pointer hover:opacity-80 transition-colors`}
              onClick={() => navigate('/parametres')}
            />
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

        {/* Dashboard Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`${cardBgColor} rounded-2xl p-5 sm:p-8 mb-6 ${isLightMode ? 'border border-[#0150BC]' : ''}`}
        >
          <div className="flex justify-between items-center mb-4">
            <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold ${textPrimaryColor}`}>Mon Tableau de Bord</h1>
            {activeTab === "properties" && (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg ${viewMode === "grid" ? `${buttonPrimaryBg}/20` : 'bg-transparent'}`}
                >
                  <GridIcon className={`w-5 h-5 ${textColor}`} />
                </button>
                <button 
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg ${viewMode === "list" ? `${buttonPrimaryBg}/20` : 'bg-transparent'}`}
                >
                  <ListIcon className={`w-5 h-5 ${textColor}`} />
                </button>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className={`${statCardBg} rounded-lg p-4 flex flex-col ${cardBorder}`}>
              <BuildingIcon className={`w-6 h-6 ${textColor} mb-2`} />
              <span className={`text-xs ${textSecondaryColor}`}>Mes propriétés</span>
              <span className={`text-xl ${textPrimaryColor} font-bold`}>{properties.length}</span>
            </div>
            <div className={`${statCardBg} rounded-lg p-4 flex flex-col ${cardBorder}`}>
              <ClipboardListIcon className={`w-6 h-6 ${textColor} mb-2`} />
              <span className={`text-xs ${textSecondaryColor}`}>Demandes</span>
              <span className={`text-xl ${textPrimaryColor} font-bold`}>{requests.length}</span>
            </div>
            <div className={`${statCardBg} rounded-lg p-4 flex flex-col ${cardBorder}`}>
              <CalendarIcon className={`w-6 h-6 ${textColor} mb-2`} />
              <span className={`text-xs ${textSecondaryColor}`}>Visites</span>
              <span className={`text-xl ${textPrimaryColor} font-bold`}>{appointments.length}</span>
            </div>
            <div className={`${statCardBg} rounded-lg p-4 flex flex-col ${cardBorder}`}>
              <HomeIcon className={`w-6 h-6 ${textColor} mb-2`} />
              <span className={`text-xs ${textSecondaryColor}`}>Achats</span>
              <span className={`text-xl ${textPrimaryColor} font-bold`}>{orders.length}</span>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className={`flex overflow-x-auto pb-2 space-x-4 border-b ${borderColor}/30`}>
            <button 
              onClick={() => setActiveTab("properties")}
              className={`pb-2 font-medium whitespace-nowrap ${activeTab === "properties" ? `${textColor} border-b-2 ${borderColor}` : textSecondaryColor}`}
            >
              Mes propriétés
            </button>
            <button 
              onClick={() => setActiveTab("requests")}
              className={`pb-2 font-medium whitespace-nowrap ${activeTab === "requests" ? `${textColor} border-b-2 ${borderColor}` : textSecondaryColor}`}
            >
              Mes demandes
            </button>
            <button 
              onClick={() => setActiveTab("appointments")}
              className={`pb-2 font-medium whitespace-nowrap ${activeTab === "appointments" ? `${textColor} border-b-2 ${borderColor}` : textSecondaryColor}`}
            >
              Mes visites
            </button>
            <button 
              onClick={() => setActiveTab("orders")}
              className={`pb-2 font-medium whitespace-nowrap ${activeTab === "orders" ? `${textColor} border-b-2 ${borderColor}` : textSecondaryColor}`}
            >
              Mes achats
            </button>
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </motion.div>

        {/* Add Property Button */}
        <div className="text-center mb-16">
          <button 
            onClick={() => navigate('/category-selection')}
            className={`inline-flex items-center gap-2 ${buttonPrimaryBg} ${buttonPrimaryText} px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-colors`}
          >
            <BuildingIcon size={18} />
            <span>Ajouter une nouvelle propriété</span>
          </button>
        </div>
      </div>

      {/* Modale de confirmation */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={`${itemBgColor} rounded-lg p-6 max-w-md w-full shadow-xl ${borderColor} border`}
          >
            {!resetSuccess || selectedPropertyId !== null ? (
              // Modale de confirmation
              <>
                <h3 className={`text-xl font-semibold mb-4 ${textColor}`}>Confirmation</h3>
                <p className={`mb-6 ${textPrimaryColor}`}>{resetMessage}</p>
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={closeModal}
                    className={`px-4 py-2 rounded-lg ${isLightMode ? 'bg-gray-200 text-gray-800' : 'bg-gray-700 text-gray-200'} hover:opacity-90`}
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={confirmReset}
                    className={`px-4 py-2 rounded-lg ${buttonPrimaryBg} ${buttonPrimaryText} hover:opacity-90`}
                  >
                    Confirmer
                  </button>
                </div>
              </>
            ) : (
              // Modale de succès/erreur
              <>
                <div className="flex items-center mb-4">
                  {resetSuccess ? (
                    <div className={`w-10 h-10 rounded-full ${isLightMode ? 'bg-green-100' : 'bg-green-900'} flex items-center justify-center mr-3`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isLightMode ? 'text-green-600' : 'text-green-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className={`w-10 h-10 rounded-full ${isLightMode ? 'bg-red-100' : 'bg-red-900'} flex items-center justify-center mr-3`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isLightMode ? 'text-red-600' : 'text-red-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                  <h3 className={`text-xl font-semibold ${textColor}`}>
                    {resetSuccess ? "Succès" : "Erreur"}
                  </h3>
                </div>
                <p className={`mb-6 ${textPrimaryColor}`}>{resetMessage}</p>
                <div className="flex justify-end">
                  <button 
                    onClick={closeModal}
                    className={`px-4 py-2 rounded-lg ${buttonPrimaryBg} ${buttonPrimaryText} hover:opacity-90`}
                  >
                    Fermer
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard;