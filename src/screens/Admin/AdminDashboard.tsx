import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { 
  BellIcon, HomeIcon, SettingsIcon, ClipboardListIcon, 
  CalendarIcon, BuildingIcon, UserIcon, ListIcon,
  CheckCircleIcon, XCircleIcon, RefreshCwIcon,
  SunIcon, MoonIcon, UsersIcon, ShoppingCartIcon,
  ClipboardIcon, InfoIcon, MailIcon, PhoneIcon, ImageIcon, FileIcon,
  FileTextIcon, CreditCardIcon, PlusCircleIcon, ArrowRightIcon, TagIcon, TicketIcon
} from "lucide-react";
import apiService from "../../services/apiService";
import NotificationBadge from "../../components/NotificationBadge";
import { getMediaUrl } from "../../config/api";


// Types
interface DashboardStats {
  total_properties: number;
  available_properties: number;
  sold_properties: number;
  rented_properties: number;
  total_users: number;
  total_orders: number;
  pending_appointments: number;
  pending_property_requests: number;
  pending_orders: number;
}

interface PropertyRequestMedia {
  media_id: number;
  request_id: number;
  media_type: string;
  media_url: string;
  uploaded_at: string;
}

interface PropertyRequest {
  request_id: number;
  user_id: number;
  title: string;
  description: string;
  additional_details: string;
  status: string;
  submitted_at: string;
  updated_at: string;
  image_url?: string;
  media?: PropertyRequestMedia[];
  user?: {
    full_name: string;
    email: string;
    phone: string;
  };
}

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export const AdminDashboard = (): JSX.Element => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingRequests, setPendingRequests] = useState<PropertyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLightMode, setIsLightMode] = useState(() => {
    // Récupérer la préférence depuis localStorage
    const savedMode = localStorage.getItem('isLightMode');
    return savedMode !== null ? savedMode === 'true' : false;
  });
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});

  // Couleurs qui changent en fonction du mode
  const accentColor = isLightMode ? "#0150BC" : "#59e0c5";
  const bgColor = isLightMode ? "bg-white" : "bg-[#0f172a]";
  const cardBgColor = isLightMode ? "bg-[#F8FAFC]" : "bg-[#1e293b]";
  const darkBgColor = isLightMode ? "bg-[#EFF6FF]" : "bg-[#0f172a]";
  const textColor = isLightMode ? "text-[#0150BC]" : "text-[#59e0c5]";
  const textPrimaryColor = isLightMode ? "text-[#1E293B]" : "text-white";
  const textSecondaryColor = isLightMode ? "text-gray-700" : "text-gray-300";
  const borderColor = isLightMode ? "border-[#0150BC]" : "border-[#59e0c5]";
  const buttonPrimaryBg = isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]";
  const buttonpending = isLightMode ? "bg-[#FF3030]" : "bg-[#FF5151]";
  const buttonPrimaryText = isLightMode ? "text-white" : "text-white";
  const adminBadgeBg = isLightMode ? "bg-red-100" : "bg-red-500/20";
  const adminBadgeText = isLightMode ? "text-red-700" : "text-red-300";
  const borderLight = isLightMode ? "border-[#0150BC]/20" : "border-[#59e0c5]/20";
  const cardBorder = isLightMode ? "border border-[#0150BC]/30" : "";
  const errorBgColor = isLightMode ? "bg-red-100" : "bg-red-500/20";
  const errorTextColor = isLightMode ? "text-red-700" : "text-red-300";
  const tabActiveBg = isLightMode ? "bg-[#F8FAFC]" : "bg-[#1e293b]";
  const tabHoverBg = isLightMode ? "bg-[#F8FAFC]/80" : "bg-[#1e293b]/50";
  const statCardBg = isLightMode ? "bg-[#F8FAFC]" : "bg-[#1e293b]";
  const yellowTextColor = isLightMode ? "text-yellow-700" : "text-yellow-300";
  const yellowBgColor = isLightMode ? "bg-yellow-100/50" : "bg-yellow-500/20";
  const greenTextColor = isLightMode ? "text-green-700" : "text-green-300";
  const blueTextColor = isLightMode ? "text-blue-700" : "text-blue-300";
  const iconBgColor = isLightMode ? "bg-[#0150BC]/10" : "bg-[#59e0c5]/20";
  const yellowIconBgColor = isLightMode ? "bg-yellow-100" : "bg-yellow-500/20";
  const actionButtonBg = isLightMode ? "bg-[#EFF6FF]" : "bg-[#0f172a]";
  const actionButtonHoverBg = isLightMode ? "bg-[#EFF6FF]/80" : "bg-[#0f172a]/80";
  const spinnerBorderColor = isLightMode ? "border-[#0150BC]" : "border-[#59e0c5]";

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

  // Helper function to handle image errors
  const handleImageError = (requestId: number) => {
    setImageErrors(prev => ({
      ...prev,
      [`${requestId}`]: true
    }));
  };

  // Charger les statistiques et les demandes en attente
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Charger les statistiques du tableau de bord
        const statsResponse = await apiService.get<ApiResponse<DashboardStats>>('/dashboard/stats');
        
        if (statsResponse.data && statsResponse.data.data) {
          setStats(statsResponse.data.data);
        }
        
        // Charger les demandes de propriétés en attente
        const requestsResponse = await apiService.get<ApiResponse<PropertyRequest[] | { data: PropertyRequest[] }>>('/property-requests', {
          params: { status: 'En attente' }
        });
        
        if (requestsResponse.data && requestsResponse.data.data) {
          const requests = Array.isArray(requestsResponse.data.data) 
            ? requestsResponse.data.data 
            : requestsResponse.data.data.data || [];
            
          // Fetch media for each request
          const requestsWithMedia = await Promise.all(
            requests.map(async (request) => {
              try {
                const mediaResponse = await apiService.get<ApiResponse<PropertyRequestMedia[]>>(
                  `/property-requests/${request.request_id}/media`
                );
                
                if (mediaResponse.data && mediaResponse.data.status === "success" && mediaResponse.data.data) {
                  // Find the first image from media
                  const media = mediaResponse.data.data;
                  const firstImage = Array.isArray(media) ? 
                    media.find(m => m.media_type === 'Photo') : null;
                    
                  if (firstImage) {
                    return {
                      ...request,
                      image_url: firstImage.media_url,
                      media: media
                    };
                  }
                }
              } catch (err) {
                console.error(`Error fetching media for request ${request.request_id}:`, err);
              }
              
              return request;
            })
          );
          
          setPendingRequests(requestsWithMedia);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données du tableau de bord:", err);
        setError("Impossible de charger les données. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Approuver une demande de propriété
  const handleApproveRequest = async (requestId: number) => {
    try {
      // 1. Mettre à jour le statut de la demande à "Accepté"
      await apiService.put(`/property-requests/${requestId}`, {
        status: 'Accepté'
      });
      
      // 2. Rediriger vers la page de création de propriété avec l'ID de la demande
      navigate(`/admin/property-requests/${requestId}`);
    } catch (err) {
      console.error("Erreur lors de l'approbation de la demande:", err);
      alert("Une erreur est survenue lors de l'approbation de la demande. Veuillez réessayer.");
    }
  };

  // Refuser une demande de propriété
  const handleRejectRequest = async (requestId: number) => {
    try {
      // Mettre à jour le statut de la demande à "Refusé"
      await apiService.put(`/property-requests/${requestId}`, {
        status: 'Refusé'
      });
      
      // Mettre à jour la liste des demandes en attente
      setPendingRequests(pendingRequests.filter(req => req.request_id !== requestId));
      
      // Mettre à jour les statistiques
      if (stats) {
        setStats({
          ...stats,
          pending_property_requests: stats.pending_property_requests - 1
        });
      }
    } catch (err) {
      console.error("Erreur lors du refus de la demande:", err);
      alert("Une erreur est survenue lors du refus de la demande. Veuillez réessayer.");
    }
  };

  // Navigation vers les différentes pages d'administration
  const navigateToPropertyManagement = () => {
    navigate('/admin/properties');
  };

  const navigateToAppointmentManagement = () => {
    navigate('/admin/appointments');
  };

  const navigateToUserManagement = () => {
    navigate('/admin/users');
  };

  const navigateToOrderManagement = () => {
    navigate('/admin/orders');
  };

  const navigateToPropertyRequestManagement = () => {
    // S'il y a des demandes en attente, rediriger vers la première
    if (pendingRequests.length > 0) {
      navigate(`/admin/property-requests/${pendingRequests[0].request_id}`);
    } else {
      navigate('/admin/property-requests');
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

  // Modifier les cards de navigation pour ajouter la gestion des commandes
  // Générer dynamiquement les cartes d'administration pour que les icônes s'adaptent au mode
  const getAdminCards = () => [
    {
      id: 1,
      title: "Propriétés",
      description: "Gérer les annonces",
      icon: <FileTextIcon className={`h-6 w-6 ${textColor}`} />,
      link: "/admin/properties"
    },
    {
      id: 2,
      title: "Utilisateurs",
      description: "Gérer les comptes",
      icon: <UsersIcon className={`h-6 w-6 ${textColor}`} />,
      link: "/admin/users"
    },
    {
      id: 3,
      title: "Demandes de mise en ligne",
      description: "Approuver les requêtes",
      icon: <PlusCircleIcon className={`h-6 w-6 ${textColor}`} />,
      link: "/admin/property-requests"
    },
    {
      id: 4,
      title: "Rendez-vous",
      description: "Gérer les visites",
      icon: <CalendarIcon className={`h-6 w-6 ${textColor}`} />,
      link: "/admin/appointments"
    },
    {
      id: 5,
      title: "Commandes",
      description: "Gérer les transactions",
      icon: <CreditCardIcon className={`h-6 w-6 ${textColor}`} />,
      link: "/admin/orders"
    },
    {
      id: 6,
      title: "Coupons",
      description: "Accès aux vidéos",
      icon: <TicketIcon className={`h-6 w-6 ${textColor}`} />,
      link: "/admin/coupons"
    }
  ];

  return (
    <div className={`${bgColor} min-h-screen ${textPrimaryColor} relative`}>
      <div 
        className="fixed inset-0 opacity-50 z-0" 
        style={{ 
          backgroundImage: `url(${isLightMode ? '/public_Accueil_Sombre/blie-pattern2.jpeg' : '/public_Accueil_Sombre/blie-pattern.png'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'fixed',
          transition: 'background-image 0.5s ease-in-out'
        }}
      ></div>
      <div className="max-w-[1440px] mx-auto px-4 xs:px-6 sm:px-8 py-6 relative z-10">
        {/* En-tête d'administration */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <h1 className={`text-2xl md:text-3xl font-bold ${textColor} mr-4`}>
              Admin Dashboard
            </h1>
            {/* <div className={`${adminBadgeBg} ${adminBadgeText} px-3 py-1 rounded-full text-xs font-medium`}>
              Mode Administrateur
            </div> */}
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/home')}
              className={`p-2 rounded-full ${cardBgColor} ${textColor}`}
            >
              <HomeIcon size={25} />
            </button>
            <div className={`p-2 rounded-full ${cardBgColor}`}>
              <NotificationBadge size="sm" accentColor={accentColor} />
            </div>
            <button 
              onClick={() => navigate('/profile')}
              className={`p-2 rounded-full ${cardBgColor} ${textColor}`}
            >
              <UserIcon size={25} />
            </button>
          </div>
        </div>

        {/* Navigation des onglets */}
        <div className="relative">
          <div className={`flex overflow-x-auto pb-2 mb-6 ${isLightMode ? "border-gray-400" : "border-[#1e293b]"} border-b`}>
            <button 
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 mr-2 rounded-t-lg font-medium ${
                activeTab === "overview" 
                  ? `${tabActiveBg} ${textColor}` 
                  : `${textSecondaryColor} hover:${textColor} hover:${tabHoverBg}`
              }`}
            >
              Vue d'ensemble
            </button>

            <button 
              onClick={navigateToAppointmentManagement}
              className={`px-4 py-2 mr-2 rounded-t-lg font-medium flex items-center ${
                activeTab === "appointments" 
                  ? `${tabActiveBg} ${textColor}` 
                  : `${textSecondaryColor} hover:${textColor} hover:${tabHoverBg}`
              }`}
            >
              Rendez-vous
              {stats && stats.pending_appointments > 0 && (
                <span className={`ml-2 px-2 py-0.5 ${buttonpending} ${buttonPrimaryText} rounded-full text-xs`}>
                  {stats.pending_appointments}
                </span>
              )}
            </button>
            <button 
              onClick={navigateToOrderManagement}
              className={`px-4 py-2 mr-2 rounded-t-lg font-medium flex items-center ${
                activeTab === "orders" 
                  ? `${tabActiveBg} ${textColor}` 
                  : `${textSecondaryColor} hover:${textColor} hover:${tabHoverBg}`
              }`}
            >
              Commandes
              {stats && stats.pending_orders > 0 && (
                <span className={`ml-2 px-2 py-0.5 ${buttonpending} ${buttonPrimaryText} rounded-full text-xs`}>
                  {stats.pending_orders}
                </span>
              )}
            </button>
            
            <button 
              onClick={() => setActiveTab("requests")}
              className={`px-4 py-2 mr-2 rounded-t-lg font-medium flex items-center ${
                activeTab === "requests" 
                  ? `${tabActiveBg} ${textColor}` 
                  : `${textSecondaryColor} hover:${textColor} hover:${tabHoverBg}`
              }`}
            >
              Demandes
              {stats && stats.pending_property_requests > 0 && (
                <span className={`ml-2 px-2 py-0.5 ${buttonPrimaryBg} ${buttonPrimaryText} rounded-full text-xs`}>
                  {stats.pending_property_requests}
                </span>
              )}
            </button>
           
            <button 
              onClick={navigateToPropertyManagement}
              className={`px-4 py-2 mr-2 rounded-t-lg font-medium ${
                activeTab === "properties" 
                  ? `${tabActiveBg} ${textColor}` 
                  : `${textSecondaryColor} hover:${textColor} hover:${tabHoverBg}`
              }`}
            >
              Propriétés
            </button>
            <button 
              onClick={navigateToUserManagement}
              className={`px-4 py-2 mr-2 rounded-t-lg font-medium ${
                activeTab === "users" 
                  ? `${tabActiveBg} ${textColor}` 
                  : `${textSecondaryColor} hover:${textColor} hover:${tabHoverBg}`
              }`}
            >
              Utilisateurs
            </button>
          </div>
          <div className={`absolute bottom-0 left-0 right-0 h-px ${isLightMode ? "bg-gray-400" : "bg-[#1e293b]"}`}></div>
        </div>
        

        {/* Contenu principal */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${spinnerBorderColor}`}></div>
          </div>
        ) : error ? (
          <div className={`${errorBgColor} ${errorTextColor} p-4 rounded-lg`}>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 flex items-center text-sm hover:underline"
            >
              <RefreshCwIcon size={14} className="mr-1" /> Réessayer
            </button>
          </div>
        ) : (
          <>
            {/* Onglet Vue d'ensemble */}
            {activeTab === "overview" && stats && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col h-[calc(100vh-200px)]"
              >
                <div className="flex-none">
                  <h2 className={`text-xl font-semibold mb-4 ${textPrimaryColor}`}>Statistiques Générales</h2>
                </div>
                <div className="flex-1 overflow-y-auto pr-2">
                  <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-1 mb-6 sm:mb-8">
                    <motion.div 
                      variants={itemVariants}
                      className={`${statCardBg} p-4 sm:p-4 rounded-lg ${cardBorder}`}
                    >
                      <div className="flex items-center mb-2">
                        <ShoppingCartIcon className={`w-5 h-5 ${textColor} mr-2`} />
                        <h3 className={textSecondaryColor}>Commandes</h3>
                      </div>
                      <p className={`text-2xl font-bold ${textPrimaryColor}`}>{stats?.total_orders || 0}</p>
                      <p className={`mt-2 text-sm ${yellowTextColor}`}>
                        {stats?.pending_orders || 0} en attente
                      </p>
                    </motion.div>
                    
                    <motion.div 
                      variants={itemVariants}
                      className={`${statCardBg} p-4 sm:p-4 rounded-lg ${cardBorder}`}
                    >
                      <div className="flex items-center mb-2">
                        <UserIcon className={`w-5 h-5 ${textColor} mr-2`} />
                        <h3 className={textSecondaryColor}>Utilisateurs</h3>
                      </div>
                      <p className={`text-2xl font-bold ${textPrimaryColor}`}>{stats?.total_users || 0}</p>
                    </motion.div>
                    
                    <motion.div 
                      variants={itemVariants}
                      className={`${statCardBg} p-4 sm:p-4 rounded-lg ${cardBorder}`}
                    >
                      <div className="flex items-center mb-2">
                        <ClipboardListIcon className={`w-5 h-5 ${textColor} mr-2`} />
                        <h3 className={textSecondaryColor}>Demandes</h3>
                      </div>
                      <p className={`text-2xl font-bold ${textPrimaryColor}`}>{stats?.pending_property_requests || 0}</p>
                      <p className={`mt-2 text-sm ${yellowTextColor}`}>{stats.pending_property_requests} en attente</p>
                    </motion.div>
                    
                    <motion.div 
                      variants={itemVariants}
                      className={`${statCardBg} p-4 sm:p-4 rounded-lg ${cardBorder}`}
                    >
                      <div className="flex items-center mb-2">
                        <CalendarIcon className={`w-5 h-5 ${textColor} mr-2`} />
                        <h3 className={textSecondaryColor}>Rendez-vous</h3>
                      </div>
                      <p className={`text-2xl font-bold ${textPrimaryColor}`}>{stats.pending_appointments}</p>
                      <p className={`mt-2 text-sm ${yellowTextColor}`}>{stats.pending_appointments} en attente</p>
                    </motion.div>

                    <motion.div 
                      variants={itemVariants}
                      className={`${statCardBg} p-4 sm:p-4 rounded-lg ${cardBorder} col-span-2`}
                    >
                      <div className="flex items-center mb-2">
                        <BuildingIcon className={`w-5 h-5 ${textColor} mr-2`} />
                        <h3 className={textSecondaryColor}>Propriétés</h3>
                      </div>
                      <p className={`text-2xl font-bold ${textPrimaryColor}`}>{stats.total_properties}</p>
                      <div className="mt-2 flex justify-between text-sm">
                        <span className={greenTextColor}>{stats.available_properties} disponibles</span>
                        <span className={blueTextColor}>{stats.sold_properties} vendues</span>
                        <span className={yellowTextColor}>{stats.rented_properties} louées</span>
                      </div>
                    </motion.div>
                  </div>
                  
                  <div className="flex-none">
                    <h2 className={`text-xl font-semibold mb-4 ${textPrimaryColor}`}>Accès Rapides</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {getAdminCards().map(card => (
                      <Link
                        key={card.id}
                        to={card.link}
                        className={`${cardBgColor} overflow-hidden shadow rounded-lg transition-all hover:shadow-lg ${cardBorder}`}
                      >
                        <div className="px-4 py-5 sm:p-6">
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 ${iconBgColor} rounded-md p-3`}>
                              {card.icon}
                            </div>
                            <div className="ml-5 w-0 flex-1">
                              <dl>
                                <dt className={`text-sm font-medium ${textSecondaryColor} truncate`}>
                                  {card.title}
                                </dt>
                                <dd>
                                  <div className={`text-lg font-medium ${textPrimaryColor}`}>
                                    {card.description}
                                  </div>
                                </dd>
                              </dl>
                            </div>
                          </div>
                        </div>
                        <div className={`${darkBgColor} px-4 py-4 sm:px-6`}>
                          <div className="text-sm">
                            <p className={`font-medium ${textColor} hover:opacity-80`}>
                              Gérer {card.title.toLowerCase()} &rarr;
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Onglet des demandes de propriété */}
            {activeTab === "requests" && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className={`text-xl font-semibold ${textPrimaryColor}`}>Demandes de Propriété</h2>
                </div>
                
                {pendingRequests.length === 0 ? (
                  <motion.div 
                    variants={itemVariants}
                    className={`${cardBgColor} p-6 rounded-lg text-center ${cardBorder}`}
                  >
                    <p className={textSecondaryColor}>Aucune demande en attente</p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map(request => (
                      <motion.div 
                        key={request.request_id}
                        variants={itemVariants}
                        className={`${cardBgColor} p-4 rounded-lg ${cardBorder} hover:shadow-md transition-all`}
                      >
                        <div className="flex flex-col md:flex-row md:items-start mb-4">
                          <div className="flex items-center mb-3 md:mb-0 md:mr-6">
                            <div className={`w-10 h-10 ${iconBgColor} rounded-full flex items-center justify-center mr-3`}>
                              <ClipboardIcon className={`w-5 h-5 ${textColor}`} />
                            </div>
                            <div>
                              <h3 className="font-medium">Demande #{request.request_id}</h3>
                              <div className="flex items-center text-sm text-gray-400">
                                <RefreshCwIcon className="w-3.5 h-3.5 mr-1" />
                                <span>Soumise le {new Date(request.submitted_at).toLocaleDateString('fr-FR')}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className={`${yellowBgColor} ${yellowTextColor} px-3 py-1 rounded-full text-sm flex items-center self-start`}>
                            <span className="ml-1">En attente</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className={`${darkBgColor} p-3 rounded-lg ${cardBorder}`}>
                            <h4 className={`${textColor} text-sm font-medium mb-2`}>Détails de la demande</h4>
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm font-medium">{request.title}</p>
                                {request.description && (
                                  <p className={`text-sm ${textSecondaryColor} line-clamp-2 mt-1`}>
                                    {request.description}
                                  </p>
                                )}
                              </div>
                              
                              {request.additional_details && (
                                <div className={`border-t ${isLightMode ? "border-gray-200" : "border-gray-700"} pt-2 mt-2`}>
                                  <p className="text-xs text-gray-400">Détails supplémentaires:</p>
                                  <p className={`text-sm ${textSecondaryColor} line-clamp-2`}>
                                    {request.additional_details}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className={`${darkBgColor} p-3 rounded-lg ${cardBorder}`}>
                            <h4 className={`${textColor} text-sm font-medium mb-2`}>Image de la propriété</h4>
                            <div className="w-full h-32 overflow-hidden rounded bg-gray-200 flex items-center justify-center">
                              {request.image_url && !imageErrors[`${request.request_id}`] ? (
                                <img 
                                  src={getMediaUrl(request.image_url)} 
                                  alt={request.title} 
                                  className="w-full h-full object-cover" 
                                  onError={() => handleImageError(request.request_id)}
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center text-gray-400">
                                  <FileIcon size={36} />
                                  <p className="mt-2 text-xs">Aucune image disponible</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                            <button
                            onClick={() => handleRejectRequest(request.request_id)}
                            className="px-4 py-2 border border-red-500 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-500/10 transition-colors"
                            >
                            <XCircleIcon className="w-4 h-4 mr-2" /> Refuser
                            </button>
                            <button
                            onClick={() => navigate(`/admin/property-requests/${request.request_id}`)}
                            className={`px-4 py-2 ${buttonPrimaryBg} ${buttonPrimaryText} rounded-lg flex items-center justify-center hover:opacity-90 transition-colors`}
                            >
                            <InfoIcon className="w-4 h-4 mr-2" /> Voir détail
                            </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Onglet des rendez-vous */}
            {activeTab === "appointments" && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className={`text-xl font-semibold ${textPrimaryColor}`}>Gestion des Rendez-vous</h2>
                  <button 
                    onClick={navigateToAppointmentManagement}
                    className={`${buttonPrimaryBg} ${buttonPrimaryText} px-4 py-2 rounded-lg text-sm flex items-center`}
                  >
                    Voir tous les rendez-vous
                  </button>
                </div>
              </motion.div>
            )}

            {/* Onglet des propriétés */}
            {activeTab === "properties" && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className={`text-xl font-semibold ${textPrimaryColor}`}>Gestion des Propriétés</h2>
                  <button 
                    onClick={navigateToPropertyManagement}
                    className={`${buttonPrimaryBg} ${buttonPrimaryText} px-4 py-2 rounded-lg text-sm flex items-center`}
                  >
                    Gérer les propriétés
                  </button>
                </div>
              </motion.div>
            )}

            {/* Onglet des utilisateurs */}
            {activeTab === "users" && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className={`text-xl font-semibold ${textPrimaryColor}`}>Gestion des Utilisateurs</h2>
                  <button 
                    onClick={navigateToUserManagement}
                    className={`${buttonPrimaryBg} ${buttonPrimaryText} px-4 py-2 rounded-lg text-sm flex items-center`}
                  >
                    Gérer les utilisateurs
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 