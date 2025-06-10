// Configuration de l'API

export const API_URL = 'http://192.168.8.116:8000';
//
export const API_ENDPOINT = `${API_URL}/api`;

// Fonction pour obtenir les URL complètes des médias
export const getMediaUrl = (mediaPath: string) => {
  if (mediaPath?.startsWith('/')) {
    return `${API_URL}${mediaPath}`;
  }
  return `${API_URL}/${mediaPath}`;
};
