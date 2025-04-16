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
    <div className="bg-[#0f172a] min-h-screen text-white">
      <div className="max-w-[1440px] mx-auto px-4 py-6">
        {/* En-tête */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 rounded-full bg-[#1e293b] text-[#59e0c5] mr-4"
          >
            <ArrowLeftIcon size={20} />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-[#59e0c5]">
            Validation de la demande de propriété
          </h1>
        </div>
        
        {/* Message de succès avec détails de la propriété créée */}
        {success && createdProperty && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-300 p-6 rounded-lg mb-6">
            <div className="flex items-center mb-3">
              <CheckCircleIcon size={24} className="mr-3" /> 
              <h3 className="text-xl font-bold">Propriété créée avec succès!</h3>
            </div>
            
            <p className="mb-4">La propriété a été créée dans la base de données et la demande a été marquée comme "Acceptée".</p>
            
            <div className="bg-[#0f172a] p-4 rounded-lg mb-4">
              <h4 className="text-[#59e0c5] mb-2 font-medium">Détails de la propriété créée :</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-2">
                <div>
                  <span className="text-gray-400">ID Propriété:</span> {createdProperty.property_id}
                </div>
                <div>
                  <span className="text-gray-400">Titre:</span> {createdProperty.title}
                </div>
                <div>
                  <span className="text-gray-400">Prix:</span> {createdProperty.price}
                </div>
                <div>
                  <span className="text-gray-400">Surface:</span> {createdProperty.surface || "Non spécifiée"}
                </div>
                <div>
                  <span className="text-gray-400">Emplacement:</span> {createdProperty.location || "Non spécifié"}
                </div>
                <div>
                  <span className="text-gray-400">Catégorie:</span> {createdProperty.category}
                </div>
                <div>
                  <span className="text-gray-400">Statut:</span> {createdProperty.status}
                </div>
                <div>
                  <span className="text-gray-400">Créée le:</span> {new Date(createdProperty.created_at).toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-gray-400">Description:</span>
                <p className="mt-1 text-sm">{createdProperty.description || "Aucune description fournie"}</p>
              </div>
            </div>
            
            <p className="text-sm">Redirection vers le tableau de bord dans quelques secondes...</p>
          </div>
        )}
        
        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg mb-6">
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
            <div className="bg-[#1e293b] rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-[#59e0c5] mb-4 flex items-center">
                <AlertTriangleIcon size={24} className="mr-2" />
                Confirmer la création
              </h3>
              
              <p className="mb-4">Vous êtes sur le point de créer une nouvelle propriété avec les détails suivants :</p>
              
              <div className="bg-[#0f172a] p-4 rounded-lg mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-2">
                  <div>
                    <span className="text-gray-400">Titre:</span> {formData.title}
                  </div>
                  <div>
                    <span className="text-gray-400">Prix:</span> {formData.price}
                  </div>
                  <div>
                    <span className="text-gray-400">Surface:</span> {formData.surface || "Non spécifiée"}
                  </div>
                  <div>
                    <span className="text-gray-400">Emplacement:</span> {formData.location || "Non spécifié"}
                  </div>
                  <div>
                    <span className="text-gray-400">Catégorie:</span> {formData.category}
                  </div>
                  <div>
                    <span className="text-gray-400">Statut:</span> {formData.status}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Description:</span>
                  <p className="mt-1 text-sm">{formData.description || "Aucune description fournie"}</p>
                </div>
                
                {/* Afficher les images dans la confirmation */}
                {requestImages.length > 0 && (
                  <div className="mt-4">
                    <span className="text-gray-400 flex items-center">
                      <ImageIcon size={14} className="mr-1" />
                      Photos ({requestImages.length}):
                    </span>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {requestImages.map((image) => (
                        <div key={image.media_id} className="h-20 bg-black/40 rounded overflow-hidden">
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
                  className="px-4 py-2 border border-[#59e0c5] text-[#59e0c5] rounded-lg"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-[#59e0c5] text-[#0f172a] rounded-lg font-medium"
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#59e0c5] mb-4"></div>
            <p className="text-gray-400">Chargement des détails de la demande...</p>
          </div>
        ) : request ? (
          <>
            {/* Notice informative */}
            <div className="bg-blue-500/20 border border-blue-500/50 text-blue-300 p-4 rounded-lg mb-6 flex items-start">
              <InfoIcon size={20} className="mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">À propos de cette page</p>
                <p className="text-sm">Cette page vous permet de créer une nouvelle propriété à partir d'une demande client. Les informations de la demande originale sont affichées ci-dessous, et vous pouvez les modifier si nécessaire avant de créer la propriété.</p>
              </div>
            </div>
          
            {/* Détails de la demande */}
            <div className="bg-[#1e293b] rounded-lg p-5 mb-6">
              <h2 className="text-lg font-semibold mb-3 text-[#59e0c5]">
                Informations de la demande originale
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-400">Demande #</p>
                  <p className="text-white">{request.request_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Soumis par</p>
                  <p className="text-white">{request.user?.full_name || `Utilisateur ${request.user_id}`}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Date de soumission</p>
                  <p className="text-white">{new Date(request.submitted_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Statut</p>
                  <p className={`${
                    request.status === "En attente" ? "text-yellow-300" :
                    request.status === "Accepté" ? "text-green-300" :
                    "text-red-300"
                  }`}>
                    {request.status}
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-1">Détails supplémentaires fournis</p>
                <div className="bg-[#0f172a] p-3 rounded">
                  <p className="text-gray-300 text-sm whitespace-pre-line">
                    {request.additional_details || "Aucun détail supplémentaire fourni."}
                  </p>
                </div>
              </div>
              
              {/* Images de la demande */}
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2 flex items-center">
                  <ImageIcon size={16} className="mr-1" />
                  Photos soumises ({loadingImages ? "chargement..." : requestImages.length})
                </p>
                
                {loadingImages ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#59e0c5]"></div>
                  </div>
                ) : requestImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {requestImages.map((image) => (
                      <div key={image.media_id} className="relative h-32 bg-[#0f172a] rounded-lg overflow-hidden">
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
                  <div className="bg-[#0f172a] p-3 rounded text-center">
                    <p className="text-gray-400 text-sm">Aucune image soumise avec cette demande.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Formulaire de création de propriété */}
            <form onSubmit={handleShowConfirmation} className="bg-[#1e293b] rounded-lg p-5">
              <h2 className="text-lg font-semibold mb-4 text-[#59e0c5] flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Vérifier et Confirmer la nouvelle propriété
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm text-[#59e0c5] mb-1">
                      Titre*
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full bg-[#0f172a] border border-[#59e0c5] rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="price" className="block text-sm text-[#59e0c5] mb-1">
                      Prix*
                    </label>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full bg-[#0f172a] border border-[#59e0c5] rounded-lg px-4 py-2 text-white"
                      placeholder="Ex: 450000000"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="surface" className="block text-sm text-[#59e0c5] mb-1">
                      Surface (m²)
                    </label>
                    <input
                      id="surface"
                      name="surface"
                      type="number"
                      min="0"
                      value={formData.surface}
                      onChange={handleInputChange}
                      className="w-full bg-[#0f172a] border border-[#59e0c5] rounded-lg px-4 py-2 text-white"
                      placeholder="Ex: 120"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="location" className="block text-sm text-[#59e0c5] mb-1">
                      Emplacement
                    </label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full bg-[#0f172a] border border-[#59e0c5] rounded-lg px-4 py-2 text-white"
                      placeholder="Ex: Tambohobe, Fianarantsoa"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm text-[#59e0c5] mb-1">
                      Catégorie*
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full bg-[#0f172a] border border-[#59e0c5] rounded-lg px-4 py-2 text-white"
                      required
                    >
                      <option value="LITE">LITE</option>
                      <option value="ESSENTIEL">ESSENTIEL</option>
                      <option value="PREMIUM">PREMIUM</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm text-[#59e0c5] mb-1">
                      Statut*
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full bg-[#0f172a] border border-[#59e0c5] rounded-lg px-4 py-2 text-white"
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
                  <label htmlFor="description" className="block text-sm text-[#59e0c5] mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full bg-[#0f172a] border border-[#59e0c5] rounded-lg px-4 py-2 text-white min-h-[120px]"
                    placeholder="Décrivez le bien immobilier..."
                  />
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/dashboard')}
                    className="px-6 py-2 mr-3 border border-[#59e0c5] text-[#59e0c5] rounded-lg font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#59e0c5] text-[#0f172a] rounded-lg font-medium hover:bg-[#59e0c5]/80"
                  >
                    Vérifier et confirmer
                  </button>
                </div>
              </div>
            </form>
          </>
        ) : (
          <div className="bg-yellow-500/20 text-yellow-300 p-4 rounded-lg">
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