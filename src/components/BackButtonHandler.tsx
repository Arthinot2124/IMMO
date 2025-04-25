import { useEffect, useState, useRef } from 'react';
import { App } from '@capacitor/app';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const BackButtonHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [backPressCount, setBackPressCount] = useState(0);
  const listenersAttached = useRef(false);

  useEffect(() => {
    // S'assurer que tous les écouteurs précédents sont supprimés
    App.removeAllListeners();
    listenersAttached.current = false;
    
    const handleBackButton = () => {
      if (listenersAttached.current) return;
      
      // Vérifie si l'utilisateur est connecté
      const isLoggedIn = authService.getCurrentUser() !== null;
      
      // Traiter d'abord le cas de la page de login
      if (location.pathname === '/login') {
        if (isLoggedIn) {
          // Si l'utilisateur est connecté mais sur la page login, rediriger vers l'accueil
          navigate('/home');
          return;
        }
      }
      
      // Vérifie si on est sur la page d'accueil ou SplashScreen
      if (location.pathname === '/home' || location.pathname === '/') {
        App.addListener('backButton', () => {
          // Sur l'accueil, toujours afficher une confirmation pour quitter
          const confirmExit = window.confirm("Voulez-vous vraiment quitter l'application ?");
          if (confirmExit) {
            App.exitApp();
          }
        });
      } else {
        // Pour toutes les autres pages
        App.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack) {
            // Pour les utilisateurs connectés, vérifier si la navigation arrière mènerait à /login
            if (isLoggedIn) {
              // Si la page actuelle n'est pas login mais que la précédente pourrait l'être
              // Si l'historique est court, c'est probablement login qui est avant
              if (window.history.length <= 2) {
                navigate('/home');
                return;
              }
              
              // Tentative de navigation sécurisée
              try {
                navigate(-1);
                
                // Vérification immédiate après la navigation
                setTimeout(() => {
                  if (window.location.pathname === '/login') {
                    // Si on se retrouve quand même sur login, retour à l'accueil
                    navigate('/home');
                  }
                }, 100);
              } catch (e) {
                navigate('/home');
              }
            } else {
              // Utilisateur non connecté: navigation normale
              navigate(-1);
            }
          } else {
            // Si on ne peut pas revenir en arrière, aller à l'accueil
            navigate('/home');
          }
        });
      }
      
      listenersAttached.current = true;
    };

    handleBackButton();

    return () => {
      App.removeAllListeners();
      listenersAttached.current = false;
    };
  }, [location.pathname, navigate]);

  // Ce composant ne rend rien, il gère simplement les événements
  return null;
};

export default BackButtonHandler; 