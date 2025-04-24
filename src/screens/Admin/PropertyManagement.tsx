import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  PlusIcon, EditIcon, TrashIcon, SearchIcon, 
  RefreshCwIcon, FilterIcon, EyeIcon, XIcon,
  CheckIcon, SunIcon, MoonIcon, ArrowLeftIcon,
  ChevronLeftIcon, ChevronRightIcon, HomeIcon,
  BuildingIcon, ImageIcon, MapPinIcon, TagIcon,
  DollarSignIcon, SquareIcon, UserIcon
} from "lucide-react";
import apiService from "../../services/apiService";
import { API_URL, getMediaUrl } from "../../config/api";

// Types
interface Property {
  property_id: number;
  user_id: number | null;
  title: string;
  description: string;
  price: number;
  surface: number;
  location: string;
  property_type: 'VILLA' | 'TERRAIN' | 'APPARTEMENT';
  category: 'LITE' | 'ESSENTIEL' | 'PREMIUM';
  status: 'Disponible' | 'Réservé' | 'Vendu' | 'Loué';
  created_at: string;
  updated_at: string;
  owner?: {
    full_name: string;
    email: string;
    phone: string;
  };
  media?: PropertyMedia[];
}

interface PropertyMedia {
  media_id: number;
  property_id: number;
  media_type: 'Photo' | 'Vidéo' | 'Document';
  media_url: string;
  uploaded_at: string;
}

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  surface: number;
  location: string;
  property_type: 'VILLA' | 'TERRAIN' | 'APPARTEMENT';
  category: 'LITE' | 'ESSENTIEL' | 'PREMIUM';
  status: 'Disponible' | 'Réservé' | 'Vendu' | 'Loué';
  user_id: number | null;
}

interface FilterOptions {
  property_type: string;
}

const PropertyManagement = (): JSX.Element => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    property_type: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    description: "",
    price: 0,
    surface: 0,
    location: "",
    property_type: "VILLA",
    category: "LITE",
    status: "Disponible",
    user_id: null
  });
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isLightMode, setIsLightMode] = useState(() => {
    // Récupérer la préférence depuis localStorage
    const savedMode = localStorage.getItem('isLightMode');
    return savedMode !== null ? savedMode === 'true' : false; // Défaut: mode sombre
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
  const modalBgColor = isLightMode ? "bg-white" : "bg-[#1e293b]";
  const inputBgColor = isLightMode ? "bg-white" : "bg-[#0f172a]";
  const inputBorderColor = isLightMode ? "border-gray-300" : "border-gray-600";
  const inputFocusBorderColor = isLightMode ? "border-[#0150BC]" : "border-[#59e0c5]";
  const tableBorderColor = isLightMode ? "border-gray-200" : "border-gray-700";
  const tableHeaderBgColor = isLightMode ? "bg-gray-50" : "bg-[#0f172a]";
  const tableRowHoverBgColor = isLightMode ? "hover:bg-gray-50" : "hover:bg-[#0f172a]/50";
  const tableRowEvenBgColor = isLightMode ? "bg-white" : "bg-[#1e293b]";
  const tableRowOddBgColor = isLightMode ? "bg-gray-50" : "bg-[#0f172a]/50";

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

  // Méttre à jour dans useEffect pour utiliser la nouvelle fonction
  useEffect(() => {
    // Charger les propriétés au chargement du composant
    fetchPropertiesFromAPI();
  }, []);

  // Fonction pour recharger toutes les propriétés
  const fetchPropertiesFromAPI = () => {
    setLoading(true);
    setError(null);
    
    apiService.get<ApiResponse<{data: Property[], current_page: number, last_page: number}>>('/properties')
      .then(response => {
        // Debug: afficher la structure complète de la réponse
        console.log("Structure complète de la réponse API:", JSON.stringify(response.data, null, 2));
        
        if (response && response.data && response.data.status === 'success') {
          let propertiesData: Property[] = [];
          
          if (response.data.data && Array.isArray(response.data.data)) {
            // Cas où les données ne sont pas paginées
            propertiesData = response.data.data;
            console.log("Données non paginées:", propertiesData);
          } else if (response.data.data && typeof response.data.data === 'object' && response.data.data.data && Array.isArray(response.data.data.data)) {
            // Cas où les données sont paginées (structure Laravel standard)
            propertiesData = response.data.data.data;
            console.log("Données paginées:", propertiesData);
            // Mettre à jour le nombre total de pages
            if (response.data.data.last_page) {
              setTotalPages(response.data.data.last_page);
            }
          }
          
          console.log("Nombre de propriétés récupérées:", propertiesData.length);
          setProperties(propertiesData);
          setCurrentPage(1);
          
          // Calculer le nombre total de pages si la pagination n'est pas fournie
          if (!response.data.data.last_page) {
            const totalItems = propertiesData.length;
            setTotalPages(Math.ceil(totalItems / 10));
          }
        } else {
          // Cas où les données sont invalides ou absentes
          console.error("Réponse API invalide:", response);
          setProperties([]);
          setTotalPages(1);
          setError("Les données reçues sont invalides. Veuillez réessayer.");
        }
      })
      .catch(err => {
        console.error("Erreur lors du chargement des propriétés:", err);
        setProperties([]);
        setTotalPages(1);
        setError("Impossible de charger les propriétés. Veuillez réessayer.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Ajouter un délai (debounce) pour la recherche automatique
  useEffect(() => {
    // Ignorer le premier rendu
    if (searchQuery === "" && properties.length === 0) return;
    
    // Ajouter un délai avant d'exécuter la recherche
    const debounceTimeout = setTimeout(() => {
      handleSearch();
    }, 500); // 500ms de délai
    
    // Nettoyer le timeout si searchQuery change avant la fin du délai
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]); // Cette fonction s'exécute chaque fois que searchQuery change

  // Rechercher des propriétés
  const handleSearch = () => {
    if (searchQuery === "") {
      // Si la recherche est vide, recharger toutes les propriétés
      fetchPropertiesFromAPI();
      return;
    }
    
    try {
      if (!Array.isArray(properties)) {
        console.error("Properties n'est pas un tableau lors de la recherche:", properties);
        return;
      }
      
      // Implémenter la recherche par titre ou description
      const filteredProperties = properties.filter(property => 
        property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setProperties(filteredProperties);
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      setError("Une erreur est survenue lors de la recherche");
      setProperties([]);  // Réinitialiser à un tableau vide en cas d'erreur
    }
  };

  // Ajouter une propriété
  const handleAddProperty = async () => {
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      
      // Ajouter les champs du formulaire
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          formDataToSend.append(key, value.toString());
        }
      });
      
      // Ajouter les fichiers médias
      mediaFiles.forEach((file, index) => {
        formDataToSend.append(`media[${index}]`, file);
      });
      
      // Envoyer la requête
      const response = await apiService.post<ApiResponse<Property>>('/properties', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response && response.data && response.data.status === 'success' && response.data.data) {
        // Ajouter la nouvelle propriété à la liste
        setProperties([...properties, response.data.data]);
        
        // Fermer le modal et réinitialiser le formulaire
        setShowAddModal(false);
        setFormData({
          title: "",
          description: "",
          price: 0,
          surface: 0,
          location: "",
          property_type: "VILLA",
          category: "LITE",
          status: "Disponible",
          user_id: null
        });
        setMediaFiles([]);
      } else {
        console.error("Réponse API invalide:", response);
        alert("La réponse du serveur est invalide. Veuillez réessayer.");
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout de la propriété:", err);
      alert("Une erreur est survenue lors de l'ajout de la propriété. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // Modifier une propriété
  const handleEditProperty = async () => {
    if (!selectedProperty) return;
    
    try {
      const formDataToSend = new FormData();
      
      // Ajouter les champs du formulaire
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          formDataToSend.append(key, value.toString());
        }
      });
      
      // Ajouter les fichiers médias
      mediaFiles.forEach((file, index) => {
        formDataToSend.append(`media[${index}]`, file);
      });
      
      // Ajouter la méthode PUT pour Laravel
      formDataToSend.append('_method', 'PUT');
      
      // Envoyer la requête
      const response = await apiService.post<ApiResponse<Property>>(`/properties/${selectedProperty.property_id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data && response.data.status === 'success') {
        // Mettre à jour la propriété dans la liste
        setProperties(properties.map(property => 
          property.property_id === selectedProperty.property_id ? response.data.data : property
        ));
        
        // Fermer le modal et réinitialiser le formulaire
        setShowEditModal(false);
        setSelectedProperty(null);
        setFormData({
          title: "",
          description: "",
          price: 0,
          surface: 0,
          location: "",
          property_type: "VILLA",
          category: "LITE",
          status: "Disponible",
          user_id: null
        });
        setMediaFiles([]);
      }
    } catch (err) {
      console.error("Erreur lors de la modification de la propriété:", err);
      alert("Une erreur est survenue lors de la modification de la propriété. Veuillez réessayer.");
    }
  };

  // Supprimer une propriété
  const handleDeleteProperty = async () => {
    if (!selectedProperty) return;
    
    try {
      // Envoyer la requête
      const response = await apiService.delete<ApiResponse<null>>(`/properties/${selectedProperty.property_id}`);
      
      if (response.data && response.data.status === 'success') {
        // Supprimer la propriété de la liste
        setProperties(properties.filter(property => property.property_id !== selectedProperty.property_id));
        
        // Fermer le modal et réinitialiser la sélection
        setShowDeleteModal(false);
        setSelectedProperty(null);
      }
    } catch (err) {
      console.error("Erreur lors de la suppression de la propriété:", err);
      alert("Une erreur est survenue lors de la suppression de la propriété. Veuillez réessayer.");
    }
  };

  // Gérer le changement de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Ouvrir le modal d'ajout
  const openAddModal = () => {
    setShowAddModal(true);
  };

  // Ouvrir le modal de modification
  const openEditModal = (property: Property) => {
    setSelectedProperty(property);
    setFormData({
      title: property.title,
      description: property.description,
      price: property.price,
      surface: property.surface,
      location: property.location,
      property_type: property.property_type,
      category: property.category,
      status: property.status,
      user_id: property.user_id
    });
    setShowEditModal(true);
  };

  // Ouvrir le modal de suppression
  const openDeleteModal = (property: Property) => {
    setSelectedProperty(property);
    setShowDeleteModal(true);
  };

  // Ouvrir le modal de visualisation
  const openViewModal = (property: Property) => {
    setSelectedProperty(property);
    setShowViewModal(true);
  };

  // Gérer le changement dans le formulaire
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Gérer l'ajout de fichiers médias
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setMediaFiles([...mediaFiles, ...filesArray]);
    }
  };

  // Supprimer un fichier média
  const removeFile = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  // Calculer les propriétés à afficher pour la pagination
  const displayedProperties = Array.isArray(properties) 
    ? properties.slice((currentPage - 1) * 10, currentPage * 10)
    : [];

  // Appliquer le filtre par type de propriété uniquement
  const applyFilters = () => {
    if (!Array.isArray(properties)) {
      console.error("Properties n'est pas un tableau lors du filtrage:", properties);
      return;
    }

    setLoading(true);
    
    try {
      // Si aucun filtre n'est sélectionné, réinitialiser avec toutes les propriétés
      if (!filterOptions.property_type) {
        // Recharger toutes les propriétés
        fetchPropertiesFromAPI();
        return;
      }
      
      // Filtre uniquement par type de propriété
      const params: Record<string, string> = {};
      if (filterOptions.property_type) {
        params['property_type'] = filterOptions.property_type;
      }
      
      // Appel API avec le filtre
      apiService.get<ApiResponse<{data: Property[], current_page: number, last_page: number}>>('/properties', { params })
        .then(response => {
          if (response && response.data && response.data.status === 'success') {
            let propertiesData: Property[] = [];
            
            if (response.data.data && Array.isArray(response.data.data)) {
              propertiesData = response.data.data;
            } else if (response.data.data && typeof response.data.data === 'object' && response.data.data.data && Array.isArray(response.data.data.data)) {
              propertiesData = response.data.data.data;
              if (response.data.data.last_page) {
                setTotalPages(response.data.data.last_page);
              }
            }
            
            setProperties(propertiesData);
            console.log("Propriétés filtrées:", propertiesData);
            
            // Réinitialiser la pagination
            setCurrentPage(1);
          } else {
            setError("Erreur lors du filtrage des propriétés");
            setProperties([]);
          }
        })
        .catch(err => {
          console.error("Erreur lors du filtrage des propriétés:", err);
          setError("Erreur lors du filtrage des propriétés");
          setProperties([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      console.error("Erreur lors de l'application des filtres:", error);
      setLoading(false);
    }
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilterOptions({
      property_type: ""
    });
    fetchPropertiesFromAPI();
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
        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/admin/dashboard')} 
              className={`p-2 rounded-full ${cardBgColor} ${textColor} mr-4`}
            >
              <ArrowLeftIcon size={20} />
            </button>
            <h1 className={`text-2xl md:text-3xl font-bold ${textColor}`}>
              Gestion des Propriétés
            </h1>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={toggleLightMode}
              className={`p-2 rounded-full ${cardBgColor} ${textColor}`}
            >
              {isLightMode ? <MoonIcon size={20} /> : <SunIcon size={20} />}
            </button>
            <button 
              onClick={() => navigate('/home')}
              className={`p-2 rounded-full ${cardBgColor} ${textColor}`}
            >
              <HomeIcon size={20} />
            </button>
          </div>
        </div>

        {/* Barre d'outils */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher une propriété..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg ${inputBgColor} ${inputBorderColor} border focus:outline-none focus:${inputFocusBorderColor} ${textPrimaryColor}`}
              />
              <SearchIcon size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textSecondaryColor}`} />
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 rounded-lg ${cardBgColor} ${textColor} flex items-center`}
            >
              <FilterIcon size={18} className="mr-2" />
              Filtres
            </button>
            
            <button
              onClick={openAddModal}
              className={`px-3 py-2 rounded-lg ${buttonPrimaryBg} ${buttonPrimaryText} flex items-center`}
            >
              <PlusIcon size={18} className="mr-2" />
              Ajouter
            </button>
          </div>
        </div>

        {/* Filtres */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`${cardBgColor} p-4 rounded-lg mb-6 ${cardBorder}`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block mb-1 text-sm ${textSecondaryColor}`}>Type de propriété</label>
                <select
                  name="property_type"
                  value={filterOptions.property_type}
                  onChange={(e) => setFilterOptions({...filterOptions, property_type: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg ${inputBgColor} ${inputBorderColor} border focus:outline-none focus:${inputFocusBorderColor} ${textPrimaryColor}`}
                >
                  <option value="">Tous</option>
                  <option value="VILLA">Villa</option>
                  <option value="TERRAIN">Terrain</option>
                  <option value="APPARTEMENT">Appartement</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={resetFilters}
                className={`px-3 py-2 rounded-lg ${actionButtonBg} ${textSecondaryColor} flex items-center`}
              >
                <RefreshCwIcon size={16} className="mr-2" />
                Réinitialiser
              </button>
              
              <button
                onClick={applyFilters}
                className={`px-3 py-2 rounded-lg ${buttonPrimaryBg} ${buttonPrimaryText} flex items-center`}
              >
                <FilterIcon size={16} className="mr-2" />
                Appliquer
              </button>
            </div>
          </motion.div>
        )}

        {/* Tableau des propriétés */}
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
          <div className="relative">
            {/* Indicateurs de défilement horizontal améliorés */}
            <div className="flex justify-between items-center mb-2">
              <div className={`flex items-center ${textColor}`}>
                <ChevronLeftIcon size={16} className="animate-pulse mr-1" />
                <ChevronRightIcon size={16} className="animate-pulse" />
                <span className="ml-2 text-sm">Faites défiler horizontalement</span>
              </div>
            </div>
            
            {/* Effet de dégradé pour indiquer le défilement */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm relative">
              <div className={`w-full min-w-max ${cardBgColor}`}>
                <table className={`w-full border-collapse ${textPrimaryColor}`}>
                  <thead>
                    <tr className={`${tableHeaderBgColor} border-b ${tableBorderColor}`}>
                      <th className="px-4 py-3 text-left">ID</th>
                      <th className="px-4 py-3 text-left">Titre</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Prix</th>
                      <th className="px-4 py-3 text-left">Surface</th>
                      <th className="px-4 py-3 text-left">Emplacement</th>
                      <th className="px-4 py-3 text-left">Statut</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!displayedProperties || displayedProperties.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center">
                          Aucune propriété trouvée.
                        </td>
                      </tr>
                    ) : (
                      displayedProperties.map((property, index) => (
                        <tr 
                          key={property.property_id || index} 
                          className={`${index % 2 === 0 ? tableRowEvenBgColor : tableRowOddBgColor} ${tableRowHoverBgColor} border-b ${tableBorderColor}`}
                        >
                          <td className="px-4 py-3">{property.property_id || 'N/A'}</td>
                          <td className="px-4 py-3">{property.title || 'Sans titre'}</td>
                          <td className="px-4 py-3">{property.property_type || 'N/A'}</td>
                          <td className="px-4 py-3">{property.price ? property.price.toLocaleString() : '0'} Ar</td>
                          <td className="px-4 py-3">{property.surface || '0'} m²</td>
                          <td className="px-4 py-3">{property.location || 'Non spécifié'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              property.status === 'Disponible' ? 'bg-green-100 text-green-800' :
                              property.status === 'Réservé' ? 'bg-yellow-100 text-yellow-800' :
                              property.status === 'Vendu' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {property.status || 'Non défini'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openViewModal(property)}
                                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                title="Voir les détails"
                              >
                                <EyeIcon size={16} className={textColor} />
                              </button>
                              <button
                                onClick={() => openEditModal(property)}
                                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                title="Modifier"
                              >
                                <EditIcon size={16} className={textColor} />
                              </button>
                              <button
                                onClick={() => openDeleteModal(property)}
                                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                title="Supprimer"
                              >
                                <TrashIcon size={16} className="text-red-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-full ${cardBgColor} ${textColor} ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ChevronLeftIcon size={16} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentPage === page 
                      ? `${buttonPrimaryBg} ${buttonPrimaryText}` 
                      : `${cardBgColor} ${textColor}`
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-full ${cardBgColor} ${textColor} ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ChevronRightIcon size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Modal d'ajout de propriété */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowAddModal(false)}></div>
              
              <div className={`relative w-full max-w-3xl p-6 rounded-lg shadow-lg ${modalBgColor} ${textPrimaryColor}`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Ajouter une propriété</h2>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <XIcon size={20} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={`block mb-1 text-sm ${textSecondaryColor}`}>Titre</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      className={`w-full px-3 py-2 rounded-lg ${inputBgColor} ${inputBorderColor} border focus:outline-none focus:${inputFocusBorderColor} ${textPrimaryColor}`}
                      placeholder="Titre de la propriété"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={`block mb-1 text-sm ${textSecondaryColor}`}>Type de propriété</label>
                    <select
                      name="property_type"
                      value={formData.property_type}
                      onChange={handleFormChange}
                      className={`w-full px-3 py-2 rounded-lg ${inputBgColor} ${inputBorderColor} border focus:outline-none focus:${inputFocusBorderColor} ${textPrimaryColor}`}
                      required
                    >
                      <option value="VILLA">Villa</option>
                      <option value="TERRAIN">Terrain</option>
                      <option value="APPARTEMENT">Appartement</option>
                      <option value="MAISON">Maison</option>
                      <option value="AUTRE">Autre</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block mb-1 text-sm ${textSecondaryColor}`}>Prix (Ar)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleFormChange}
                      className={`w-full px-3 py-2 rounded-lg ${inputBgColor} ${inputBorderColor} border focus:outline-none focus:${inputFocusBorderColor} ${textPrimaryColor}`}
                      placeholder="Prix en Ariary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={`block mb-1 text-sm ${textSecondaryColor}`}>Surface (m²)</label>
                    <input
                      type="number"
                      name="surface"
                      value={formData.surface}
                      onChange={handleFormChange}
                      className={`w-full px-3 py-2 rounded-lg ${inputBgColor} ${inputBorderColor} border focus:outline-none focus:${inputFocusBorderColor} ${textPrimaryColor}`}
                      placeholder="Surface en m²"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={`block mb-1 text-sm ${textSecondaryColor}`}>Emplacement</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleFormChange}
                      className={`w-full px-3 py-2 rounded-lg ${inputBgColor} ${inputBorderColor} border focus:outline-none focus:${inputFocusBorderColor} ${textPrimaryColor}`}
                      placeholder="Adresse ou emplacement"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={`block mb-1 text-sm ${textSecondaryColor}`}>Catégorie</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      className={`w-full px-3 py-2 rounded-lg ${inputBgColor} ${inputBorderColor} border focus:outline-none focus:${inputFocusBorderColor} ${textPrimaryColor}`}
                      required
                    >
                      <option value="LITE">Lite</option>
                      <option value="ESSENTIEL">Essentiel</option>
                      <option value="PREMIUM">Premium</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block mb-1 text-sm ${textSecondaryColor}`}>Statut</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      className={`w-full px-3 py-2 rounded-lg ${inputBgColor} ${inputBorderColor} border focus:outline-none focus:${inputFocusBorderColor} ${textPrimaryColor}`}
                      required
                    >
                      <option value="Disponible">Disponible</option>
                      <option value="Réservé">Réservé</option>
                      <option value="Vendu">Vendu</option>
                      <option value="Loué">Loué</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className={`block mb-1 text-sm ${textSecondaryColor}`}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    className={`w-full px-3 py-2 rounded-lg ${inputBgColor} ${inputBorderColor} border focus:outline-none focus:${inputFocusBorderColor} ${textPrimaryColor} min-h-[100px]`}
                    placeholder="Description détaillée de la propriété"
                    required
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label className={`block mb-1 text-sm ${textSecondaryColor}`}>Images</label>
                  <div className="flex items-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="property-images"
                    />
                    <label 
                      htmlFor="property-images"
                      className={`px-4 py-2 rounded-lg ${buttonPrimaryBg} ${buttonPrimaryText} cursor-pointer flex items-center`}
                    >
                      <ImageIcon size={16} className="mr-2" />
                      Ajouter des images
                    </label>
                  </div>
                  
                  {mediaFiles.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {mediaFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={`Preview ${index}`} 
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeFile(index)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <XIcon size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className={`px-4 py-2 rounded-lg ${actionButtonBg} ${textSecondaryColor}`}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddProperty}
                    className={`px-4 py-2 rounded-lg ${buttonPrimaryBg} ${buttonPrimaryText} flex items-center`}
                  >
                    <CheckIcon size={16} className="mr-2" />
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de modification de propriété */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowEditModal(false)}></div>
              
              <div className={`relative w-full max-w-3xl p-6 rounded-lg shadow-lg ${modalBgColor} ${textPrimaryColor}`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Modifier la propriété</h2>
                  <button 
                    onClick={() => setShowEditModal(false)}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <XIcon size={20} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={`block mb-1 text-sm ${textSecondaryColor}`}>Titre</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      className={`w-full px-3 py-2 rounded-lg ${inputBgColor} ${inputBorderColor} border focus:outline-none focus:${inputFocusBorderColor} ${textPrimaryColor}`}
                      placeholder="Titre de la propriété"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={`block mb-1 text-sm ${textSecondaryColor}`}>Type de propriété</label>
                    <select
                      name="property_type"
                      value={formData.property_type}
                      onChange={handleFormChange}
                      className={`w-full px-3 py-2 rounded-lg ${inputBgColor} ${inputBorderColor} border focus:outline-none focus:${inputFocusBorderColor} ${textPrimaryColor}`}
                      required
                    >
                      <option value="VILLA">Villa</option>
                      <option value="TERRAIN">Terrain</option>
                      <option value="APPARTEMENT">Appartement</option>
                      <option value="MAISON">Maison</option>
                      <option value="AUTRE">Autre</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block mb-1 text-sm ${textSecondaryColor}`}>Prix (Ar)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleFormChange}
                      className={`w-full px-3 py-2 rounded-lg ${inputBgColor} ${inputBorderColor} border focus:outline-none focus:${inputFocusBorderColor} ${textPrimaryColor}`}
                      placeholder="Prix en Ariary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={`block mb-1 text-sm ${textSecondaryColor}`}>Surface (m²)</label>
                    <input
                      type="number"
                      name="surface"
                      value={formData.surface}
                      onChange={handleFormChange}
                      className={`w-full px-3 py-2 rounded-lg ${inputBgColor} ${inputBorderColor} border focus:outline-none focus:${inputFocusBorderColor} ${textPrimaryColor}`}
                      placeholder="Surface en m²"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={`block mb-1 text-sm ${textSecondaryColor}`}>Emplacement</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleFormChange}
                      className={`w-full px-3 py-2 rounded-lg ${inputBgColor} ${inputBorderColor} border focus:outline-none focus:${inputFocusBorderColor} ${textPrimaryColor}`}
                      placeholder="Adresse ou emplacement"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={`block mb-1 text-sm ${textSecondaryColor}`}>Catégorie</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      className={`w-full px-3 py-2 rounded-lg ${inputBgColor} ${inputBorderColor} border focus:outline-none focus:${inputFocusBorderColor} ${textPrimaryColor}`}
                      required
                    >
                      <option value="LITE">Lite</option>
                      <option value="ESSENTIEL">Essentiel</option>
                      <option value="PREMIUM">Premium</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block mb-1 text-sm ${textSecondaryColor}`}>Statut</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      className={`w-full px-3 py-2 rounded-lg ${inputBgColor} ${inputBorderColor} border focus:outline-none focus:${inputFocusBorderColor} ${textPrimaryColor}`}
                      required
                    >
                      <option value="Disponible">Disponible</option>
                      <option value="Réservé">Réservé</option>
                      <option value="Vendu">Vendu</option>
                      <option value="Loué">Loué</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className={`block mb-1 text-sm ${textSecondaryColor}`}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    className={`w-full px-3 py-2 rounded-lg ${inputBgColor} ${inputBorderColor} border focus:outline-none focus:${inputFocusBorderColor} ${textPrimaryColor} min-h-[100px]`}
                    placeholder="Description détaillée de la propriété"
                    required
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label className={`block mb-1 text-sm ${textSecondaryColor}`}>Images</label>
                  <div className="flex items-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="property-images-edit"
                    />
                    <label 
                      htmlFor="property-images-edit"
                      className={`px-4 py-2 rounded-lg ${buttonPrimaryBg} ${buttonPrimaryText} cursor-pointer flex items-center`}
                    >
                      <ImageIcon size={16} className="mr-2" />
                      Ajouter des images
                    </label>
                  </div>
                  
                  {/* Afficher les images existantes */}
                  {selectedProperty?.media && selectedProperty.media.length > 0 && (
                    <div className="mt-3">
                      <h3 className={`text-sm font-medium ${textSecondaryColor} mb-2`}>Images existantes</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {selectedProperty.media.map((media) => (
                          <div key={media.media_id} className="relative group">
                            <img 
                              src={getMediaUrl(media.media_url)} 
                              alt={`Property ${selectedProperty.property_id}`} 
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => {
                                // Implémenter la suppression de médias existants
                                console.log("Supprimer média", media.media_id);
                              }}
                              className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <XIcon size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Afficher les nouvelles images */}
                  {mediaFiles.length > 0 && (
                    <div className="mt-3">
                      <h3 className={`text-sm font-medium ${textSecondaryColor} mb-2`}>Nouvelles images</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {mediaFiles.map((file, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={`Preview ${index}`} 
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeFile(index)}
                              className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <XIcon size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className={`px-4 py-2 rounded-lg ${actionButtonBg} ${textSecondaryColor}`}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleEditProperty}
                    className={`px-4 py-2 rounded-lg ${buttonPrimaryBg} ${buttonPrimaryText} flex items-center`}
                  >
                    <CheckIcon size={16} className="mr-2" />
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de visualisation de propriété */}
        {showViewModal && selectedProperty && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowViewModal(false)}></div>
              
              <div className={`relative w-full max-w-4xl p-6 rounded-lg shadow-lg ${modalBgColor} ${textPrimaryColor} max-h-[90vh] overflow-y-auto`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Détails de la propriété</h2>
                  <button 
                    onClick={() => setShowViewModal(false)}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <XIcon size={20} />
                  </button>
                </div>

                {/* Images de la propriété */}
                {selectedProperty.media && selectedProperty.media.length > 0 ? (
                  <div className="mb-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {selectedProperty.media.map((media) => (
                        <div key={media.media_id} className="relative">
                          <img 
                            src={getMediaUrl(media.media_url)} 
                            alt={`Property ${selectedProperty.property_id}`} 
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={`${cardBgColor} p-4 rounded-lg mb-6 flex justify-center items-center`}>
                    <p className={`${textSecondaryColor} flex items-center`}>
                      <ImageIcon size={18} className="mr-2" />
                      Aucune image disponible
                    </p>
                  </div>
                )}

                {/* Informations principales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className={`${cardBgColor} p-4 rounded-lg`}>
                    <div className={`flex items-center mb-2 ${textColor}`}>
                      <HomeIcon size={18} className="mr-2" />
                      <h3 className="font-semibold">Type</h3>
                    </div>
                    <p className={`${textPrimaryColor} text-lg font-medium`}>{selectedProperty.property_type}</p>
                  </div>
                  
                  <div className={`${cardBgColor} p-4 rounded-lg`}>
                    <div className={`flex items-center mb-2 ${textColor}`}>
                      <DollarSignIcon size={18} className="mr-2" />
                      <h3 className="font-semibold">Prix</h3>
                    </div>
                    <p className={`${textPrimaryColor} text-lg font-medium`}>{selectedProperty.price.toLocaleString()} Ar</p>
                  </div>
                  
                  <div className={`${cardBgColor} p-4 rounded-lg`}>
                    <div className={`flex items-center mb-2 ${textColor}`}>
                      <SquareIcon size={18} className="mr-2" />
                      <h3 className="font-semibold">Surface</h3>
                    </div>
                    <p className={`${textPrimaryColor} text-lg font-medium`}>{selectedProperty.surface} m²</p>
                  </div>
                </div>

                {/* Détails de la propriété */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className={`text-lg font-semibold mb-3 ${textColor}`}>Informations générales</h3>
                    
                    <div className={`${cardBgColor} p-4 rounded-lg space-y-4`}>
                      <div>
                        <div className={`flex items-center mb-1 ${textSecondaryColor}`}>
                          <TagIcon size={16} className="mr-2" />
                          <span className="text-sm">Titre</span>
                        </div>
                        <p className={`${textPrimaryColor} font-medium`}>{selectedProperty.title}</p>
                      </div>
                      
                      <div>
                        <div className={`flex items-center mb-1 ${textSecondaryColor}`}>
                          <MapPinIcon size={16} className="mr-2" />
                          <span className="text-sm">Emplacement</span>
                        </div>
                        <p className={`${textPrimaryColor} font-medium`}>{selectedProperty.location}</p>
                      </div>
                      
                      <div>
                        <div className={`flex items-center mb-1 ${textSecondaryColor}`}>
                          <BuildingIcon size={16} className="mr-2" />
                          <span className="text-sm">Catégorie</span>
                        </div>
                        <p className={`${textPrimaryColor} font-medium`}>{selectedProperty.category}</p>
                      </div>
                      
                      <div>
                        <div className={`flex items-center mb-1 ${textSecondaryColor}`}>
                          <CheckIcon size={16} className="mr-2" />
                          <span className="text-sm">Statut</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedProperty.status === 'Disponible' ? 'bg-green-100 text-green-800' :
                          selectedProperty.status === 'Réservé' ? 'bg-yellow-100 text-yellow-800' :
                          selectedProperty.status === 'Vendu' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedProperty.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className={`text-lg font-semibold mb-3 ${textColor}`}>Détails</h3>
                    
                    <div className={`${cardBgColor} p-4 rounded-lg h-full`}>
                      <div className={`flex items-start mb-2 ${textSecondaryColor}`}>
                        <p className="text-sm">Description</p>
                      </div>
                      <p className={`${textPrimaryColor}`}>{selectedProperty.description}</p>
                      
                      {selectedProperty.owner && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className={`flex items-center mb-2 ${textSecondaryColor}`}>
                            <UserIcon size={16} className="mr-2" />
                            <span className="text-sm">Propriétaire</span>
                          </div>
                          <div className="space-y-1">
                            <p className={`${textPrimaryColor} font-medium`}>{selectedProperty.owner.full_name}</p>
                            <p className={`${textSecondaryColor} text-sm`}>{selectedProperty.owner.email}</p>
                            <p className={`${textSecondaryColor} text-sm`}>{selectedProperty.owner.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      openEditModal(selectedProperty);
                    }}
                    className={`px-4 py-2 rounded-lg ${buttonPrimaryBg} ${buttonPrimaryText} flex items-center`}
                  >
                    <EditIcon size={16} className="mr-2" />
                    Modifier
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de suppression de propriété */}
        {showDeleteModal && selectedProperty && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowDeleteModal(false)}></div>
              
              <div className={`relative w-full max-w-md p-6 rounded-lg shadow-lg ${modalBgColor} ${textPrimaryColor}`}>
                <div className="text-center mb-4">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                    <TrashIcon size={24} className="text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-medium">Confirmation de suppression</h3>
                  <p className={`mt-2 ${textSecondaryColor}`}>
                    Êtes-vous sûr de vouloir supprimer cette propriété ? Cette action est irréversible.
                  </p>
                </div>
                
                <div className={`p-4 mb-4 rounded-lg ${cardBgColor}`}>
                  <p className="font-medium">{selectedProperty.title}</p>
                  <p className={`${textSecondaryColor} text-sm mt-1`}>{selectedProperty.location}</p>
                  <div className="flex items-center mt-2">
                    <span className={`inline-flex items-center ${textSecondaryColor} text-sm mr-3`}>
                      <DollarSignIcon size={14} className="mr-1" />
                      {selectedProperty.price.toLocaleString()} Ar
                    </span>
                    <span className={`inline-flex items-center ${textSecondaryColor} text-sm`}>
                      <SquareIcon size={14} className="mr-1" />
                      {selectedProperty.surface} m²
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className={`px-4 py-2 rounded-lg ${actionButtonBg} ${textSecondaryColor}`}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeleteProperty}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white flex items-center"
                  >
                    <TrashIcon size={16} className="mr-2" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyManagement;