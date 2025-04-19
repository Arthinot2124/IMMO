import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, CheckCircleIcon, RefreshCwIcon, AlertTriangleIcon, InfoIcon, ImageIcon, FileIcon } from "lucide-react";
import apiService from "../../services/apiService";
import { getMediaUrl } from "../../config/api";

// Type de la demande de propriété
interface PropertyRequest {
  request_id: number;
  user_id: number;
  title: string;
  description: string;
  price: number | null;
  surface: number | null;
  location: string;
  category: string;
  property_status: string;
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

// Type pour la propriété créée
interface CreatedProperty {
  property_id: number;
  user_id: number;
  title: string;
  description: string;
  price: string;
  surface: string | null;
  location: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Type pour les médias
interface PropertyRequestMedia {
  media_id: number;
  request_id: number;
  media_type: string;
  media_url: string;
  uploaded_at: string;
}

// Type pour les réponses API
interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export const PropertyRequestApproval = (): JSX.Element => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [request, setRequest] = useState<PropertyRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdProperty, setCreatedProperty] = useState<CreatedProperty | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [requestImages, setRequestImages] = useState<PropertyRequestMedia[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});
  const [isLightMode, setIsLightMode] = useState(() => {
    const savedMode = localStorage.getItem('isLightMode');
    return savedMode !== null ? savedMode === 'true' : false;
  });

  // Couleurs qui changent en fonction du mode
  const accentColor = isLightMode ? "#0150BC" : "#59e0c5";
  const bgColor = isLightMode ? "bg-white" : "bg-[#0f172a]";
  const cardBgColor = isLightMode ? "bg-[#F8FAFC]" : "bg-[#1e293b]";
  const textColor = isLightMode ? "text-[#0150BC]" : "text-[#59e0c5]";
  const textPrimaryColor = isLightMode ? "text-[#1E293B]" : "text-white";
  const textSecondaryColor = isLightMode ? "text-gray-700" : "text-gray-300";
  const buttonPrimaryBg = isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]";
  const buttonPrimaryText = isLightMode ? "text-white" : "text-[#0f172a]";
  const buttonSecondaryBg = isLightMode ? "bg-[#EFF6FF]" : "bg-[#1e293b]";
  const buttonSecondaryText = isLightMode ? "text-[#0150BC]" : "text-white";
  const borderColor = isLightMode ? "border-[#0150BC]" : "border-[#59e0c5]";
  const cardBorder = isLightMode ? "border border-[#0150BC]/30" : "border border-[#59e0c5]/30";
  const inputBgColor = isLightMode ? "bg-white" : "bg-[#0f172a]";
  const inputBorderColor = isLightMode ? "border-[#0150BC]/30" : "border-[#59e0c5]/30";

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

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    surface: "",
    location: "",
    category: "LITE",
    status: "Disponible"
  });

  // Charger les détails de la demande
  useEffect(() => {
    const fetchPropertyRequest = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      console.log(`Tentative de chargement de la demande #${id}...`);
      
      try {
        const response = await apiService.get<ApiResponse<PropertyRequest>>(`/property-requests/${id}`);
        
        if (response.data && response.data.status === "success" && response.data.data) {
          const requestData = response.data.data;
          console.log("Données de la demande:", requestData);
          setRequest(requestData);
          
          // Utiliser directement les valeurs de la demande
          setFormData({
            title: requestData.title || "",
            description: requestData.description || "",
            price: requestData.price ? requestData.price.toString() : "",
            surface: requestData.surface ? requestData.surface.toString() : "",
            location: requestData.location || "",
            category: requestData.category || "LITE",
            status: requestData.property_status || "Disponible"
          });
        } else {
          throw new Error("Format de réponse inattendu");
        }
      } catch (err: any) {
        console.error("Erreur lors du chargement de la demande:", err);
        setError(`Impossible de charger les détails: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPropertyRequest();
  }, [id]);

  // Charger les images de la demande
  useEffect(() => {
    const fetchRequestImages = async () => {
      if (!id) return;
      
      setLoadingImages(true);
      
      try {
        const response = await apiService.get<ApiResponse<PropertyRequestMedia[]>>(`/property-requests/${id}/media`);
        
        if (response.data && response.data.status === "success" && Array.isArray(response.data.data)) {
          setRequestImages(response.data.data);
        }
      } catch (err: any) {
        console.error("Erreur lors du chargement des images:", err);
        // We don't set an error since images are optional
      } finally {
        setLoadingImages(false);
      }
    };
    
    if (request) {
      fetchRequestImages();
    }
  }, [id, request]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Montrer la confirmation avant de soumettre
  const handleShowConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  // Annuler la confirmation
  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleSubmit = async () => {
    if (!request) {
      setError("Aucune demande chargée");
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Créer la propriété en utilisant les données de la demande et du formulaire
      const propertyData = {
        user_id: request.user_id, // Conserver l'ID original de l'utilisateur qui a fait la demande
        title: formData.title || request.title,
        description: formData.description || request.description,
        price: parseFloat(formData.price) || request.price || 100000,
        surface: formData.surface ? parseFloat(formData.surface) : (request.surface || 100),
        location: formData.location || request.location || "Emplacement non spécifié",
        category: formData.category || request.category || "LITE",
        status: formData.status || request.property_status || "Disponible"
      };
      
      console.log("Envoi des données vers l'API:", propertyData);
      
      // Créer la propriété
      const response = await apiService.post<ApiResponse<CreatedProperty>>('/properties', propertyData);
      
      if (response.data.status === "success" && response.data.data && response.data.data.property_id) {
        // Stocker la propriété créée
        setCreatedProperty(response.data.data);
        
        // Transfer images from property request to the new property
        if (requestImages.length > 0) {
          try {
            // Use the dedicated endpoint to copy media from property request to property
            await apiService.post<ApiResponse<any>>(`/properties/${response.data.data.property_id}/copy-media-from-request`, 
              { request_id: request.request_id }
            );
            
            console.log("Images transférées avec succès");
          } catch (imageErr) {
            console.error("Erreur lors du transfert des images:", imageErr);
            // We continue even if there's an error with images
          }
        }
        
        // Mettre à jour le statut de la demande à "Accepté"
        await apiService.put<ApiResponse<any>>(`/property-requests/${request.request_id}`, 
          { status: 'Accepté' }
        );
        
        // Propriété créée avec succès
        setSuccess(true);
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 5000); // Donner plus de temps pour voir le résultat
      } else {
        throw new Error("Format de réponse inattendu lors de la création de propriété");
      }
    } catch (err: any) {
      console.error("Erreur lors de la création de propriété:", err);
      setError(err.message || "Une erreur est survenue lors de la création");
    } finally {
      setSubmitting(false);
      setShowConfirmation(false);
    }
  };

  // Helper function to handle image load errors
  const handleImageError = (imageId: number) => {
    setImageErrors(prev => ({
      ...prev,
      [imageId]: true
    }));
    console.error(`Failed to load image with ID: ${imageId}`);
  };

  // Helper function to get image URL with fallbacks
  const getImageUrl = (image: PropertyRequestMedia) => {
    return getMediaUrl(image.media_url);
  };

  return (
    <div className={`${bgColor} min-h-screen ${textPrimaryColor}`}>
      <div 
        className="fixed inset-0 opacity-50 z-0" 
        style={{ 
          backgroundImage: `url(${isLightMode ? '/public_Accueil_Sombre/blie-pattern2.jpeg' : '/public_Accueil_Sombre/blie-pattern.png'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'fixed',
          transition: 'background-image 0.5s ease-in-out'
        }}
      ></div>
      <div className="max-w-[1440px] mx-auto px-4 py-6 relative z-10">
        {/* En-tête */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className={`p-2 rounded-full ${cardBgColor} ${textColor} mr-4`}
          >
            <ArrowLeftIcon size={20} />
          </button>
          <h1 className={`text-xl sm:text-2xl font-bold ${textColor}`}>
            Validation de la demande de propriété
          </h1>
        </div>
        
        {/* Message de succès avec détails de la propriété créée */}
        {success && createdProperty && (
          <div className={`${isLightMode ? "bg-green-100 border-green-500" : "bg-green-500/20 border-green-500/50"} border rounded-lg p-6 mb-6 ${isLightMode ? "text-green-700" : "text-green-300"}`}>
            <div className="flex items-center mb-3">
              <CheckCircleIcon size={24} className="mr-3" /> 
              <h3 className="text-xl font-bold">Propriété créée avec succès!</h3>
            </div>
            
            <p className="mb-4">La propriété a été créée dans la base de données et la demande a été marquée comme "Acceptée".</p>
            
            <div className={`${cardBgColor} p-4 rounded-lg mb-4 ${cardBorder}`}>
              <h4 className={`${textColor} mb-2 font-medium`}>Détails de la propriété créée :</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-2">
                <div>
                  <span className={textSecondaryColor}>ID Propriété:</span> {createdProperty.property_id}
                </div>
                <div>
                  <span className={textSecondaryColor}>Titre:</span> {createdProperty.title}
                </div>
                <div>
                  <span className={textSecondaryColor}>Prix:</span> {createdProperty.price}
                </div>
                <div>
                  <span className={textSecondaryColor}>Surface:</span> {createdProperty.surface || "Non spécifiée"}
                </div>
                <div>
                  <span className={textSecondaryColor}>Emplacement:</span> {createdProperty.location || "Non spécifié"}
                </div>
                <div>
                  <span className={textSecondaryColor}>Catégorie:</span> {createdProperty.category}
                </div>
                <div>
                  <span className={textSecondaryColor}>Statut:</span> {createdProperty.status}
                </div>
                <div>
                  <span className={textSecondaryColor}>Créée le:</span> {(() => {
                    const date = new Date(createdProperty.created_at);
                    date.setHours(date.getHours() - 3);
                    return date.toLocaleString('fr-FR');
                  })()}
                </div>
              </div>
              <div>
                <span className={textSecondaryColor}>Description:</span>
                <p className="mt-1 text-sm">{createdProperty.description || "Aucune description fournie"}</p>
              </div>
            </div>
            
            <p className="text-sm">Redirection vers le tableau de bord dans quelques secondes...</p>
          </div>
        )}
        
        {/* Message d'erreur */}
        {error && (
          <div className={`${isLightMode ? "bg-red-100 border-red-500" : "bg-red-500/20 border-red-500/50"} border rounded-lg p-4 mb-6 ${isLightMode ? "text-red-700" : "text-red-300"}`}>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 flex items-center text-sm hover:underline"
            >
              <RefreshCwIcon size={14} className="mr-1" /> Réessayer
            </button>
          </div>
        )}
        
        {/* Modal de confirmation */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
            <div className={`${cardBgColor} rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto ${cardBorder}`}>
              <h3 className={`text-xl font-bold ${textColor} mb-4 flex items-center`}>
                <AlertTriangleIcon size={24} className="mr-2" />
                Confirmer la création
              </h3>
              
              <p className="mb-4">Vous êtes sur le point de créer une nouvelle propriété avec les détails suivants :</p>
              
              <div className={`${inputBgColor} p-4 rounded-lg mb-4 ${cardBorder}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-2">
                  <div>
                    <span className={textSecondaryColor}>Titre:</span> {formData.title}
                  </div>
                  <div>
                    <span className={textSecondaryColor}>Prix:</span> {formData.price}
                  </div>
                  <div>
                    <span className={textSecondaryColor}>Surface:</span> {formData.surface || "Non spécifiée"}
                  </div>
                  <div>
                    <span className={textSecondaryColor}>Emplacement:</span> {formData.location || "Non spécifié"}
                  </div>
                  <div>
                    <span className={textSecondaryColor}>Catégorie:</span> {formData.category}
                  </div>
                  <div>
                    <span className={textSecondaryColor}>Statut:</span> {formData.status}
                  </div>
                </div>
                <div>
                  <span className={textSecondaryColor}>Description:</span>
                  <p className="mt-1 text-sm">{formData.description || "Aucune description fournie"}</p>
                </div>
                
                {/* Afficher les images dans la confirmation */}
                {requestImages.length > 0 && (
                  <div className="mt-4">
                    <span className={`${textSecondaryColor} flex items-center`}>
                      <ImageIcon size={14} className="mr-1" />
                      Photos ({requestImages.length}):
                    </span>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {requestImages.map((image) => (
                        <div key={image.media_id} className={`h-20 ${isLightMode ? "bg-gray-100" : "bg-black/40"} rounded overflow-hidden`}>
                          {imageErrors[image.media_id] ? (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                              <FileIcon size={16} />
                              <p className="text-[10px] mt-1">Image non disponible</p>
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
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={handleCancelConfirmation}
                  className={`px-4 py-2 border ${borderColor} ${textColor} rounded-lg`}
                >
                  Annuler
                </button>
                <button 
                  onClick={handleSubmit}
                  className={`px-4 py-2 ${buttonPrimaryBg} ${buttonPrimaryText} rounded-lg font-medium`}
                  disabled={submitting}
                >
                  {submitting ? 'Traitement...' : 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Contenu principal */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${borderColor} mb-4`}></div>
            <p className={textSecondaryColor}>Chargement des détails de la demande...</p>
          </div>
        ) : request ? (
          <>
            {/* Détails de la demande */}
            <div className={`${cardBgColor} rounded-lg p-5 mb-6 ${cardBorder}`}>
              <h2 className={`text-lg font-semibold mb-3 ${textColor}`}>
                Informations de la demande originale
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-400">Demande #</p>
                  <p className={textPrimaryColor}>{request.request_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Soumis par</p>
                  <p className={textPrimaryColor}>{request.user?.full_name || `Utilisateur ${request.user_id}`}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Date de soumission</p>
                  <p className="text-white">{new Date(request.submitted_at).toLocaleString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Statut</p>
                  <p className={`${
                    request.status === "En attente" ? (isLightMode ? "text-yellow-600" : "text-yellow-300") :
                    request.status === "Accepté" ? (isLightMode ? "text-green-600" : "text-green-300") :
                    (isLightMode ? "text-red-600" : "text-red-300")
                  }`}>
                    {request.status}
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-1">Détails supplémentaires fournis</p>
                <div className={`${inputBgColor} p-3 rounded ${cardBorder}`}>
                  <p className={`${textSecondaryColor} text-sm whitespace-pre-line`}>
                    {request.additional_details || "Aucun détail supplémentaire fourni."}
                  </p>
                </div>
              </div>
              
              {/* Images de la demande */}
              <div className="mb-4">
                <p className={`text-sm ${textSecondaryColor} mb-2 flex items-center`}>
                  <ImageIcon size={16} className="mr-1" />
                  Photos soumises ({loadingImages ? "chargement..." : requestImages.length})
                </p>
                
                {loadingImages ? (
                  <div className="flex justify-center py-4">
                    <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${borderColor}`}></div>
                  </div>
                ) : requestImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {requestImages.map((image) => (
                      <div key={image.media_id} className={`relative h-32 ${inputBgColor} rounded-lg overflow-hidden ${cardBorder}`}>
                        {imageErrors[image.media_id] ? (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                            <FileIcon size={32} />
                            <p className="text-xs mt-2">Image non disponible</p>
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
                  </div>
                ) : (
                  <div className={`${inputBgColor} p-3 rounded text-center ${cardBorder}`}>
                    <p className={`${textSecondaryColor} text-sm`}>Aucune image soumise avec cette demande.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Formulaire de création de propriété */}
            <form onSubmit={handleShowConfirmation} className={`${cardBgColor} rounded-lg p-5 ${cardBorder}`}>
              <h2 className={`text-lg font-semibold mb-4 ${textColor} flex items-center`}>
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Vérifier et Confirmer la nouvelle propriété
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <label htmlFor="title" className={`block text-sm ${textColor} mb-1`}>
                      Titre*
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full ${inputBgColor} border ${inputBorderColor} rounded-lg px-4 py-2 ${textPrimaryColor}`}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="price" className={`block text-sm ${textColor} mb-1`}>
                      Prix*
                    </label>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      className={`w-full ${inputBgColor} border ${inputBorderColor} rounded-lg px-4 py-2 ${textPrimaryColor}`}
                      placeholder="Ex: 450000000"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="surface" className={`block text-sm ${textColor} mb-1`}>
                      Surface (m²)
                    </label>
                    <input
                      id="surface"
                      name="surface"
                      type="number"
                      min="0"
                      value={formData.surface}
                      onChange={handleInputChange}
                      className={`w-full ${inputBgColor} border ${inputBorderColor} rounded-lg px-4 py-2 ${textPrimaryColor}`}
                      placeholder="Ex: 120"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="location" className={`block text-sm ${textColor} mb-1`}>
                      Emplacement
                    </label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`w-full ${inputBgColor} border ${inputBorderColor} rounded-lg px-4 py-2 ${textPrimaryColor}`}
                      placeholder="Ex: Tambohobe, Fianarantsoa"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="category" className={`block text-sm ${textColor} mb-1`}>
                      Catégorie*
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full ${inputBgColor} border ${inputBorderColor} rounded-lg px-4 py-2 ${textPrimaryColor}`}
                      required
                    >
                      <option value="LITE">LITE</option>
                      <option value="ESSENTIEL">ESSENTIEL</option>
                      <option value="PREMIUM">PREMIUM</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="status" className={`block text-sm ${textColor} mb-1`}>
                      Statut*
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className={`w-full ${inputBgColor} border ${inputBorderColor} rounded-lg px-4 py-2 ${textPrimaryColor}`}
                      required
                    >
                      <option value="Disponible">Disponible</option>
                      <option value="Réservé">Réservé</option>
                      <option value="Vendu">Vendu</option>
                      <option value="Loué">Loué</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className={`block text-sm ${textColor} mb-1`}>
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`w-full ${inputBgColor} border ${inputBorderColor} rounded-lg px-4 py-2 ${textPrimaryColor} min-h-[120px]`}
                    placeholder="Décrivez le bien immobilier..."
                  />
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/dashboard')}
                    className={`px-6 py-2 mr-3 border ${borderColor} ${textColor} rounded-lg font-medium`}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className={`px-6 py-2 ${buttonPrimaryBg} ${buttonPrimaryText} rounded-lg font-medium hover:opacity-90`}
                  >
                    Vérifier et confirmer
                  </button>
                </div>
              </div>
            </form>
          </>
        ) : (
          <div className={`${isLightMode ? "bg-yellow-100 border-yellow-500" : "bg-yellow-500/20 border-yellow-500/50"} border rounded-lg p-4 ${isLightMode ? "text-yellow-700" : "text-yellow-300"}`}>
            <p>Demande non trouvée. Veuillez vérifier l'identifiant de la demande.</p>
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="mt-2 flex items-center text-sm hover:underline"
            >
              <ArrowLeftIcon size={14} className="mr-1" /> Retour au tableau de bord
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyRequestApproval; 