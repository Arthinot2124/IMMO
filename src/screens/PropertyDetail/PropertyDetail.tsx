import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BellIcon, HomeIcon, SettingsIcon, HeartIcon, CalendarIcon, StarIcon, MessageSquareIcon, ShareIcon } from "lucide-react";

// Mock data - would come from an API in a real app
const propertyData = {
  id: 1,
  title: "Villa moderne à Tambohobe",
  price: "450 000 000 Ar",
  location: "Tambohobe, Fianarantsoa",
  description: "Belle villa moderne de 4 pièces située dans un quartier calme et résidentiel de Tambohobe. La maison comprend un salon spacieux, une cuisine équipée, 3 chambres dont une suite parentale, 2 salles de bain et un jardin bien entretenu. Parfait pour une famille cherchant confort et tranquillité.",
  features: ["4 pièces", "3 chambres", "2 salles de bain", "Jardin", "Garage"],
  images: [
    "/public_Trano/maison-01.png",
    "/public_Trano/calque-3.png",
    "/public_Trano/calque-4.png",
    "/public_Trano/calque-5.png"
  ],
  rating: 4.8,
  reviews: 12
};

export const PropertyDetail = (): JSX.Element => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const propertyId = propertyData.id;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-[#0f172a] min-h-screen"
    >
      <div className="max-w-[1440px] mx-auto px-4 xs:px-6 sm:px-8 md:px-12 lg:px-16 pt-4 xs:pt-6 sm:pt-8 md:pt-10 lg:pt-12">
        {/* Navigation Bar */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center py-2 xs:py-4 mb-6 sm:mb-8"
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
          <button 
            onClick={() => navigate('/trano')}
            className="bg-[#59e0c5] text-[#0f172a] px-3 py-1.5 rounded-lg hover:bg-[#59e0c5]/80 transition-colors text-sm"
          >
            Retour aux annonces
          </button>
        </motion.header>

        {/* Property Images Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 sm:mb-8"
        >
          <div className="relative bg-[#1e293b] rounded-2xl overflow-hidden h-[200px] xs:h-[250px] sm:h-[350px] md:h-[450px]">
            <img
              src={propertyData.images[selectedImage]}
              alt={propertyData.title}
              className="w-full h-full object-contain"
            />
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className="absolute top-4 right-4 bg-[#0f172a]/70 p-2 rounded-full"
            >
              <HeartIcon 
                className={`w-6 h-6 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-white'}`} 
              />
            </button>
          </div>
          
          {/* Thumbnail Gallery */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            {propertyData.images.map((image, index) => (
              <div 
                key={index}
                className={`w-16 h-16 xs:w-20 xs:h-20 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 ${selectedImage === index ? 'border-[#59e0c5]' : 'border-transparent'}`}
                onClick={() => setSelectedImage(index)}
              >
                <img 
                  src={image} 
                  alt={`Thumbnail ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Property Details Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#1E2B47] rounded-2xl p-5 sm:p-8 mb-6 sm:mb-8"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">{propertyData.title}</h1>
              <p className="text-[#59e0c5] text-lg sm:text-xl font-semibold">{propertyData.price}</p>
              <p className="text-gray-300 text-sm">{propertyData.location}</p>
            </div>
            <div className="flex items-center">
              <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
              <span className="text-white">{propertyData.rating} ({propertyData.reviews} avis)</span>
            </div>
          </div>
          
          <div className="border-t border-[#59e0c5]/30 my-4 pt-4">
            <h3 className="text-[#59e0c5] font-semibold mb-2">Description</h3>
            <p className="text-gray-300 text-sm">{propertyData.description}</p>
          </div>
          
          <div className="border-t border-[#59e0c5]/30 my-4 pt-4">
            <h3 className="text-[#59e0c5] font-semibold mb-2">Caractéristiques</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {propertyData.features.map((feature, index) => (
                <div key={index} className="flex items-center text-gray-300 text-sm">
                  <div className="w-2 h-2 bg-[#59e0c5] rounded-full mr-2"></div>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <button 
            className="flex items-center justify-center gap-2 bg-[#59e0c5] text-[#0f172a] font-bold py-3 rounded-lg hover:bg-[#59e0c5]/80 transition-colors"
            onClick={() => navigate(`/property/${propertyId}/book`)}
          >
            <CalendarIcon size={20} />
            <span>Réserver une visite</span>
          </button>
          
          <button className="flex items-center justify-center gap-2 bg-[#1E2B47] text-white font-bold py-3 rounded-lg hover:bg-[#1E2B47]/80 transition-colors">
            <MessageSquareIcon size={20} className="text-[#59e0c5]" />
            <span>Contacter l'agence</span>
          </button>
        </motion.div>

        {/* Share Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mb-12"
        >
          <button className="inline-flex items-center gap-2 text-[#59e0c5] hover:underline">
            <ShareIcon size={18} />
            <span>Partager cette annonce</span>
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PropertyDetail; 