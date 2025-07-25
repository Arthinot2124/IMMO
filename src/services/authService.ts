import apiService from './apiService';


export interface UserData {
  user_id: number;
  role_id: number;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  token?: string;
  role?: {
    role_id: number;
    role_name: string;
  };
}

interface LoginResponse {
  status: string;
  token?: string;
  message?: string;
  user: UserData;
}

interface RegisterResponse {
  status: string;
  message?: string;
  data?: UserData;
  token?: string;
}

interface NotificationResponse {
  status: string;
  data: Array<{
    is_read: boolean;
    [key: string]: any;
  }>;
}

// Charger le compteur de notifications non lues pour l'utilisateur connecté
const loadUnreadNotificationsCount = async (userId: number, token: string) => {
  try {
    const response = await apiService.get<NotificationResponse>(`/users/${userId}/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data?.status === 'success' && response.data?.data) {
      const unreadCount = response.data.data.filter((notification) => !notification.is_read).length;
      
      // Stocker le compteur dans localStorage
      localStorage.setItem('unreadNotificationsCount', unreadCount.toString());
      
      // Émettre un événement personnalisé pour mettre à jour les composants
      window.dispatchEvent(new CustomEvent('unreadNotificationsUpdated', { 
        detail: { count: unreadCount }
      }));
      
      return unreadCount;
    }
    
    return 0;
  } catch (error) {
    console.error("Erreur lors du chargement des notifications non lues:", error);
    return 0;
  }
};

// Fonction utilitaire pour gérer les erreurs d'API
const handleApiError = (error: any): never => {
  // En cas d'erreur de réseau
  if (!error.response) {
    throw new Error("Problème de connexion au serveur");
  }

  // Si le backend renvoie un message d'erreur
  if (error.response.data && error.response.data.message) {
    throw new Error(error.response.data.message);
  }

  // Message par défaut
  throw new Error("Une erreur s'est produite");
};

const authService = {
  /**
   * Inscrit un nouvel utilisateur
   * @param fullName Nom complet de l'utilisateur
   * @param identifier Email ou numéro de téléphone (format: uniquement des chiffres)
   * @param password Mot de passe de l'utilisateur
   * @returns Les données de l'utilisateur créé
   */
  register: async (fullName: string, identifier: string, password: string): Promise<UserData> => {
    try {
      // Déterminer si l'identifiant est un email ou un numéro de téléphone
      const isPhone = /^\d+$/.test(identifier);
      
      // Préparer les données d'inscription
      const registerData = {
        role_id: 2, // Par défaut, on attribue le rôle client (2)
        full_name: fullName,
        password: password,
        // On ajoute soit email, soit phone selon le format de l'identifiant
        ...(isPhone ? { phone: identifier } : { email: identifier })
      };
      
      const response = await apiService.post<RegisterResponse>(`/register`, registerData);
      
      console.log("Réponse d'inscription:", response.data);
      
      if (response.data.status === 'success' && response.data.data) {
        // Connexion automatique après inscription réussie
        return await authService.login(identifier, password);
      } else {
        throw new Error(response.data.message || "Échec de l'inscription");
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || "Erreur lors de l'inscription");
      }
      throw error;
    }
  },

  /**
   * Authentifie un utilisateur avec ses identifiants
   * @param identifier Email ou numéro de téléphone de l'utilisateur
   * @param password Mot de passe de l'utilisateur
   * @returns Les données de l'utilisateur et le statut de la connexion
   */
  login: async (identifier: string, password: string): Promise<UserData> => {
    try {
      // Déterminer si l'identifiant est un email ou un numéro de téléphone
      // Un numéro de téléphone ne contient que des chiffres
      const isPhone = /^\d+$/.test(identifier);
      
      // Préparer les données à envoyer au serveur
      const loginData = isPhone 
        ? { phone: identifier, password } 
        : { email: identifier, password };
      
      const response = await apiService.post<LoginResponse>(`/login`, loginData);
      
      console.log("Réponse de connexion:", response.data);
      
      // Vérifier si la réponse est valide
      if (response.data.status === 'success' && response.data.user) {
        // Stocker les informations utilisateur dans le localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('user_id', response.data.user.user_id.toString());
        
        // Stocker le token s'il est présent dans la réponse
        let token = '';
        if (response.data.token) {
          token = response.data.token;
          localStorage.setItem('token', token);
          console.log("Token stocké:", token);
        } else if (response.data.user.token) {
          // Cas où le token serait dans l'objet utilisateur
          token = response.data.user.token;
          localStorage.setItem('token', token);
          console.log("Token dans user stocké:", token);
        } else {
          console.warn("Aucun token trouvé dans la réponse de connexion");
        }
        
        // Charger les notifications non lues pour l'utilisateur
        await loadUnreadNotificationsCount(response.data.user.user_id, token);
        
        return response.data.user;
      } else {
        throw new Error(response.data.message || 'Échec de la connexion');
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Identifiants incorrects');
      }
      throw error;
    }
  },
  
  /**
   * Déconnecte l'utilisateur en supprimant ses informations stockées
   */
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('user_id');
    localStorage.removeItem('token');
    localStorage.removeItem('unreadNotificationsCount');
    
    // Appeler l'API de déconnexion si nécessaire
    apiService.post(`/logout`, {}).catch(error => 
      console.error('Erreur lors de la déconnexion:', error)
    );
  },
  
  /**
   * Récupère l'utilisateur actuellement connecté
   * @returns Les données de l'utilisateur ou null s'il n'est pas connecté
   */
  getCurrentUser: (): UserData | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as UserData;
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      return null;
    }
  },
  
  /**
   * Vérifie si l'utilisateur actuel est un administrateur
   * @returns true si l'utilisateur est un administrateur
   */
  isAdmin: (): boolean => {
    const user = authService.getCurrentUser();
    // role_id = 1 correspond à 'Admin' dans la base de données
    return !!user && user.role_id === 1;
  },
  
  /**
   * Vérifie si l'utilisateur actuel est un client
   * @returns true si l'utilisateur est un client
   */
  isClient: (): boolean => {
    const user = authService.getCurrentUser();
    // role_id = 2 correspond à 'Client' dans la base de données
    return !!user && user.role_id === 2;
  },

  /**
   * Actualise le compteur de notifications pour l'utilisateur courant
   * Cette fonction peut être appelée après des actions spécifiques ou au chargement de la page
   */
  refreshNotificationsCount: async (): Promise<number> => {
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('token');
    
    if (userId && token) {
      return await loadUnreadNotificationsCount(parseInt(userId), token);
    }
    
    return 0;
  },

  /**
   * Request a password reset link
   * @param identifier Email or phone number
   */
  async requestPasswordReset(identifier: string): Promise<any> {
    try {
      const response = await apiService.post('/auth/forgot-password', { identifier });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * Reset password with token
   * @param token Reset token
   * @param email User's email
   * @param password New password
   */
  async resetPassword(token: string, email: string, password: string): Promise<any> {
    try {
      const response = await apiService.post('/auth/reset-password', { 
        token,
        email,
        password 
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
};

export default authService; 