import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BellIcon, HomeIcon, SettingsIcon, BookOpenIcon, HelpCircleIcon, InfoIcon, HomeIcon as HouseIcon, UserIcon, HeartIcon, CalendarIcon, CreditCardIcon } from "lucide-react";

export const Guide = (): JSX.Element => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>("introduction");

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

  // Guide sections
  const sections = [
    { id: "introduction", title: "Introduction", icon: <InfoIcon /> },
    { id: "navigation", title: "Navigation", icon: <HomeIcon /> },
    { id: "search", title: "Recherche", icon: <HouseIcon /> },
    { id: "favorites", title: "Favoris", icon: <HeartIcon /> },
    { id: "profile", title: "Profil", icon: <UserIcon /> },
    { id: "booking", title: "Réservation", icon: <CalendarIcon /> },
    { id: "payment", title: "Paiement", icon: <CreditCardIcon /> },
    { id: "contact", title: "Contact", icon: <HelpCircleIcon /> }
  ];

  // Render the active section content
  const renderSectionContent = () => {
    switch (activeSection) {
      case "introduction":
        return (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Bienvenue sur Tafo Immo</h2>
            <p className="text-gray-300 mb-4">
              Tafo Immo est votre application immobilière complète pour trouver, vendre ou louer des biens immobiliers en toute simplicité.
            </p>
            <div className="bg-[#0f172a] p-4 rounded-lg mb-6">
              <h3 className="text-[#59e0c5] font-bold mb-2">Fonctionnalités principales :</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Parcourir les propriétés disponibles (maisons, terrains, immeubles)</li>
                <li>Publier vos propres biens à vendre ou à louer</li>
                <li>Enregistrer vos propriétés préférées dans vos favoris</li>
                <li>Réserver des visites directement depuis l'application</li>
                <li>Contacter les propriétaires ou l'agence immobilière</li>
                <li>Suivre l'état de vos demandes dans votre tableau de bord</li>
              </ul>
            </div>
            <p className="text-gray-300">
              Ce guide vous aidera à naviguer dans l'application et à tirer le meilleur parti de toutes ses fonctionnalités.
            </p>
          </div>
        );
      case "navigation":
        return (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Navigation dans l'application</h2>
            <p className="text-gray-300 mb-4">
              L'application Tafo Immo a été conçue pour être intuitive et facile à utiliser. Voici comment naviguer :
            </p>
            
            <div className="space-y-6">
              <div className="bg-[#0f172a] p-4 rounded-lg">
                <h3 className="text-[#59e0c5] font-bold mb-2">Page d'accueil</h3>
                <p className="text-gray-300 mb-2">
                  La page d'accueil vous donne un aperçu des fonctionnalités principales et des statistiques importantes.
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Cliquez sur "Trouvez votre prochain chez vous" pour parcourir les propriétés</li>
                  <li>Utilisez "Vendre ou Louer votre Immeuble" pour publier votre bien</li>
                  <li>Consultez les cartes d'information pour obtenir des conseils utiles</li>
                </ul>
              </div>
              
              <div className="bg-[#0f172a] p-4 rounded-lg">
                <h3 className="text-[#59e0c5] font-bold mb-2">Barre de navigation</h3>
                <p className="text-gray-300 mb-2">
                  La barre de navigation est présente en haut de chaque écran :
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <HomeIcon className="w-6 h-6 text-[#59e0c5]" />
                  <span className="text-gray-300">Cliquez sur l'icône Accueil pour revenir à la page d'accueil</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <BellIcon className="w-6 h-6 text-[#59e0c5]" />
                  <span className="text-gray-300">Cliquez sur l'icône Notifications pour voir vos notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <SettingsIcon className="w-6 h-6 text-[#59e0c5]" />
                  <span className="text-gray-300">Cliquez sur l'icône Paramètres pour accéder aux paramètres</span>
                </div>
              </div>
            </div>
          </div>
        );
      case "search":
        return (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Recherche de propriétés</h2>
            <p className="text-gray-300 mb-4">
              Tafo Immo vous offre plusieurs façons de trouver la propriété idéale.
            </p>
            
            <div className="space-y-6">
              <div className="bg-[#0f172a] p-4 rounded-lg">
                <h3 className="text-[#59e0c5] font-bold mb-2">Navigation par catégories</h3>
                <p className="text-gray-300 mb-2">
                  Sur la page d'accueil, vous pouvez naviguer par type de propriété :
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Cliquez sur "Maisons" pour voir toutes les maisons disponibles</li>
                  <li>Cliquez sur "Terrains" pour explorer les terrains à vendre</li>
                  <li>Cliquez sur "Immeuble" pour voir les bâtiments commerciaux et résidentiels</li>
                </ul>
              </div>
              
              <div className="bg-[#0f172a] p-4 rounded-lg">
                <h3 className="text-[#59e0c5] font-bold mb-2">Filtres de recherche</h3>
                <p className="text-gray-300 mb-2">
                  Sur la page Trano (propriétés), vous pouvez filtrer les résultats :
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Filtrez par type : Villas, Terrains, etc.</li>
                  <li>Filtrez par gamme de prix</li>
                  <li>Utilisez la barre de recherche pour une recherche par mots-clés</li>
                </ul>
              </div>
              
              <div className="bg-[#0f172a] p-4 rounded-lg">
                <h3 className="text-[#59e0c5] font-bold mb-2">Consultez les détails</h3>
                <p className="text-gray-300 mb-2">
                  Pour voir les détails d'une propriété :
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Cliquez sur la carte de la propriété pour accéder à sa page détaillée</li>
                  <li>Consultez les photos, la description et les caractéristiques</li>
                  <li>Cliquez sur "Aperçu" pour un résumé rapide</li>
                  <li>Utilisez "Visite Virtuelle" si disponible pour explorer virtuellement</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case "favorites":
        return (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Gestion des favoris</h2>
            <p className="text-gray-300 mb-4">
              Pour faciliter votre recherche, vous pouvez sauvegarder vos propriétés préférées dans vos favoris.
            </p>
            
            <div className="space-y-6">
              <div className="bg-[#0f172a] p-4 rounded-lg">
                <h3 className="text-[#59e0c5] font-bold mb-2">Ajouter aux favoris</h3>
                <p className="text-gray-300 mb-2">
                  Pour ajouter une propriété à vos favoris :
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Sur la page de détail d'une propriété, cliquez sur l'icône cœur ♥ en haut à droite</li>
                  <li>Le cœur deviendra rouge pour indiquer que la propriété est dans vos favoris</li>
                </ul>
              </div>
              
              <div className="bg-[#0f172a] p-4 rounded-lg">
                <h3 className="text-[#59e0c5] font-bold mb-2">Accéder à vos favoris</h3>
                <p className="text-gray-300 mb-2">
                  Pour voir toutes vos propriétés favorites :
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Accédez à votre profil</li>
                  <li>Cliquez sur "Mes favoris"</li>
                  <li>Vous pouvez basculer entre la vue grille et la vue liste avec les boutons en haut à droite</li>
                </ul>
              </div>
              
              <div className="bg-[#0f172a] p-4 rounded-lg">
                <h3 className="text-[#59e0c5] font-bold mb-2">Supprimer des favoris</h3>
                <p className="text-gray-300 mb-2">
                  Pour retirer une propriété de vos favoris :
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Sur la page des favoris, cliquez sur l'icône de corbeille associée à la propriété</li>
                  <li>Ou retournez sur la page de détail et cliquez à nouveau sur l'icône cœur pour la désélectionner</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case "profile":
        return (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Gestion de votre profil</h2>
            <p className="text-gray-300 mb-4">
              Votre profil contient vos informations personnelles et vous permet de gérer votre compte.
            </p>
            
            <div className="space-y-6">
              <div className="bg-[#0f172a] p-4 rounded-lg">
                <h3 className="text-[#59e0c5] font-bold mb-2">Modifier votre profil</h3>
                <p className="text-gray-300 mb-2">
                  Pour mettre à jour vos informations :
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Accédez à votre profil en cliquant sur l'icône de profil</li>
                  <li>Cliquez sur "Modifier" pour changer vos informations personnelles</li>
                  <li>Mettez à jour vos détails : nom, téléphone, email, adresse</li>
                  <li>Cliquez sur "Enregistrer" pour confirmer les modifications</li>
                </ul>
              </div>
              
              <div className="bg-[#0f172a] p-4 rounded-lg">
                <h3 className="text-[#59e0c5] font-bold mb-2">Sécurité du compte</h3>
                <p className="text-gray-300 mb-2">
                  Pour gérer la sécurité de votre compte :
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Dans votre profil, accédez à la section "Sécurité du compte"</li>
                  <li>Vous pouvez changer votre mot de passe</li>
                  <li>Gérer vos paramètres de notification</li>
                  <li>Vous déconnecter de l'application</li>
                </ul>
              </div>
              
              <div className="bg-[#0f172a] p-4 rounded-lg">
                <h3 className="text-[#59e0c5] font-bold mb-2">Historique des activités</h3>
                <p className="text-gray-300 mb-2">
                  Pour consulter votre historique :
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Accédez à la section "Tableau de bord" depuis votre profil</li>
                  <li>Consultez l'historique de vos visites réservées</li>
                  <li>Suivez l'état de vos demandes immobilières</li>
                  <li>Vérifiez les propriétés que vous avez récemment consultées</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case "booking":
        return (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Réservation de visites</h2>
            <p className="text-gray-300 mb-4">
              Tafo Immo vous permet de réserver facilement des visites pour les propriétés qui vous intéressent.
            </p>
            
            <div className="space-y-6">
              <div className="bg-[#0f172a] p-4 rounded-lg">
                <h3 className="text-[#59e0c5] font-bold mb-2">Demander une visite</h3>
                <p className="text-gray-300 mb-2">
                  Pour programmer une visite :
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Sur la page de détail d'une propriété, cliquez sur "Réserver une visite"</li>
                  <li>Vous serez dirigé vers la page de réservation</li>
                </ul>
              </div>
              
              <div className="bg-[#0f172a] p-4 rounded-lg">
                <h3 className="text-[#59e0c5] font-bold mb-2">Choisir date et heure</h3>
                <p className="text-gray-300 mb-2">
                  Sur la page de réservation :
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Sélectionnez une date disponible dans le calendrier</li>
                  <li>Choisissez un créneau horaire parmi ceux proposés</li>
                  <li>Les créneaux grisés ne sont pas disponibles</li>
                </ul>
              </div>
              
              <div className="bg-[#0f172a] p-4 rounded-lg">
                <h3 className="text-[#59e0c5] font-bold mb-2">Confirmer la réservation</h3>
                <p className="text-gray-300 mb-2">
                  Pour finaliser votre demande :
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Remplissez le formulaire avec vos coordonnées</li>
                  <li>Ajoutez des commentaires ou questions si nécessaire</li>
                  <li>Cliquez sur "Confirmer la réservation"</li>
                  <li>Vous recevrez une confirmation à l'écran et par email/SMS</li>
                </ul>
              </div>
              
              <div className="bg-[#0f172a] p-4 rounded-lg">
                <h3 className="text-[#59e0c5] font-bold mb-2">Suivre vos réservations</h3>
                <p className="text-gray-300 mb-2">
                  Pour suivre l'état de vos demandes :
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Accédez à votre tableau de bord depuis votre profil</li>
                  <li>Consultez la section "Mes visites"</li>
                  <li>Vous pouvez annuler une visite si nécessaire</li>
                  <li>Les confirmations définitives seront notifiées par l'agence</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case "payment":
        return (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Paiements et transactions</h2>
            <p className="text-gray-300 mb-4">
              Tafo Immo offre différentes options pour effectuer des paiements sécurisés.
            </p>
            
            <div className="space-y-6">
              <div className="bg-[#0f172a] p-4 rounded-lg">
                <h3 className="text-[#59e0c5] font-bold mb-2">Réserver un bien</h3>
                <p className="text-gray-300 mb-2">
                  Pour réserver un bien que vous souhaitez acheter :
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Sur la page de détail, cliquez sur l'option de paiement</li>
                  <li>Vous pouvez verser un acompte pour bloquer temporairement le bien</li>
                  <li>Différentes méthodes de paiement sont proposées</li>
                </ul>
              </div>
              
              <div className="bg-[#0f172a] p-4 rounded-lg">
                <h3 className="text-[#59e0c5] font-bold mb-2">Méthodes de paiement</h3>
                <p className="text-gray-300 mb-2">
                  Les options de paiement disponibles :
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Carte bancaire</li>
                  <li>Mobile Money (Orange Money, Mvola, etc.)</li>
                  <li>Virement bancaire</li>
                  <li>Paiement en espèces à l'agence (avec reçu électronique)</li>
                </ul>
              </div>
              
              <div className="bg-[#0f172a] p-4 rounded-lg">
                <h3 className="text-[#59e0c5] font-bold mb-2">Sécurité des transactions</h3>
                <p className="text-gray-300 mb-2">
                  Tafo Immo garantit la sécurité de vos paiements :
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Toutes les transactions sont cryptées</li>
                  <li>Système d'escrow pour protéger acheteurs et vendeurs</li>
                  <li>Reçus et confirmations envoyés automatiquement</li>
                  <li>Historique des transactions accessible dans votre profil</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case "contact":
        return (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Besoin d'aide ?</h2>
            <p className="text-gray-300 mb-4">
              Si vous avez des questions ou besoin d'assistance, plusieurs options s'offrent à vous.
            </p>
            
            <div className="space-y-6">
              <div className="bg-[#0f172a] p-4 rounded-lg">
                <h3 className="text-[#59e0c5] font-bold mb-2">Contacter l'agence</h3>
                <p className="text-gray-300 mb-2">
                  Pour obtenir de l'aide directement :
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Téléphone : +261 34 00 000 00</li>
                  <li>Email : support@tafoimmo.mg</li>
                  <li>Visite : Nos bureaux à Fianarantsoa, quartier Tambohobe</li>
                  <li>Horaires : Lundi au Vendredi, 8h à 17h et Samedi 9h à 12h</li>
                </ul>
              </div>
              
              <div className="bg-[#0f172a] p-4 rounded-lg">
                <h3 className="text-[#59e0c5] font-bold mb-2">Chat en direct</h3>
                <p className="text-gray-300 mb-2">
                  Pour une assistance immédiate :
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Cliquez sur l'icône de chat en bas à droite de l'application</li>
                  <li>Un conseiller est disponible pendant les heures d'ouverture</li>
                  <li>Hors horaires, laissez un message pour être recontacté</li>
                </ul>
              </div>
              
              <div className="bg-[#0f172a] p-4 rounded-lg">
                <h3 className="text-[#59e0c5] font-bold mb-2">FAQ et astuces</h3>
                <p className="text-gray-300 mb-2">
                  Pour des informations rapides :
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Consultez notre section FAQ pour les questions fréquentes</li>
                  <li>Lisez nos astuces immobilières pour des conseils avisés</li>
                  <li>Suivez notre blog pour les dernières tendances du marché</li>
                </ul>
              </div>
              
              <div className="bg-[#0f172a] p-4 rounded-lg">
                <h3 className="text-[#59e0c5] font-bold mb-2">Signaler un problème</h3>
                <p className="text-gray-300 mb-2">
                  En cas de difficultés techniques :
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Dans les paramètres, utilisez l'option "Signaler un problème"</li>
                  <li>Décrivez le problème rencontré avec précision</li>
                  <li>Joignez une capture d'écran si possible</li>
                  <li>Notre équipe technique vous répondra sous 24h</li>
                </ul>
              </div>
            </div>
          </div>
        );
      default:
        return <div className="text-gray-300">Sélectionnez une section pour afficher son contenu.</div>;
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
              className="w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-[#59e0c5] cursor-pointer hover:text-[#59e0c5]/80 transition-colors" 
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

        {/* Guide Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 flex items-center gap-3"
        >
          <BookOpenIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#59e0c5]" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Guide d'utilisation</h1>
        </motion.div>

        {/* Content Container */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <motion.aside
            variants={containerVariants}
            initial="hidden"
            animate="visible" 
            className="lg:w-64 flex-shrink-0 bg-[#1E2B47] rounded-xl p-4"
          >
            <h2 className="text-white font-bold mb-4 text-lg">Sections</h2>
            <nav>
              <ul className="space-y-2">
                {sections.map((section) => (
                  <motion.li 
                    key={section.id}
                    variants={itemVariants}
                    whileHover={{ x: 5 }}
                  >
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg text-left ${
                        activeSection === section.id 
                          ? "bg-[#59e0c5] text-[#0f172a]" 
                          : "text-white hover:bg-[#0f172a]"
                      }`}
                    >
                      <span className={activeSection === section.id ? "text-[#0f172a]" : "text-[#59e0c5]"}>
                        {section.icon}
                      </span>
                      <span>{section.title}</span>
                    </button>
                  </motion.li>
                ))}
              </ul>
            </nav>
          </motion.aside>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-1 bg-[#1E2B47] rounded-xl p-4 sm:p-6 md:p-8"
          >
            {renderSectionContent()}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Guide; 