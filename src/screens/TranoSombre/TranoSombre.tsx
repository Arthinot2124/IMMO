import { BellIcon, HomeIcon, SettingsIcon } from "lucide-react";
import React from "react";
import { Button } from "../../components/ui/ComponentTrano/button";
import { Card, CardContent } from "../../components/ui/ComponentTrano/card";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Property listing data
const propertyListings = [
  {
    id: 1,
    title: "Trano 4 pièces Tambohobe",
    description:
      "lorem ipsum imspsum lorem ipsum imspsum\nlorem ipsum imspsum lorem ipsum",
    image: "/public_Trano/maison-01.png",
  },
  {
    id: 2,
    title: "Trano 5 pièces antarandolo",
    description:
      "lorem ipsum imspsum lorem ipsum imspsum\nlorem ipsum imspsum lorem ipsum",
    image: "/public_Trano/calque-3.png",
  },
  {
    id: 3,
    title: "Trano 2 pièces Isada",
    description:
      "lorem ipsum imspsum lorem ipsum imspsum\nlorem ipsum imspsum lorem ipsum",
    image: "/public_Trano/calque-4.png",
  },
  {
    id: 4,
    title: "Trano 3 pièces Andrainjato",
    description:
      "lorem ipsum imspsum lorem ipsum imspsum\nlorem ipsum imspsum lorem ipsum",
    image: "/public_Trano/calque-5.png",
  },
];

export const TranoSombre = (): JSX.Element => {
  const navigate = useNavigate();

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
          className="flex justify-between items-center py-2 xs:py-4 mb-8 xs:mb-10"
        >
          <div className="flex gap-2 xs:gap-4">
            <HomeIcon 
              className="w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-[#59e0c5] cursor-pointer hover:text-[#59e0c5]/80 transition-colors" 
              onClick={() => navigate('/')}
            />
            <BellIcon className="w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-[#59e0c5]" />
            <SettingsIcon className="w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-[#59e0c5]" />
          </div>
          <div className="relative">
            <input
              type="search"
              className="w-[140px] xs:w-[200px] sm:w-[300px] h-8 xs:h-10 bg-transparent rounded-full px-3 xs:px-4 text-xs xs:text-sm text-[#59e0c5] border border-[#59e0c5] outline-none"
              placeholder="Rechercher..."
            />
          </div>
        </motion.header>

        {/* Hero Section */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative mt-2 xs:mt-3 mb-3 xs:mb-6 rounded-[24px] xs:rounded-[32px] overflow-hidden"
        >
          <img
            src="/public_Trano/FIANARANTSOA.png"
            alt="Hero"
            className="w-full h-[150px] xs:h-[190px] sm:h-[230px] object-cover"
          />
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <img 
              src="/public_Trano/tafo-immo-logo.png" 
              alt="" 
              className="h-7 xs:h-10 sm:h-14" 
            />
          </div>
        </motion.div>

        {/* Filter Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mb-8 xs:mb-16"
        >
          <div className="inline-flex items-center gap-2 xs:gap-4 mb-2 xs:mb-4">
            <span className="text-base xs:text-xl sm:text-2xl font-bold text-[#59e0c5]">TRANO</span>
            <div className="w-0.5 h-4 xs:h-6 sm:h-8 bg-[#59e0c5]"></div>
            <span className="text-base xs:text-xl sm:text-2xl font-bold text-[#59e0c5]">TANY</span>
          </div>
          <div className="border-t border-[#59e0c5] w-40 sm:w-58 md:w-70 mx-auto mb-1 sm:mb-2"></div>
          <div className="flex justify-center gap-4 xs:gap-8 sm:gap-12">
        
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 rounded-full border-2 border-[#59e0c5]"></div>
              <span className="text-sm xs:text-base sm:text-xl text-[#59e0c5]">TERRAINS</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 rounded-full bg-[#59e0c5] flex items-center justify-center">
                <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#0f172a]"></div>
              </div>
              <span className="text-sm xs:text-base sm:text-xl text-[#59e0c5]">VILLAS</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 rounded-full border-2 border-[#59e0c5]"></div>
              <span className="text-sm xs:text-base sm:text-xl text-[#59e0c5] whitespace-nowrap">+ de 10 000 000 Ar</span>
            </div>
          </div>
        </motion.div>

        {/* Property Listings */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-5 xs:space-y-6 sm:space-y-8"
        >
          {propertyListings.map((property) => (
            <motion.div
              key={property.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="bg-[#1e293b]/50 rounded-lg xs:rounded-xl overflow-hidden border border-[#59e0c5]/30"
            >
              <div className="flex">
                <div className="w-[130px] xs:w-[150px] sm:w-[180px] h-[90px] xs:h-[100px] sm:h-[120px] flex-shrink-0 bg-[#1e293b] flex items-center justify-center">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 p-2 xs:p-3 sm:p-4 flex flex-col justify-between h-[90px] xs:h-[100px] sm:h-[120px]">
                  <div>
                    <h3 className="text-xs xs:text-sm sm:text-base font-semibold text-[#59e0c5] mb-1">
                      {property.title}
                    </h3>
                    <p className="text-[10px] xs:text-xs sm:text-sm text-gray-300 line-clamp-2">
                      {property.description}
                    </p>
                  </div>
                  <div className="flex justify-end gap-1.5 xs:gap-2 sm:gap-3">
                    <button className="px-2 xs:px-3 sm:px-4 py-0.5 xs:py-1 bg-[#1e293b] text-[#59e0c5] rounded-full hover:bg-[#59e0c5] hover:text-[#1e293b] transition-colors text-[10px] xs:text-xs sm:text-sm">
                      Apérçu
                    </button>
                    <button className="px-2 xs:px-3 sm:px-4 py-0.5 xs:py-1 bg-[#1e293b] text-[#59e0c5] rounded-full hover:bg-[#59e0c5] hover:text-[#1e293b] transition-colors text-[10px] xs:text-xs sm:text-sm">
                      Visite Virtuelle
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Pagination */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center items-center gap-1 xs:gap-2 sm:gap-4 my-8 xs:my-12 sm:my-16"
        >
          <button className="w-6 h-6 xs:w-8 xs:h-8 sm:w-12 sm:h-12 rounded-full bg-[#59e0c5] flex items-center justify-center">
            <span className="text-[#0f172a] text-xs xs:text-sm sm:text-base">←</span>
          </button>
          <div className="flex items-center gap-1 xs:gap-2 sm:gap-4">
            <span className="text-[#59e0c5] text-sm xs:text-lg sm:text-2xl">1</span>
            <span className="text-[#59e0c5] text-sm xs:text-lg sm:text-2xl">2</span>
            <span className="w-6 h-6 xs:w-8 xs:h-8 sm:w-12 sm:h-12 rounded-full bg-[#1e293b] flex items-center justify-center text-[#59e0c5] text-sm xs:text-lg sm:text-2xl">3</span>
            <span className="text-[#59e0c5] text-sm xs:text-lg sm:text-2xl">4</span>
            <span className="text-[#59e0c5] text-sm xs:text-lg sm:text-2xl">...</span>
            <span className="text-[#59e0c5] text-sm xs:text-lg sm:text-2xl">7</span>
          </div>
          <button className="w-6 h-6 xs:w-8 xs:h-8 sm:w-12 sm:h-12 rounded-full bg-[#59e0c5] flex items-center justify-center">
            <span className="text-[#0f172a] text-xs xs:text-sm sm:text-base">→</span>
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};