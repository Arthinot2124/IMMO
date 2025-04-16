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
  const buttonPrimaryText = isLightMode ? "text-white" : "text-[#0f172a]";
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
            <div className={`${adminBadgeBg} ${adminBadgeText} px-3 py-1 rounded-full text-xs font-medium`}>
              Mode Administrateur
            </div>
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
        <div className={`flex overflow-x-auto pb-2 mb-6 border-b ${isLightMode ? "border-gray-200" : "border-[#1e293b]"}`}>
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
            onClick={() => setActiveTab("properties")}
            className={`px-4 py-2 mr-2 rounded-t-lg font-medium ${
              activeTab === "properties" 
                ? `${tabActiveBg} ${textColor}` 
                : `${textSecondaryColor} hover:${textColor} hover:${tabHoverBg}`
            }`}
          >
            Propriétés
          </button>
          <button 
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 mr-2 rounded-t-lg font-medium ${
              activeTab === "users" 
                ? `${tabActiveBg} ${textColor}` 
                : `${textSecondaryColor} hover:${textColor} hover:${tabHoverBg}`
            }`}
          >
            Utilisateurs
          </button>
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
              >
                <h2 className={`text-xl font-semibold mb-4 ${textPrimaryColor}`}>Statistiques Générales</h2>
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
                    <p className={`text-2xl font-bold ${textPrimaryColor}`}>{stats.total_users}</p>
                  </motion.div>
                  
                  <motion.div 
                    variants={itemVariants}
                    className={`${statCardBg} p-4 rounded-lg ${cardBorder}`}
                  >
                    <div className="flex items-center mb-2">
                      <ClipboardListIcon className={`w-5 h-5 ${textColor} mr-2`} />
                      <h3 className={textSecondaryColor}>Commandes</h3>
                    </div>
                    <p className={`text-2xl font-bold ${textPrimaryColor}`}>{stats.total_orders}</p>
                  </motion.div>
                  
                  <motion.div 
                    variants={itemVariants}
                    className={`${statCardBg} p-4 rounded-lg ${cardBorder}`}
                  >
                    <div className="flex items-center mb-2">
                      <CalendarIcon className={`w-5 h-5 ${textColor} mr-2`} />
                      <h3 className={textSecondaryColor}>Rendez-vous</h3>
                    </div>
                    <p className={`text-2xl font-bold ${textPrimaryColor}`}>{stats.pending_appointments}</p>
                    <p className={`mt-2 text-sm ${yellowTextColor}`}>{stats.pending_appointments} en attente</p>
                  </motion.div>
                </div>

                <h2 className={`text-xl font-semibold mb-4 ${textPrimaryColor}`}>Actions requises</h2>
                <div className={`${statCardBg} p-4 rounded-lg mb-8 ${cardBorder}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <ClipboardListIcon className={`w-5 h-5 ${textColor} mr-2`} />
                      <h3 className={textPrimaryColor + " font-medium"}>Demandes de propriétés en attente</h3>
                    </div>
                    <span className={`px-2 py-0.5 ${yellowBgColor} ${yellowTextColor} rounded-full text-sm`}>
                      {stats.pending_property_requests} demandes
                    </span>
                  </div>
                  
                  {pendingRequests.length > 0 ? (
                    <div className="space-y-3">
                      {pendingRequests.slice(0, 3).map((request) => (
                        <div 
                          key={request.request_id} 
                          className={`border ${borderLight} rounded-lg p-3 flex justify-between items-center`}
                        >
                          <div>
                            <h4 className={`font-medium ${textColor}`}>{request.title}</h4>
                            <p className={`text-sm ${textSecondaryColor}`}>
                              Soumis par {request.user?.full_name || `Utilisateur ${request.user_id}`} le {new Date(request.submitted_at).toLocaleDateString()}
                            </p>
                          </div>
                          <button 
                            onClick={() => navigate(`/admin/property-requests/${request.request_id}`)}
                            className={`px-3 py-1 ${buttonPrimaryBg} ${buttonPrimaryText} rounded-lg text-sm font-medium`}
                          >
                            Voir détails
                          </button>
                        </div>
                      ))}
                      
                      {pendingRequests.length > 3 && (
                        <button 
                          onClick={() => setActiveTab("requests")}
                          className={`w-full text-center ${textColor} py-2 border border-dashed ${borderLight} rounded-lg hover:${isLightMode ? 'bg-[#0150BC]/10' : 'bg-[#59e0c5]/10'}`}
                        >
                          Voir toutes les demandes ({pendingRequests.length})
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className={`${textSecondaryColor} text-center py-3`}>Aucune demande en attente.</p>
                  )}
                </div>

                {/* Statistiques sommaires */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className={`${cardBgColor} p-4 rounded-lg flex items-center ${cardBorder}`}>
                    <div className={`w-10 h-10 rounded-full ${iconBgColor} flex items-center justify-center mr-3`}>
                      <BuildingIcon className={`w-5 h-5 ${textColor}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${textSecondaryColor}`}>Propriétés</p>
                      <p className={`text-xl font-semibold ${textPrimaryColor}`}>{stats?.total_properties || 0}</p>
                    </div>
                  </div>
                  
                  <div className={`${cardBgColor} p-4 rounded-lg flex items-center ${cardBorder}`}>
                    <div className={`w-10 h-10 rounded-full ${iconBgColor} flex items-center justify-center mr-3`}>
                      <UserIcon className={`w-5 h-5 ${textColor}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${textSecondaryColor}`}>Utilisateurs</p>
                      <p className={`text-xl font-semibold ${textPrimaryColor}`}>{stats?.total_users || 0}</p>
                    </div>
                  </div>
                  
                  <div className={`${cardBgColor} p-4 rounded-lg flex items-center ${cardBorder}`}>
                    <div className={`w-10 h-10 rounded-full ${yellowIconBgColor} flex items-center justify-center mr-3`}>
                      <CalendarIcon className={`w-5 h-5 ${isLightMode ? 'text-yellow-600' : 'text-yellow-500'}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${textSecondaryColor}`}>Rendez-vous en attente</p>
                      <p className={`text-xl font-semibold ${textPrimaryColor}`}>{stats?.pending_appointments || 0}</p>
                    </div>
                  </div>
                  
                  <div className={`${cardBgColor} p-4 rounded-lg flex items-center ${cardBorder}`}>
                    <div className={`w-10 h-10 rounded-full ${iconBgColor} flex items-center justify-center mr-3`}>
                      <ClipboardListIcon className={`w-5 h-5 ${textColor}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${textSecondaryColor}`}>Demandes en attente</p>
                      <p className={`text-xl font-semibold ${textPrimaryColor}`}>{stats?.pending_property_requests || 0}</p>
                    </div>
                  </div>
                </div>
                
                {/* Actions rapides */}
                <div className={`${cardBgColor} p-4 rounded-lg mb-6 ${cardBorder}`}>
                  <h2 className={`text-lg font-semibold mb-3 ${textPrimaryColor}`}>Actions rapides</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <button 
                      onClick={() => navigate('/property-request')}
                      className={`flex items-center justify-between p-3 ${actionButtonBg} rounded-lg hover:${actionButtonHoverBg} transition-colors w-full`}
                    >
                      <span className="flex items-center">
                        <BuildingIcon className={`w-5 h-5 ${textColor} mr-2`} />
                        <span className={textPrimaryColor}>Ajouter une propriété</span>
                      </span>
                    </button>
                    
                    <button 
                      onClick={() => navigate('/admin/property-requests')}
                      className={`flex items-center justify-between p-3 ${actionButtonBg} rounded-lg hover:${actionButtonHoverBg} transition-colors w-full`}
                    >
                      <span className="flex items-center">
                        <ClipboardListIcon className={`w-5 h-5 ${textColor} mr-2`} />
                        <span className={textPrimaryColor}>Voir les demandes</span>
                      </span>
                      {stats?.pending_property_requests > 0 && (
                        <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
                          {stats.pending_property_requests}
                        </span>
                      )}
                    </button>
                    
                    <button 
                      onClick={() => navigate('/admin/appointments')}
                      className={`flex items-center justify-between p-3 ${actionButtonBg} rounded-lg hover:${actionButtonHoverBg} transition-colors w-full`}
                    >
                      <span className="flex items-center">
                        <CalendarIcon className={`w-5 h-5 ${textColor} mr-2`} />
                        <span className={textPrimaryColor}>Gérer les rendez-vous</span>
                      </span>
                      {stats?.pending_appointments > 0 && (
                        <span className="bg-yellow-500 text-white px-2 py-0.5 rounded-full text-xs">
                          {stats.pending_appointments}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Onglet Demandes de propriétés */}
            {activeTab === "requests" && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-xl font-semibold ${textPrimaryColor}`}>Demandes de propriétés</h2>
                  <button 
                    onClick={() => navigate('/admin/all-requests')}
                    className={`px-3 py-1 ${cardBgColor} ${textColor} rounded-lg text-sm flex items-center ${borderColor}`}
                  >
                    Voir toutes <ListIcon size={16} className="ml-1" />
                  </button>
                </div>
                
                {pendingRequests.length > 0 ? (
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <motion.div
                        key={request.request_id}
                        variants={itemVariants}
                        className={`${cardBgColor} rounded-lg p-4 border ${isLightMode ? 'border-[#0150BC]/30' : 'border-[#59e0c5]/20'}`}
                      >
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3">
                          <div>
                            <h3 className={`text-lg font-medium ${textColor}`}>{request.title}</h3>
                            <p className={`text-sm ${textSecondaryColor}`}>
                              Soumis par {request.user?.full_name || `Utilisateur ${request.user_id}`} • 
                              {new Date(request.submitted_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex mt-2 md:mt-0">
                            <button 
                              onClick={() => handleApproveRequest(request.request_id)}
                              className={`px-3 py-1 ${isLightMode ? 'bg-green-100' : 'bg-green-500/20'} ${isLightMode ? 'text-green-700' : 'text-green-300'} rounded-lg text-sm font-medium flex items-center mr-2 ${isLightMode ? 'border border-green-200' : ''}`}
                            >
                              <CheckCircleIcon size={16} className="mr-1" /> Approuver
                            </button>
                            <button 
                              onClick={() => handleRejectRequest(request.request_id)}
                              className={`px-3 py-1 ${isLightMode ? 'bg-red-100' : 'bg-red-500/20'} ${isLightMode ? 'text-red-700' : 'text-red-300'} rounded-lg text-sm font-medium flex items-center ${isLightMode ? 'border border-red-200' : ''}`}
                            >
                              <XCircleIcon size={16} className="mr-1" /> Refuser
                            </button>
                          </div>
                        </div>
                        
                        <div className={`${darkBgColor} p-3 rounded-md mb-3 ${isLightMode ? 'border border-[#0150BC]/20' : ''}`}>
                          <p className={`text-sm ${textSecondaryColor}`}>
                            {request.description || "Aucune description fournie."}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className={`text-sm font-medium ${textColor} mb-1`}>Détails supplémentaires:</h4>
                          <p className={`text-sm ${textSecondaryColor} ${darkBgColor} p-3 rounded-md ${isLightMode ? 'border border-[#0150BC]/20' : ''}`}>
                            {request.additional_details || "Aucun détail supplémentaire fourni."}
                          </p>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <button 
                            onClick={() => navigate(`/admin/property-requests/${request.request_id}`)}
                            className={`px-3 py-1 ${buttonPrimaryBg} ${buttonPrimaryText} rounded-lg text-sm font-medium`}
                          >
                            Voir détails complets
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className={`${cardBgColor} p-6 rounded-lg text-center ${cardBorder}`}>
                    <ClipboardListIcon className={`w-12 h-12 ${textColor} opacity-30 mx-auto mb-3`} />
                    <h3 className={`text-lg font-medium ${textPrimaryColor} mb-1`}>Aucune demande en attente</h3>
                    <p className={textSecondaryColor}>Toutes les demandes ont été traitées.</p>
                  </div>
                )}
              </motion.div>
            )}
            
            {/* Onglet Propriétés - Lien vers la page de gestion des propriétés */}
            {activeTab === "properties" && (
              <div className={`text-center py-12 ${cardBgColor} rounded-lg ${cardBorder}`}>
                <BuildingIcon className={`w-16 h-16 ${textColor} opacity-30 mx-auto mb-4`} />
                <h2 className={`text-xl font-semibold mb-2 ${textPrimaryColor}`}>Gestion des propriétés</h2>
                <p className={`${textSecondaryColor} mb-6 max-w-lg mx-auto`}>
                  Gérez toutes les propriétés, ajoutez de nouvelles propriétés ou modifiez les propriétés existantes.
                </p>
                <button 
                  onClick={() => navigate('/admin/properties')}
                  className={`px-6 py-3 ${buttonPrimaryBg} ${buttonPrimaryText} rounded-lg font-medium`}
                >
                  Accéder à la gestion des propriétés
                </button>
              </div>
            )}
            
            {/* Onglet Utilisateurs - Lien vers la page de gestion des utilisateurs */}
            {activeTab === "users" && (
              <div className={`text-center py-12 ${cardBgColor} rounded-lg ${cardBorder}`}>
                <UserIcon className={`w-16 h-16 ${textColor} opacity-30 mx-auto mb-4`} />
                <h2 className={`text-xl font-semibold mb-2 ${textPrimaryColor}`}>Gestion des utilisateurs</h2>
                <p className={`${textSecondaryColor} mb-6 max-w-lg mx-auto`}>
                  Gérez tous les utilisateurs, consultez leurs profils et leurs historiques d'activité.
                </p>
                <button 
                  onClick={() => navigate('/admin/users')}
                  className={`px-6 py-3 ${buttonPrimaryBg} ${buttonPrimaryText} rounded-lg font-medium`}
                >
                  Accéder à la gestion des utilisateurs
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 