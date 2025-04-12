import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BellIcon, HomeIcon, SettingsIcon, HomeIcon as HouseIcon, CalendarIcon, HeartIcon, CheckIcon, XIcon, AlertCircleIcon, RefreshCwIcon } from "lucide-react";
import notificationService, { Notification } from "../../services/notificationService";

export const Notifications = (): JSX.Element => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

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
              onClick={() => navigate('/home')}
            />
            <div className="relative">
              <BellIcon 
                className="w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-[#59e0c5] fill-[#59e0c5] cursor-pointer hover:text-[#59e0c5]/80 transition-colors" 
                onClick={() => navigate('/notifications')}
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <SettingsIcon 
              className="w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-[#59e0c5] cursor-pointer hover:text-[#59e0c5]/80 transition-colors" 
              onClick={() => navigate('/profile')}
            />
          </div>
        </motion.header>

        {/* Notifications Container */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#1E2B47] rounded-2xl p-5 sm:p-8 mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-white">Notifications</h1>
            <div className="flex space-x-3">
              <button 
                onClick={fetchNotifications}
                className="text-sm text-gray-400 hover:text-[#59e0c5] flex items-center"
                title="Rafraîchir"
              >
                <RefreshCwIcon className="w-4 h-4 mr-1" />
                Actualiser
              </button>
              
              {notifications.some(n => !n.is_read) && (
                <button 
                  onClick={markAllAsRead}
                  className="text-sm text-[#59e0c5] hover:underline flex items-center"
                >
                  <CheckIcon className="w-4 h-4 mr-1" />
                Tout marquer comme lu
              </button>
            )}
          </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 flex items-center">
              <AlertCircleIcon className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-sm text-red-100">{error}</p>
              <button 
                onClick={fetchNotifications}
                className="ml-auto flex items-center text-sm text-red-100 hover:text-white"
              >
                <RefreshCwIcon size={14} className="mr-1" /> Réessayer
              </button>
            </div>
          )}

          {/* État de chargement */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#59e0c5] mx-auto"></div>
              <p className="mt-4 text-gray-400">Chargement des notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <BellIcon className="w-16 h-16 text-[#59e0c5]/30 mx-auto mb-4" />
              <p className="text-gray-400">Aucune notification pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.notification_id}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`relative bg-[#0f172a] rounded-lg p-4 border-l-4 ${notification.is_read ? 'border-[#59e0c5]/30' : 'border-[#59e0c5]'}`}
                >
                  <div className="flex">
                    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[#1E2B47] flex items-center justify-center mr-3">
                      {getIconForMessage(notification.message)}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm sm:text-base ${notification.is_read ? 'text-gray-300' : 'text-white font-medium'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{formatRelativeDate(notification.created_at)}</p>
                    </div>
                    <div className="flex flex-col space-y-2 ml-2">
                      {!notification.is_read && (
                        <button 
                          onClick={() => markAsRead(notification.notification_id)}
                          className="p-1 text-[#59e0c5] hover:bg-[#1E2B47] rounded-full"
                          title="Marquer comme lu"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(notification.notification_id)}
                        className="p-1 text-gray-400 hover:bg-[#1E2B47] rounded-full"
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