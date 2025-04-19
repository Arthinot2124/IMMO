import React, { useEffect, useState } from "react";
import { Card, CardContent, Separator, Switch } from "../../components/ui/ComponentAccueilSombre";
import { useNavigate } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
// @ts-ignore
import "./animations.css";
// @ts-ignore
import "./accueil.css";
import NotificationBadge from "../../components/NotificationBadge";
import { UserIcon, Settings } from "lucide-react";

const CountUp = ({ value }: { value: number }) => {
  const [count, setCount] = React.useState(0);

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60; // 60 steps for smooth animation
    const increment = value / steps;
    const interval = duration / steps;

    let currentCount = 0;
    const timer = setInterval(() => {
      currentCount += increment;
      if (currentCount >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(currentCount));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}</span>;
};

export const ElementAccueilSombre = (): JSX.Element => {
  const navigate = useNavigate();
  const controls = useAnimation();
  const [isLightMode, setIsLightMode] = useState(() => {
    // Récupérer la préférence depuis localStorage au montage (ou true par défaut)
    const savedMode = localStorage.getItem('isLightMode');
    return savedMode !== null ? savedMode === 'true' : true;
  });
  const [isEuro, setIsEuro] = useState(false);
  const [isSearch, setIsSearch] = useState(false);

  // Sauvegarder le mode dans localStorage quand il change
  useEffect(() => {
    localStorage.setItem('isLightMode', isLightMode.toString());
  }, [isLightMode]);

  // Couleur qui change en fonction du mode
  const accentColor = isLightMode ? "#0150BC" : "#59e0c5";
  // Couleur de fond des cartes
  const cardBgColor = isLightMode ? "rgba(240, 240, 240, 0.85)" : "#1E2B47";
  // Couleur du texte
  const textColor = isLightMode ? "#333333" : "white";
  // Style de bordure des cartes
  const cardBorderStyle = isLightMode ? "1px solid rgb(99, 160, 246)" : "1px solid rgb(255, 255, 255)";
  // Couleur pour le titre et les stats
  const titleStatsColor = isLightMode ? "rgba(168, 167, 167, 0.99)" : "white";

  useEffect(() => {
    controls.start("visible");
  }, [controls]);

  const stats = [
    {
      value: 100,
      label: "Maisons",
      subLabel: "en Vente",
      onClick: () => navigate("/trano"),
    },
    {
      value: 50,
      label: "Terrains",
      subLabel: "en Vente",
      onClick: () => navigate("/tany"),
    },
    {
      value: 150,
      label: "Immeuble",
      subLabel: "en Vente",
      onClick: () => navigate("/immeuble"),
    },
  ];

  const settings = [
    { label: "Prix en", highlight: "euro", state: isEuro, setState: setIsEuro },
    { label: "Ouverture sur", highlight: "Recherche", state: isSearch, setState: setIsSearch, newLine: true },
    { label: "Mode", highlight: "light", state: isLightMode, setState: setIsLightMode },
  ];

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

  useEffect(() => {
    // Ajouter les classes d'animation après le montage du composant
    const elements = document.querySelectorAll('.animate-on-mount');
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('animate-in');
      }, 100 * index); // Décalage entre les animations
    });
  }, []);

  return (
    <div className={`w-full min-h-screen ${isLightMode ? "bg-white" : "bg-[#0150BC]"} relative overflow-hidden pt-4 sm:pt-6 md:pt-8`}>
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-50" 
        style={{ 
          backgroundImage: `url(${isLightMode ? '/public_Accueil_Sombre/blie-pattern2.jpeg' : '/public_Accueil_Sombre/blie-pattern.png'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 0.5s ease-in-out'
        }}
      />

      {/* Main Content Container */}
      <div className="relative mx-auto px-6 sm:px-8 md:px-12 pt-10 sm:pt-12 md:pt-16 pb-6 sm:pb-8 md:pb-10 small-screen-container">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-14 sm:mb-18 animate-on-mount small-screen-header">
          <div>
            <h1 className={`text-6xl sm:text-7xl md:text-8xl lg:text-[80px] font-bold leading-tight`} style={{ color: titleStatsColor }}>
              Salut,
              <br />
              Rakoto.
            </h1>
          </div>
          <img src="/public_Accueil_Sombre/logo-couleur.png" alt="Logo" className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" />
        </div>

        {/* Welcome Card */}
        <div 
          className="relative rounded-3xl p-6 sm:p-8 mb-8 sm:mb-12 animate-on-mount h-[180px] sm:h-[220px] md:h-[260px] small-screen-welcome-card"
          style={{ 
            backgroundColor: cardBgColor, 
            animationDelay: '100ms',
            border: cardBorderStyle
          }}
        >
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 icons">
            <UserIcon 
              className={`w-8 h-8 sm:w-10 sm:h-10 cursor-pointer text-[${accentColor}] hover:text-[${accentColor}]/80 transition-colors`} 
              onClick={() => navigate('/profile')} 
            />
            <div className="flex-shrink-0">
              <NotificationBadge size="md" className="mx-auto" accentColor={accentColor} />
            </div>
            <Settings 
              className={`w-8 h-8 sm:w-10 sm:h-10 cursor-pointer text-[${accentColor}] hover:text-[${accentColor}]/80 transition-colors`} 
              onClick={() => navigate('/profile')} 
            />
          </div>
          <p style={{ color: textColor }} className="text-base sm:text-xl md:text-2xl lg:text-3xl max-w-[200px] sm:max-w-sm md:max-w-md lg:max-w-lg pr-2 sm:pr-8 md:pr-12 lg:pr-0 leading-tight sm:leading-snug md:leading-normal">
            Bienvenu ! En quelques 
            clics, achetez, vendez ou 
            louez le bien idéal en toute simplicité
            
          </p>

          
          <motion.img 
            src={isLightMode ? "/public_Accueil_Sombre/perso2.png" : "/public_Accueil_Sombre/perso.png"}
            alt="Person" 
            className="absolute right-4 sm:right-3 md:right-5 bottom-[-0px] h-[250px] sm:h-[280px] md:h-[320px] z-10"
            key={isLightMode ? "light" : "dark"} 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Stats Section */}
        <div className="mb-8 sm:mb-12 animate-on-mount small-screen-stats" style={{animationDelay: '200ms'}}>
          <div className="flex flex-row items-start">
            <div className="flex flex-col items-start">
              <h2 className={`text-lg sm:text-xl font-bold ${isLightMode ? "text-[#0150BC]" : "text-white"}`}>
                Tafo Immo en quelques
              </h2>
              <h2 className={`text-lg sm:text-xl font-bold ${isLightMode ? "text-[#0150BC]" : "text-white"}`}>
                chiffres
              </h2>
            </div>
            <div className="flex flex-col mt-4" style={{marginLeft: 'auto'}}>
              <div className={`border-t-2 ${isLightMode ? "border-[#0150BC]" : "border-white"} w-40 sm:w-56 md:w-64 mb-1 sm:mb-2 border-line`}></div>
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex gap-3 sm:gap-6 justify-end stats-container" 
                style={{marginLeft: 'auto', marginRight: '-0px'}}
              >
                {stats.map((stat, index) => (
                  <motion.div 
                    key={index} 
                    variants={itemVariants}
                    className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={stat.onClick}
                  >
                    <motion.div 
                      className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-['Anton'] stat-value`}
                      style={{ color: titleStatsColor }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <CountUp value={stat.value} />
                      </motion.span>
                    </motion.div>
                    <motion.div 
                      className={`text-[${accentColor}] text-[8px] sm:text-xs stat-label`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <div>{stat.label}</div>
                      <div>{stat.subLabel}</div>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 small-screen-grid">
          {/* Sell/Rent Card */}
          <Card 
            style={{ 
              backgroundColor: cardBgColor, 
              width: '120%', 
              animationDelay: '300ms',
              border: cardBorderStyle
            }}
            className={`rounded-xl overflow-hidden animate-on-mount cursor-pointer hover:opacity-90 transition-opacity small-screen-feature-card small-screen-sell-card`}
            onClick={() => navigate('/property-request')}
          >
            <CardContent className="p-2 sm:p-3 md:p-4">
              <div className="flex justify-between items-start mb-1 sm:mb-2">
                <h3 style={{ color: textColor }} className="text-sm sm:text-base md:text-lg lg:text-xl font-bold leading-tight">
                  Vendre<br />ou Louer votre<br />Immeuble
                </h3>
                <img src="/public_Accueil_Sombre/purple-hme.png" alt="Home" className="w-8 h-8 sm:w-8 sm:h-8 md:w-10 md:h-10" />
              </div>
              <Separator className={`my-1 sm:my-2 md:my-3`} style={{ backgroundColor: accentColor }} />
              <p style={{ color: textColor }} className="text-[8px] sm:text-[10px] md:text-xs">Hivarotra Tany na Trano, na koa hampanofa Trano</p>
            </CardContent>
          </Card>

          {/* Find Home Card */}
          <Card 
            style={{ 
              backgroundColor: cardBgColor, 
              width: '80%', 
              animationDelay: '400ms',
              border: cardBorderStyle
            }}
            className={`rounded-xl overflow-hidden ml-auto animate-on-mount cursor-pointer hover:opacity-90 transition-opacity small-screen-feature-card small-screen-find-card`}
            onClick={() => navigate('/trano')}
          >
            <CardContent className="p-2 sm:p-3 md:p-4">
              <div className="flex justify-between items-start mb-1 sm:mb-2">
                <h3 style={{ color: textColor }} className="text-sm sm:text-base md:text-lg lg:text-xl font-bold leading-tight">
                  Trouvez<br />votre prochain<br />
                  <span style={{ color: accentColor }}>chez vous</span>
                </h3>
                <img src="/public_Accueil_Sombre/calque-3.png" alt="Search" className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10" />
              </div>
              <Separator className={`my-1 sm:my-2 md:my-3`} style={{ backgroundColor: accentColor }} />
              <p style={{ color: textColor }} className="text-[8px] sm:text-[10px] md:text-xs">Hanofa na hividy Tany na Trano</p>
            </CardContent>
          </Card>

          {/* Left Column with Guide Card and Settings Panel */}
          <div className="flex flex-col space-y-2 sm:space-y-3 md:space-y-4 animate-on-mount small-screen-grid-col" style={{animationDelay: '500ms'}}>
            {/* Guide Card */}
            <Card 
              style={{ 
                backgroundColor: cardBgColor,
                border: cardBorderStyle
              }}
              className={`rounded-xl overflow-hidden h-[100px] sm:h-[150px] md:h-[200px] cursor-pointer hover:opacity-90 transition-opacity small-screen-feature-card small-screen-guide-card`}
              onClick={() => navigate('/guide')}
            >
              <CardContent className="p-2 sm:p-3 md:p-4">
                <div className="flex justify-between items-start mb-1 sm:mb-2">
                  <h3 style={{ color: textColor }} className="text-sm sm:text-base md:text-lg lg:text-xl font-bold leading-tight">
                    Guide<br />
                    <span style={{ color: accentColor }}>d'Utilisation</span><br />
                    de ton application
                  </h3>
                  <img src="/public_Accueil_Sombre/book.png" alt="Guide" className="w-8 h-8 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                </div>
                <Separator className={`my-1 sm:my-2 md:my-3`} style={{ backgroundColor: accentColor }} />
                <p style={{ color: textColor }} className="text-[8px] sm:text-[10px] md:text-xs">Torolalana</p>
              </CardContent>
            </Card>

            {/* Settings Panel */}
            <Card 
              style={{ 
                backgroundColor: cardBgColor,
                border: cardBorderStyle 
              }}
              className={`rounded-xl overflow-hidden w-full small-screen-settings`}
            >
              <CardContent className="p-3 sm:p-4">
                <img src="/public_Accueil_Sombre/calque-5.png" alt="Settings" className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2" />
                {settings.map((setting, index) => (
                  <div key={index} className="flex items-center justify-between py-1 sm:py-2">
                    <span style={{ color: textColor }} className="text-base sm:text-lg font-bold">
                      {setting.newLine ? (
                        <>
                          <span>{setting.label}</span>
                          <br />
                          <span style={{ color: accentColor }}>{setting.highlight}</span>
                        </>
                      ) : (
                        <>
                          {setting.label}{" "}
                          <span style={{ color: accentColor }}>{setting.highlight}</span>
                        </>
                      )}
                    </span>
                    <Switch 
                      checked={setting.state}
                      onCheckedChange={setting.setState}
                      className={isLightMode 
                        ? "data-[state=checked]:!bg-black scale-75 sm:scale-100 border border-[#0150BC] data-[state=unchecked]:bg-transparent"
                        : "data-[state=checked]:!bg-[#59e0c5] scale-75 sm:scale-100 border border-[#59e0c5] data-[state=unchecked]:bg-transparent"
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Advice Card */}
          <Card 
            style={{ 
              backgroundColor: cardBgColor, 
              animationDelay: '600ms',
              border: cardBorderStyle
            }}
            className={`rounded-xl overflow-hidden h-[280px] sm:h-[350px] md:h-[400px] animate-on-mount small-screen-advice-card`}
          >
            <CardContent className="p-2 sm:p-3 md:p-4 h-full flex flex-col justify-between">
              <div className="flex flex-col items-center h-full justify-between py-2">
                <div className="flex flex-col items-center">
                  <img src="/public_Accueil_Sombre/ampoule-.png" alt="Tip" className="w-8 h-10 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 mb-2 sm:mb-3" />
                  <h3 style={{ color: textColor }} className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-center mb-2 sm:mb-3">
                    Notre ptit' <span style={{ color: accentColor }}>Conseil</span> :
                  </h3>
                  <p style={{ color: textColor }} className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-center mb-2 sm:mb-3">
                    "Comparer plusieurs offres avant de prendre une décision. 
                    <span style={{ color: accentColor }}> Aza maika</span> eee !!!"
                  </p>
                </div>
                <div className="w-full">
                  <Separator className={`my-2 sm:my-3 w-full`} style={{ backgroundColor: accentColor }} />
                  <p style={{ color: textColor }} className="text-xs sm:text-sm md:text-base text-center mt-2">
                    Voir d'autres Astuces et Tips Immobliers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Line */}
        <div className={`w-full h-[2px] ${isLightMode ? "bg-[#0150BC]" : "bg-white"} mt-24 sm:mt-28 md:mt-36 mb-8 mx-auto max-w-[16rem] sm:max-w-[20rem] md:max-w-[26rem] animate-on-mount small-screen-bottom-line`} style={{animationDelay: '700ms'}}></div>
      </div>
    </div>
  );
};