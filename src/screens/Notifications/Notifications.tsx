import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BellIcon, HomeIcon, SettingsIcon, HomeIcon as HouseIcon, CalendarIcon, HeartIcon, CheckIcon, XIcon, AlertCircleIcon, RefreshCwIcon, SunIcon, MoonIcon, MoreVerticalIcon, TrashIcon } from "lucide-react";
import notificationService, { Notification } from "../../services/notificationService";

export const Notifications = (): JSX.Element => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLightMode, setIsLightMode] = useState(() => {
    // Récupérer la préférence depuis localStorage
    const savedMode = localStorage.getItem('isLightMode');
    return savedMode !== null ? savedMode === 'true' : true;
  });
  const [showDropdown, setShowDropdown] = useState(false);

  // Couleurs qui changent en fonction du mode
  const accentColor = isLightMode ? "#0150BC" : "#59e0c5";
  const bgColor = isLightMode ? "bg-white" : "bg-[#0f172a]";
  const cardBgColor = isLightMode ? "bg-[#F8FAFC]" : "bg-[#1E2B47]";
  const darkBgColor = isLightMode ? "bg-[#EFF6FF]" : "bg-[#0f172a]";
  const textColor = isLightMode ? "text-[#0150BC]" : "text-[#59e0c5]";
  const textPrimaryColor = isLightMode ? "text-[#1E293B]" : "text-white";
  const textSecondaryColor = isLightMode ? "text-gray-700" : "text-gray-300";
  const buttonPrimaryBg = isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]";
  const buttonPrimaryText = isLightMode ? "text-white" : "text-[#0f172a]";
  const borderColor = isLightMode ? "border-[#0150BC]" : "border-[#59e0c5]";
  const cardBorder = isLightMode ? "border border-[#0150BC]/30" : "border border-[#59e0c5]/30";
  const itemBgColor = isLightMode ? "bg-white" : "bg-[#0f172a]";
  const itemBorderColor = isLightMode ? "border-[#0150BC]" : "border-[#59e0c5]";
  const itemBorderColorRead = isLightMode ? "border-[#0150BC]/30" : "border-[#59e0c5]/30";
  const iconBgColor = isLightMode ? "bg-[#F8FAFC]" : "bg-[#1E2B47]";
  const errorBgColor = isLightMode ? "bg-red-100" : "bg-red-500/20";
  const errorTextColor = isLightMode ? "text-red-700" : "text-red-100";
  const loadingBorderColor = isLightMode ? "border-[#0150BC]" : "border-[#59e0c5]";
  const emptyTextColor = isLightMode ? "text-gray-500" : "text-gray-400";
  const emptyIconColor = isLightMode ? "text-[#0150BC]/30" : "text-[#59e0c5]/30";

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

  // Chargement des notifications au chargement du composant
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mise à jour du compteur de notifications non lues
  useEffect(() => {
    const count = notifications.filter(notification => !notification.is_read).length;
    setUnreadCount(count);
  }, [notifications]);

  // Fonction pour charger les notifications
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const notificationsList = await notificationService.getNotifications();
      setNotifications(notificationsList);
      setLoading(false);
    } catch (err: any) {
      console.error("Erreur lors du chargement des notifications:", err);
      setError("Impossible de charger vos notifications pour le moment.");
      setLoading(false);
    }
  };

  // Déterminer l'icône en fonction du contenu du message
  const getIconForMessage = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("rendez-vous") || lowerMessage.includes("visite")) {
      return <CalendarIcon className="text-green-400" />;
    } else if (lowerMessage.includes("propriété") || lowerMessage.includes("bien") || lowerMessage.includes("immeuble")) {
        return <HouseIcon className="text-blue-400" />;
    } else if (lowerMessage.includes("favori")) {
        return <HeartIcon className="text-red-400" />;
    } else if (lowerMessage.includes("confirmé") || lowerMessage.includes("accepté")) {
        return <CheckIcon className="text-yellow-400" />;
    } else {
        return <BellIcon className="text-[#59e0c5]" />;
    }
  };

  // Formater la date relative (aujourd'hui, hier, etc.)
  const formatRelativeDate = (dateString: string) => {
    try {
      // Log pour debug
      console.log('Date string reçue:', dateString);
      
      // Vérifier si la chaîne de date est valide
      if (!dateString) {
        return "Date inconnue";
      }
      
      // Nettoyer la chaîne de date (supprimer .000000Z et remplacer T par un espace)
      const cleanedDateString = dateString
        .replace(/\.000000Z$/, '') // Supprime .000000Z à la fin
        .replace('T', ' ');        // Remplace T par un espace
      
      console.log('Date nettoyée:', cleanedDateString);
      
      // Diviser en parties date et heure
      const dateTimeParts = cleanedDateString.split(' ');
      
      if (dateTimeParts.length < 2) {
        console.error('Format de date invalide après nettoyage:', cleanedDateString);
        return dateString; // Retourner la chaîne originale si le format est incorrect
      }
      
      const datePart = dateTimeParts[0]; // "2023-10-23"
      const timePart = dateTimeParts[1]; // "09:05:00"
      
      // Extraire les composants de la date
      const dateComponents = datePart.split('-');
      const year = dateComponents[0];
      const month = parseInt(dateComponents[1]);
      const day = parseInt(dateComponents[2]);
      
      // Extraire les composants de l'heure
      const timeComponents = timePart.split(':');
      const hours = timeComponents[0].padStart(2, '0');
      const minutes = timeComponents[1].padStart(2, '0');
      
      // Pour comparer avec aujourd'hui et hier
      const now = new Date();
      const today = now.getDate();
      const thisMonth = now.getMonth() + 1;
      const thisYear = now.getFullYear();
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDay = yesterday.getDate();
      const yesterdayMonth = yesterday.getMonth() + 1;
      const yesterdayYear = yesterday.getFullYear();
      
      // Formater la chaîne d'heure
      const timeStr = `${hours}:${minutes}`;
      
      // Déterminer si c'est aujourd'hui, hier ou une autre date
      if (day === today && month === thisMonth && year === thisYear.toString()) {
        return `Aujourd'hui, ${timeStr}`;
      } else if (day === yesterdayDay && month === yesterdayMonth && year === yesterdayYear.toString()) {
        return `Hier, ${timeStr}`;
      } else {
        // Noms des mois en français
        const monthNames = ['', 'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
        return `${day} ${monthNames[month]} ${year} à ${timeStr}`;
      }
    } catch (error) {
      console.error("Erreur lors du formatage de la date:", error, "pour la chaîne:", dateString);
      return dateString; // Retourner la chaîne originale en cas d'erreur
    }
  };

  // Ajout d'une fonction pour mettre à jour le badge ailleurs dans l'application
  const updateGlobalNotificationBadge = (count: number) => {
    // Stockage du nombre dans localStorage pour être accessible par d'autres composants
    localStorage.setItem('unreadNotificationsCount', count.toString());
    // Vous pouvez également émettre un événement personnalisé si nécessaire
    window.dispatchEvent(new CustomEvent('unreadNotificationsUpdated', { detail: { count } }));
  };

  // Mise à jour du badge global lorsque le compteur local change
  useEffect(() => {
    updateGlobalNotificationBadge(unreadCount);
  }, [unreadCount]);

  // Marquer une notification comme lue
  const markAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(notification => 
        notification.notification_id === id ? {...notification, is_read: true} : notification
      ));
    } catch (err) {
      console.error("Erreur lors du marquage de la notification comme lue:", err);
      setError("Impossible de marquer la notification comme lue.");
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(notification => ({...notification, is_read: true})));
    } catch (err) {
      console.error("Erreur lors du marquage des notifications comme lues:", err);
      setError("Impossible de marquer toutes les notifications comme lues.");
    }
  };

  // Supprimer une notification
  const deleteNotification = async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter(notification => notification.notification_id !== id));
    } catch (err) {
      console.error("Erreur lors de la suppression de la notification:", err);
      setError("Impossible de supprimer la notification.");
    }
  };

  // Supprimer toutes les notifications
  const deleteAllNotifications = async () => {
    try {
      // Pour chaque notification, appeler l'API de suppression
      const promises = notifications.map(notification => 
        notificationService.deleteNotification(notification.notification_id)
      );
      
      await Promise.all(promises);
      setNotifications([]);
      setShowDropdown(false);
    } catch (err) {
      console.error("Erreur lors de la suppression de toutes les notifications:", err);
      setError("Impossible de supprimer toutes les notifications.");
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`${bgColor} min-h-screen`}
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
          className="flex justify-between items-center py-2 xs:py-4 mb-4 xs:mb-6"
        >
          <div className="flex gap-2 xs:gap-4">
            <HomeIcon 
              className={`w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 ${textColor} cursor-pointer hover:opacity-80 transition-colors`}
              onClick={() => navigate('/home')}
            />
            <div className="relative">
              <BellIcon 
                className={`w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 ${textColor} ${isLightMode ? '' : 'fill-[#59e0c5]'} cursor-pointer hover:opacity-80 transition-colors`}
                onClick={() => navigate('/notifications')}
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <SettingsIcon 
              className={`w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 ${textColor} cursor-pointer hover:opacity-80 transition-colors`}
              onClick={() => navigate('/parametres')}
            />
          </div>
          
          {/* Bouton pour basculer entre les modes */}
          <button 
            onClick={toggleLightMode}
            className={`${buttonPrimaryBg} ${buttonPrimaryText} p-2 rounded-full flex items-center justify-center`}
            aria-label={isLightMode ? "Passer au mode sombre" : "Passer au mode clair"}
          >
            {isLightMode ? (
              <MoonIcon className="w-5 h-5 xs:w-6 xs:h-6" />
            ) : (
              <SunIcon className="w-5 h-5 xs:w-6 xs:h-6" />
            )}
          </button>
        </motion.header>

        {/* Notifications Container */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`${cardBgColor} rounded-2xl p-5 sm:p-8 mb-8 ${cardBorder}`}
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className={`text-lg sm:text-xl font-bold ${textPrimaryColor}`}>Notifications</h1>
            <div className="flex space-x-3 relative">
              <button 
                onClick={fetchNotifications}
                className={`text-sm ${textSecondaryColor} hover:${textColor} flex items-center`}
                title="Rafraîchir"
              >
                {/* <RefreshCwIcon className="w-4 h-4 mr-1" />
                Actualiser */}
              </button>
              
              <div className="relative">
                <button 
                  onClick={toggleDropdown}
                  className={`p-2 rounded-full ${showDropdown ? buttonPrimaryBg : darkBgColor} ${showDropdown ? buttonPrimaryText : textColor}`}
                >
                  <MoreVerticalIcon size={18} />
                </button>
                
                {showDropdown && (
                  <div 
                    className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${cardBgColor} ring-1 ring-black ring-opacity-5 z-50 ${cardBorder}`}
                  >
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      {notifications.some(n => !n.is_read) && (
                        <button 
                          onClick={() => {
                            markAllAsRead();
                            setShowDropdown(false);
                          }}
                          className={`block px-4 py-2 text-sm ${textColor} hover:${darkBgColor} w-full text-left flex items-center`}
                          role="menuitem"
                        >
                          <CheckIcon className="w-4 h-4 mr-2" />
                          Tout marquer comme lu
                        </button>
                      )}
                      
                      {notifications.length > 0 && (
                        <button 
                          onClick={() => {
                            deleteAllNotifications();
                            setShowDropdown(false);
                          }}
                          className={`block px-4 py-2 text-sm text-red-500 hover:${darkBgColor} w-full text-left flex items-center`}
                          role="menuitem"
                        >
                          <TrashIcon className="w-4 h-4 mr-2" />
                          Tout supprimer
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className={`${errorBgColor} border border-red-500 rounded-lg p-4 mb-6 flex items-center`}>
              <AlertCircleIcon className={`w-5 h-5 ${isLightMode ? 'text-red-500' : 'text-red-400'} mr-2`} />
              <p className={`text-sm ${errorTextColor}`}>{error}</p>
              <button 
                onClick={fetchNotifications}
                className={`ml-auto flex items-center text-sm ${errorTextColor} hover:${isLightMode ? 'text-red-900' : 'text-white'}`}
              >
                <RefreshCwIcon size={14} className="mr-1" /> Réessayer
              </button>
            </div>
          )}

          {/* État de chargement */}
          {loading ? (
            <div className="text-center py-12">
              <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${loadingBorderColor} mx-auto`}></div>
              <p className={`mt-4 ${emptyTextColor}`}>Chargement des notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <BellIcon className={`w-16 h-16 ${emptyIconColor} mx-auto mb-4`} />
              <p className={emptyTextColor}>Aucune notification pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.notification_id}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`relative ${itemBgColor} rounded-lg p-4 border-l-4 ${notification.is_read ? itemBorderColorRead : itemBorderColor}`}
                >
                  <div className="flex">
                    <div className={`w-10 h-10 flex-shrink-0 rounded-full ${iconBgColor} flex items-center justify-center mr-3`}>
                      {getIconForMessage(notification.message)}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm sm:text-base ${notification.is_read ? textSecondaryColor : `${textPrimaryColor} font-medium`}`}>
                        {notification.message}
                      </p>
                      <p className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>{formatRelativeDate(notification.created_at)}</p>
                    </div>
                    <div className="flex flex-col space-y-2 ml-2">
                      {!notification.is_read && (
                        <button 
                          onClick={() => markAsRead(notification.notification_id)}
                          className={`p-1 ${textColor} hover:${iconBgColor} rounded-full`}
                          title="Marquer comme lu"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(notification.notification_id)}
                        className={`p-1 ${textSecondaryColor} hover:${iconBgColor} rounded-full`}
                        title="Supprimer"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Notifications; 