import React, { useState, useEffect } from 'react';
import { BellIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

interface NotificationBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  accentColor?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  size = 'md',
  className = '',
  accentColor = '#59e0c5'
}) => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Définir les tailles d'icône
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8 xs:w-8 xs:h-8', 
    lg: 'w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10'
  };

  // Charger les notifications et configurer les écouteurs d'événements
  useEffect(() => {
    // Fonction pour charger le compteur de notifications
    const loadNotificationCount = async () => {
      // D'abord, vérifier si une valeur est déjà stockée dans localStorage
      const storedCount = localStorage.getItem('unreadNotificationsCount');
      if (storedCount) {
        setUnreadCount(parseInt(storedCount, 10));
      }

      // Ensuite, actualiser depuis le serveur si l'utilisateur est connecté
      if (authService.getCurrentUser()) {
        try {
          await authService.refreshNotificationsCount();
          // La valeur sera mise à jour via l'écouteur d'événement ci-dessous
        } catch (error) {
          console.error("Erreur lors de l'actualisation du compteur de notifications:", error);
        }
      }
    };

    // Écouter les mises à jour du compteur
    const handleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.count !== undefined) {
        setUnreadCount(customEvent.detail.count);
      }
    };

    // Écouter les changements d'utilisateur via localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_id' || e.key === 'token') {
        // L'utilisateur vient de se connecter ou de se déconnecter
        loadNotificationCount();
      }
    };

    // Charger le compteur initial
    loadNotificationCount();

    // Ajouter les écouteurs d'événements
    window.addEventListener('unreadNotificationsUpdated', handleUpdate);
    window.addEventListener('storage', handleStorageChange);

    // Nettoyer les écouteurs d'événements
    return () => {
      window.removeEventListener('unreadNotificationsUpdated', handleUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div className="relative">
      <BellIcon 
        className={`${sizeClasses[size]} cursor-pointer hover:opacity-80 transition-colors ${className}`}
        style={{ color: accentColor }}
        onClick={() => navigate('/notifications')}
      />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
  );
};

export default NotificationBadge; 