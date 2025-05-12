/**
 * Formate un prix en Ariary avec séparateurs de milliers
 * @param price - Le prix à formater
 * @returns Le prix formaté avec séparateurs de milliers
 */
export const formatPrice = (price?: number): string => {
  if (price === undefined || price === null) return "Prix non spécifié";
  return new Intl.NumberFormat('fr-FR').format(price) + " Ar";
};

/**
 * Formate une date au format local
 * @param dateString - La date à formater
 * @returns La date formatée
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return "Date non spécifiée";
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return "Date invalide";
  }
  
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Formate une surface en m²
 * @param surface - La surface à formater
 * @returns La surface formatée
 */
export const formatSurface = (surface?: number): string => {
  if (surface === undefined || surface === null) return "Surface non spécifiée";
  return `${surface} m²`;
}; 