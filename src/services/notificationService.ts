import apiService from './apiService';
// Interface pour les notifications
export interface Notification {
  notification_id: number;
  user_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

const notificationService = {
  /**
   * Crée une nouvelle notification pour un utilisateur
   */
  createNotification: async (userId: number, message: string): Promise<Notification> => {
    try {
      const response = await apiService.post<ApiResponse<Notification>>('/notifications', {
        user_id: userId,
        message: message
      });

      if (response.data && response.data.status === 'success') {
        return response.data.data;
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      throw error;
    }
  },

  /**
   * Récupère toutes les notifications pour l'utilisateur actuel
   */
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      const response = await apiService.get<ApiResponse<Notification[]>>(`/users/${userId}/notifications`);

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
      await apiService.put(`/notifications/${notificationId}`, { is_read: true });
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

      await apiService.post(`/users/${userId}/notifications/mark-all-read`, {});
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
      await apiService.delete(`/notifications/${notificationId}`);
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      throw error;
    }
  }
};

export default notificationService; 