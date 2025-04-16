// Configuration de l'API

export const API_URL = 'https://dd9b-102-17-119-32.ngrok-free.app';
//
export const API_ENDPOINT = `${API_URL}/api`;

// Fonction pour obtenir les URL complètes des médias
export const getMediaUrl = (mediaPath: string) => {
  if (mediaPath?.startsWith('/')) {
    return `${API_URL}${mediaPath}`;
  }
  return `${API_URL}/${mediaPath}`;
}; 
