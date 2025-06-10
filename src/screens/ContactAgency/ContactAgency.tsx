import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { HomeIcon, SettingsIcon, PhoneIcon, MailIcon, MapPinIcon, ArrowLeftIcon } from "lucide-react";
import NotificationBadge from "../../components/NotificationBadge";

export const ContactAgency = (): JSX.Element => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLightMode, setIsLightMode] = useState(() => {
    // Récupérer la préférence depuis localStorage au montage (ou true par défaut)
    const savedMode = localStorage.getItem('isLightMode');
    return savedMode !== null ? savedMode === 'true' : true;
  });

  // Couleurs qui changent en fonction du mode
  const accentColor = isLightMode ? "#0150BC" : "#59e0c5";
  const bgColor = isLightMode ? "bg-white" : "bg-[#0f172a]";
  const cardBgColor = isLightMode ? "bg-[#F8FAFC]" : "bg-[#1E2B47]";
  const textColor = isLightMode ? "text-[#0150BC]" : "text-[#59e0c5]";
  const textPrimaryColor = isLightMode ? "text-[#1E293B]" : "text-white";
  const textSecondaryColor = isLightMode ? "text-gray-700" : "text-gray-300";
  const buttonPrimaryBg = isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]";
  const buttonPrimaryText = isLightMode ? "text-white" : "text-[#0f172a]";
  const buttonSecondaryBg = isLightMode ? "bg-[#EFF6FF]" : "bg-[#1E2B47]";
  const buttonSecondaryText = isLightMode ? "text-[#0150BC]" : "text-white";
  const borderColor = isLightMode ? "border-[#0150BC]" : "border-[#59e0c5]";
  const borderColorLight = isLightMode ? "border-[#0150BC]/30" : "border-[#59e0c5]/30";
  const cardBorder = isLightMode ? "border border-[#0150BC]/30" : "border border-[#59e0c5]/30";

  // Mettre à jour le mode quand il change dans localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const savedMode = localStorage.getItem('isLightMode');
      if (savedMode !== null) {
        setIsLightMode(savedMode === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Vérifier régulièrement si le mode a changé
    const interval = setInterval(() => {
      const savedMode = localStorage.getItem('isLightMode');
      if (savedMode !== null && (savedMode === 'true') !== isLightMode) {
        setIsLightMode(savedMode === 'true');
      }
    }, 1000); // Vérifier chaque seconde

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [isLightMode]);

  // Données de l'agence
  const agencyInfo = {
    name: "Tafo Immo",
    phone: "+261 34 12 345 67",
    whatsapp: "+261 34 12 345 67",
    email: "contact@tafoimmo.com",
    address: "Lot II A 34 ter Ampandrana, Fianarantsoa 301",
    hours: "Lundi - Vendredi: 8h - 17h",
    description: "Tafo Immo est une agence immobilière spécialisée dans la vente et la location de biens immobiliers à Fianarantsoa et ses environs. Notre équipe de professionnels est à votre disposition pour vous accompagner dans tous vos projets immobiliers."
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`${bgColor} min-h-screen relative`}
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
      <div className="max-w-[1440px] mx-auto px-4 xs:px-6 sm:px-8 md:px-12 lg:px-16 pt-4 xs:pt-6 sm:pt-8 md:pt-10 lg:pt-12 relative z-10">
        {/* Navigation Bar */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center py-2 xs:py-4 mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-colors" onClick={() => navigate(`/property/${id}`)}>
            <img 
              src={isLightMode ? "/public_Trano/fleche_retour_b.png" : "/public_Trano/fleche_retour_v.png"} 
              alt="Retour" 
              className="w-7 h-7 xs:w-7 xs:h-7 sm:w-8 sm:h-8" 
            />
            <span className={`${textColor} font-medium`}>Detail</span>
          </div>
          <div className="flex gap-2 xs:gap-4">
            <HomeIcon 
              className={`w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 ${textColor} cursor-pointer hover:opacity-80 transition-colors`} 
              onClick={() => navigate('/home')}
            />
            <NotificationBadge size="lg" accentColor={accentColor} />
            <SettingsIcon 
              className={`w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 ${textColor} cursor-pointer hover:opacity-80 transition-colors`}
              onClick={() => navigate('/profile')}
            />
          </div>
        
        </motion.header>

        {/* Contact Information */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`${cardBgColor} rounded-2xl p-5 sm:p-8 mb-6 sm:mb-8 ${cardBorder}`}
        >
          <div className="flex flex-col items-center mb-6">
            <img src="/public_login/logo_couleur.png" alt="Logo Tafo Immo" className="w-24 h-24 mb-4" />
            <h1 className={`text-2xl sm:text-3xl font-bold ${textPrimaryColor} mb-2 text-center`}>Contactez {agencyInfo.name}</h1>
            <p className={`${textSecondaryColor} text-center max-w-lg`}>{agencyInfo.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Contact Methods */}
            <div className={`${cardBgColor} p-6 rounded-xl ${cardBorder}`}>
              <h2 className={`${textColor} text-xl font-semibold mb-4`}>Nous contacter</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${buttonSecondaryBg} ${textColor}`}>
                    <PhoneIcon size={20} />
                  </div>
                  <div>
                    <p className={`font-semibold ${textPrimaryColor}`}>Téléphone</p>
                    <p className={textSecondaryColor}>{agencyInfo.phone}</p>
                    <a 
                      href={`tel:${agencyInfo.phone.replace(/\s+/g, '')}`}
                      className={`text-sm ${textColor} hover:underline mt-1 inline-block`}
                    >
                      Appeler maintenant
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${buttonSecondaryBg} ${textColor}`}>
                    <svg 
                      className="w-5 h-5" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12A10 10 0 0 1 12 2m-1 5v2m2 0V7m-3.6 5.8c.2.8.7 1.2 1.6 1.2 1.3 0 2-.8 2-4 0 3.2.7 4 2 4 .9 0 1.4-.4 1.6-1.2" />
                    </svg>
                  </div>
                  <div>
                    <p className={`font-semibold ${textPrimaryColor}`}>WhatsApp</p>
                    <p className={textSecondaryColor}>{agencyInfo.whatsapp}</p>
                    <a 
                      href={`https://wa.me/${agencyInfo.whatsapp.replace(/\D/g, '')}`}
                      className={`text-sm ${textColor} hover:underline mt-1 inline-block`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Envoyer un message
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${buttonSecondaryBg} ${textColor}`}>
                    <MailIcon size={20} />
                  </div>
                  <div>
                    <p className={`font-semibold ${textPrimaryColor}`}>Email</p>
                    <p className={textSecondaryColor}>{agencyInfo.email}</p>
                    <a 
                      href={`mailto:${agencyInfo.email}`}
                      className={`text-sm ${textColor} hover:underline mt-1 inline-block`}
                    >
                      Envoyer un email
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Office Information */}
            <div className={`${cardBgColor} p-6 rounded-xl ${cardBorder}`}>
              <h2 className={`${textColor} text-xl font-semibold mb-4`}>Notre agence</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${buttonSecondaryBg} ${textColor}`}>
                    <MapPinIcon size={20} />
                  </div>
                  <div>
                    <p className={`font-semibold ${textPrimaryColor}`}>Adresse</p>
                    <p className={textSecondaryColor}>{agencyInfo.address}</p>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(agencyInfo.address)}`}
                      className={`text-sm ${textColor} hover:underline mt-1 inline-block`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Voir sur Google Maps
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${buttonSecondaryBg} ${textColor}`}>
                    <svg 
                      className="w-5 h-5" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <p className={`font-semibold ${textPrimaryColor}`}>Heures d'ouverture</p>
                    <p className={textSecondaryColor}>{agencyInfo.hours}</p>
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              <div className={`mt-6 w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center ${isLightMode ? "bg-gray-200" : "bg-gray-700"}`}>
                <p className={textSecondaryColor}>Carte de localisation</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`${cardBgColor} rounded-2xl p-5 sm:p-8 mb-10 ${cardBorder}`}
        >
          <h2 className={`${textColor} text-xl font-semibold mb-6`}>Envoyez-nous un message</h2>
          
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className={`block mb-1 ${textPrimaryColor} text-sm`}>Nom complet</label>
                <input 
                  type="text" 
                  id="name"
                  className={`w-full px-4 py-2 rounded-lg ${borderColorLight} border bg-transparent ${textPrimaryColor}`}
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label htmlFor="email" className={`block mb-1 ${textPrimaryColor} text-sm`}>Email</label>
                <input 
                  type="email" 
                  id="email"
                  className={`w-full px-4 py-2 rounded-lg ${borderColorLight} border bg-transparent ${textPrimaryColor}`}
                  placeholder="Votre email"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="subject" className={`block mb-1 ${textPrimaryColor} text-sm`}>Sujet</label>
              <input 
                type="text" 
                id="subject"
                className={`w-full px-4 py-2 rounded-lg ${borderColorLight} border bg-transparent ${textPrimaryColor}`}
                placeholder="Sujet de votre message"
              />
            </div>
            
            <div>
              <label htmlFor="message" className={`block mb-1 ${textPrimaryColor} text-sm`}>Message</label>
              <textarea 
                id="message"
                rows={4}
                className={`w-full px-4 py-2 rounded-lg ${borderColorLight} border bg-transparent ${textPrimaryColor}`}
                placeholder="Votre message..."
              ></textarea>
            </div>
            
            <div className="pt-2">
              <button 
                type="submit"
                className={`${buttonPrimaryBg} ${buttonPrimaryText} px-6 py-3 rounded-lg hover:opacity-90 transition-colors font-semibold`}
              >
                Envoyer le message
              </button>
            </div>
          </form>
        </motion.div>

        {/* Social Media Links */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center gap-4 mb-12"
        >
          {/* Facebook */}
          <a 
            href="#" 
            className={`w-10 h-10 rounded-full ${buttonSecondaryBg} ${textColor} flex items-center justify-center hover:opacity-90 transition-colors`}
            aria-label="Facebook"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
            </svg>
          </a>
          
          {/* Instagram */}
          <a 
            href="#" 
            className={`w-10 h-10 rounded-full ${buttonSecondaryBg} ${textColor} flex items-center justify-center hover:opacity-90 transition-colors`}
            aria-label="Instagram"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 00-3.16.5 5.24 5.24 0 00-2.34 1.52 5.24 5.24 0 00-1.52 2.34c-.32 1.23-.48 2.08-.48 3.16v2.96c0 1.08.16 1.93.48 3.16a5.24 5.24 0 001.52 2.34 5.24 5.24 0 002.34 1.52c1.23.32 2.08.48 3.16.48h2.96c1.08 0 1.93-.16 3.16-.48a5.24 5.24 0 002.34-1.52 5.24 5.24 0 001.52-2.34c.32-1.23.48-2.08.48-3.16v-2.96c0-1.08-.16-1.93-.48-3.16a5.24 5.24 0 00-1.52-2.34 5.24 5.24 0 00-2.34-1.52C16.89 2.16 16.04 2 14.96 2h-2.96zm0 6a4 4 0 110 8 4 4 0 010-8zm5-2a1 1 0 100-2 1 1 0 000 2z"/>
            </svg>
          </a>
          
          {/* LinkedIn */}
          <a 
            href="#" 
            className={`w-10 h-10 rounded-full ${buttonSecondaryBg} ${textColor} flex items-center justify-center hover:opacity-90 transition-colors`}
            aria-label="LinkedIn"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
            </svg>
          </a>
          
          {/* Twitter/X */}
          <a 
            href="#" 
            className={`w-10 h-10 rounded-full ${buttonSecondaryBg} ${textColor} flex items-center justify-center hover:opacity-90 transition-colors`}
            aria-label="Twitter"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ContactAgency; 