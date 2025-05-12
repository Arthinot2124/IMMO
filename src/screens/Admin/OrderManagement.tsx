import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  HomeIcon, SettingsIcon, ArrowLeftIcon, 
  CheckCircleIcon, XCircleIcon, RefreshCwIcon,
  UserIcon, MapPinIcon, PhoneIcon, MailIcon,
  ShoppingCartIcon, DollarSignIcon, ClockIcon, 
  CheckIcon, XIcon, FileTextIcon, BuildingIcon,
  ImageIcon, FileIcon
} from "lucide-react";
import apiService from "../../services/apiService";
import { formatPrice } from "../../utils/formatters";
import { getMediaUrl } from "../../config/api";

// Types
interface OrderUser {
  user_id: number;
  full_name: string;
  email: string;
  phone?: string;
}

interface OrderProperty {
  property_id: number;
  title: string;
  description: string;
  price: number;
  surface: number;
  location: string;
  category: string;
  status: string;
  transaction_type: string;
}

interface PropertyMedia {
  media_id: number;
  property_id: number;
  media_url: string;
  media_type: string;
}

interface Order {
  order_id: number;
  property_id: number;
  user_id: number;
  order_type: 'Achat' | 'Location';
  order_status: 'En attente' | 'Confirmé' | 'Annulé' | 'Terminé';
  order_date: string;
  created_at: string;
  updated_at: string;
  user?: OrderUser;
  property?: OrderProperty;
}

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export const OrderManagement = (): JSX.Element => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'En attente' | 'Confirmé' | 'Annulé' | 'Terminé'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Achat' | 'Location'>('all');
  const [processing, setProcessing] = useState<{[key: number]: boolean}>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLightMode, setIsLightMode] = useState(() => {
    const savedMode = localStorage.getItem('isLightMode');
    return savedMode !== null ? savedMode === 'true' : true;
  });
  const [propertyImages, setPropertyImages] = useState<{[key: number]: PropertyMedia[]}>({});
  const [loadingImages, setLoadingImages] = useState<{[key: number]: boolean}>({});
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});

  // Couleurs qui changent en fonction du mode
  const accentColor = isLightMode ? "#0150BC" : "#59e0c5";
  const bgColor = isLightMode ? "bg-white" : "bg-[#0f172a]";
  const cardBgColor = isLightMode ? "bg-[#F8FAFC]" : "bg-[#1E2B47]";
  const textColor = isLightMode ? "text-[#0150BC]" : "text-[#59e0c5]";
  const textPrimaryColor = isLightMode ? "text-[#1E293B]" : "text-white";
  const textSecondaryColor = isLightMode ? "text-gray-700" : "text-gray-300";
  const buttonPrimaryBg = isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]";
  const buttonPrimaryText = isLightMode ? "text-white" : "text-[#0f172a]";
  const buttonSecondaryBg = isLightMode ? "bg-[#EFF6FF]" : "bg-[#1e293b]";
  const buttonSecondaryText = isLightMode ? "text-[#0150BC]" : "text-white";
  const borderColor = isLightMode ? "border-[#0150BC]" : "border-[#59e0c5]";
  const cardBorder = isLightMode ? "border border-[#0150BC]/30" : "border border-[#59e0c5]/30";
  const tableBgColor = isLightMode ? "bg-white" : "bg-[#1e293b]";
  const tableHeaderBg = isLightMode ? "bg-[#EFF6FF]" : "bg-[#0f172a]";
  const tableRowHoverBg = isLightMode ? "hover:bg-gray-50" : "hover:bg-[#1E2B47]/70";

  // Synchroniser avec les changements de mode
  useEffect(() => {
    const interval = setInterval(() => {
      const savedMode = localStorage.getItem('isLightMode');
      if (savedMode !== null && (savedMode === 'true') !== isLightMode) {
        setIsLightMode(savedMode === 'true');
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isLightMode]);

  // Fonction pour charger les images d'une propriété
  const fetchPropertyImages = async (propertyId: number) => {
    if (loadingImages[propertyId]) return;
    
    setLoadingImages(prev => ({ ...prev, [propertyId]: true }));
    
    try {
      const response = await apiService.get<ApiResponse<PropertyMedia[]>>(`/properties/${propertyId}/media`);
      
      if (response.data && response.data.status === "success" && Array.isArray(response.data.data)) {
        setPropertyImages(prev => ({ ...prev, [propertyId]: response.data.data }));
      }
    } catch (err: any) {
      console.error(`Erreur lors du chargement des images pour la propriété ${propertyId}:`, err);
      // Ne pas afficher d'erreur car les images sont optionnelles
    } finally {
      setLoadingImages(prev => ({ ...prev, [propertyId]: false }));
    }
  };

  // Gestion des erreurs d'images
  const handleImageError = (imageId: number) => {
    setImageErrors(prev => ({
      ...prev,
      [imageId]: true
    }));
    console.error(`Failed to load image with ID: ${imageId}`);
  };

  // Récupération de l'URL de l'image
  const getImageUrl = (image: PropertyMedia) => {
    return getMediaUrl(image.media_url);
  };

  // Charger les commandes au chargement du composant
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiService.get<ApiResponse<Order[] | { data: Order[] }>>('/orders');
        
        console.log("Commandes chargées:", response.data);
        
        if (response.data && response.data.status === "success" && response.data.data) {
          // Vérifier si les données sont paginées
          const ordersData = Array.isArray(response.data.data) 
            ? response.data.data 
            : (response.data.data.data || []);
          
          setOrders(ordersData);
          applyFilters(ordersData, statusFilter, typeFilter);
          
          // Pour chaque commande avec une propriété, charger les images
          ordersData.forEach(order => {
            if (order.property && order.property.property_id) {
              fetchPropertyImages(order.property.property_id);
            }
          });
        } else {
          throw new Error("Format de réponse inattendu");
        }
      } catch (err: any) {
        console.error("Erreur lors du chargement des commandes:", err);
        setError(err.response?.data?.message || err.message || "Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  // Appliquer les filtres
  const applyFilters = (
    data: Order[], 
    status: 'all' | 'En attente' | 'Confirmé' | 'Annulé' | 'Terminé',
    type: 'all' | 'Achat' | 'Location'
  ) => {
    if (!Array.isArray(data)) {
      console.error("Les données ne sont pas un tableau:", data);
      setFilteredOrders([]);
      return;
    }
    
    let filtered = [...data];
    
    // Filtre par statut
    if (status !== 'all') {
      filtered = filtered.filter(order => order.order_status === status);
    }
    
    // Filtre par type
    if (type !== 'all') {
      filtered = filtered.filter(order => order.order_type === type);
    }
    
    // Si on affiche tous les statuts, on trie d'abord par statut (En attente en premier)
    if (status === 'all') {
      const getStatusPriority = (status: string) => {
        switch (status) {
          case 'En attente': return 0;
          case 'Confirmé': return 1;
          case 'Terminé': return 2;
          case 'Annulé': return 3;
          default: return 4;
        }
      };
      
      // Tri principal par statut, tri secondaire par date
      filtered.sort((a, b) => {
        // D'abord par statut
        const statusCompare = getStatusPriority(a.order_status) - getStatusPriority(b.order_status);
        if (statusCompare !== 0) return statusCompare;
        
        // Ensuite par date (les plus récents en premier)
        return new Date(b.order_date).getTime() - new Date(a.order_date).getTime();
      });
    } else {
      // Sinon, on trie simplement par date
      filtered.sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
    }
    
    setFilteredOrders(filtered);
  };

  // Mettre à jour le statut d'une commande
  const updateOrderStatus = async (orderId: number, newStatus: 'Confirmé' | 'Annulé' | 'Terminé') => {
    setProcessing(prev => ({ ...prev, [orderId]: true }));
    setSuccessMessage(null);
    setError(null);
    
    try {
      const response = await apiService.put<ApiResponse<any>>(`/orders/${orderId}`, {
        order_status: newStatus
      });
      
      if (response.data && response.data.status === "success") {
        // Mettre à jour la liste des commandes
        const updatedOrders = orders.map(order => {
          if (order.order_id === orderId) {
            return { ...order, order_status: newStatus };
          }
          return order;
        });
        
        setOrders(updatedOrders);
        applyFilters(updatedOrders, statusFilter, typeFilter);
        
        const actionMsg = newStatus === 'Confirmé' 
          ? "confirmée" 
          : newStatus === 'Annulé' 
            ? "annulée" 
            : "marquée comme terminée";
            
        setSuccessMessage(`Commande ${actionMsg} avec succès.`);
        
        // Masquer le message après 3 secondes
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        throw new Error("Échec de la mise à jour du statut");
      }
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du statut:", err);
      setError(err.response?.data?.message || err.message || "Erreur lors de la mise à jour du statut");
    } finally {
      setProcessing(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // Formater la date au format lisible
  const formatDate = (dateString: string) => {
    if (!dateString) return "Date inconnue";
    
    try {
      // Créer une date à partir de la chaîne ISO de la base de données
      // en respectant le fuseau horaire d'origine
      const date = new Date(dateString);
      
      // Format la date au format local avec le jour, mois, année
      const dateOptions: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'UTC'  // Utiliser UTC pour respecter l'heure de la base de données
      };
      
      // Format l'heure au format local
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'  // Utiliser UTC pour respecter l'heure de la base de données
      };
      
      const formattedDate = date.toLocaleDateString('fr-FR', dateOptions);
      const formattedTime = date.toLocaleTimeString('fr-FR', timeOptions);
      
      return `${formattedDate} à ${formattedTime}`;
    } catch (error) {
      console.error("Erreur de formatage de date:", error);
      return dateString; // Retourne la chaîne d'origine en cas d'erreur
    }
  };

  // Obtenir les informations de statut (couleur, texte, icône)
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'En attente':
        return {
          color: 'text-yellow-500',
          bgColor: isLightMode ? 'bg-yellow-100' : 'bg-yellow-900/20',
          borderColor: 'border-yellow-500',
          icon: <ClockIcon className="w-4 h-4 mr-1" />,
          text: 'En attente'
        };
      case 'Confirmé':
        return {
          color: 'text-green-500',
          bgColor: isLightMode ? 'bg-green-100' : 'bg-green-900/20',
          borderColor: 'border-green-500',
          icon: <CheckCircleIcon className="w-4 h-4 mr-1" />,
          text: 'Confirmé'
        };
      case 'Annulé':
        return {
          color: 'text-red-500',
          bgColor: isLightMode ? 'bg-red-100' : 'bg-red-900/20',
          borderColor: 'border-red-500',
          icon: <XCircleIcon className="w-4 h-4 mr-1" />,
          text: 'Annulé'
        };
      case 'Terminé':
        return {
          color: 'text-blue-500',
          bgColor: isLightMode ? 'bg-blue-100' : 'bg-blue-900/20',
          borderColor: 'border-blue-500',
          icon: <CheckCircleIcon className="w-4 h-4 mr-1" />,
          text: 'Terminé'
        };
      default:
        return {
          color: 'text-gray-500',
          bgColor: isLightMode ? 'bg-gray-100' : 'bg-gray-900/20',
          borderColor: 'border-gray-500',
          icon: <ClockIcon className="w-4 h-4 mr-1" />,
          text: status
        };
    }
  };

  // Obtenir les informations de type (couleur, texte, icône)
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'Achat':
        return {
          color: 'text-purple-500',
          bgColor: isLightMode ? 'bg-purple-100' : 'bg-purple-900/20',
          borderColor: 'border-purple-500',
          icon: <DollarSignIcon className="w-4 h-4 mr-1" />,
          text: 'Achat'
        };
      case 'Location':
        return {
          color: 'text-indigo-500',
          bgColor: isLightMode ? 'bg-indigo-100' : 'bg-indigo-900/20',
          borderColor: 'border-indigo-500',
          icon: <HomeIcon className="w-4 h-4 mr-1" />,
          text: 'Location'
        };
      default:
        return {
          color: 'text-gray-500',
          bgColor: isLightMode ? 'bg-gray-100' : 'bg-gray-900/20',
          borderColor: 'border-gray-500',
          icon: <ShoppingCartIcon className="w-4 h-4 mr-1" />,
          text: type
        };
    }
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
          <div className="flex gap-2 items-center">
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className={`flex items-center justify-center ${buttonSecondaryBg} ${buttonSecondaryText} p-2 rounded-lg hover:opacity-90 transition-colors`}
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className={`text-xl sm:text-2xl font-bold ${textColor}`}>Gestion des Commandes</h1>
          </div>
          
        </motion.header>

        {/* Afficher les erreurs */}
        {error && (
          <div className={`${isLightMode ? "bg-red-100" : "bg-red-500/20"} ${isLightMode ? "text-red-700" : "text-white"} p-4 rounded-lg mb-6`}>
            <p>{error}</p>
          </div>
        )}
        
        {/* Afficher les messages de succès */}
        {successMessage && (
          <div className={`${isLightMode ? "bg-green-100" : "bg-green-500/20"} ${isLightMode ? "text-green-700" : "text-white"} p-4 rounded-lg mb-6`}>
            <p>{successMessage}</p>
          </div>
        )}

        {/* Filtres */}
        <div className={`${cardBgColor} ${cardBorder} rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-4`}>
          <div className="flex-1">
            <label className={`block text-sm font-medium ${textSecondaryColor} mb-1`}>
              Filtrer par statut
            </label>
            <select 
              className={`w-full p-2 rounded-lg border ${borderColor} ${bgColor} ${textPrimaryColor}`}
              value={statusFilter}
              onChange={(e) => {
                const newStatus = e.target.value as 'all' | 'En attente' | 'Confirmé' | 'Annulé' | 'Terminé';
                setStatusFilter(newStatus);
                applyFilters(orders, newStatus, typeFilter);
              }}
            >
              <option value="all">Tous les statuts</option>
              <option value="En attente">En attente</option>
              <option value="Confirmé">Confirmé</option>
              <option value="Terminé">Terminé</option>
              <option value="Annulé">Annulé</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className={`block text-sm font-medium ${textSecondaryColor} mb-1`}>
              Filtrer par type
            </label>
            <select 
              className={`w-full p-2 rounded-lg border ${borderColor} ${bgColor} ${textPrimaryColor}`}
              value={typeFilter}
              onChange={(e) => {
                const newType = e.target.value as 'all' | 'Achat' | 'Location';
                setTypeFilter(newType);
                applyFilters(orders, statusFilter, newType);
              }}
            >
              <option value="all">Tous les types</option>
              <option value="Achat">Achat</option>
              <option value="Location">Location</option>
            </select>
          </div>
        </div>

        {/* Liste des commandes */}
        <div className={`${cardBgColor} ${cardBorder} rounded-xl overflow-hidden mb-8`}>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className={`w-12 h-12 border-4 ${borderColor} border-t-transparent rounded-full animate-spin`}></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingCartIcon className={`${textSecondaryColor} w-16 h-16 mx-auto mb-4 opacity-30`} />
              <p className={`${textPrimaryColor} text-xl font-medium`}>Aucune commande trouvée</p>
              <p className={textSecondaryColor}>
                {statusFilter !== 'all' || typeFilter !== 'all' 
                  ? "Essayez de modifier vos filtres pour voir plus de résultats." 
                  : "Il n'y a actuellement aucune commande dans le système."}
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {/* Nombre de résultats */}
              <div className="flex justify-between items-center mb-2">
                <p className={`${isLightMode ? "text-gray-600" : "text-gray-300"}`}>
                  {filteredOrders.length} commandes trouvées
                </p>
              </div>

              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.order_status);
                const typeInfo = getTypeInfo(order.order_type);
                const propertyId = order.property?.property_id;
                const propertyImagesArray = propertyId ? propertyImages[propertyId] || [] : [];
                
                return (
                  <div 
                    key={order.order_id} 
                    className={`${isLightMode ? "bg-[#F8FAFC] hover:bg-[#F8FAFC]/80" : "bg-[#1e293b] hover:bg-[#1e293b]/80"} rounded-lg p-4 transition-colors ${cardBorder}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div className="flex items-center mb-2 md:mb-0">
                        <div className={`w-10 h-10 ${isLightMode ? "bg-[#0150BC]/20" : "bg-[#59e0c5]/20"} rounded-full flex items-center justify-center mr-3`}>
                          <ShoppingCartIcon className={`w-5 h-5 ${isLightMode ? "text-[#0150BC]" : "text-[#59e0c5]"}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold">Commande #{order.order_id}</h3>
                          <div className="flex items-center text-sm text-gray-400">
                            <ClockIcon className="w-3.5 h-3.5 mr-1" />
                            <span>Créée le {formatDate(order.order_date)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${typeInfo.bgColor} ${typeInfo.color} border ${typeInfo.borderColor}`}>
                          {typeInfo.icon}
                          {typeInfo.text}
                        </span>
                        
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color} border ${statusInfo.borderColor}`}>
                          {statusInfo.icon}
                          {statusInfo.text}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className={`${isLightMode ? "bg-white" : "bg-[#0f172a]"} p-3 rounded-lg ${cardBorder}`}>
                        <h4 className={`${isLightMode ? "text-[#0150BC]" : "text-[#59e0c5]"} text-sm font-medium mb-2`}>Détails de la commande</h4>
                        <div className="space-y-2">
                          {order.property && (
                            <div className="flex items-start">
                              <HomeIcon className="w-4 h-4 text-gray-400 mt-1 mr-2" />
                              <div>
                                <p className="text-sm">{order.property.title}</p>
                                <p className="text-sm text-gray-400">{order.property.location}</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Images de la propriété */}
                          {propertyId && (
                            <div className="mt-4">
                              <p className={`${isLightMode ? "text-gray-500" : "text-gray-400"} text-xs mb-2 flex items-center`}>
                                <ImageIcon size={12} className="mr-1" />
                                Photos de la propriété
                              </p>
                              
                              {loadingImages[propertyId] ? (
                                <div className="flex justify-center py-2">
                                  <div className={`animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 ${isLightMode ? "border-[#0150BC]" : "border-[#59e0c5]"}`}></div>
                                </div>
                              ) : propertyImagesArray.length > 0 ? (
                                <div className="grid grid-cols-3 gap-1">
                                  {propertyImagesArray.slice(0, 3).map((image) => (
                                    <div key={image.media_id} className={`h-16 ${isLightMode ? "bg-gray-100" : "bg-black/40"} rounded overflow-hidden`}>
                                      {imageErrors[image.media_id] ? (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                          <FileIcon size={12} />
                                          <p className="text-[8px] mt-1">Image non disponible</p>
                                        </div>
                                      ) : (
                                        <img 
                                          src={getImageUrl(image)} 
                                          alt={`Image ${image.media_id}`} 
                                          className="w-full h-full object-cover"
                                          onError={() => handleImageError(image.media_id)}
                                        />
                                      )}
                                    </div>
                                  ))}
                                  {propertyImagesArray.length > 3 && (
                                    <div className={`h-16 ${isLightMode ? "bg-gray-100" : "bg-black/40"} rounded flex items-center justify-center text-gray-500`}>
                                      <span>+{propertyImagesArray.length - 3}</span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="text-gray-400 text-xs">Aucune image disponible</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className={`${isLightMode ? "bg-white" : "bg-[#0f172a]"} p-3 rounded-lg ${cardBorder}`}>
                        <h4 className={`${isLightMode ? "text-[#0150BC]" : "text-[#59e0c5]"} text-sm font-medium mb-2`}>Informations de contact</h4>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                            <p className="text-sm">{order.user?.full_name || "Non spécifié"}</p>
                          </div>
                          
                          <div className="flex items-center">
                            <PhoneIcon className="w-4 h-4 text-gray-400 mr-2" />
                            <p className="text-sm">{order.user?.phone || "Non spécifié"}</p>
                          </div>
                          
                          <div className="flex items-center">
                            <MailIcon className="w-4 h-4 text-gray-400 mr-2" />
                            <p className="text-sm">{order.user?.email || "Non spécifié"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      {order.order_status === 'En attente' && (
                        <>
                          <button 
                            onClick={() => updateOrderStatus(order.order_id, 'Annulé')}
                            disabled={processing[order.order_id]}
                            className="px-4 py-2 border border-red-500 text-red-500 rounded-lg flex items-center hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processing[order.order_id] ? (
                              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                            ) : (
                              <XCircleIcon className="w-4 h-4 mr-2" />
                            )}
                            Annuler
                          </button>
                          <button 
                            onClick={() => updateOrderStatus(order.order_id, 'Confirmé')}
                            disabled={processing[order.order_id]}
                            className={`px-4 py-2 ${isLightMode ? "bg-[#0150BC] text-white" : "bg-[#59e0c5] text-[#0f172a]"} rounded-lg flex items-center hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {processing[order.order_id] ? (
                              <div className={`w-4 h-4 border-2 ${isLightMode ? "border-white" : "border-[#0f172a]"} border-t-transparent rounded-full animate-spin mr-2`}></div>
                            ) : (
                              <CheckCircleIcon className="w-4 h-4 mr-2" />
                            )}
                            Confirmer
                          </button>
                        </>
                      )}
                      
                      {order.order_status === 'Confirmé' && (
                        <button 
                          onClick={() => updateOrderStatus(order.order_id, 'Terminé')}
                          disabled={processing[order.order_id]}
                          className={`px-4 py-2 ${isLightMode ? "bg-blue-500 text-white" : "bg-blue-600 text-white"} rounded-lg flex items-center hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {processing[order.order_id] ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          ) : (
                            <CheckCircleIcon className="w-4 h-4 mr-2" />
                          )}
                          Terminer
                        </button>
                      )}
                      
                     
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de détails de commande */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${cardBgColor} rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className={`text-xl font-bold ${textPrimaryColor}`}>Détails de la commande #{selectedOrder.order_id}</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className={`p-1 rounded-full ${buttonSecondaryBg}`}
                >
                  <XIcon className={`w-5 h-5 ${textColor}`} />
                </button>
              </div>
              
              <div className={`mb-6 pb-6 border-b ${isLightMode ? "border-gray-200" : "border-[#1E2B47]"}`}>
                <h3 className={`text-lg font-medium ${textPrimaryColor} mb-3`}>Informations de la commande</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <p className={`text-sm ${textSecondaryColor}`}>Type :</p>
                    <p className={`font-medium ${textPrimaryColor}`}>{selectedOrder.order_type}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${textSecondaryColor}`}>Statut :</p>
                    <p className={`font-medium ${textPrimaryColor}`}>{selectedOrder.order_status}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${textSecondaryColor}`}>Date de commande :</p>
                    <p className={`font-medium ${textPrimaryColor}`}>{formatDate(selectedOrder.order_date)}</p>
                  </div>
                </div>
              </div>
              
              {selectedOrder.property && (
                <div className={`mb-6 pb-6 border-b ${isLightMode ? "border-gray-200" : "border-[#1E2B47]"}`}>
                  <h3 className={`text-lg font-medium ${textPrimaryColor} mb-3`}>Propriété</h3>
                  <p className={`font-medium ${textPrimaryColor}`}>{selectedOrder.property.title}</p>
                  <p className={`text-sm ${textSecondaryColor} mb-2`}>{selectedOrder.property.location}</p>
                  <p className={`${textColor} font-medium`}>
                    {formatPrice(selectedOrder.property.price)} 
                    {selectedOrder.order_type === 'Location' ? '/mois' : ''}
                  </p>
                  <div className="mt-2">
                    <p className={`text-sm ${textSecondaryColor}`}>Transaction : {selectedOrder.property.transaction_type}</p>
                    <p className={`text-sm ${textSecondaryColor}`}>Catégorie : {selectedOrder.property.category}</p>
                    <p className={`text-sm ${textSecondaryColor}`}>Surface : {selectedOrder.property.surface} m²</p>
                    <p className={`text-sm ${textSecondaryColor}`}>Statut actuel : {selectedOrder.property.status}</p>
                  </div>
                </div>
              )}
              
              {selectedOrder.user && (
                <div className={`mb-6`}>
                  <h3 className={`text-lg font-medium ${textPrimaryColor} mb-3`}>Client</h3>
                  <p className={`font-medium ${textPrimaryColor}`}>{selectedOrder.user.full_name}</p>
                  <p className={`text-sm ${textSecondaryColor}`}>{selectedOrder.user.email}</p>
                  {selectedOrder.user.phone && (
                    <p className={`text-sm ${textSecondaryColor}`}>{selectedOrder.user.phone}</p>
                  )}
                </div>
              )}
              
              <div className="flex justify-end gap-3 mt-6">
                {selectedOrder.order_status === 'En attente' && (
                  <>
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.order_id, 'Confirmé');
                        setShowModal(false);
                      }}
                      disabled={!!processing[selectedOrder.order_id]}
                      className={`flex items-center gap-1 px-4 py-2 rounded-lg ${buttonPrimaryBg} ${buttonPrimaryText} hover:opacity-90 transition-colors`}
                    >
                      {processing[selectedOrder.order_id] ? (
                        <RefreshCwIcon className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckIcon className="w-4 h-4" />
                      )}
                      Confirmer
                    </button>
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.order_id, 'Annulé');
                        setShowModal(false);
                      }}
                      disabled={!!processing[selectedOrder.order_id]}
                      className={`flex items-center gap-1 px-4 py-2 rounded-lg ${isLightMode ? "bg-red-500" : "bg-red-600"} text-white hover:opacity-90 transition-colors`}
                    >
                      {processing[selectedOrder.order_id] ? (
                        <RefreshCwIcon className="w-4 h-4 animate-spin" />
                      ) : (
                        <XIcon className="w-4 h-4" />
                      )}
                      Annuler
                    </button>
                  </>
                )}
                {selectedOrder.order_status === 'Confirmé' && (
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.order_id, 'Terminé');
                      setShowModal(false);
                    }}
                    disabled={!!processing[selectedOrder.order_id]}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg ${isLightMode ? "bg-blue-500" : "bg-blue-600"} text-white hover:opacity-90 transition-colors`}
                  >
                    {processing[selectedOrder.order_id] ? (
                      <RefreshCwIcon className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircleIcon className="w-4 h-4" />
                    )}
                    Terminer
                  </button>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 rounded-lg ${buttonSecondaryBg} ${buttonSecondaryText} hover:opacity-90 transition-colors`}
                >
                  Fermer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default OrderManagement; 