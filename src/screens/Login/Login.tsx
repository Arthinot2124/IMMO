import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";

export const Login = (): JSX.Element => {
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (isSignUp) {
        // Implémenter la fonctionnalité d'inscription
        if (!identifier.trim() || !email.trim() || !password.trim()) {
          throw new Error("Veuillez remplir tous les champs");
        }
        
        // Le champ identifier est utilisé pour le nom complet (full_name) en mode inscription
        const user = await authService.register(identifier, email, password);
        
        // Après inscription et connexion réussie
        await authService.refreshNotificationsCount();
        
        if (user.role_id === 1) {
          navigate("/admin/dashboard");
        } else {
          navigate("/home");
        }
      } else {
        const user = await authService.login(identifier, password);
        await authService.refreshNotificationsCount();
        
        if (user.role_id === 1) {
          navigate("/admin/dashboard");
        } else {
          navigate("/home");
        }
      }
    } catch (err: any) {
      console.error(isSignUp ? "Erreur d'inscription:" : "Erreur de connexion:", err);
      setError(err.message || (isSignUp ? "Échec de l'inscription. Veuillez réessayer." : "Échec de la connexion. Veuillez vérifier vos identifiants."));
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

        {/* Icône dynamique (Profil ou Empreinte) */}
        <motion.div 
          className="flex justify-center mt-8 mb-12"
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
          key={isSignUp ? 'signup' : 'login'}
        >
          <motion.img
            src={isSignUp ? "/public_login/Fingerprint_Icon_Signup.png" : "/public_login/Profil_icon_login.png"}
            alt={isSignUp ? "Fingerprint" : "Profile"}
            className="w-28 h-28 drop-shadow-xl"
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Champ prénom/téléphone */}
          <div className="space-y-2 relative">
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-transparent border-b-2 border-white/40 px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:border-white/80 transition-colors caret-white"
              placeholder={isSignUp ? "Nom complet" : "Email ou Téléphone"}
              required
            />
          </div>

          {/* Champ email (uniquement pour l'inscription) */}
          {isSignUp && (
            <div className="space-y-2 relative">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b-2 border-white/40 px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:border-white/80 transition-colors caret-white"
                placeholder="Email ou Téléphone (pour connexion)"
                required
              />
            </div>
          )}

          {/* Champ mot de passe avec bouton œil */}
          <div className="space-y-2 relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b-2 border-white/40 px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:border-white/80 transition-colors pr-10 caret-white"
              placeholder="Mot de passe"
              required
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-white/70 hover:text-white"
            >
              {/* Icône œil (ouvert ou fermé selon l'état) */}
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              )}
            </button>
          </div>

          {/* Bouton de connexion */}
          <button
            type="submit"
            className={`w-full bg-[#0066CC] text-white font-semibold py-3 rounded-full transition-all ${
              isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#0055AA] active:scale-95'
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Chargement...' : isSignUp ? "S'inscrire" : "Se connecter"}
          </button>

          {/* Liens supplémentaires */}
          {!isSignUp && (
            <div className="flex flex-col items-center gap-4 mt-6 text-white">
              <button type="button" className="text-sm hover:underline">
                J'ai oublié mon mot de passe
              </button>
            </div>
          )}
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-center">
            {error}
          </div>
        )}
      </motion.div>

      {/* Toggle Inscription/Connexion à l'extérieur de la div principale */}
      <div className="absolute bottom-10 text-center">
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
            setIdentifier("");
            setEmail("");
            setPassword("");
            setShowPassword(false);
          }}
          className="text-white text-lg hover:underline"
          disabled={isLoading}
        >
          {isSignUp ? "Déjà un compte ? Se connecter" : "Je n'ai pas de compte"}
        </button>
      </div>
    </div>
  );
};

export default Login; 