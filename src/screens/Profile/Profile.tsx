import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BellIcon, HomeIcon, SettingsIcon, UserIcon, LogOutIcon, Edit2Icon, SaveIcon, AlertCircleIcon, XIcon } from "lucide-react";
import authService, { UserData } from "../../services/authService";
import axios from "axios";
import NotificationBadge from "../../components/NotificationBadge";

export const Profile = (): JSX.Element => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: ""
  });

  // Récupérer les données de l'utilisateur au chargement du composant
  useEffect(() => {
    // D'abord, vérifier si l'utilisateur est connecté
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser) {
      // Si non connecté, rediriger vers la page de connexion
      navigate('/');
      return;
    }
    
    // Charger les données utilisateur depuis l'API pour obtenir les informations les plus récentes
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Récupérer les données de l'utilisateur connecté depuis l'API
        const response = await axios.get(`http://localhost:8000/api/users/${currentUser.user_id}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });
        
        if (response.data && response.data.status === "success" && response.data.data) {
          const user = response.data.data;
          setUserData(user);
          // Initialiser le formulaire avec les données de l'utilisateur
          setFormData({
            full_name: user.full_name || "",
            email: user.email || "",
            phone: user.phone || "",
            address: user.address || ""
          });
        } else {
          // Utiliser les données du localStorage si l'API échoue
          setUserData(currentUser);
          setFormData({
            full_name: currentUser.full_name || "",
            email: currentUser.email || "",
            phone: currentUser.phone || "",
            address: currentUser.address || ""
          });
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données utilisateur:", err);
        // En cas d'erreur, utiliser les données du localStorage
        setUserData(currentUser);
        setFormData({
          full_name: currentUser.full_name || "",
          email: currentUser.email || "",
          phone: currentUser.phone || "",
          address: currentUser.address || ""
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!userData) return;
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Envoyer les modifications au backend
      const response = await axios.put(`http://localhost:8000/api/users/${userData.user_id}`, formData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      
      if (response.data && response.data.status === "success") {
        // Mettre à jour les données stockées localement
        const updatedUser = { ...userData, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUserData(updatedUser);
        setSuccessMessage("Profil mis à jour avec succès");
        
        // Désactiver le mode édition
        setIsEditing(false);
      } else {
        throw new Error("Échec de la mise à jour du profil");
      }
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du profil:", err);
      setError(err.response?.data?.message || err.message || "Une erreur est survenue lors de la mise à jour du profil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const showLogoutConfirmation = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Afficher un état de chargement pendant la récupération des données
  if (isLoading && !userData) {
    return (
      <div className="bg-[#0f172a] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#59e0c5]"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-[#0f172a] min-h-screen"
    >
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Confirmation</h3>
              <button 
                onClick={cancelLogout}
                className="text-gray-400 hover:text-white"
              >
                <XIcon size={24} />
              </button>
            </div>
            
            <p className="text-white mb-6">Êtes-vous sûr de vouloir vous déconnecter ?</p>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={cancelLogout}
                className="px-4 py-2 border border-[#59e0c5] text-[#59e0c5] rounded-lg"
              >
                Annuler
              </button>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-4 xs:px-6 sm:px-8 md:px-12 lg:px-16 pt-4 xs:pt-6 sm:pt-8 md:pt-10 lg:pt-12">
        {/* Navigation Bar */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center py-2 xs:py-4 mb-8 xs:mb-10"
        >
          <div className="flex gap-2 xs:gap-4">
            <HomeIcon 
              className="w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-[#59e0c5] cursor-pointer hover:text-[#59e0c5]/80 transition-colors" 
              onClick={() => navigate('/home')}
            />
            <NotificationBadge size="lg" />
            <SettingsIcon className="w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-[#59e0c5]" />
          </div>
        </motion.header>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 text-white flex items-start">
            <AlertCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-6 text-white">
            <p>{successMessage}</p>
          </div>
        )}

        {/* Profile Container */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#1E2B47] rounded-2xl p-5 sm:p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Mon Profil</h2>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-[#59e0c5] text-[#0f172a] px-3 py-1.5 rounded-lg hover:bg-[#59e0c5]/80 transition-colors"
              >
                <Edit2Icon size={16} />
                <span>Modifier</span>
              </button>
            ) : (
              <button 
                onClick={handleSave}
                disabled={isLoading}
                className={`flex items-center gap-2 bg-[#59e0c5] text-[#0f172a] px-3 py-1.5 rounded-lg ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#59e0c5]/80 transition-colors'}`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#0f172a] border-t-transparent rounded-full animate-spin mr-1"></div>
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <SaveIcon size={16} />
                    <span>Enregistrer</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#59e0c5]/20 border-4 border-[#59e0c5] flex items-center justify-center mb-3">
                <UserIcon className="w-14 h-14 text-[#59e0c5]" />
              </div>
              <button className="mt-2 text-sm text-[#59e0c5] hover:underline">
                Changer l'avatar
              </button>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm text-[#59e0c5] mb-1">Nom Complet</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full bg-[#0f172a] border border-[#59e0c5] rounded-lg px-4 py-2 text-white"
                  />
                ) : (
                  <p className="text-white">{userData?.full_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-[#59e0c5] mb-1">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-[#0f172a] border border-[#59e0c5] rounded-lg px-4 py-2 text-white"
                  />
                ) : (
                  <p className="text-white">{userData?.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-[#59e0c5] mb-1">Téléphone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-[#0f172a] border border-[#59e0c5] rounded-lg px-4 py-2 text-white"
                  />
                ) : (
                  <p className="text-white">{userData?.phone || "Non spécifié"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-[#59e0c5] mb-1">Adresse</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full bg-[#0f172a] border border-[#59e0c5] rounded-lg px-4 py-2 text-white"
                  />
                ) : (
                  <p className="text-white">{userData?.address || "Non spécifié"}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-[#1E2B47] rounded-2xl p-5 sm:p-8 mb-8"
        >
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Sécurité du compte</h3>
          
          <button 
            className="w-full flex items-center justify-between text-white bg-[#0f172a] p-3 rounded-lg mb-3 hover:bg-[#0f172a]/80"
            onClick={() => navigate('/dashboard')}
          >
            <span>Mon tableau de bord</span>
            <span className="bg-[#59e0c5] text-[#0f172a] px-2 py-0.5 rounded text-xs">Nouveau</span>
          </button>
          
          <button className="w-full flex items-center justify-between text-white bg-[#0f172a] p-3 rounded-lg mb-3 hover:bg-[#0f172a]/80">
            <span>Changer le mot de passe</span>
            <SettingsIcon size={20} className="text-[#59e0c5]" />
          </button>
          
          <button className="w-full flex items-center justify-between text-white bg-[#0f172a] p-3 rounded-lg mb-3 hover:bg-[#0f172a]/80">
            <span>Paramètres de notification</span>
            <BellIcon size={20} className="text-[#59e0c5]" />
          </button>
          
          <button 
            onClick={showLogoutConfirmation}
            className="w-full flex items-center justify-between text-red-500 bg-[#0f172a] p-3 rounded-lg hover:bg-[#0f172a]/80"
          >
            <span>Se déconnecter</span>
            <LogOutIcon size={20} />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile; 