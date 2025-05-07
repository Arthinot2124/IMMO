import React, { useState, useEffect} from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  PlusIcon, EditIcon, TrashIcon, SearchIcon, 
  RefreshCwIcon, FilterIcon, EyeIcon, XIcon,
  CheckIcon, SunIcon, MoonIcon, ArrowLeftIcon,
  ChevronLeftIcon, ChevronRightIcon, HomeIcon,
  BuildingIcon, ImageIcon, MapPinIcon, TagIcon,
  DollarSignIcon, SquareIcon, UserIcon, InfoIcon
} from "lucide-react";
import apiService from "../../services/apiService";
import { API_URL, getMediaUrl } from "../../config/api";
import "./PropertyManagement.css";

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

// Ajouter cette interface pour les alertes
interface AlertProps {
  message: string;
  type: 'success' | 'error' | 'info';
  show: boolean;
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
  // Variable showAddModal supprimée car le modal a été remplacé par une redirection
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
  const [mediaToDelete, setMediaToDelete] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const MAX_IMAGES = 6;
  
  // Ajouter l'état pour gérer les alertes
  const [alert, setAlert] = useState<AlertProps>({
    message: '',
    type: 'success',
    show: false
  });

  // Couleurs qui changent en fonction du mode
  const bgColor = isLightMode ? "bg-white" : "bg-[#0f172a]";
  const cardBgColor = isLightMode ? "bg-[#F8FAFC]" : "bg-[#1e293b]";
  const textColor = isLightMode ? "text-[#0150BC]" : "text-[#59e0c5]";
  const textPrimaryColor = isLightMode ? "text-[#1E293B]" : "text-white";
  const textSecondaryColor = isLightMode ? "text-gray-700" : "text-gray-300";
  const buttonPrimaryBg = isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]";
  const buttonPrimaryText = isLightMode ? "text-white" : "text-[#0f172a]";
  const cardBorder = isLightMode ? "border border-[#0150BC]/30" : "";
  const actionButtonBg = isLightMode ? "bg-[#EFF6FF]" : "bg-[#0f172a]";
 

  const modalBgColor = isLightMode ? "bg-white" : "bg-[#1e293b]";
  const inputBgColor = isLightMode ? "bg-white" : "bg-[#0f172a]";
  const inputBorderColor = isLightMode ? "border-gray-300" : "border-gray-600";
  const inputFocusBorderColor = isLightMode ? "border-[#0150BC]" : "border-[#59e0c5]";


  // Ajouter ces variables après les autres variables de style
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  // Variables de style supplémentaires
  const borderColorLight = isLightMode ? "border-[#0150BC]/30" : "border-[#59e0c5]/30";
  const buttonBg = isLightMode ? "bg-[#EFF6FF]" : "bg-[#1e293b]";
  const buttonHoverBg = isLightMode ? "hover:bg-[#0150BC]" : "hover:bg-[#59e0c5]";
  const buttonBorder = isLightMode ? "border border-[#0150BC]" : "";
  const buttonShadow = isLightMode ? "shadow-sm" : "";

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

  // La fonction handleAddProperty a été supprimée car le modal d'ajout a été remplacé par une redirection

  // Ajouter cette fonction pour afficher une alerte pendant un temps donné
  const showAlert = (message: string, type: 'success' | 'error' | 'info') => {
    setAlert({
      message,
      type,
      show: true
    });
    
    // Masquer l'alerte après 3 secondes
    setTimeout(() => {
      setAlert(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Modifier une propriété
  const handleEditProperty = async () => {
    if (!selectedProperty) return;
    
    try {
      setIsSubmitting(true);
      
      // 1. D'abord mettre à jour les informations de base de la propriété
      const propertyData = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        surface: formData.surface,
        location: formData.location,
        property_type: formData.property_type,
        category: formData.category,
        status: formData.status,
        user_id: formData.user_id
      };
      
      console.log("Mise à jour des informations de base:", propertyData);
      
      // Premier appel API pour mettre à jour les informations de base
      const updateResponse = await apiService.put<ApiResponse<Property>>(
        `/properties/${selectedProperty.property_id}`,
        propertyData
      );
      
      if (!updateResponse.data || updateResponse.data.status !== 'success') {
        throw new Error("Échec de la mise à jour des informations de base");
      }
      
      console.log("Informations de base mises à jour avec succès");
      
      // 2. Ensuite, supprimer les médias sélectionnés
      const deletePromises = mediaToDelete.map(async (mediaId) => {
        console.log(`Suppression du média ${mediaId}`);
        return apiService.delete(`/properties/${selectedProperty.property_id}/media/${mediaId}`);
      });
      
      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
        console.log(`${deletePromises.length} médias supprimés avec succès`);
      }
      
      // 3. Enfin, télécharger les nouveaux médias
      const uploadPromises = mediaFiles.map(async (file, index) => {
        console.log(`Téléchargement du média ${index}: ${file.name}`);
        const formData = new FormData();
        formData.append('media_file', file);
        formData.append('media_type', 'Photo'); // On définit le type par défaut comme 'Photo'
        
        return apiService.post(
          `/properties/${selectedProperty.property_id}/media`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      });
      
      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
        console.log(`${uploadPromises.length} nouveaux médias téléchargés avec succès`);
      }
      
      // 4. Récupérer la propriété mise à jour avec tous ses médias
      const refreshResponse = await apiService.get<ApiResponse<Property>>(
        `/properties/${selectedProperty.property_id}`
      );
      
      if (refreshResponse.data && refreshResponse.data.status === 'success') {
        const refreshedProperty = refreshResponse.data.data;
        console.log("Propriété mise à jour complète:", refreshedProperty);
        
        // Mettre à jour la liste des propriétés
        setProperties(properties.map(property => 
          property.property_id === selectedProperty.property_id ? refreshedProperty : property
        ));
        
        // Utiliser l'alerte stylisée au lieu de alert()
        showAlert("Propriété modifiée avec succès", "success");
        
        // Fermer le modal et réinitialiser
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
        setMediaToDelete([]);
        setImageError(null);
        
        // Rafraîchir toutes les propriétés
        fetchPropertiesFromAPI();
      } else {
        throw new Error("Échec de la récupération des données mises à jour");
      }
    } catch (err) {
      console.error("Erreur lors de la modification de la propriété:", err);
      // Utiliser l'alerte stylisée au lieu de alert()
      showAlert("Une erreur est survenue lors de la modification de la propriété. Veuillez réessayer.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour supprimer une propriété
  const handleDeleteProperty = async () => {
    if (!selectedProperty) return;
    
    try {
      setIsSubmitting(true);
      
      // Appel à l'API pour supprimer la propriété
      const response = await apiService.delete<ApiResponse<null>>(`/properties/${selectedProperty.property_id}`);
      
      if (response.data && response.data.status === 'success') {
        // Fermer le modal
        setShowDeleteModal(false);
        
        // Mettre à jour la liste des propriétés
        setProperties(properties.filter(p => p.property_id !== selectedProperty.property_id));
        
        // Utiliser l'alerte stylisée au lieu de alert()
        showAlert("La propriété a été supprimée avec succès", "success");
      } else {
        throw new Error(response.data?.message || "Une erreur est survenue lors de la suppression");
      }
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      
      // Utiliser l'alerte stylisée au lieu de alert()
      showAlert(`Erreur: ${error.message || "Une erreur est survenue lors de la suppression"}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gérer le changement de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Rediriger vers la page de demande de propriété
  const navigateToPropertyRequest = () => {
    navigate('/property-request');
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
    // Réinitialiser la liste des médias à supprimer
    setMediaToDelete([]);
    setMediaFiles([]);
    setShowEditModal(true);
  };

  // Fonction pour ouvrir le modal de suppression
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
      
      // Calculer le nombre d'images actuelles (existantes non supprimées + nouvelles)
      const existingImagesCount = selectedProperty?.media 
        ? selectedProperty.media.filter(m => 
            m.media_type === 'Photo' && !mediaToDelete.includes(m.media_id)
          ).length 
        : 0;
      
      const totalImagesAfterAdd = existingImagesCount + mediaFiles.length + filesArray.length;
      
      if (totalImagesAfterAdd > MAX_IMAGES) {
        setImageError(`Vous ne pouvez pas ajouter plus de ${MAX_IMAGES} images au total`);
        return;
      }
      
      setMediaFiles([...mediaFiles, ...filesArray]);
      setImageError(null);
    }
  };

  // Supprimer un fichier média
  const removeFile = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
    setImageError(null);
  };

  // Fonction pour supprimer une image existante
  const removeExistingMedia = (mediaId: number) => {
    setMediaToDelete([...mediaToDelete, mediaId]);
    setImageError(null);
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

  // Ajouter cette fonction après fetchPropertiesFromAPI
  const logMediaUrl = (mediaPath: string) => {
    const url = getMediaUrl(mediaPath);
    console.log("Chemin média original:", mediaPath);
    console.log("URL complète générée:", url);
    console.log("API_URL utilisé:", API_URL);
    return url;
  };

  return (
    <div className={`${bgColor} min-h-screen ${textPrimaryColor} relative`}>
      {/* Alerte stylisée */}
      {alert.show && (
        <div className="fixed top-5 right-5 z-50 shadow-lg rounded-lg overflow-hidden transition-all duration-300 max-w-md transform translate-y-0 opacity-100">
          <div 
            className={`p-4 ${
              alert.type === 'success' 
                ? 'bg-green-600 text-white' 
                : alert.type === 'error' 
                ? 'bg-red-600 text-white' 
                : 'bg-blue-600 text-white'
            } flex items-center justify-between`}
          >
            <div className="flex items-center">
              {alert.type === 'success' && <CheckIcon size={20} className="mr-3" />}
              {alert.type === 'error' && <XIcon size={20} className="mr-3" />}
              {alert.type === 'info' && <InfoIcon size={20} className="mr-3" />}
              <p className="font-medium">{alert.message}</p>
            </div>
            <button 
              onClick={() => setAlert(prev => ({ ...prev, show: false }))}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <XIcon size={16} />
            </button>
          </div>
          <div className="h-1 bg-white bg-opacity-20">
            <div 
              className="h-full bg-white bg-opacity-40" 
              style={{ 
                width: '100%', 
                animation: 'countdown 3s linear forwards' 
              }}
            ></div>
          </div>
        </div>
      )}

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
              onClick={navigateToPropertyRequest}
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

        {/* Property Listings */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-5 xs:space-y-6 sm:space-y-8 max-h-[calc(103vh-300px)] overflow-y-auto pr-2"
        >
          {!loading && properties.map((property) => (
            <motion.div
              key={property.property_id}
              variants={itemVariants}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className={`${cardBgColor} rounded-lg xs:rounded-xl overflow-hidden border ${borderColorLight}`}
            >
              <div className="flex">
                <div className={`w-[130px] xs:w-[150px] sm:w-[180px] h-[90px] xs:h-[100px] sm:h-[120px] flex-shrink-0 ${buttonBg} property-image-container flex items-center justify-center`}>
                  {property.media && property.media.length > 0 ? (
                    <img
                      src={getMediaUrl(property.media[0].media_url)}
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/public_Trano/maison-01.png";
                      }}
                    />
                  ) : (
                    <img
                      src="/public_Trano/maison-01.png"
                      alt={property.title}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                <div className="flex-1 p-2 xs:p-3 sm:p-4 flex flex-col justify-between h-[90px] xs:h-[100px] sm:h-[120px]">
                  <div className="property-card">
                    <h3 className={`text-xs xs:text-sm sm:text-base font-semibold ${textColor} mb-1`}>
                      {property.title}
                    </h3>
                    <p className={`text-[10px] xs:text-xs sm:text-sm ${textSecondaryColor} line-clamp-2`}>
                      {property.description || `Située à ${property.location}, surface: ${property.surface}m²`}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] xs:text-xs sm:text-sm ${textColor} font-medium`}>
                        {property.price.toLocaleString()} Ar
                      </span>
                      <span className={`text-[10px] xs:text-xs sm:text-sm ${textSecondaryColor}`}>
                        • {property.location}
                      </span>
                    </div>
                  </div>
                  <div className="property-actions flex justify-end gap-1.5 xs:gap-2 sm:gap-3">
                    <button 
                      className={`px-2 xs:px-3 sm:px-4 py-0.5 xs:py-1 ${buttonBg} ${textColor} rounded-full hover:${buttonHoverBg} hover:text-white transition-all text-[10px] xs:text-xs sm:text-sm`}
                      onClick={() => openViewModal(property)}
                    >
                      <EyeIcon size={14} className="inline-block mr-1" />
                      Voir
                    </button>
                    <button 
                      className={`px-2 xs:px-3 sm:px-4 py-0.5 xs:py-1 ${buttonBg} ${textColor} rounded-full hover:${buttonHoverBg} hover:text-white transition-all text-[10px] xs:text-xs sm:text-sm`}
                      onClick={() => openEditModal(property)}
                    >
                      <EditIcon size={14} className="inline-block mr-1" />
                      Modifier
                    </button>
                    <button 
                      className={`px-2 xs:px-3 sm:px-4 py-0.5 xs:py-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all text-[10px] xs:text-xs sm:text-sm`}
                      onClick={() => openDeleteModal(property)}
                    >
                      <TrashIcon size={14} className="inline-block mr-1" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

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

        {/* Le modal d'ajout a été supprimé et remplacé par une redirection vers la page PropertyRequest */}

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
                    disabled={isSubmitting}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeleteProperty}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white flex items-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Suppression...
                      </>
                    ) : (
                      <>
                        <TrashIcon size={16} className="mr-2" />
                        Supprimer
                      </>
                    )}
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
              <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => {
                setShowEditModal(false);
                setMediaToDelete([]); // Réinitialiser les médias à supprimer quand on ferme sans sauvegarder
                setImageError(null);
              }}></div>
              
              <div className={`relative w-full max-w-3xl p-6 rounded-lg shadow-lg ${modalBgColor} ${textPrimaryColor}`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Modifier la propriété</h2>
                  <button 
                    onClick={() => {
                      setShowEditModal(false);
                      setMediaToDelete([]); // Réinitialiser les médias à supprimer quand on annule
                      setImageError(null);
                    }}
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
                    <span className={`ml-3 text-sm ${textSecondaryColor}`}>
                      Maximum {MAX_IMAGES} images
                    </span>
                  </div>
                  
                  {imageError && (
                    <div className="mt-2 text-red-500 text-sm">
                      {imageError}
                    </div>
                  )}
                  
                  {/* Afficher les images existantes */}
                  {selectedProperty?.media && selectedProperty.media.filter(media => media.media_type === 'Photo').length > 0 && (
                    <div className="mt-3">
                      <h3 className={`text-sm font-medium ${textSecondaryColor} mb-2`}>
                        Images existantes 
                        ({selectedProperty.media.filter(media => media.media_type === 'Photo' && !mediaToDelete.includes(media.media_id)).length})
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {selectedProperty.media
                          .filter(media => media.media_type === 'Photo' && !mediaToDelete.includes(media.media_id))
                          .map((media) => (
                          <div key={media.media_id} className="relative group">
                            <img 
                              src={logMediaUrl(media.media_url)} 
                              alt={`Property ${selectedProperty.property_id}`} 
                              className="w-full h-24 object-cover rounded-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                console.log("Erreur de chargement d'image:", media.media_url);
                                target.src = '/img/default-property.jpg';
                                target.onerror = null; // Éviter les boucles infinies
                              }}
                            />
                            <button
                              onClick={() => removeExistingMedia(media.media_id)}
                              className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              type="button"
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
                      <h3 className={`text-sm font-medium ${textSecondaryColor} mb-2`}>
                        Nouvelles images ({mediaFiles.length})
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {mediaFiles.map((file, index) => (
                          <div key={`new-${index}`} className="relative group">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={`Preview ${index}`} 
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeFile(index)}
                              className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              type="button"
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
                    onClick={() => {
                      setShowEditModal(false);
                      setMediaToDelete([]); // Réinitialiser les médias à supprimer quand on annule
                      setImageError(null);
                    }}
                    className={`px-4 py-2 rounded-lg ${actionButtonBg} ${textSecondaryColor}`}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleEditProperty}
                    className={`px-4 py-2 rounded-lg ${buttonPrimaryBg} ${buttonPrimaryText} flex items-center`}
                    disabled={isSubmitting || !!imageError}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <CheckIcon size={16} className="mr-2" />
                        Enregistrer
                      </>
                    )}
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
                {selectedProperty.media && selectedProperty.media.filter(media => media.media_type === 'Photo').length > 0 ? (
                  <div className="mb-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {selectedProperty.media
                        .filter(media => media.media_type === 'Photo')
                        .map((media) => (
                        <div key={media.media_id} className="relative">
                          <img 
                            src={logMediaUrl(media.media_url)} 
                            alt={`Property ${selectedProperty.property_id}`} 
                            className="w-full h-32 object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              console.log("Erreur de chargement d'image:", media.media_url);
                              target.src = '/img/default-property.jpg';
                              target.onerror = null; // Éviter les boucles infinies
                            }}
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
      </div>
    </div>
  );
};

export default PropertyManagement;