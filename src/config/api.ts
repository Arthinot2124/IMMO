export const API_URL = 'https://0ad9-129-222-109-75.ngrok-free.app';
//
export const API_ENDPOINT = `${API_URL}/api`;

// Fonction pour obtenir les URL complètes des médias
export const getMediaUrl = (mediaPath: string) => {
  if (mediaPath?.startsWith('/')) {
    return `${API_URL}${mediaPath}`;
  }
  return `${API_URL}/${mediaPath}`;
};
