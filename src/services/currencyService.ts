// Taux de change actuel (à mettre à jour régulièrement)
const EXCHANGE_RATE = 5057; // 1 EUR = 5057 AR

export const convertToEuro = (amountInAr: number): number => {
  return amountInAr / EXCHANGE_RATE;
};

export const formatCurrency = (amount: number, isEuro: boolean): string => {
  if (isEuro) {
    const amountInEuro = convertToEuro(amount);
    return `${amountInEuro.toFixed(2)} €`;
  }
  return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ar`;
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