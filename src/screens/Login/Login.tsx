import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";

export const Login = (): JSX.Element => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      // Placeholder pour la fonctionnalité d'inscription - à implémenter plus tard
      alert("La fonctionnalité d'inscription n'est pas encore implémentée");
      return;
    }
    
    // Connexion
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await authService.login(email, password);
      
      // Refresh notification counter after login
      await authService.refreshNotificationsCount();
      
      // Redirection basée sur le rôle
      if (user.role_id === 1) {
        // Admin - redirection vers le tableau de bord admin
        navigate("/admin/dashboard");
      } else {
        // Client - redirection vers la page d'accueil
        navigate("/home");
      }
    } catch (err: any) {
      console.error("Erreur de connexion:", err);
      setError(err.message || "Échec de la connexion. Veuillez vérifier vos identifiants.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0f172a] relative overflow-hidden flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url(/public_Accueil_Sombre/blie-pattern.png)] opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-[#1E2B47] rounded-3xl p-6 sm:p-8 w-[90%] max-w-md"
      >
        <div className="flex justify-center mb-6">
          <img src="/public_Accueil_Sombre/logo-couleur.png" alt="Logo" className="w-16 h-16 sm:w-20 sm:h-20" />
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">
          {isSignUp ? "Créer un compte" : "Connexion"}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-[#59e0c5] mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0f172a] border border-[#59e0c5] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#59e0c5]"
              placeholder="Entrez votre email"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm text-[#59e0c5] mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0f172a] border border-[#59e0c5] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#59e0c5]"
              placeholder="Entrez votre mot de passe"
              required
            />
          </div>
          
          {isSignUp && (
            <div>
              <label htmlFor="confirm" className="block text-sm text-[#59e0c5] mb-1">
                Confirmez le mot de passe
              </label>
              <input
                id="confirm"
                type="password"
                className="w-full bg-[#0f172a] border border-[#59e0c5] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#59e0c5]"
                placeholder="Confirmez votre mot de passe"
                required
              />
            </div>
          )}
          
          {!isSignUp && (
            <div className="flex justify-end">
              <button type="button" className="text-sm text-[#59e0c5] hover:underline">
                Mot de passe oublié ?
              </button>
            </div>
          )}
          
          <button
            type="submit"
            className={`w-full bg-[#59e0c5] text-[#0f172a] font-bold py-3 rounded-lg transition-colors ${
              isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#59e0c5]/80'
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Chargement...' : isSignUp ? "S'inscrire" : "Se connecter"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-[#59e0c5] hover:underline"
            disabled={isLoading}
          >
            {isSignUp ? "Déjà un compte ? Se connecter" : "Pas de compte ? S'inscrire"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login; 