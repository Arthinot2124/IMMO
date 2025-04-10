import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export const Login = (): JSX.Element => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement actual login/signup logic here
    navigate("/home");
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
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-[#59e0c5] mb-1">
              Téléphone ou Email
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0f172a] border border-[#59e0c5] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#59e0c5]"
              placeholder="Entrez votre téléphone ou email"
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
            className="w-full bg-[#59e0c5] text-[#0f172a] font-bold py-3 rounded-lg hover:bg-[#59e0c5]/80 transition-colors"
          >
            {isSignUp ? "S'inscrire" : "Se connecter"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#59e0c5] hover:underline"
          >
            {isSignUp ? "Déjà un compte ? Se connecter" : "Pas de compte ? S'inscrire"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login; 