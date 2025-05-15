import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HomeIcon, SettingsIcon, CheckIcon, AwardIcon, StarIcon } from "lucide-react";
import NotificationBadge from "../../components/NotificationBadge";

export const CategorySelection = (): JSX.Element => {
  const navigate = useNavigate();
  const [isLightMode, setIsLightMode] = useState(() => {
    // Récupérer la préférence depuis localStorage
    const savedMode = localStorage.getItem('isLightMode');
    return savedMode !== null ? savedMode === 'true' : true;
  });

  // Couleurs qui changent en fonction du mode
  const accentColor = isLightMode ? "#0150BC" : "#59e0c5";
  const bgColor = isLightMode ? "bg-white" : "bg-[#0f172a]";
  const textColor = isLightMode ? "text-[#0150BC]" : "text-[#59e0c5]";
  const textPrimaryColor = isLightMode ? "text-[#1E293B]" : "text-white";
  const textSecondaryColor = isLightMode ? "text-gray-700" : "text-gray-300";
  const borderColor = isLightMode ? "border-[#0150BC]" : "border-[#59e0c5]";

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

  // Fonction pour sélectionner une catégorie et naviguer vers property-request
  const handleCategorySelection = (category: string) => {
    // Stocker la catégorie sélectionnée dans localStorage pour l'utiliser dans PropertyRequest
    localStorage.setItem('selected_category', category);
    navigate('/property-request');
  };

  // Animations
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`${bgColor} min-h-screen w-screen overflow-auto relative`}
    >
      {/* Arrière-plan avec effet */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-blue-500/5 dark:from-[#0f172a] via-transparent to-violet-500/10 dark:to-[#59e0c5]/20"></div>
      
      <div 
        className="fixed inset-0 z-0 opacity-60" 
        style={{ 
          backgroundImage: `url(${isLightMode ? '/public_Accueil_Sombre/blie-pattern2.jpeg' : '/public_Accueil_Sombre/blie-pattern.png'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 0.5s ease-in-out'
        }}
      ></div>
      
      {/* Effets lumineux pour le glassmorphisme */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-400/20 dark:bg-[#59e0c5]/20 rounded-full blur-3xl z-0 animate-pulse-slow"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-indigo-400/15 dark:bg-[#59e0c5]/10 rounded-full blur-3xl z-0 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        {/* Barre de navigation (non fixe, dans le flux du document) */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-4 z-50 mb-10"
        >
          <div className="flex gap-3">
            <HomeIcon 
              className={`w-8 h-8 ${textColor} cursor-pointer hover:opacity-80 transition-colors`} 
              onClick={() => navigate('/home')}
            />
            <NotificationBadge className="w-8 h-8" accentColor={accentColor} />
            <SettingsIcon 
              className={`w-8 h-8 ${textColor} cursor-pointer hover:opacity-80 transition-colors`} 
              onClick={() => navigate('/parametres')}
            />
          </div>
        </motion.header>
        
        <div className="flex-grow flex items-center justify-center">
          <div className="max-w-5xl mx-auto w-full px-4 py-4">
            {/* Titre de la page */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center mb-10 -mt-14"
            >
              <h1 className={`text-2xl md:text-3xl font-bold ${textPrimaryColor}`}>
                Choisissez votre catégorie
              </h1>
              <p className={`mt-1 ${textSecondaryColor} text-sm`}>
                Sélectionnez une catégorie pour votre demande
              </p>
            </motion.div>

            {/* Cartes de catégories */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {/* Carte LITE */}
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -5, transition: { duration: 0.2 } }}
                className="backdrop-blur-[1px] backdrop-saturate-150 bg-white/15 dark:bg-black/15 rounded-2xl overflow-hidden border-2 border-white/40 dark:border-[#59e0c5]/30 shadow-[0_10px_30px_rgba(0,0,0,0.12),_inset_0_1px_2px_rgba(255,255,255,0.5)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.2),_inset_0_2px_3px_rgba(255,255,255,0.6)]"
                onClick={() => handleCategorySelection('LITE')}
              >
                <div className="p-3 flex flex-col items-center text-center h-full relative">
                  {/* Reflet supérieur */}
                  <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent"></div>
                  
                  <div className={`${textColor} mb-1 flex items-center justify-center`}>
                    <CheckIcon size={24} />
                  </div>
                  <h3 className={`text-base font-bold mb-0.5 ${textPrimaryColor}`}>LITE</h3>
                  <div className="h-px w-12 bg-gradient-to-r from-transparent via-[#0150BC] dark:via-[#59e0c5] to-transparent mb-1"></div>
                  <p className={`${textSecondaryColor} text-xs mb-1`}>
                    Service de base pour les propriétés
                  </p>
                  <ul className={`text-left ${textSecondaryColor} text-[10px] space-y-0.5 mb-2 w-full px-2`}>
                    <li className="flex items-start">
                      <CheckIcon className={`${textColor} w-2.5 h-2.5 mt-0.5 mr-1 flex-shrink-0`} />
                      <span>Publication standard</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className={`${textColor} w-2.5 h-2.5 mt-0.5 mr-1 flex-shrink-0`} />
                      <span>Visibilité normale</span>
                    </li>
                  </ul>
                  <button 
                    className={`px-4 py-1 text-xs border ${borderColor} rounded-full ${textColor} hover:bg-[#0150BC] dark:hover:bg-[#59e0c5] hover:text-white dark:hover:text-[#0f172a] transition-colors mt-auto backdrop-blur-md`}
                  >
                    Sélectionner
                  </button>
                </div>
              </motion.div>

              {/* Carte ESSENTIEL */}
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -5, transition: { duration: 0.2 } }}
                className="backdrop-blur-[1px] backdrop-saturate-150 bg-white/15 dark:bg-black/20 rounded-2xl overflow-hidden border-2 border-white/40 dark:border-[#59e0c5]/40 shadow-[0_10px_30px_rgba(0,0,0,0.18),_inset_0_1px_2px_rgba(255,255,255,0.5)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.25),_inset_0_2px_3px_rgba(255,255,255,0.6)] relative"
                onClick={() => handleCategorySelection('ESSENTIEL')}
              >
                {/* Éclat d'accent */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/30 dark:bg-[#59e0c5]/30 rounded-full blur-3xl"></div>
                
                <div className="p-3 flex flex-col items-center text-center h-full relative">
                  {/* Reflet supérieur */}
                  <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/40 to-transparent"></div>
                  
                  <div className={`${textColor} mb-1 flex items-center justify-center`}>
                    <StarIcon size={24} />
                  </div>
                  <h3 className={`text-base font-bold mb-0.5 ${textPrimaryColor}`}>ESSENTIEL</h3>
                  <div className="h-px w-12 bg-gradient-to-r from-transparent via-[#0150BC] dark:via-[#59e0c5] to-transparent mb-1"></div>
                  <p className={`${textSecondaryColor} text-xs mb-1`}>
                    Service avec une visibilité accrue
                  </p>
                  <ul className={`text-left ${textSecondaryColor} text-[10px] space-y-0.5 mb-2 w-full px-2`}>
                    <li className="flex items-start">
                      <CheckIcon className={`${textColor} w-2.5 h-2.5 mt-0.5 mr-1 flex-shrink-0`} />
                      <span>Mise en avant ++</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className={`${textColor} w-2.5 h-2.5 mt-0.5 mr-1 flex-shrink-0`} />
                      <span>Priorité affichage</span>
                    </li>
                  </ul>
                  <button 
                    className={`px-4 py-1 text-xs border ${borderColor} rounded-full ${textColor} hover:bg-[#0150BC] dark:hover:bg-[#59e0c5] hover:text-white dark:hover:text-[#0f172a] transition-colors mt-auto backdrop-blur-md`}
                  >
                    Sélectionner
                  </button>
                </div>
              </motion.div>

              {/* Carte PREMIUM */}
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -5, transition: { duration: 0.2 } }}
                className="backdrop-blur-[1px] backdrop-saturate-150 bg-white/15 dark:bg-black/15 rounded-2xl overflow-hidden border-2 border-white/40 dark:border-[#59e0c5]/30 shadow-[0_10px_30px_rgba(0,0,0,0.12),_inset_0_1px_2px_rgba(255,255,255,0.5)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.2),_inset_0_2px_3px_rgba(255,255,255,0.6)]"
                onClick={() => handleCategorySelection('PREMIUM')}
              >
                <div className="p-3 flex flex-col items-center text-center h-full relative">
                  {/* Reflet supérieur */}
                  <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent"></div>
                  
                  <div className={`${textColor} mb-1 flex items-center justify-center`}>
                    <AwardIcon size={24} />
                  </div>
                  <h3 className={`text-base font-bold mb-0.5 ${textPrimaryColor}`}>PREMIUM</h3>
                  <div className="h-px w-12 bg-gradient-to-r from-transparent via-[#0150BC] dark:via-[#59e0c5] to-transparent mb-1"></div>
                  <p className={`${textSecondaryColor} text-xs mb-1`}>
                    Service premium complet
                  </p>
                  <ul className={`text-left ${textSecondaryColor} text-[10px] space-y-0.5 mb-2 w-full px-2`}>
                    <li className="flex items-start">
                      <CheckIcon className={`${textColor} w-2.5 h-2.5 mt-0.5 mr-1 flex-shrink-0`} />
                      <span>Première page garantie</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className={`${textColor} w-2.5 h-2.5 mt-0.5 mr-1 flex-shrink-0`} />
                      <span>Marketing premium</span>
                    </li>
                  </ul>
                  <button 
                    className={`px-4 py-1 text-xs border ${borderColor} rounded-full ${textColor} hover:bg-[#0150BC] dark:hover:bg-[#59e0c5] hover:text-white dark:hover:text-[#0f172a] transition-colors mt-auto backdrop-blur-md`}
                  >
                    Sélectionner
                  </button>
                </div>
              </motion.div>
            </motion.div>

            {/* Pied de page avec informations supplémentaires */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-center mt-4"
            >
              <p className={`${textSecondaryColor} text-[10px]`}>
                Chaque catégorie offre des niveaux différents de visibilité et de fonctionnalités.<br />
                Vous pouvez modifier la catégorie ultérieurement.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 