import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import authService from '../../services/authService';

export const ResetPassword = (): JSX.Element => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      setError('Lien de réinitialisation invalide ou expiré.');
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!token || !email) {
      setError('Lien de réinitialisation invalide ou expiré.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setIsLoading(false);
      return;
    }

    try {
      await authService.resetPassword(token, email, password);
      setSuccess('Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion...');
      
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Erreur de réinitialisation:', err);
      setError(err.message || 'Une erreur est survenue lors de la réinitialisation du mot de passe.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen relative flex items-center justify-center">
      {/* Background Image */}
      <img
        src="/public_login/fond_login.png"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Conteneur principal avec effet de verre */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-white/15 backdrop-blur-[1px] backdrop-saturate-150 border border-white/30 rounded-[32px] w-[90%] max-w-md p-8 pb-14 shadow-xl flex flex-col"
      >
        {/* Logo en haut à droite à l'intérieur du conteneur */}
        <div className="absolute top-6 right-6">
          <img src="/public_login/logo_couleur.png" alt="Logo" className="w-12 h-12" />
        </div>

        {/* Icône */}
        <motion.div 
          className="flex justify-center mt-8 mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: 1,
            opacity: 1,
            transition: {
              type: "spring",
              stiffness: 100,
              damping: 10
            }
          }}
        >
          <motion.img
            src="/public_login/Fingerprint_Icon_Signup.png"
            alt="Reset Password"
            className="w-24 h-24 drop-shadow-xl"
            whileHover={{ 
              scale: 1.1,
              rotate: 5,
              transition: { duration: 0.3 }
            }}
            whileTap={{ 
              scale: 0.95,
              transition: { duration: 0.2 }
            }}
            animate={{
              y: [0, -10, 0],
              transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          />
        </motion.div>

        <h2 className="text-white text-xl font-semibold text-center mb-6">
          Réinitialisation du mot de passe
        </h2>

        {error && (
          <div className="mt-4 mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 mb-4 p-3 bg-green-500/20 border border-green-500/50 text-green-200 rounded-lg text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b-2 border-white/40 px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:border-white/80 transition-colors caret-white"
              placeholder="Nouveau mot de passe"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-white/60 hover:text-white"
            >
              {showPassword ? "Masquer" : "Afficher"}
            </button>
          </div>

          <div className="space-y-2 relative">
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-transparent border-b-2 border-white/40 px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:border-white/80 transition-colors caret-white"
              placeholder="Confirmer le mot de passe"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className={`w-full bg-[#0066CC] text-white font-semibold py-3 rounded-full transition-all ${
              isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#0055AA] active:scale-95'
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Chargement...' : 'Réinitialiser le mot de passe'}
          </button>
        </form>

        {/* Retour à la connexion */}
        <div className="flex flex-col items-center gap-2 mt-6 text-white">
          <button 
            type="button" 
            className="text-sm hover:underline"
            onClick={() => navigate('/login')}
          >
            Retour à la connexion
          </button>
        </div>
      </motion.div>
    </div>
  );
}; 