import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BellIcon, HomeIcon, SettingsIcon, HomeIcon as HouseIcon, CalendarIcon, HeartIcon, CheckIcon, XIcon } from "lucide-react";

// Mock notifications data
const mockNotifications = [
  {
    id: 1,
    type: "property_view",
    message: "Votre propriété \"Villa moderne à Tambohobe\" a été visitée 5 fois aujourd'hui",
    date: "Aujourd'hui, 10:30",
    isRead: false
  },
  {
    id: 2,
    type: "appointment_confirmed",
    message: "Visite confirmée pour la propriété \"Appartement F3 Antarandolo\" le 15 Oct à 14h00",
    date: "Hier, 16:45",
    isRead: false
  },
  {
    id: 3,
    type: "favorite_added",
    message: "Un nouveau client a ajouté votre propriété \"Terrain 500m² Isada\" à ses favoris",
    date: "20 Sept 2023",
    isRead: true
  },
  {
    id: 4,
    type: "property_status",
    message: "Votre demande de prise en charge pour \"Maison 3 chambres Andrainjato\" a été acceptée",
    date: "15 Sept 2023",
    isRead: true
  },
  {
    id: 5,
    type: "message",
    message: "Nouveau message de l'agence concernant votre propriété \"Villa moderne à Tambohobe\"",
    date: "10 Sept 2023",
    isRead: true
  }
];

export const Notifications = (): JSX.Element => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);

  const getIconForType = (type: string) => {
    switch(type) {
      case "property_view":
        return <HouseIcon className="text-blue-400" />;
      case "appointment_confirmed":
        return <CalendarIcon className="text-green-400" />;
      case "favorite_added":
        return <HeartIcon className="text-red-400" />;
      case "property_status":
        return <CheckIcon className="text-yellow-400" />;
      default:
        return <BellIcon className="text-[#59e0c5]" />;
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? {...notification, isRead: true} : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({...notification, isRead: true})));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
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
            <BellIcon className="w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-[#59e0c5] fill-[#59e0c5]" />
            <SettingsIcon className="w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-[#59e0c5]" />
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
            {notifications.some(n => !n.isRead) && (
              <button 
                onClick={markAllAsRead}
                className="text-sm text-[#59e0c5] hover:underline"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <BellIcon className="w-16 h-16 text-[#59e0c5]/30 mx-auto mb-4" />
              <p className="text-gray-400">Aucune notification pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`relative bg-[#0f172a] rounded-lg p-4 border-l-4 ${notification.isRead ? 'border-[#59e0c5]/30' : 'border-[#59e0c5]'}`}
                >
                  <div className="flex">
                    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[#1E2B47] flex items-center justify-center mr-3">
                      {getIconForType(notification.type)}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm sm:text-base ${notification.isRead ? 'text-gray-300' : 'text-white font-medium'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{notification.date}</p>
                    </div>
                    <div className="flex flex-col space-y-2 ml-2">
                      {!notification.isRead && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-[#59e0c5] hover:bg-[#1E2B47] rounded-full"
                          title="Marquer comme lu"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(notification.id)}
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