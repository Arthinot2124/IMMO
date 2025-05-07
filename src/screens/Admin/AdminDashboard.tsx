import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  BellIcon, HomeIcon, SettingsIcon, ClipboardListIcon, 
  CalendarIcon, BuildingIcon, UserIcon, ListIcon,
  CheckCircleIcon, XCircleIcon, RefreshCwIcon,
  SunIcon, MoonIcon
} from "lucide-react";
import apiService from "../../services/apiService";
import { API_URL, getMediaUrl } from "../../config/api";

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
    return savedMode !== null ? savedMode === 'true' : false; // Défaut: mode sombre pour conserver le mode actuel
  });

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
          setPendingRequests(Array.isArray(requestsResponse.data.data) 
            ? requestsResponse.data.data 
            : requestsResponse.data.data.data || []);
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
    navigate('/admin/property-management');
  };

  const navigateToAppointmentManagement = () => {
    navigate('/admin/appointments');
  };

  const navigateToUserManagement = () => {
    navigate('/admin/users');
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
              <HomeIcon size={20} />
            </button>
            <button 
              onClick={() => navigate('/notifications')}
              className={`p-2 rounded-full ${cardBgColor} ${textColor}`}
            >
              <BellIcon size={20} />
            </button>
            <button 
              onClick={() => navigate('/profile')}
              className={`p-2 rounded-full ${cardBgColor} ${textColor}`}
            >
              <UserIcon size={20} />
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <motion.div 
                      variants={itemVariants}
                      className={`${statCardBg} p-4 rounded-lg ${cardBorder}`}
                    >
                      <div className="flex items-center mb-2">
                        <BuildingIcon className={`w-5 h-5 ${textColor} mr-2`} />
                        <h3 className={textSecondaryColor}>Propriétés</h3>
                      </div>
                      <p className={`text-2xl font-bold ${textPrimaryColor}`}>{stats.total_properties}</p>
                      <div className="mt-2 flex justify-between text-sm">
                        <span className={greenTextColor}>{stats.available_properties} disponibles</span>
                        <span className={blueTextColor}>{stats.sold_properties} vendues</span>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      variants={itemVariants}
                      className={`${statCardBg} p-4 rounded-lg ${cardBorder}`}
                    >
                      <div className="flex items-center mb-2">
                        <UserIcon className={`w-5 h-5 ${textColor} mr-2`} />
                        <h3 className={textSecondaryColor}>Utilisateurs</h3>
                      </div>
                      <p className={`text-2xl font-bold ${textPrimaryColor}`}>{stats?.total_users || 0}</p>
                    </motion.div>
                    
                    <motion.div 
                      variants={itemVariants}
                      className={`${statCardBg} p-4 rounded-lg ${cardBorder}`}
                    >
                      <div className="flex items-center mb-2">
                        <ClipboardListIcon className={`w-5 h-5 ${textColor} mr-2`} />
                        <h3 className={textSecondaryColor}>Demandes en attente</h3>
                      </div>
                      <p className={`text-2xl font-bold ${textPrimaryColor}`}>{stats?.pending_property_requests || 0}</p>
                      <p className={`mt-2 text-sm ${yellowTextColor}`}>{stats.pending_property_requests} en attente</p>
                    </motion.div>
                    
                    <motion.div 
                      variants={itemVariants}
                      className={`${statCardBg} p-4 rounded-lg ${cardBorder}`}
                    >
                      <div className="flex items-center mb-2">
                        <CalendarIcon className={`w-5 h-5 ${textColor} mr-2`} />
                        <h3 className={textSecondaryColor}>Rendez-vous en attente</h3>
                      </div>
                      <p className={`text-2xl font-bold ${textPrimaryColor}`}>{stats.pending_appointments}</p>
                      <p className={`mt-2 text-sm ${yellowTextColor}`}>{stats.pending_appointments} en attente</p>
                    </motion.div>
                  </div>
                  
                  <div className="flex-none">
                    <h2 className={`text-xl font-semibold mb-4 ${textPrimaryColor}`}>Accès Rapides</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <motion.button
                      variants={itemVariants}
                      className={`${cardBgColor} p-4 rounded-lg flex items-center ${cardBorder} hover:shadow-md transition-all`}
                      onClick={navigateToPropertyManagement}
                    >
                      <div className={`${iconBgColor} p-3 rounded-lg mr-4`}>
                        <BuildingIcon className={`w-6 h-6 ${textColor}`} />
                      </div>
                      <div className="text-left">
                        <h3 className={`font-medium ${textPrimaryColor}`}>Gestion des Propriétés</h3>
                        <p className={`text-sm ${textSecondaryColor}`}>Gérer toutes les propriétés</p>
                      </div>
                    </motion.button>
                    
                    <motion.button
                      variants={itemVariants}
                      className={`${cardBgColor} p-4 rounded-lg flex items-center ${cardBorder} hover:shadow-md transition-all`}
                      onClick={navigateToAppointmentManagement}
                    >
                      <div className={`${iconBgColor} p-3 rounded-lg mr-4`}>
                        <CalendarIcon className={`w-6 h-6 ${textColor}`} />
                      </div>
                      <div className="text-left">
                        <h3 className={`font-medium ${textPrimaryColor}`}>Gestion des Rendez-vous</h3>
                        <p className={`text-sm ${textSecondaryColor}`}>Gérer les rendez-vous</p>
                      </div>
                    </motion.button>
                    
                    <motion.button
                      variants={itemVariants}
                      className={`${cardBgColor} p-4 rounded-lg flex items-center ${cardBorder} hover:shadow-md transition-all`}
                      onClick={navigateToUserManagement}
                    >
                      <div className={`${iconBgColor} p-3 rounded-lg mr-4`}>
                        <UserIcon className={`w-6 h-6 ${textColor}`} />
                      </div>
                      <div className="text-left">
                        <h3 className={`font-medium ${textPrimaryColor}`}>Gestion des Utilisateurs</h3>
                        <p className={`text-sm ${textSecondaryColor}`}>Gérer les utilisateurs</p>
                      </div>
                    </motion.button>
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
                        className={`${cardBgColor} p-4 rounded-lg ${cardBorder}`}
                      >
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                          <div className="mb-4 md:mb-0">
                            <h3 className={`font-medium ${textPrimaryColor}`}>{request.title}</h3>
                            <p className={`text-sm ${textSecondaryColor} mt-1`}>
                              {request.user?.full_name} - {new Date(request.submitted_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleApproveRequest(request.request_id)}
                              className={`${buttonPrimaryBg} ${buttonPrimaryText} px-3 py-1 rounded-lg text-sm flex items-center`}
                            >
                              <CheckCircleIcon className="w-4 h-4 mr-1" /> Approuver
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.request_id)}
                              className={`bg-red-600 text-white px-3 py-1 rounded-lg text-sm flex items-center`}
                            >
                              <XCircleIcon className="w-4 h-4 mr-1" /> Refuser
                            </button>
                          </div>
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