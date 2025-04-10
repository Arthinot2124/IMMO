import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { 
  BellIcon, HomeIcon, SettingsIcon, CheckCircleIcon, 
  CreditCardIcon, BuildingIcon, CalendarIcon, ArrowRightIcon
} from "lucide-react";

// Mock property data based on ID
const getPropertyData = (id: string) => {
  const properties = {
    "1": {
      id: 1,
      title: "Villa moderne à Tambohobe",
      price: "450 000 000 Ar",
      location: "Tambohobe, Fianarantsoa",
      image: "/public_Trano/maison-01.png",
      surface: "200m²",
      bedrooms: 3,
      bathrooms: 2
    },
    "2": {
      id: 2,
      title: "Appartement F3 Antarandolo",
      price: "250 000 000 Ar",
      location: "Antarandolo, Fianarantsoa",
      image: "/public_Trano/calque-3.png",
      surface: "90m²",
      bedrooms: 2,
      bathrooms: 1
    },
    "3": {
      id: 3,
      title: "Terrain 500m² Isada",
      price: "80 000 000 Ar",
      location: "Isada, Fianarantsoa",
      image: "/public_Trano/calque-4.png",
      surface: "500m²",
      bedrooms: null,
      bathrooms: null
    }
  };
  
  return properties[id as keyof typeof properties] || properties["1"];
};

export const Checkout = (): JSX.Element => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const property = getPropertyData(id || "1");
  
  const [orderType, setOrderType] = useState<"achat" | "location">("achat");
  const [paymentMethod, setPaymentMethod] = useState<"carte" | "virement" | "espèces">("carte");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Generate a random order ID
  const generateOrderId = () => {
    return `OR-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      setCurrentStep(2);
    } else {
      // Simulate API call
      setTimeout(() => {
        setOrderSuccess(true);
        setOrderId(generateOrderId());
        
        // Reset form and redirect after success
        setTimeout(() => {
          navigate('/dashboard');
        }, 5000);
      }, 1500);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-[#0f172a] min-h-screen"
    >
      <div className="max-w-[1440px] mx-auto px-4 xs:px-6 sm:px-8 md:px-12 lg:px-16 pt-4 xs:pt-6 sm:pt-8 md:pt-10 lg:pt-12 pb-16">
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
              className="w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-[#59e0c5]"
              onClick={() => navigate('/profile')}
            />
          </div>
          <button
            onClick={() => navigate(`/property/${id}`)}
            className="text-[#59e0c5] hover:underline"
          >
            Retour à l'annonce
          </button>
        </motion.header>

        {/* Checkout Container */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#1E2B47] rounded-2xl overflow-hidden"
        >
          {/* Steps Header */}
          {!orderSuccess && (
            <div className="bg-[#0f172a] p-4">
              <div className="flex justify-between">
                <div className={`flex flex-col items-center ${currentStep >= 1 ? 'text-[#59e0c5]' : 'text-gray-500'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${currentStep >= 1 ? 'bg-[#59e0c5] text-[#0f172a]' : 'bg-gray-800 text-gray-500'}`}>
                    1
                  </div>
                  <span className="text-xs">Détails</span>
                </div>
                <div className="grow flex items-center px-2">
                  <div className={`h-1 w-full ${currentStep >= 2 ? 'bg-[#59e0c5]' : 'bg-gray-700'}`}></div>
                </div>
                <div className={`flex flex-col items-center ${currentStep >= 2 ? 'text-[#59e0c5]' : 'text-gray-500'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${currentStep >= 2 ? 'bg-[#59e0c5] text-[#0f172a]' : 'bg-gray-800 text-gray-500'}`}>
                    2
                  </div>
                  <span className="text-xs">Paiement</span>
                </div>
                <div className="grow flex items-center px-2">
                  <div className={`h-1 w-full ${currentStep >= 3 ? 'bg-[#59e0c5]' : 'bg-gray-700'}`}></div>
                </div>
                <div className={`flex flex-col items-center ${currentStep >= 3 ? 'text-[#59e0c5]' : 'text-gray-500'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${currentStep >= 3 ? 'bg-[#59e0c5] text-[#0f172a]' : 'bg-gray-800 text-gray-500'}`}>
                    3
                  </div>
                  <span className="text-xs">Confirmation</span>
                </div>
              </div>
            </div>
          )}

          {/* Property Info Header */}
          <div className="flex items-center p-4 sm:p-6 border-b border-[#59e0c5]/30">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden mr-4">
              <img
                src={property.image}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">{property.title}</h2>
              <p className="text-[#59e0c5]">{property.price}</p>
              <p className="text-gray-400 text-sm">{property.location}</p>
            </div>
          </div>

          {/* Success Message */}
          {orderSuccess ? (
            <div className="p-6 sm:p-8">
              <div className="bg-green-500/20 border border-green-500 rounded-lg p-6 text-center">
                <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Commande confirmée !</h2>
                <p className="text-gray-300 mb-2">
                  Votre {orderType === "achat" ? "achat" : "demande de location"} a été enregistré avec succès.
                </p>
                <div className="bg-[#0f172a] rounded-lg p-3 inline-block mb-3">
                  <span className="text-[#59e0c5] font-mono">Référence: {orderId}</span>
                </div>
                <p className="text-gray-300">
                  Un conseiller vous contactera bientôt pour finaliser la transaction.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-[#59e0c5] text-[#0f172a] px-6 py-2 rounded-lg font-medium hover:bg-[#59e0c5]/80 transition-colors"
                  >
                    Aller au tableau de bord
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {currentStep === 1 ? (
                <div className="p-6 sm:p-8">
                  <h1 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center">
                    <BuildingIcon className="mr-2 text-[#59e0c5]" />
                    {orderType === "achat" ? "Acheter cette propriété" : "Louer cette propriété"}
                  </h1>
                  
                  {/* Order Type Selection */}
                  <div className="mb-6">
                    <h3 className="text-[#59e0c5] font-semibold mb-3">Type de transaction</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setOrderType("achat")}
                        className={`p-4 rounded-lg border flex flex-col items-center ${
                          orderType === "achat"
                            ? "bg-[#59e0c5]/20 border-[#59e0c5] text-white"
                            : "bg-[#0f172a] border-[#59e0c5]/30 text-gray-300 hover:border-[#59e0c5]/50"
                        }`}
                      >
                        <BuildingIcon className={`w-6 h-6 mb-2 ${orderType === "achat" ? "text-[#59e0c5]" : "text-gray-400"}`} />
                        <span className="font-medium">Achat</span>
                        <span className="text-xs mt-1 opacity-75">Acquérir la propriété</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setOrderType("location")}
                        className={`p-4 rounded-lg border flex flex-col items-center ${
                          orderType === "location"
                            ? "bg-[#59e0c5]/20 border-[#59e0c5] text-white"
                            : "bg-[#0f172a] border-[#59e0c5]/30 text-gray-300 hover:border-[#59e0c5]/50"
                        }`}
                      >
                        <CalendarIcon className={`w-6 h-6 mb-2 ${orderType === "location" ? "text-[#59e0c5]" : "text-gray-400"}`} />
                        <span className="font-medium">Location</span>
                        <span className="text-xs mt-1 opacity-75">Louer la propriété</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="mb-6">
                    <h3 className="text-[#59e0c5] font-semibold mb-3">Vos coordonnées</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm text-gray-300 mb-1">
                          Nom complet*
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="w-full bg-[#0f172a] border border-[#59e0c5]/50 rounded-lg px-4 py-2 text-white"
                          placeholder="Votre nom"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm text-gray-300 mb-1">
                          Téléphone*
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="w-full bg-[#0f172a] border border-[#59e0c5]/50 rounded-lg px-4 py-2 text-white"
                          placeholder="Votre numéro de téléphone"
                          required
                        />
                      </div>
                      
                      <div className="sm:col-span-2">
                        <label htmlFor="email" className="block text-sm text-gray-300 mb-1">
                          Email*
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full bg-[#0f172a] border border-[#59e0c5]/50 rounded-lg px-4 py-2 text-white"
                          placeholder="Votre email"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Terms Acceptance */}
                  <div className="mb-6">
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-1 mr-2"
                        required
                      />
                      <span className="text-sm text-gray-300">
                        J'accepte les conditions générales de vente et la politique de confidentialité de Tafo Immo. Je comprends que cette commande constitue un engagement ferme de ma part.
                      </span>
                    </label>
                  </div>
                  
                  {/* Continue Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!contactName || !contactPhone || !contactEmail || !termsAccepted}
                      className={`px-6 py-2 rounded-lg font-medium flex items-center ${
                        !contactName || !contactPhone || !contactEmail || !termsAccepted
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-[#59e0c5] text-[#0f172a] hover:bg-[#59e0c5]/80"
                      }`}
                    >
                      <span>Continuer</span>
                      <ArrowRightIcon className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 sm:p-8">
                  <h1 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center">
                    <CreditCardIcon className="mr-2 text-[#59e0c5]" />
                    Moyen de paiement
                  </h1>
                  
                  {/* Payment Method Selection */}
                  <div className="mb-6">
                    <h3 className="text-[#59e0c5] font-semibold mb-3">Choisissez votre méthode de paiement</h3>
                    <div className="space-y-3">
                      <label className={`block p-4 rounded-lg border ${
                        paymentMethod === "carte"
                          ? "bg-[#59e0c5]/20 border-[#59e0c5]"
                          : "bg-[#0f172a] border-[#59e0c5]/30 hover:border-[#59e0c5]/50"
                      }`}>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === "carte"}
                            onChange={() => setPaymentMethod("carte")}
                            className="mr-3"
                          />
                          <div>
                            <span className="text-white font-medium">Carte bancaire</span>
                            <p className="text-xs text-gray-400 mt-1">
                              Paiement sécurisé par carte bancaire via notre partenaire.
                            </p>
                          </div>
                        </div>
                      </label>
                      
                      <label className={`block p-4 rounded-lg border ${
                        paymentMethod === "virement"
                          ? "bg-[#59e0c5]/20 border-[#59e0c5]"
                          : "bg-[#0f172a] border-[#59e0c5]/30 hover:border-[#59e0c5]/50"
                      }`}>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === "virement"}
                            onChange={() => setPaymentMethod("virement")}
                            className="mr-3"
                          />
                          <div>
                            <span className="text-white font-medium">Virement bancaire</span>
                            <p className="text-xs text-gray-400 mt-1">
                              Les détails du virement vous seront communiqués par email.
                            </p>
                          </div>
                        </div>
                      </label>
                      
                      <label className={`block p-4 rounded-lg border ${
                        paymentMethod === "espèces"
                          ? "bg-[#59e0c5]/20 border-[#59e0c5]"
                          : "bg-[#0f172a] border-[#59e0c5]/30 hover:border-[#59e0c5]/50"
                      }`}>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === "espèces"}
                            onChange={() => setPaymentMethod("espèces")}
                            className="mr-3"
                          />
                          <div>
                            <span className="text-white font-medium">Espèces à l'agence</span>
                            <p className="text-xs text-gray-400 mt-1">
                              Paiement en espèces directement à notre agence.
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {/* Summary */}
                  <div className="mb-6 bg-[#0f172a] rounded-lg p-4">
                    <h3 className="text-[#59e0c5] font-semibold mb-3">Récapitulatif</h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Bien immobilier:</span>
                        <span className="text-white">{property.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Type de transaction:</span>
                        <span className="text-white">{orderType === "achat" ? "Achat" : "Location"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Méthode de paiement:</span>
                        <span className="text-white capitalize">{paymentMethod}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-[#59e0c5]/30 pt-3 flex justify-between items-center">
                      <span className="text-gray-300">{orderType === "achat" ? "Prix d'achat" : "Loyer mensuel"}:</span>
                      <span className="text-xl font-bold text-[#59e0c5]">{property.price}</span>
                    </div>
                  </div>
                  
                  {/* Back and Submit Buttons */}
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-2 rounded-lg font-medium bg-[#0f172a] text-white hover:bg-[#1E293B] transition-colors"
                    >
                      Retour
                    </button>
                    
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-lg font-medium bg-[#59e0c5] text-[#0f172a] hover:bg-[#59e0c5]/80 transition-colors flex items-center"
                    >
                      <span>Confirmer la commande</span>
                      <CheckCircleIcon className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Checkout; 