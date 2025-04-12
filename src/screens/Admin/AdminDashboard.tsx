import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  BellIcon, HomeIcon, SettingsIcon, ClipboardListIcon, 
  CalendarIcon, BuildingIcon, UserIcon, ListIcon,
  CheckCircleIcon, XCircleIcon, RefreshCwIcon
} from "lucide-react";

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

export const AdminDashboard = (): JSX.Element => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingRequests, setPendingRequests] = useState<PropertyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Charger les statistiques et les demandes en attente
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Charger les statistiques du tableau de bord
        const statsResponse = await axios.get('http://localhost:8000/api/dashboard/stats', {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (statsResponse.data && statsResponse.data.data) {
          setStats(statsResponse.data.data);
        }
        
        // Charger les demandes de propriétés en attente
        const requestsResponse = await axios.get('http://localhost:8000/api/property-requests', {
          params: { status: 'En attente' },
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
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
      await axios.put(`http://localhost:8000/api/property-requests/${requestId}`, {
        status: 'Accepté'
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
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
      await axios.put(`http://localhost:8000/api/property-requests/${requestId}`, {
        status: 'Refusé'
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
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
    <div className="bg-[#0f172a] min-h-screen text-white">
      <div className="max-w-[1440px] mx-auto px-4 xs:px-6 sm:px-8 py-6">
        {/* En-tête d'administration */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-[#59e0c5] mr-4">
              Admin Dashboard
            </h1>
            <div className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-xs font-medium">
              Mode Administrateur
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/home')}
              className="p-2 rounded-full bg-[#1e293b] text-[#59e0c5]"
            >
              <HomeIcon size={20} />
            </button>
            <button 
              onClick={() => navigate('/notifications')}
              className="p-2 rounded-full bg-[#1e293b] text-[#59e0c5]"
            >
              <BellIcon size={20} />
            </button>
            <button 
              onClick={() => navigate('/profile')}
              className="p-2 rounded-full bg-[#1e293b] text-[#59e0c5]"
            >
              <UserIcon size={20} />
            </button>
          </div>
        </div>

        {/* Navigation des onglets */}
        <div className="flex overflow-x-auto pb-2 mb-6 border-b border-[#1e293b]">
          <button 
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 mr-2 rounded-t-lg font-medium ${
              activeTab === "overview" 
                ? "bg-[#1e293b] text-[#59e0c5]" 
                : "text-gray-400 hover:text-[#59e0c5] hover:bg-[#1e293b]/50"
            }`}
          >
            Vue d'ensemble
          </button>
          <button 
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 mr-2 rounded-t-lg font-medium flex items-center ${
              activeTab === "requests" 
                ? "bg-[#1e293b] text-[#59e0c5]" 
                : "text-gray-400 hover:text-[#59e0c5] hover:bg-[#1e293b]/50"
            }`}
          >
            Demandes de propriétés
            {stats && stats.pending_property_requests > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-[#59e0c5] text-[#0f172a] rounded-full text-xs">
                {stats.pending_property_requests}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab("properties")}
            className={`px-4 py-2 mr-2 rounded-t-lg font-medium ${
              activeTab === "properties" 
                ? "bg-[#1e293b] text-[#59e0c5]" 
                : "text-gray-400 hover:text-[#59e0c5] hover:bg-[#1e293b]/50"
            }`}
          >
            Propriétés
          </button>
          <button 
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 mr-2 rounded-t-lg font-medium ${
              activeTab === "users" 
                ? "bg-[#1e293b] text-[#59e0c5]" 
                : "text-gray-400 hover:text-[#59e0c5] hover:bg-[#1e293b]/50"
            }`}
          >
            Utilisateurs
          </button>
        </div>

        {/* Contenu principal */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#59e0c5]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 text-red-300 p-4 rounded-lg">
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
                <h2 className="text-xl font-semibold mb-4">Statistiques Générales</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <motion.div 
                    variants={itemVariants}
                    className="bg-[#1e293b] p-4 rounded-lg"
                  >
                    <div className="flex items-center mb-2">
                      <BuildingIcon className="w-5 h-5 text-[#59e0c5] mr-2" />
                      <h3 className="text-gray-300">Propriétés</h3>
                    </div>
                    <p className="text-2xl font-bold">{stats.total_properties}</p>
                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-green-300">{stats.available_properties} disponibles</span>
                      <span className="text-blue-300">{stats.sold_properties} vendues</span>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    variants={itemVariants}
                    className="bg-[#1e293b] p-4 rounded-lg"
                  >
                    <div className="flex items-center mb-2">
                      <UserIcon className="w-5 h-5 text-[#59e0c5] mr-2" />
                      <h3 className="text-gray-300">Utilisateurs</h3>
                    </div>
                    <p className="text-2xl font-bold">{stats.total_users}</p>
                  </motion.div>
                  
                  <motion.div 
                    variants={itemVariants}
                    className="bg-[#1e293b] p-4 rounded-lg"
                  >
                    <div className="flex items-center mb-2">
                      <ClipboardListIcon className="w-5 h-5 text-[#59e0c5] mr-2" />
                      <h3 className="text-gray-300">Commandes</h3>
                    </div>
                    <p className="text-2xl font-bold">{stats.total_orders}</p>
                  </motion.div>
                  
                  <motion.div 
                    variants={itemVariants}
                    className="bg-[#1e293b] p-4 rounded-lg"
                  >
                    <div className="flex items-center mb-2">
                      <CalendarIcon className="w-5 h-5 text-[#59e0c5] mr-2" />
                      <h3 className="text-gray-300">Rendez-vous</h3>
                    </div>
                    <p className="text-2xl font-bold">{stats.pending_appointments}</p>
                    <p className="mt-2 text-sm text-yellow-300">{stats.pending_appointments} en attente</p>
                  </motion.div>
                </div>

                <h2 className="text-xl font-semibold mb-4">Actions requises</h2>
                <div className="bg-[#1e293b] p-4 rounded-lg mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <ClipboardListIcon className="w-5 h-5 text-[#59e0c5] mr-2" />
                      <h3 className="text-white font-medium">Demandes de propriétés en attente</h3>
                    </div>
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">
                      {stats.pending_property_requests} demandes
                    </span>
                  </div>
                  
                  {pendingRequests.length > 0 ? (
                    <div className="space-y-3">
                      {pendingRequests.slice(0, 3).map((request) => (
                        <div 
                          key={request.request_id} 
                          className="border border-[#59e0c5]/30 rounded-lg p-3 flex justify-between items-center"
                        >
                          <div>
                            <h4 className="font-medium text-[#59e0c5]">{request.title}</h4>
                            <p className="text-sm text-gray-400">
                              Soumis par {request.user?.full_name || `Utilisateur ${request.user_id}`} le {new Date(request.submitted_at).toLocaleDateString()}
                            </p>
                          </div>
                          <button 
                            onClick={() => navigate(`/admin/property-requests/${request.request_id}`)}
                            className="px-3 py-1 bg-[#59e0c5] text-[#0f172a] rounded-lg text-sm font-medium"
                          >
                            Voir détails
                          </button>
                        </div>
                      ))}
                      
                      {pendingRequests.length > 3 && (
                        <button 
                          onClick={() => setActiveTab("requests")}
                          className="w-full text-center text-[#59e0c5] py-2 border border-dashed border-[#59e0c5]/50 rounded-lg hover:bg-[#59e0c5]/10"
                        >
                          Voir toutes les demandes ({pendingRequests.length})
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-3">Aucune demande en attente.</p>
                  )}
                </div>

                {/* Statistiques sommaires */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-[#1E2B47] p-4 rounded-lg flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#59e0c5]/20 flex items-center justify-center mr-3">
                      <BuildingIcon className="w-5 h-5 text-[#59e0c5]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Propriétés</p>
                      <p className="text-xl font-semibold text-white">{stats?.total_properties || 0}</p>
                    </div>
                  </div>
                  
                  <div className="bg-[#1E2B47] p-4 rounded-lg flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#59e0c5]/20 flex items-center justify-center mr-3">
                      <UserIcon className="w-5 h-5 text-[#59e0c5]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Utilisateurs</p>
                      <p className="text-xl font-semibold text-white">{stats?.total_users || 0}</p>
                    </div>
                  </div>
                  
                  <div className="bg-[#1E2B47] p-4 rounded-lg flex items-center">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center mr-3">
                      <CalendarIcon className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Rendez-vous en attente</p>
                      <p className="text-xl font-semibold text-white">{stats?.pending_appointments || 0}</p>
                    </div>
                  </div>
                  
                  <div className="bg-[#1E2B47] p-4 rounded-lg flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#59e0c5]/20 flex items-center justify-center mr-3">
                      <ClipboardListIcon className="w-5 h-5 text-[#59e0c5]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Demandes en attente</p>
                      <p className="text-xl font-semibold text-white">{stats?.pending_property_requests || 0}</p>
                    </div>
                  </div>
                </div>
                
                {/* Actions rapides */}
                <div className="bg-[#1E2B47] p-4 rounded-lg mb-6">
                  <h2 className="text-lg font-semibold mb-3">Actions rapides</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <button 
                      onClick={() => navigate('/property-request')}
                      className="flex items-center justify-between p-3 bg-[#0f172a] rounded-lg hover:bg-[#0f172a]/80 transition-colors w-full"
                    >
                      <span className="flex items-center">
                        <BuildingIcon className="w-5 h-5 text-[#59e0c5] mr-2" />
                        <span>Ajouter une propriété</span>
                      </span>
                    </button>
                    
                    <button 
                      onClick={() => navigate('/admin/property-requests')}
                      className="flex items-center justify-between p-3 bg-[#0f172a] rounded-lg hover:bg-[#0f172a]/80 transition-colors w-full"
                    >
                      <span className="flex items-center">
                        <ClipboardListIcon className="w-5 h-5 text-[#59e0c5] mr-2" />
                        <span>Voir les demandes</span>
                      </span>
                      {stats?.pending_property_requests > 0 && (
                        <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
                          {stats.pending_property_requests}
                        </span>
                      )}
                    </button>
                    
                    <button 
                      onClick={() => navigate('/admin/appointments')}
                      className="flex items-center justify-between p-3 bg-[#0f172a] rounded-lg hover:bg-[#0f172a]/80 transition-colors w-full"
                    >
                      <span className="flex items-center">
                        <CalendarIcon className="w-5 h-5 text-[#59e0c5] mr-2" />
                        <span>Gérer les rendez-vous</span>
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
                  <h2 className="text-xl font-semibold">Demandes de propriétés</h2>
                  <button 
                    onClick={() => navigate('/admin/all-requests')}
                    className="px-3 py-1 bg-[#1e293b] text-[#59e0c5] rounded-lg text-sm flex items-center"
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
                        className="bg-[#1e293b] rounded-lg p-4 border border-[#59e0c5]/20"
                      >
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3">
                          <div>
                            <h3 className="text-lg font-medium text-[#59e0c5]">{request.title}</h3>
                            <p className="text-sm text-gray-400">
                              Soumis par {request.user?.full_name || `Utilisateur ${request.user_id}`} • 
                              {new Date(request.submitted_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex mt-2 md:mt-0">
                            <button 
                              onClick={() => handleApproveRequest(request.request_id)}
                              className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg text-sm font-medium flex items-center mr-2"
                            >
                              <CheckCircleIcon size={16} className="mr-1" /> Approuver
                            </button>
                            <button 
                              onClick={() => handleRejectRequest(request.request_id)}
                              className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg text-sm font-medium flex items-center"
                            >
                              <XCircleIcon size={16} className="mr-1" /> Refuser
                            </button>
                          </div>
                        </div>
                        
                        <div className="bg-[#0f172a] p-3 rounded-md mb-3">
                          <p className="text-sm text-gray-300">
                            {request.description || "Aucune description fournie."}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-[#59e0c5] mb-1">Détails supplémentaires:</h4>
                          <p className="text-sm text-gray-300 bg-[#0f172a] p-3 rounded-md">
                            {request.additional_details || "Aucun détail supplémentaire fourni."}
                          </p>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <button 
                            onClick={() => navigate(`/admin/property-requests/${request.request_id}`)}
                            className="px-3 py-1 bg-[#59e0c5] text-[#0f172a] rounded-lg text-sm font-medium"
                          >
                            Voir détails complets
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#1e293b] p-6 rounded-lg text-center">
                    <ClipboardListIcon className="w-12 h-12 text-[#59e0c5]/30 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-300 mb-1">Aucune demande en attente</h3>
                    <p className="text-gray-400">Toutes les demandes ont été traitées.</p>
                  </div>
                )}
              </motion.div>
            )}
            
            {/* Onglet Propriétés - Lien vers la page de gestion des propriétés */}
            {activeTab === "properties" && (
              <div className="text-center py-12">
                <BuildingIcon className="w-16 h-16 text-[#59e0c5]/30 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Gestion des propriétés</h2>
                <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                  Gérez toutes les propriétés, ajoutez de nouvelles propriétés ou modifiez les propriétés existantes.
                </p>
                <button 
                  onClick={() => navigate('/admin/properties')}
                  className="px-6 py-3 bg-[#59e0c5] text-[#0f172a] rounded-lg font-medium"
                >
                  Accéder à la gestion des propriétés
                </button>
              </div>
            )}
            
            {/* Onglet Utilisateurs - Lien vers la page de gestion des utilisateurs */}
            {activeTab === "users" && (
              <div className="text-center py-12">
                <UserIcon className="w-16 h-16 text-[#59e0c5]/30 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Gestion des utilisateurs</h2>
                <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                  Gérez tous les utilisateurs, consultez leurs profils et leurs historiques d'activité.
                </p>
                <button 
                  onClick={() => navigate('/admin/users')}
                  className="px-6 py-3 bg-[#59e0c5] text-[#0f172a] rounded-lg font-medium"
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