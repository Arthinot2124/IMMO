import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BellIcon, HomeIcon, SettingsIcon, UserIcon, LogOutIcon, Edit2Icon, SaveIcon } from "lucide-react";

export const Profile = (): JSX.Element => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    fullName: "Rakoto Andrianavalona",
    email: "rakoto@example.com",
    phone: "+261 34 00 000 00",
    address: "Lot II K 44 bis Itaosy Antananarivo"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Save the data to backend
    // For now just toggle edit mode
    setIsEditing(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-[#0f172a] min-h-screen"
    >
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
            <BellIcon 
              className="w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-[#59e0c5] cursor-pointer hover:text-[#59e0c5]/80 transition-colors"
              onClick={() => navigate('/notifications')}
            />
            <SettingsIcon className="w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-[#59e0c5]" />
          </div>
        </motion.header>

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
                className="flex items-center gap-2 bg-[#59e0c5] text-[#0f172a] px-3 py-1.5 rounded-lg hover:bg-[#59e0c5]/80 transition-colors"
              >
                <SaveIcon size={16} />
                <span>Enregistrer</span>
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
                    name="fullName"
                    value={userData.fullName}
                    onChange={handleInputChange}
                    className="w-full bg-[#0f172a] border border-[#59e0c5] rounded-lg px-4 py-2 text-white"
                  />
                ) : (
                  <p className="text-white">{userData.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-[#59e0c5] mb-1">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    className="w-full bg-[#0f172a] border border-[#59e0c5] rounded-lg px-4 py-2 text-white"
                  />
                ) : (
                  <p className="text-white">{userData.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-[#59e0c5] mb-1">Téléphone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={userData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-[#0f172a] border border-[#59e0c5] rounded-lg px-4 py-2 text-white"
                  />
                ) : (
                  <p className="text-white">{userData.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-[#59e0c5] mb-1">Adresse</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={userData.address}
                    onChange={handleInputChange}
                    className="w-full bg-[#0f172a] border border-[#59e0c5] rounded-lg px-4 py-2 text-white"
                  />
                ) : (
                  <p className="text-white">{userData.address}</p>
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
          
          <button className="w-full flex items-center justify-between text-red-500 bg-[#0f172a] p-3 rounded-lg hover:bg-[#0f172a]/80">
            <span>Se déconnecter</span>
            <LogOutIcon size={20} />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile; 