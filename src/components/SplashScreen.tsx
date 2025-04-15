import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      navigate('/login'); // Redirection vers la page de login après le délai
    }, 3000); // Affiche le splash screen pendant 3 secondes

    return () => clearTimeout(timer);
  }, [navigate]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div className="w-full h-full relative">
        <img
          src="/public_login/Page_Ouverture.png"
          alt="Tafo Immo Splash"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
        
        </div>
      </div>
    </div>
  );
};

export default SplashScreen; 