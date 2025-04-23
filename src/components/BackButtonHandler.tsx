import { useEffect, useState } from 'react';
import { App } from '@capacitor/app';
import { useNavigate, useLocation } from 'react-router-dom';

const BackButtonHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [backPressCount, setBackPressCount] = useState(0);

  useEffect(() => {
    const handleBackButton = () => {
      // Vérifie si on est sur la page d'accueil ou non
      if (location.pathname === '/home' || location.pathname === '/') {
        // Si on est sur l'accueil, utilise un compteur pour double pression
        App.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack) {
            if (backPressCount === 1) {
              // Si c'est la deuxième pression en peu de temps, quitter l'app
              App.exitApp();
            } else {
              // Première pression, afficher un toast ou une alerte
              setBackPressCount(1);
              // Réinitialiser le compteur après 2 secondes
              setTimeout(() => setBackPressCount(0), 2000);
              
              // Afficher un message à l'utilisateur (vous pourriez utiliser une solution de toast)
              alert('Appuyez à nouveau sur retour pour quitter');
            }
          } else {
            navigate(-1);
          }
        });
      } else {
        // Sur les autres pages, retourne à la page précédente
        App.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack) {
            navigate(-1);
          } else {
            navigate('/home');
          }
        });
      }
    };

    handleBackButton();

    // Nettoyage des listeners lors du démontage du composant
    return () => {
      App.removeAllListeners();
    };
  }, [location.pathname, navigate, backPressCount]);

  // Ce composant ne rend rien, il gère simplement les événements
  return null;
};

export default BackButtonHandler; 