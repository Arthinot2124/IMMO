import apiService from './apiService';
import { UserData } from './authService';

export interface UserListResponse {
  status: string;
  data: UserData[];
  message?: string;
}

export interface UserResponse {
  status: string;
  data: UserData;
  message?: string;
}

/**
 * Service de gestion des utilisateurs
 */
const userService = {
  /**
   * Récupère la liste de tous les utilisateurs
   * @returns Liste des utilisateurs
   */
  getAllUsers: async (): Promise<UserData[]> => {
    try {
      const response = await apiService.get<UserListResponse>('/users');
      
      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Échec de récupération des utilisateurs');
      }
    } catch (error: any) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  },
  
  /**
   * Récupère un utilisateur par son ID
   * @param userId ID de l'utilisateur
   * @returns Données de l'utilisateur
   */
  getUserById: async (userId: number): Promise<UserData> => {
    try {
      const response = await apiService.get<UserResponse>(`/users/${userId}`);
      
      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Utilisateur non trouvé');
      }
    } catch (error: any) {
      console.error(`Erreur lors de la récupération de l'utilisateur ${userId}:`, error);
      throw error;
    }
  },
  
  /**
   * Crée un nouvel utilisateur
   * @param userData Données du nouvel utilisateur
   * @returns Données de l'utilisateur créé
   */
  createUser: async (userData: {
    full_name: string;
    email?: string;
    phone?: string;
    password: string;
    role_id: number;
    address?: string;
  }): Promise<UserData> => {
    try {
      const response = await apiService.post<UserResponse>('/users', userData);
      
      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Échec de création de l\'utilisateur');
      }
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  },
  
  /**
   * Met à jour un utilisateur existant
   * @param userId ID de l'utilisateur à mettre à jour
   * @param userData Données à mettre à jour
   * @returns Données de l'utilisateur mis à jour
   */
  updateUser: async (userId: number, userData: {
    full_name?: string;
    email?: string;
    phone?: string;
    password?: string;
    role_id?: number;
    address?: string;
  }): Promise<UserData> => {
    try {
      const response = await apiService.put<UserResponse>(`/users/${userId}`, userData);
      
      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Échec de mise à jour de l\'utilisateur');
      }
    } catch (error: any) {
      console.error(`Erreur lors de la mise à jour de l'utilisateur ${userId}:`, error);
      throw error;
    }
  },
  
  /**
   * Supprime un utilisateur
   * @param userId ID de l'utilisateur à supprimer
   * @returns Statut de la suppression
   */
  deleteUser: async (userId: number): Promise<{ status: string; message: string }> => {
    try {
      const response = await apiService.delete(`/users/${userId}`);
      
      if (response.data.status === 'success') {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Échec de suppression de l\'utilisateur');
      }
    } catch (error: any) {
      console.error(`Erreur lors de la suppression de l'utilisateur ${userId}:`, error);
      throw error;
    }
  }
};

export default userService; 