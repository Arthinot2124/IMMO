import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  PlusIcon, EditIcon, TrashIcon, SearchIcon, 
  RefreshCwIcon, ChevronLeftIcon, ChevronRightIcon,
  ArrowLeftIcon, CheckIcon, XIcon
} from "lucide-react";
import userService from "../../services/userService";
import { UserData } from "../../services/authService";

interface UserFormData {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  role_id: number;
  address: string;
}

const UserManagement = (): JSX.Element => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role_id: 2,
    address: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLightMode, setIsLightMode] = useState(() => {
    const savedMode = localStorage.getItem('isLightMode');
    return savedMode !== null ? savedMode === 'true' : false;
  });
  const [showPassword, setShowPassword] = useState(false);
  const usersPerPage = 8;
  
  // Couleurs en fonction du mode
  const bgColor = isLightMode ? "bg-white" : "bg-[#0f172a]";
  const cardBgColor = isLightMode ? "bg-[#F8FAFC]" : "bg-[#1e293b]";
  const textColor = isLightMode ? "text-[#0150BC]" : "text-[#59e0c5]";
  const textPrimaryColor = isLightMode ? "text-[#1E293B]" : "text-white";
  const textSecondaryColor = isLightMode ? "text-gray-700" : "text-gray-300";
  const buttonPrimaryBg = isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]";
  const buttonPrimaryText = isLightMode ? "text-white" : "text-[#0f172a]";
  const cardBorder = isLightMode ? "border border-[#0150BC]/30" : "";
  const actionButtonBg = isLightMode ? "bg-[#EFF6FF]" : "bg-[#0f172a]";
  const modalBgColor = isLightMode ? "bg-white" : "bg-[#1e293b]";
  const inputBgColor = isLightMode ? "bg-white" : "bg-[#0f172a]";
  const inputBorderColor = isLightMode ? "border-gray-300" : "border-gray-600";
  const inputFocusBorderColor = isLightMode ? "border-[#0150BC]" : "border-[#59e0c5]";
  const borderColorLight = isLightMode ? "border-[#0150BC]/30" : "border-[#59e0c5]/30";
  const buttonBg = isLightMode ? "bg-[#EFF6FF]" : "bg-[#1e293b]";
  const buttonHoverBg = isLightMode ? "hover:bg-[#0150BC]" : "hover:bg-[#59e0c5]";
  const buttonBorder = isLightMode ? "border border-[#0150BC]" : "";
  const buttonShadow = isLightMode ? "shadow-sm" : "";

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  // Mise à jour du mode clair/sombre
  useEffect(() => {
    const handleStorageChange = () => {
      const savedMode = localStorage.getItem('isLightMode');
      if (savedMode !== null) {
        setIsLightMode(savedMode === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    const interval = setInterval(() => {
      const savedMode = localStorage.getItem('isLightMode');
      if (savedMode !== null && (savedMode === 'true') !== isLightMode) {
        setIsLightMode(savedMode === 'true');
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [isLightMode]);

  // Fonction pour basculer le mode clair/sombre
  const toggleLightMode = () => {
    const newMode = !isLightMode;
    setIsLightMode(newMode);
    localStorage.setItem('isLightMode', newMode.toString());
  };

  // Navigation vers le tableau de bord d'administration
  const navigateToAdminDashboard = () => {
    navigate('/admin/dashboard');
  };

  // Charger les utilisateurs au chargement du composant
  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  // Fonction pour récupérer tous les utilisateurs depuis l'API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
      // La pagination pourrait être implémentée côté serveur
      setTotalPages(Math.ceil(data.length / usersPerPage));
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la récupération des utilisateurs");
      setLoading(false);
    }
  };

  // Recherche d'utilisateurs
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      fetchUsers();
      return;
    }
    
    const filteredUsers = users.filter(user => 
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.phone && user.phone.includes(searchQuery))
    );
    
    setUsers(filteredUsers);
  };

  // Gestion de la pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Ouvrir le modal d'ajout d'utilisateur
  const openAddModal = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      password: "",
      role_id: 2,
      address: ""
    });
    setShowAddModal(true);
  };

  // Ouvrir le modal d'édition d'utilisateur
  const openEditModal = (user: UserData) => {
    setSelectedUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email || "",
      phone: user.phone || "",
      password: "", // Le mot de passe n'est pas renvoyé par l'API
      role_id: user.role_id,
      address: user.address || ""
    });
    setShowEditModal(true);
  };

  // Ouvrir le modal de suppression d'utilisateur
  const openDeleteModal = (user: UserData) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Gestion du changement des champs du formulaire
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'role_id' ? parseInt(value) : value
    }));
  };

  // Ajouter un nouvel utilisateur
  const handleAddUser = async () => {
    setIsSubmitting(true);
    
    try {
      await userService.createUser({
        full_name: formData.full_name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        password: formData.password,
        role_id: formData.role_id,
        address: formData.address || undefined
      });
      
      setShowAddModal(false);
      fetchUsers();
      setIsSubmitting(false);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'ajout de l'utilisateur");
      setIsSubmitting(false);
    }
  };

  // Mettre à jour un utilisateur existant
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    
    try {
      const updateData: any = {};
      
      if (formData.full_name !== selectedUser.full_name) {
        updateData.full_name = formData.full_name;
      }
      
      if (formData.email !== (selectedUser.email || "")) {
        updateData.email = formData.email || null;
      }
      
      if (formData.phone !== (selectedUser.phone || "")) {
        updateData.phone = formData.phone || null;
      }
      
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      if (formData.role_id !== selectedUser.role_id) {
        updateData.role_id = formData.role_id;
      }
      
      if (formData.address !== (selectedUser.address || "")) {
        updateData.address = formData.address || null;
      }
      
      if (Object.keys(updateData).length > 0) {
        await userService.updateUser(selectedUser.user_id, updateData);
      }
      
      setShowEditModal(false);
      fetchUsers();
      setIsSubmitting(false);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour de l'utilisateur");
      setIsSubmitting(false);
    }
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    
    try {
      await userService.deleteUser(selectedUser.user_id);
      setShowDeleteModal(false);
      fetchUsers();
      setIsSubmitting(false);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression de l'utilisateur");
      setIsSubmitting(false);
    }
  };

  // Afficher le rôle sous forme textuelle
  const getRoleName = (roleId: number): string => {
    switch (roleId) {
      case 1:
        return "Administrateur";
      case 2:
        return "Client";
      default:
        return "Inconnu";
    }
  };

  return (
    <motion.div 
      className={`min-h-screen ${bgColor} ${textPrimaryColor} relative`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div 
        className="fixed inset-0 opacity-50 z-0" 
        style={{ 
          backgroundImage: `url(${isLightMode ? '/public_Accueil_Sombre/blie-pattern2.jpeg' : '/public_Accueil_Sombre/blie-pattern.png'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'fixed',
          transition: 'background-image 0.5s ease-in-out'
        }}
      ></div>
      {/* Entête */}
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex items-center mb-6">
          <motion.button
            onClick={navigateToAdminDashboard}
            className={`p-2 mr-4 rounded-full ${actionButtonBg} ${textColor}`}
            variants={itemVariants}
          >
            <ArrowLeftIcon size={20} />
          </motion.button>
          
          <motion.h1 
            className={`text-2xl font-bold ${textColor} flex-grow`}
            variants={itemVariants}
          >
            Gestion des Utilisateurs
          </motion.h1>
        </div>
        
        {/* Barre d'actions */}
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6"
          variants={itemVariants}
        >
          <div className="flex w-full md:w-auto">
            <div className={`flex items-center border ${borderColorLight} rounded-l-lg px-3 ${inputBgColor}`}>
              <SearchIcon size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className={`flex-1 py-2 px-3 border-y ${borderColorLight} outline-none ${inputBgColor} ${textPrimaryColor}`}
            />
            <button
              onClick={handleSearch}
              className={`${buttonPrimaryBg} ${buttonPrimaryText} rounded-r-lg px-4 py-2`}
            >
              Rechercher
            </button>
          </div>
          
          <button
            onClick={openAddModal}
            className={`${buttonPrimaryBg} ${buttonPrimaryText} rounded-lg px-4 py-2 flex items-center gap-2 w-full md:w-auto justify-center`}
          >
            <PlusIcon size={18} />
            <span>Ajouter un utilisateur</span>
          </button>
        </motion.div>
        
        {/* Message d'erreur */}
        {error && (
          <motion.div 
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
            variants={itemVariants}
          >
            {error}
          </motion.div>
        )}
        
        {/* Tableau des utilisateurs */}
        <motion.div 
          className={`overflow-hidden rounded-xl ${cardBgColor} ${cardBorder}`}
          variants={itemVariants}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className={`${isLightMode ? 'bg-gray-50' : 'bg-gray-800'}`}>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom Complet</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">Chargement...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">Aucun utilisateur trouvé</td>
                  </tr>
                ) : (
                  users
                    .slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage)
                    .map(user => (
                      <tr key={user.user_id} className={`hover:${isLightMode ? 'bg-gray-50' : 'bg-gray-700/20'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">{user.user_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.full_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.email || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.phone || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span 
                            className={`px-2 py-1 rounded-full text-xs ${
                              user.role_id === 1 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {getRoleName(user.role_id)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => openEditModal(user)}
                              className={`p-1 rounded-full ${actionButtonBg} text-blue-600`}
                            >
                              <EditIcon size={16} />
                            </button>
                            <button 
                              onClick={() => openDeleteModal(user)}
                              className={`p-1 rounded-full ${actionButtonBg} text-red-600`}
                            >
                              <TrashIcon size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {users.length > usersPerPage && (
            <div className="flex justify-between items-center p-4 border-t border-gray-200">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${buttonBg} ${buttonBorder} ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ChevronLeftIcon size={16} />
              </button>
              <span className="text-[#0150BC]">
                Page {currentPage} sur {Math.ceil(users.length / usersPerPage)}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(users.length / usersPerPage)))}
                disabled={currentPage === Math.ceil(users.length / usersPerPage)}
                className={`p-2 rounded-lg ${buttonBg} ${buttonBorder} ${currentPage === Math.ceil(users.length / usersPerPage) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ChevronRightIcon size={16} />
              </button>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Modal d'ajout d'utilisateur */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${modalBgColor} rounded-lg w-full max-w-lg shadow-xl p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${textColor}`}>Ajouter un utilisateur</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block mb-1 text-sm font-medium ${textSecondaryColor}`}>
                  Nom complet
                </label>
                <input 
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 rounded-lg border ${inputBorderColor} focus:outline-none focus:ring-1 focus:${inputFocusBorderColor} ${inputBgColor}`}
                  required
                />
              </div>
              
              <div>
                <label className={`block mb-1 text-sm font-medium ${textSecondaryColor}`}>
                  Email
                </label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 rounded-lg border ${inputBorderColor} focus:outline-none focus:ring-1 focus:${inputFocusBorderColor} ${inputBgColor}`}
                />
              </div>
              
              <div>
                <label className={`block mb-1 text-sm font-medium ${textSecondaryColor}`}>
                  Téléphone
                </label>
                <input 
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 rounded-lg border ${inputBorderColor} focus:outline-none focus:ring-1 focus:${inputFocusBorderColor} ${inputBgColor}`}
                />
              </div>
              
              <div>
                <label className={`block mb-1 text-sm font-medium ${textSecondaryColor}`}>
                  Mot de passe
                </label>
                <input 
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 rounded-lg border ${inputBorderColor} focus:outline-none focus:ring-1 focus:${inputFocusBorderColor} ${inputBgColor}`}
                  required
                />
              </div>
              
              <div>
                <label className={`block mb-1 text-sm font-medium ${textSecondaryColor}`}>
                  Rôle
                </label>
                <select 
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 rounded-lg border ${inputBorderColor} focus:outline-none focus:ring-1 focus:${inputFocusBorderColor} ${inputBgColor}`}
                >
                  <option value={1}>Administrateur</option>
                  <option value={2}>Client</option>
                </select>
              </div>
              
              <div>
                <label className={`block mb-1 text-sm font-medium ${textSecondaryColor}`}>
                  Adresse
                </label>
                <input 
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 rounded-lg border ${inputBorderColor} focus:outline-none focus:ring-1 focus:${inputFocusBorderColor} ${inputBgColor}`}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={() => setShowAddModal(false)}
                className={`px-4 py-2 rounded-lg border ${borderColorLight} ${textPrimaryColor}`}
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button 
                onClick={handleAddUser}
                className={`px-4 py-2 rounded-lg ${buttonPrimaryBg} ${buttonPrimaryText} flex items-center gap-2`}
                disabled={isSubmitting || !formData.full_name || !formData.password}
              >
                {isSubmitting ? 'En cours...' : 'Ajouter'}
                {isSubmitting ? (
                  <RefreshCwIcon size={16} className="animate-spin" />
                ) : (
                  <CheckIcon size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal d'édition d'utilisateur */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${modalBgColor} rounded-lg w-full max-w-lg shadow-xl p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${textColor}`}>Modifier l'utilisateur</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block mb-1 text-sm font-medium ${textSecondaryColor}`}>
                  Nom complet
                </label>
                <input 
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 rounded-lg border ${inputBorderColor} focus:outline-none focus:ring-1 focus:${inputFocusBorderColor} ${inputBgColor}`}
                  required
                />
              </div>
              
              <div>
                <label className={`block mb-1 text-sm font-medium ${textSecondaryColor}`}>
                  Email
                </label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 rounded-lg border ${inputBorderColor} focus:outline-none focus:ring-1 focus:${inputFocusBorderColor} ${inputBgColor}`}
                />
              </div>
              
              <div>
                <label className={`block mb-1 text-sm font-medium ${textSecondaryColor}`}>
                  Téléphone
                </label>
                <input 
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 rounded-lg border ${inputBorderColor} focus:outline-none focus:ring-1 focus:${inputFocusBorderColor} ${inputBgColor}`}
                />
              </div>
              
              <div className="relative">
                <label className={`block mb-1 text-sm font-medium ${textSecondaryColor}`}>
                  Mot de passe (laisser vide pour ne pas modifier)
                </label>
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 rounded-lg border ${inputBorderColor} focus:outline-none focus:ring-1 focus:${inputFocusBorderColor} ${inputBgColor} pr-10`}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-8 text-gray-500 hover:text-gray-700"
                >
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
              
              <div>
                <label className={`block mb-1 text-sm font-medium ${textSecondaryColor}`}>
                  Rôle
                </label>
                <select 
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 rounded-lg border ${inputBorderColor} focus:outline-none focus:ring-1 focus:${inputFocusBorderColor} ${inputBgColor}`}
                >
                  <option value={1}>Administrateur</option>
                  <option value={2}>Client</option>
                </select>
              </div>
              
              <div>
                <label className={`block mb-1 text-sm font-medium ${textSecondaryColor}`}>
                  Adresse
                </label>
                <input 
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 rounded-lg border ${inputBorderColor} focus:outline-none focus:ring-1 focus:${inputFocusBorderColor} ${inputBgColor}`}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={() => setShowEditModal(false)}
                className={`px-4 py-2 rounded-lg border ${borderColorLight} ${textPrimaryColor}`}
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button 
                onClick={handleUpdateUser}
                className={`px-4 py-2 rounded-lg ${buttonPrimaryBg} ${buttonPrimaryText} flex items-center gap-2`}
                disabled={isSubmitting || !formData.full_name}
              >
                {isSubmitting ? 'En cours...' : 'Mettre à jour'}
                {isSubmitting ? (
                  <RefreshCwIcon size={16} className="animate-spin" />
                ) : (
                  <CheckIcon size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de suppression d'utilisateur */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${modalBgColor} rounded-lg w-full max-w-md shadow-xl p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${textColor}`}>Supprimer l'utilisateur</h2>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <p className={textPrimaryColor}>
                Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{selectedUser.full_name}</strong> ?
                Cette action est irréversible.
              </p>
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className={`px-4 py-2 rounded-lg border ${borderColorLight} ${textPrimaryColor}`}
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button 
                onClick={handleDeleteUser}
                className="px-4 py-2 rounded-lg bg-red-600 text-white flex items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'En cours...' : 'Supprimer'}
                {isSubmitting ? (
                  <RefreshCwIcon size={16} className="animate-spin" />
                ) : (
                  <TrashIcon size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default UserManagement; 