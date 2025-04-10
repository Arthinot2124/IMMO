import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  BellIcon, HomeIcon, SettingsIcon, ClipboardListIcon, 
  CalendarIcon, BuildingIcon, GridIcon, ListIcon 
} from "lucide-react";

// Mock data for dashboard
const mockProperties = [
  { id: 1, title: "Villa moderne à Tambohobe", status: "En vente", price: "450 000 000 Ar", views: 152, image: "/public_Trano/maison-01.png" },
  { id: 2, title: "Appartement F3 Antarandolo", status: "En visite", price: "250 000 000 Ar", views: 98, image: "/public_Trano/calque-3.png" }
];

const mockRequests = [
  { id: 1, title: "Maison 3 chambres Andrainjato", status: "Acceptée", date: "15 Sept 2023" },
  { id: 2, title: "Terrain 600m² Ambanidia", status: "En attente", date: "10 Oct 2023" }
];

const mockAppointments = [
  { id: 1, property: "Appartement F3 Antarandolo", date: "15 Oct 2023", time: "14:00", status: "Confirmé" },
  { id: 2, property: "Villa moderne à Tambohobe", date: "20 Oct 2023", time: "10:30", status: "En attente" }
];

const mockOrders = [
  { id: 1, property: "Terrain 500m² Isada", type: "Achat", amount: "80 000 000 Ar", date: "05 Sept 2023", status: "Complété" }
];

export const Dashboard = (): JSX.Element => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("properties");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  };

  // Generate content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "properties":
        return (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`mt-6 ${viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-4"}`}
          >
            {mockProperties.map((property) => (
              <motion.div
                key={property.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="bg-[#0f172a] rounded-lg overflow-hidden border border-[#59e0c5]/30"
              >
                <div className={viewMode === "grid" ? "flex flex-col" : "flex"}>
                  <div className={`${viewMode === "grid" ? "h-40" : "w-[120px] h-[90px]"} flex-shrink-0 bg-[#1e293b]`}>
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-[#59e0c5] font-semibold">{property.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        property.status === "En vente" ? "bg-blue-500/20 text-blue-300" : 
                        property.status === "En visite" ? "bg-yellow-500/20 text-yellow-300" :
                        "bg-green-500/20 text-green-300"
                      }`}>
                        {property.status}
                      </span>
                    </div>
                    <p className="text-white font-medium">{property.price}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-gray-400 text-sm">{property.views} vues</span>
                      <button 
                        onClick={() => navigate(`/property/${property.id}`)}
                        className="text-[#59e0c5] text-sm hover:underline"
                      >
                        Voir détails
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        );
      
      case "requests":
        return (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-6 space-y-4"
          >
            {mockRequests.map((request) => (
              <motion.div
                key={request.id}
                variants={itemVariants}
                className="bg-[#0f172a] rounded-lg p-4 border-l-4 border-[#59e0c5]"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-medium mb-1">{request.title}</h3>
                    <p className="text-gray-400 text-sm">Soumis le {request.date}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    request.status === "Acceptée" ? "bg-green-500/20 text-green-300" : 
                    request.status === "Refusée" ? "bg-red-500/20 text-red-300" :
                    "bg-yellow-500/20 text-yellow-300"
                  }`}>
                    {request.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        );
      
      case "appointments":
        return (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-6 space-y-4"
          >
            {mockAppointments.map((appointment) => (
              <motion.div
                key={appointment.id}
                variants={itemVariants}
                className="bg-[#0f172a] rounded-lg p-4"
              >
                <div className="flex">
                  <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[#1E2B47] flex items-center justify-center mr-3">
                    <CalendarIcon className="text-[#59e0c5] w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-1">{appointment.property}</h3>
                    <div className="flex justify-between">
                      <p className="text-gray-400 text-sm">{appointment.date} à {appointment.time}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        appointment.status === "Confirmé" ? "bg-green-500/20 text-green-300" : 
                        "bg-yellow-500/20 text-yellow-300"
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        );

      case "orders":
        return (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-6 space-y-4"
          >
            {mockOrders.length > 0 ? (
              mockOrders.map((order) => (
                <motion.div
                  key={order.id}
                  variants={itemVariants}
                  className="bg-[#0f172a] rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-medium">{order.property}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === "Complété" ? "bg-green-500/20 text-green-300" : 
                      "bg-blue-500/20 text-blue-300"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-[#59e0c5] font-medium">{order.amount}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-400 text-sm">{order.type}</span>
                    <span className="text-gray-400 text-sm">{order.date}</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">Vous n'avez pas encore d'achats ou de locations</p>
              </div>
            )}
          </motion.div>
        );
      
      default:
        return <div>Contenu non disponible</div>;
    }
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
              className="w-8 h-8 sm:w-10 sm:h-10 text-[#59e0c5] cursor-pointer hover:text-[#59e0c5]/80 transition-colors" 
              onClick={() => navigate('/home')}
            />
            <BellIcon 
              className="w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-[#59e0c5] cursor-pointer hover:text-[#59e0c5]/80 transition-colors"
              onClick={() => navigate('/notifications')}
            />
            <SettingsIcon 
              className="w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-[#59e0c5] cursor-pointer hover:text-[#59e0c5]/80 transition-colors"
              onClick={() => navigate('/profile')}
            />
          </div>
        </motion.header>

        {/* Dashboard Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#1E2B47] rounded-2xl p-5 sm:p-8 mb-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Mon Tableau de Bord</h1>
            {activeTab === "properties" && (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg ${viewMode === "grid" ? 'bg-[#59e0c5]/20' : 'bg-transparent'}`}
                >
                  <GridIcon className="w-5 h-5 text-[#59e0c5]" />
                </button>
                <button 
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg ${viewMode === "list" ? 'bg-[#59e0c5]/20' : 'bg-transparent'}`}
                >
                  <ListIcon className="w-5 h-5 text-[#59e0c5]" />
                </button>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#0f172a] rounded-lg p-4 flex flex-col">
              <BuildingIcon className="w-6 h-6 text-[#59e0c5] mb-2" />
              <span className="text-xs text-gray-400">Mes propriétés</span>
              <span className="text-xl text-white font-bold">{mockProperties.length}</span>
            </div>
            <div className="bg-[#0f172a] rounded-lg p-4 flex flex-col">
              <ClipboardListIcon className="w-6 h-6 text-[#59e0c5] mb-2" />
              <span className="text-xs text-gray-400">Demandes</span>
              <span className="text-xl text-white font-bold">{mockRequests.length}</span>
            </div>
            <div className="bg-[#0f172a] rounded-lg p-4 flex flex-col">
              <CalendarIcon className="w-6 h-6 text-[#59e0c5] mb-2" />
              <span className="text-xs text-gray-400">Visites</span>
              <span className="text-xl text-white font-bold">{mockAppointments.length}</span>
            </div>
            <div className="bg-[#0f172a] rounded-lg p-4 flex flex-col">
              <HomeIcon className="w-6 h-6 text-[#59e0c5] mb-2" />
              <span className="text-xs text-gray-400">Achats</span>
              <span className="text-xl text-white font-bold">{mockOrders.length}</span>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex overflow-x-auto pb-2 space-x-4 border-b border-[#59e0c5]/30">
            <button 
              onClick={() => setActiveTab("properties")}
              className={`pb-2 font-medium whitespace-nowrap ${activeTab === "properties" ? "text-[#59e0c5] border-b-2 border-[#59e0c5]" : "text-gray-400"}`}
            >
              Mes propriétés
            </button>
            <button 
              onClick={() => setActiveTab("requests")}
              className={`pb-2 font-medium whitespace-nowrap ${activeTab === "requests" ? "text-[#59e0c5] border-b-2 border-[#59e0c5]" : "text-gray-400"}`}
            >
              Mes demandes
            </button>
            <button 
              onClick={() => setActiveTab("appointments")}
              className={`pb-2 font-medium whitespace-nowrap ${activeTab === "appointments" ? "text-[#59e0c5] border-b-2 border-[#59e0c5]" : "text-gray-400"}`}
            >
              Mes visites
            </button>
            <button 
              onClick={() => setActiveTab("orders")}
              className={`pb-2 font-medium whitespace-nowrap ${activeTab === "orders" ? "text-[#59e0c5] border-b-2 border-[#59e0c5]" : "text-gray-400"}`}
            >
              Mes achats
            </button>
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </motion.div>

        {/* Add Property Button */}
        <div className="text-center mb-16">
          <button 
            onClick={() => navigate('/property-request')}
            className="inline-flex items-center gap-2 bg-[#59e0c5] text-[#0f172a] px-6 py-3 rounded-lg font-bold hover:bg-[#59e0c5]/80 transition-colors"
          >
            <BuildingIcon size={18} />
            <span>Ajouter une nouvelle propriété</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard; 