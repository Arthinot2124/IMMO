// Taux de change actuel (à mettre à jour régulièrement)
const EXCHANGE_RATE = 5057; // 1 EUR = 5057 AR

export const convertToEuro = (amountInAr: number): number => {
  return amountInAr / EXCHANGE_RATE;
};

export const formatCurrency = (amount: number, isEuro: boolean): string => {
  if (isEuro) {
    const amountInEuro = convertToEuro(amount);
    // Vérifier si le montant est un entier
    const formattedAmount = amountInEuro % 1 === 0 
      ? amountInEuro.toFixed(0)  // Pas de décimales pour les nombres entiers
      : amountInEuro.toFixed(2); // 2 décimales pour les autres
    return `${formattedAmount} €`;
  }
  
  // Pour Ariary, supprimer les décimales si c'est un nombre entier
  let formattedAmount = amount.toString();
  
  // Supprimer les décimales .00 si présentes
  formattedAmount = formattedAmount.replace(/\.00$/, '');
  
  // Ajouter les séparateurs d'espaces pour les milliers
  return `${formattedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ar`;
};

// Fonction pour mettre à jour le taux de change (à appeler périodiquement)
export const updateExchangeRate = async (): Promise<void> => {
  try {
    // Ici, vous pouvez ajouter un appel API pour obtenir le taux de change actuel
    // Pour l'instant, nous utilisons un taux fixe
    console.log('Taux de change mis à jour');
  } catch (error) {
    console.error('Erreur lors de la mise à jour du taux de change:', error);
  }
}; 