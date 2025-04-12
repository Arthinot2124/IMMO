import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HomeIcon, SettingsIcon, HeartIcon, TrashIcon, AlertCircleIcon } from "lucide-react";
import NotificationBadge from "../../components/NotificationBadge";

// Mock data for favorites
const mockFavorites = [
  { 
    id: 1, 
    title: "Villa moderne à Tambohobe", 
    price: "450 000 000 Ar", 
    location: "Tambohobe, Fianarantsoa", 
    bedrooms: 3, 
    bathrooms: 2, 
    surface: "200m²", 
    image: "/public_Trano/maison-01.png",
    rating: 4.8
  },
  { 
    id: 2, 
    title: "Appartement F3 Antarandolo", 
    price: "250 000 000 Ar", 
    location: "Antarandolo, Fianarantsoa", 
    bedrooms: 2, 
    bathrooms: 1, 
    surface: "90m²", 
    image: "/public_Trano/calque-3.png",
    rating: 4.2
  },
  { 
    id: 3, 
    title: "Terrain 500m² Isada", 
    price: "80 000 000 Ar", 
    location: "Isada, Fianarantsoa", 
    bedrooms: null, 
    bathrooms: null, 
    surface: "500m²", 
    image: "/public_Trano/calque-4.png",
    rating: 4.5
  }
];

export const Favorites = (): JSX.Element => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState(mockFavorites);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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

  const removeFavorite = (id: number) => {
    setFavorites(favorites.filter(fav => fav.id !== id));
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
            <NotificationBadge size="lg" />
            <SettingsIcon 
              className="w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-[#59e0c5] cursor-pointer hover:text-[#59e0c5]/80 transition-colors"
              onClick={() => navigate('/profile')}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md ${viewMode === "grid" ? "bg-[#59e0c5] text-[#0f172a]" : "bg-[#1E2B47] text-[#59e0c5]"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md ${viewMode === "list" ? "bg-[#59e0c5] text-[#0f172a]" : "bg-[#1E2B47] text-[#59e0c5]"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </button>
          </div>
        </motion.header>

        {/* Favorites Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <HeartIcon className="w-6 h-6 text-red-400 fill-red-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">Mes favoris</h1>
          </div>
          <p className="text-gray-400">Retrouvez ici tous les biens immobiliers que vous avez ajoutés à vos favoris.</p>
        </motion.div>

        {/* Favorites List */}
        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#1E2B47] rounded-2xl p-6 sm:p-10 text-center"
          >
            <HeartIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Vous n'avez pas de favoris</h2>
            <p className="text-gray-400 mb-6">Parcourez nos propriétés et ajoutez-les à vos favoris pour les retrouver ici.</p>
            <button
              onClick={() => navigate('/trano')}
              className="bg-[#59e0c5] text-[#0f172a] px-6 py-3 rounded-lg font-bold hover:bg-[#59e0c5]/80 transition-colors"
            >
              Parcourir les propriétés
            </button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}
          >
            {favorites.map((favorite) => (
              <motion.div
                key={favorite.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className={`bg-[#1E2B47] rounded-lg overflow-hidden ${viewMode === "list" ? "flex" : ""}`}
              >
                <div 
                  className={`${viewMode === "grid" ? "h-48" : "w-[120px] flex-shrink-0"} relative`}
                  onClick={() => navigate(`/property/${favorite.id}`)}
                >
                  <img
                    src={favorite.image}
                    alt={favorite.title}
                    className="w-full h-full object-cover cursor-pointer"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavorite(favorite.id);
                    }}
                    className="absolute top-2 right-2 p-2 rounded-full bg-[#0f172a]/70 hover:bg-[#0f172a]"
                  >
                    <TrashIcon className="w-4 h-4 text-red-400" />
                  </button>
                </div>
                <div className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                  <div className="flex justify-between items-start">
                    <h3 
                      className="text-[#59e0c5] font-semibold mb-1 hover:underline cursor-pointer"
                      onClick={() => navigate(`/property/${favorite.id}`)}
                    >
                      {favorite.title}
                    </h3>
                    <div className="flex items-center">
                      <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-gray-300 text-xs">{favorite.rating}</span>
                    </div>
                  </div>
                  <p className="text-white font-medium mb-2">{favorite.price}</p>
                  <p className="text-gray-400 text-sm mb-3">{favorite.location}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {favorite.bedrooms && (
                      <span className="text-xs bg-[#0f172a] text-gray-300 px-2 py-1 rounded">
                        {favorite.bedrooms} chambres
                      </span>
                    )}
                    {favorite.bathrooms && (
                      <span className="text-xs bg-[#0f172a] text-gray-300 px-2 py-1 rounded">
                        {favorite.bathrooms} SDB
                      </span>
                    )}
                    <span className="text-xs bg-[#0f172a] text-gray-300 px-2 py-1 rounded">
                      {favorite.surface}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Back to Listings Button */}
        {favorites.length > 0 && (
          <div className="text-center mt-10">
            <button
              onClick={() => navigate('/trano')}
              className="text-[#59e0c5] hover:underline transition-colors inline-flex items-center gap-2"
            >
              <span>Voir plus de propriétés</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Favorites; 