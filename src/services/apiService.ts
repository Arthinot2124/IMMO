import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_ENDPOINT } from '../config/api';

const apiClient = axios.create({
  baseURL: API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Cache simple pour stocker les réponses des requêtes GET
const cache: Record<string, { data: any; timestamp: number }> = {};
// Durée de vie du cache en millisecondes (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les réponses et les erreurs
apiClient.interceptors.response.use(
  (response) => {
    // Mettre en cache les requêtes GET réussies
    if (response.config.method?.toLowerCase() === 'get') {
      const cacheKey = `${response.config.url}${JSON.stringify(response.config.params || '')}`;
      cache[cacheKey] = {
        data: response.data,
        timestamp: Date.now()
      };
    }
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config;
    
    // Si pas de config, on ne peut pas retry
    if (!config) {
      return Promise.reject(error);
    }
    
    // Ajouter un compteur de retry à la config
    // @ts-ignore
    config.__retryCount = config.__retryCount || 0;
    
    // Si c'est une erreur 429 (Too Many Attempts) et qu'on n'a pas dépassé le nombre max de tentatives
    if (error.response?.status === 429 && 
        // @ts-ignore
        config.__retryCount < 3) {
      
      // Incrémenter le compteur de retry
      // @ts-ignore
      config.__retryCount += 1;
      
      // Calculer le temps d'attente avec un backoff exponentiel
      // @ts-ignore
      const retryDelay = Math.pow(2, config.__retryCount) * 1000;
      
      console.log(`Erreur 429 détectée. Nouvelle tentative dans ${retryDelay}ms...`);
      
      // Attendre le délai calculé
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      // Refaire la requête
      return apiClient(config);
    }
    
    return Promise.reject(error);
  }
);

const apiService = {
  /**
   * Exécute une requête GET
   * @param url Chemin relatif à l'URL de base de l'API
   * @param config Configuration Axios optionnelle
   * @param useCache Utiliser le cache si disponible
   * @returns Résultat de la requête
   */
  get: <T>(url: string, config?: AxiosRequestConfig, useCache = true): Promise<AxiosResponse<T>> => {
    // Vérifier si la réponse est dans le cache et encore valide
    if (useCache) {
      const params = config?.params ? JSON.stringify(config.params) : '';
      const cacheKey = `${url}${params}`;
      const cachedResponse = cache[cacheKey];
      
      if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_TTL) {
        console.log(`Utilisation du cache pour ${url}`);
        return Promise.resolve({ 
          data: cachedResponse.data, 
          status: 200, 
          statusText: 'OK', 
          headers: {}, 
          config: config || {}
        } as AxiosResponse<T>);
      }
    }
    
    return apiClient.get<T>(url, config);
  },

  /**
   * Exécute une requête POST
   * @param url Chemin relatif à l'URL de base de l'API
   * @param data Données à envoyer dans la requête
   * @param config Configuration Axios optionnelle
   * @returns Résultat de la requête
   */
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.post<T>(url, data, config);
  },

  /**
   * Exécute une requête PUT
   * @param url Chemin relatif à l'URL de base de l'API
   * @param data Données à envoyer dans la requête
   * @param config Configuration Axios optionnelle
   * @returns Résultat de la requête
   */
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.put<T>(url, data, config);
  },

  /**
   * Exécute une requête DELETE
   * @param url Chemin relatif à l'URL de base de l'API
   * @param config Configuration Axios optionnelle
   * @returns Résultat de la requête
   */
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.delete<T>(url, config);
  },

  /**
   * Crée une instance d'Axios avec une configuration personnalisée
   * @param config Configuration Axios
   * @returns Instance Axios personnalisée
   */
  createCustomClient: (config: AxiosRequestConfig) => {
    return axios.create(config);
  },
  
  /**
   * Vide le cache
   */
  clearCache: () => {
    Object.keys(cache).forEach(key => delete cache[key]);
    console.log('Cache API vidé');
  }
};

export default apiService; 