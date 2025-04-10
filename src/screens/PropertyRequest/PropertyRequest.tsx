import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BellIcon, HomeIcon, SettingsIcon, UploadIcon, XIcon, PlusIcon } from "lucide-react";

export const PropertyRequest = (): JSX.Element => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyType: "villa", // default value
    price: "",
    location: "",
    numRooms: "",
    numBathrooms: "",
    surface: "",
    additionalDetails: ""
  });
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Create preview URLs
      const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
      
      setImages([...images, ...filesArray]);
      setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newPreviewUrls = [...previewUrls];
    
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    newImages.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    setImages(newImages);
    setPreviewUrls(newPreviewUrls);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically send the formData and images to your backend
    console.log("Form Data:", formData);
    console.log("Images:", images);
    
    // Show success message
    setSubmitSuccess(true);
    
    // Reset form after 3 seconds and redirect
    setTimeout(() => {
      setSubmitSuccess(false);
      navigate('/home');
    }, 3000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-[#0f172a] min-h-screen"
    >
      <div className="max-w-[1440px] mx-auto px-4 xs:px-6 sm:px-8 md:px-12 lg:px-16 pt-4 xs:pt-6 sm:pt-8 md:pt-10 lg:pt-12 pb-16">
        {/* Navigation Bar */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center py-2 xs:py-4 mb-8 xs:mb-10"
        >
          <div className="flex gap-2 xs:gap-4">
            <HomeIcon 
              className="w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-[#59e0c5] cursor-pointer hover:text-[#59e0c5]/80 transition-colors" 
              onClick={() => navigate('/home')}
            />
            <BellIcon 
              className="w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-[#59e0c5] cursor-pointer hover:text-[#59e0c5]/80 transition-colors"
              onClick={() => navigate('/notifications')}
            />
            <SettingsIcon className="w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-[#59e0c5]" />
          </div>
        </motion.header>

        {/* Main Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#1E2B47] rounded-2xl p-5 sm:p-8 mb-6"
        >
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6">
            Soumettre votre bien immobilier
          </h1>
          
          {submitSuccess ? (
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-6">
              <p className="text-white text-center">
                Votre demande a été soumise avec succès! L'agence vous contactera bientôt.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm text-[#59e0c5] mb-1">
                    Titre de l'annonce*
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full bg-[#0f172a] border border-[#59e0c5] rounded-lg px-4 py-2 text-white"
                    placeholder="Ex: Villa moderne à Tambohobe"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="propertyType" className="block text-sm text-[#59e0c5] mb-1">
                    Type de bien*
                  </label>
                  <select
                    id="propertyType"
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    className="w-full bg-[#0f172a] border border-[#59e0c5] rounded-lg px-4 py-2 text-white"
                    required
                  >
                    <option value="villa">Villa</option>
                    <option value="apartment">Appartement</option>
                    <option value="house">Maison</option>
                    <option value="land">Terrain</option>
                    <option value="commercial">Local commercial</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="price" className="block text-sm text-[#59e0c5] mb-1">
                    Prix*
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="text"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full bg-[#0f172a] border border-[#59e0c5] rounded-lg px-4 py-2 text-white"
                    placeholder="Ex: 450 000 000 Ar"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm text-[#59e0c5] mb-1">
                    Emplacement*
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full bg-[#0f172a] border border-[#59e0c5] rounded-lg px-4 py-2 text-white"
                    placeholder="Ex: Tambohobe, Fianarantsoa"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="numRooms" className="block text-sm text-[#59e0c5] mb-1">
                    Nombre de pièces
                  </label>
                  <input
                    id="numRooms"
                    name="numRooms"
                    type="number"
                    value={formData.numRooms}
                    onChange={handleInputChange}
                    className="w-full bg-[#0f172a] border border-[#59e0c5] rounded-lg px-4 py-2 text-white"
                    placeholder="Ex: 4"
                  />
                </div>
                
                <div>
                  <label htmlFor="numBathrooms" className="block text-sm text-[#59e0c5] mb-1">
                    Nombre de salles de bain
                  </label>
                  <input
                    id="numBathrooms"
                    name="numBathrooms"
                    type="number"
                    value={formData.numBathrooms}
                    onChange={handleInputChange}
                    className="w-full bg-[#0f172a] border border-[#59e0c5] rounded-lg px-4 py-2 text-white"
                    placeholder="Ex: 2"
                  />
                </div>
                
                <div>
                  <label htmlFor="surface" className="block text-sm text-[#59e0c5] mb-1">
                    Surface (m²)
                  </label>
                  <input
                    id="surface"
                    name="surface"
                    type="text"
                    value={formData.surface}
                    onChange={handleInputChange}
                    className="w-full bg-[#0f172a] border border-[#59e0c5] rounded-lg px-4 py-2 text-white"
                    placeholder="Ex: 120"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm text-[#59e0c5] mb-1">
                  Description détaillée*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-[#0f172a] border border-[#59e0c5] rounded-lg px-4 py-2 text-white min-h-[120px]"
                  placeholder="Décrivez votre bien immobilier en détail..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-[#59e0c5] mb-3">
                  Photos du bien (maximum 6)
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative h-24 sm:h-32 bg-[#0f172a] rounded-lg overflow-hidden">
                      <img 
                        src={url} 
                        alt={`Preview ${index}`} 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-[#0f172a]/70 p-1 rounded-full"
                      >
                        <XIcon className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                  
                  {previewUrls.length < 6 && (
                    <label className="h-24 sm:h-32 border-2 border-dashed border-[#59e0c5] rounded-lg flex flex-col items-center justify-center cursor-pointer bg-[#0f172a]">
                      <PlusIcon className="w-8 h-8 text-[#59e0c5] mb-1" />
                      <span className="text-xs text-[#59e0c5]">Ajouter</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="additionalDetails" className="block text-sm text-[#59e0c5] mb-1">
                  Détails supplémentaires
                </label>
                <textarea
                  id="additionalDetails"
                  name="additionalDetails"
                  value={formData.additionalDetails}
                  onChange={handleInputChange}
                  className="w-full bg-[#0f172a] border border-[#59e0c5] rounded-lg px-4 py-2 text-white min-h-[80px]"
                  placeholder="Autres informations importantes..."
                />
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-[#59e0c5] text-[#0f172a] font-bold py-3 rounded-lg hover:bg-[#59e0c5]/80 transition-colors flex items-center justify-center gap-2"
                >
                  <UploadIcon size={20} />
                  <span>Soumettre ma demande</span>
                </button>
              </div>
            </form>
          )}
          
          <p className="text-gray-400 text-xs mt-4">
            * Champs obligatoires. En soumettant ce formulaire, vous acceptez que l'agence vous contacte pour discuter de votre demande.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PropertyRequest; 