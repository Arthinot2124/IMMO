import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_ENDPOINT } from '../config/api';

const apiClient = axios.create({
  baseURL: API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const apiService = {
  /**
   * Exécute une requête GET
   * @param url Chemin relatif à l'URL de base de l'API
   * @param config Configuration Axios optionnelle
   * @returns Résultat de la requête
   */
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
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
  }
};

export default apiService; 