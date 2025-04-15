import axios from 'axios';

const API_URL = 'http://localhost:8000/api';
//const API_URL = 'https://6aa3-129-222-109-77.ngrok-free.app/api';
// Interface pour les notifications
export interface Notification {
  notification_id: number;
  user_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

const notificationService = {
  /**
   * Récupère toutes les notifications pour l'utilisateur actuel
   */
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      const response = await axios.get(`${API_URL}/users/${userId}/notifications`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (response.data && response.data.status === 'success') {
        return response.data.data;
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      throw error;
    }
  },

  /**
   * Marque une notification comme lue
   */
  markAsRead: async (notificationId: number): Promise<void> => {
    try {
      await axios.put(`${API_URL}/notifications/${notificationId}`, 
        { is_read: true },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        }
      );
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
      throw error;
    }
  },

  /**
   * Marque toutes les notifications de l'utilisateur comme lues
   */
  markAllAsRead: async (): Promise<void> => {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      await axios.post(`${API_URL}/users/${userId}/notifications/mark-all-read`, {}, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
      throw error;
    }
  },

  /**
   * Supprime une notification
   */
  deleteNotification: async (notificationId: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/notifications/${notificationId}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      throw error;
    }
  }
};

export default notificationService; 