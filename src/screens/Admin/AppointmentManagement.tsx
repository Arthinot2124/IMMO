import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  BellIcon, HomeIcon, SettingsIcon, ArrowLeftIcon, 
  CheckCircleIcon, XCircleIcon, RefreshCwIcon,
  CalendarIcon, ClockIcon, UserIcon, MapPinIcon, PhoneIcon, MailIcon,
  CalendarDaysIcon, XIcon, ImageIcon, FileIcon
} from "lucide-react";
import apiService from "../../services/apiService";
import { getMediaUrl } from "../../config/api";

// Types pour les rendez-vous
interface AppointmentUser {
  user_id: number;
  full_name: string;
  email: string;
  phone?: string;
}

// Type pour les médias des propriétés
interface PropertyMedia {
  media_id: number;
  property_id: number;
  media_type: string;
  media_url: string;
  uploaded_at: string;
}

interface AppointmentProperty {
  property_id: number;
  title: string;
  location: string;
  price: number;
  category: string;
  media?: PropertyMedia[];
}

interface Appointment {
  appointment_id: number;
  property_id: number;
  user_id: number;
  appointment_date: string;
  confirmation_status: 'En attente' | 'Confirmé' | 'Annulé';
  created_at: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  notes?: string;
  user?: AppointmentUser;
  property?: AppointmentProperty;
}

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export const AppointmentManagement = (): JSX.Element => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'En attente' | 'Confirmé' | 'Annulé'>('all');
  const [processing, setProcessing] = useState<{[key: number]: boolean}>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLightMode, setIsLightMode] = useState(() => {
    const savedMode = localStorage.getItem('isLightMode');
    return savedMode !== null ? savedMode === 'true' : true;
  });
  
  // États pour le filtre par date de création
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [datePickerMonth, setDatePickerMonth] = useState(() => new Date());
  
  // États pour la gestion des images
  const [propertyImages, setPropertyImages] = useState<{[key: number]: PropertyMedia[]}>({});
  const [loadingImages, setLoadingImages] = useState<{[key: number]: boolean}>({});
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});

  // Couleurs qui changent en fonction du mode
  const accentColor = isLightMode ? "#0150BC" : "#59e0c5";
  const bgColor = isLightMode ? "bg-white" : "bg-[#0f172a]";
  const cardBgColor = isLightMode ? "bg-[#F8FAFC]" : "bg-[#1E2B47]";
  const textColor = isLightMode ? "text-[#0150BC]" : "text-[#59e0c5]";
  const textPrimaryColor = isLightMode ? "text-[#1E293B]" : "text-white";
  const textSecondaryColor = isLightMode ? "text-gray-700" : "text-gray-300";
  const buttonPrimaryBg = isLightMode ? "bg-[#0150BC]" : "bg-[#59e0c5]";
  const buttonPrimaryText = isLightMode ? "text-white" : "text-[#0f172a]";
  const buttonSecondaryBg = isLightMode ? "bg-[#EFF6FF]" : "bg-[#1e293b]";
  const buttonSecondaryText = isLightMode ? "text-[#0150BC]" : "text-white";
  const borderColor = isLightMode ? "border-[#0150BC]" : "border-[#59e0c5]";
  const cardBorder = isLightMode ? "border border-[#0150BC]/30" : "border border-[#59e0c5]/30";
  const tableBgColor = isLightMode ? "bg-white" : "bg-[#1e293b]";
  const tableHeaderBg = isLightMode ? "bg-[#EFF6FF]" : "bg-[#0f172a]";
  const tableRowHoverBg = isLightMode ? "hover:bg-gray-50" : "hover:bg-[#1E2B47]/70";

  // Synchroniser avec les changements de mode
  useEffect(() => {
    const interval = setInterval(() => {
      const savedMode = localStorage.getItem('isLightMode');
      if (savedMode !== null && (savedMode === 'true') !== isLightMode) {
        setIsLightMode(savedMode === 'true');
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isLightMode]);

  // Charger les rendez-vous au chargement du composant
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiService.get<ApiResponse<Appointment[] | { data: Appointment[] }>>('/appointments');
        
        console.log("Rendez-vous chargés:", response.data);
        
        if (response.data && response.data.status === "success" && response.data.data) {
          // Vérifier si les données sont paginées
          const appointmentsData = Array.isArray(response.data.data) 
            ? response.data.data 
            : (response.data.data.data || []);
          
          setAppointments(appointmentsData);
          applyFilters(appointmentsData, statusFilter);
          
          // Pour chaque rendez-vous avec une propriété, charger les images
          appointmentsData.forEach(appointment => {
            if (appointment.property && appointment.property.property_id) {
              fetchPropertyImages(appointment.property.property_id);
            }
          });
        } else {
          throw new Error("Format de réponse inattendu");
        }
      } catch (err: any) {
        console.error("Erreur lors du chargement des rendez-vous:", err);
        setError(err.response?.data?.message || err.message || "Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);

  // Appliquer les filtres
  const applyFilters = (
    data: Appointment[], 
    status: 'all' | 'En attente' | 'Confirmé' | 'Annulé'
  ) => {
    if (!Array.isArray(data)) {
      console.error("Les données ne sont pas un tableau:", data);
      setFilteredAppointments([]);
      return;
    }
    
    let filtered = [...data];
    
    // Filtre par statut
    if (status !== 'all') {
      filtered = filtered.filter(app => app.confirmation_status === status);
    }
    
    // Filtre par date de création (si une date est sélectionnée)
    if (selectedDate) {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(app => {
        const creationDate = new Date(app.created_at);
        return creationDate >= startOfDay && creationDate <= endOfDay;
      });
    }
    
    // Si on affiche tous les statuts, on trie d'abord par statut (En attente en premier)
    if (status === 'all') {
      const getStatusPriority = (status: string) => {
        switch (status) {
          case 'En attente': return 0;
          case 'Confirmé': return 1;
          case 'Annulé': return 2;
          default: return 3;
        }
      };
      
      // Tri principal par statut, tri secondaire par date
      filtered.sort((a, b) => {
        // D'abord par statut
        const statusCompare = getStatusPriority(a.confirmation_status) - getStatusPriority(b.confirmation_status);
        if (statusCompare !== 0) return statusCompare;
        
        // Ensuite par date (plus récent en premier)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    } else {
      // Pour les filtres spécifiques à un statut, conserver le tri par date de rendez-vous
      filtered.sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());
    }
    
    setFilteredAppointments(filtered);
  };

  // Mettre à jour les filtres
  useEffect(() => {
    applyFilters(appointments, statusFilter);
  }, [statusFilter, appointments, selectedDate]);

  // Fonction pour générer le calendrier du mois en cours
  const generateCalendar = (month: Date) => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = dimanche, 1 = lundi, etc.
    
    // Ajuster le jour de début pour que la semaine commence le lundi (1)
    const adjustedStartingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    
    const calendarDays = [];
    
    // Jours vides avant le premier jour du mois
    for (let i = 0; i < adjustedStartingDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Jours du mois
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push(new Date(month.getFullYear(), month.getMonth(), i));
    }
    
    return calendarDays;
  };

  // Formater la date pour l'affichage
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  // Vérifier si une date est égale à la date sélectionnée
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  // Changer de mois dans le sélecteur de date
  const changeMonth = (amount: number) => {
    const newDate = new Date(datePickerMonth);
    newDate.setMonth(newDate.getMonth() + amount);
    setDatePickerMonth(newDate);
  };

  // Mettre à jour le statut d'un rendez-vous
  const updateAppointmentStatus = async (appointmentId: number, newStatus: 'Confirmé' | 'Annulé') => {
    setProcessing(prev => ({ ...prev, [appointmentId]: true }));
    setError(null);
    setSuccessMessage(null);
    
    try {
      // 1. Mettre à jour le statut du rendez-vous
      const response = await apiService.put<ApiResponse<any>>(`/appointments/${appointmentId}`, 
        { confirmation_status: newStatus }
      );
      
      if (response.data && response.data.status === "success") {
        // Trouver le rendez-vous pour obtenir l'ID utilisateur
        const appointment = appointments.find(app => app.appointment_id === appointmentId);
        
        if (appointment) {
          // 2. Envoyer une notification au client
          const notificationMessage = newStatus === 'Confirmé' 
            ? `Votre rendez-vous du ${formatDateTime(appointment.appointment_date).date} à ${formatDateTime(appointment.appointment_date).time} a été confirmé.`
            : `Votre rendez-vous du ${formatDateTime(appointment.appointment_date).date} à ${formatDateTime(appointment.appointment_date).time} a été annulé.`;
          
          console.log("Préparation de l'envoi de notification:", {
            user_id: appointment.user_id,
            message: notificationMessage
          });
          
          try {
            // Assurez-vous que user_id est bien un nombre
            const userId = parseInt(appointment.user_id.toString());
            
            // Créer la notification
            const notificationData = {
              user_id: userId,
              message: notificationMessage,
              is_read: false
            };
            
            console.log("Données de notification à envoyer:", notificationData);
            
            // Effectuer la requête pour créer la notification
            const notificationResponse = await apiService.post<ApiResponse<any>>('/notifications', notificationData);
            
            console.log("Réponse de création de notification:", notificationResponse.data);
            console.log(`Notification envoyée avec succès à l'utilisateur ID: ${userId}`);
            
            // Pour des raisons de test, créons une notification locale également
            // Cela aide à vérifier si le problème vient du backend ou du frontend
            try {
              localStorage.setItem('testNotification', JSON.stringify({
                id: Math.floor(Math.random() * 10000),
                userId: userId,
                message: notificationMessage,
                date: new Date().toISOString()
              }));
              console.log("Notification de test stockée localement");
            } catch (e) {
              console.error("Erreur lors de la création de la notification de test locale:", e);
            }
          } catch (notifError: any) {
            console.error("Erreur détaillée lors de l'envoi de la notification:", notifError);
            
            if (notifError.response) {
              console.error("Données de la réponse d'erreur:", notifError.response.data);
              console.error("Statut de l'erreur:", notifError.response.status);
              console.error("Headers de l'erreur:", notifError.response.headers);
            } else {
              console.error("Message d'erreur:", notifError.message);
            }
          }
          
          // 3. Mise à jour du rendez-vous dans le state
          const updatedAppointments = appointments.map(app => 
            app.appointment_id === appointmentId 
              ? { ...app, confirmation_status: newStatus } 
              : app
          );
          
          setAppointments(updatedAppointments);
          setSuccessMessage(`Le rendez-vous a été ${newStatus === 'Confirmé' ? 'confirmé' : 'annulé'} avec succès.`);
          
          // Mettre à jour également la liste filtrée si nécessaire
          const updatedFilteredAppointments = filteredAppointments.map(app => 
            app.appointment_id === appointmentId 
              ? { ...app, confirmation_status: newStatus } 
              : app
          );
          setFilteredAppointments(updatedFilteredAppointments);
          
          // Faire disparaître le message après 3 secondes
          setTimeout(() => {
            setSuccessMessage(null);
          }, 3000);
        }
      } else {
        throw new Error("La mise à jour du statut a échoué");
      }
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du statut:", err);
      setError(err.response?.data?.message || err.message || "Erreur lors de la mise à jour du statut");
    } finally {
      setProcessing(prev => ({ ...prev, [appointmentId]: false }));
    }
  };

  // Formater la date et l'heure
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Déterminer le texte du statut et sa couleur
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Confirmé':
        return { color: 'text-green-400', bgColor: 'bg-green-400/20', icon: <CheckCircleIcon className="w-4 h-4" /> };
      case 'Annulé':
        return { color: 'text-red-400', bgColor: 'bg-red-400/20', icon: <XCircleIcon className="w-4 h-4" /> };
      default:
        return { color: 'text-yellow-400', bgColor: 'bg-yellow-400/20', icon: <ClockIcon className="w-4 h-4" /> };
    }
  };

  // Fonction pour charger les images d'une propriété
  const fetchPropertyImages = async (propertyId: number) => {
    if (loadingImages[propertyId]) return;
    
    setLoadingImages(prev => ({ ...prev, [propertyId]: true }));
    
    try {
      const response = await apiService.get<ApiResponse<PropertyMedia[]>>(`/properties/${propertyId}/media`);
      
      if (response.data && response.data.status === "success" && Array.isArray(response.data.data)) {
        setPropertyImages(prev => ({ ...prev, [propertyId]: response.data.data }));
      }
    } catch (err: any) {
      console.error(`Erreur lors du chargement des images pour la propriété ${propertyId}:`, err);
      // Ne pas afficher d'erreur car les images sont optionnelles
    } finally {
      setLoadingImages(prev => ({ ...prev, [propertyId]: false }));
    }
  };

  // Gestion des erreurs d'images
  const handleImageError = (imageId: number) => {
    setImageErrors(prev => ({
      ...prev,
      [imageId]: true
    }));
    console.error(`Failed to load image with ID: ${imageId}`);
  };

  // Récupération de l'URL de l'image
  const getImageUrl = (image: PropertyMedia) => {
    return getMediaUrl(image.media_url);
  };

  return (
    <div className={`${isLightMode ? "bg-white text-[#1E293B]" : "bg-[#0f172a] text-white"} min-h-screen`}>
      <div 
        className="fixed inset-0 opacity-50 z-0" 
        style={{ 
          backgroundImage: `url(${isLightMode ? '/public_Accueil_Sombre/blie-pattern2.jpeg' : '/public_Accueil_Sombre/blie-pattern.png'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'fixed',
          transition: 'background-image 0.5s ease-in-out'
        }}
      ></div>
      <div className="max-w-[1440px] mx-auto px-4 py-6 relative z-10">
        {/* En-tête */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className={`p-2 rounded-full ${isLightMode ? "bg-[#EFF6FF] text-[#0150BC]" : "bg-[#1e293b] text-[#59e0c5]"} mr-4`}
          >
            <ArrowLeftIcon size={20} />
          </button>
          <h1 className={`text-xl sm:text-2xl font-bold ${isLightMode ? "text-[#0150BC]" : "text-[#59e0c5]"}`}>
            Gestion des rendez-vous
          </h1>
        </div>
         
        {/* Message de succès */}
        {successMessage && (
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-6 flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-green-400 mr-2" />
            <p>{successMessage}</p>
          </div>
        )}
         
        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 flex items-center">
            <XCircleIcon className="w-5 h-5 text-red-400 mr-2" />
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="ml-auto flex items-center text-sm hover:underline"
            >
              <RefreshCwIcon size={14} className="mr-1" /> Réessayer
            </button>
          </div>
        )}
         
        {/* Filtres */}
        <div className={`${isLightMode ? "bg-[#F8FAFC]" : "bg-[#1e293b]"} rounded-lg p-4 mb-6 ${cardBorder}`}>
          <h2 className="text-lg font-semibold mb-4">Filtres</h2>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Statut</label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className={`${isLightMode ? "bg-white border-[#0150BC]/30" : "bg-[#0f172a] border-[#59e0c5]/30"} border rounded-lg px-3 py-2`}
              >
                <option value="all">Tous les statuts</option>
                <option value="En attente">En attente</option>
                <option value="Confirmé">Confirmé</option>
                <option value="Annulé">Annulé</option>
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm text-gray-400 mb-1">Filtrer par date</label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className={`flex items-center ${isLightMode ? "bg-white border-[#0150BC]/30" : "bg-[#0f172a] border-[#59e0c5]/30"} border rounded-lg px-3 py-2`}
                >
                  <CalendarDaysIcon className="w-4 h-4 mr-2" />
                  {selectedDate ? formatDate(selectedDate) : "Choisir une date"}
                </button>
                {selectedDate && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(null);
                      setShowDatePicker(false);
                    }}
                    className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Effacer la sélection"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              {showDatePicker && (
                <div className={`absolute mt-1 z-10 ${isLightMode ? "bg-white" : "bg-[#1e293b]"} border ${isLightMode ? "border-gray-200" : "border-gray-700"} rounded-lg shadow-lg p-3 min-w-[280px]`}>
                  <div className="flex justify-between items-center mb-2">
                    <button 
                      onClick={() => changeMonth(-1)} 
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="font-medium">
                      {datePickerMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </div>
                    <button 
                      onClick={() => changeMonth(1)} 
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 text-center mb-1">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                      <div key={index} className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {generateCalendar(datePickerMonth).map((day, index) => (
                      <div key={index} className="h-8 text-center">
                        {day ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDate(day);
                              setShowDatePicker(false);
                            }}
                            className={`w-8 h-8 rounded-full ${
                              selectedDate && isSameDay(day, selectedDate)
                                ? isLightMode 
                                  ? 'bg-[#0150BC] text-white'
                                  : 'bg-[#59e0c5] text-[#0f172a]'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {day.getDate()}
                          </button>
                        ) : (
                          <span className="w-8 h-8 block"></span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
         
        {/* Liste des rendez-vous */}
        {loading ? (
          <div className={`${isLightMode ? "bg-[#F8FAFC]" : "bg-[#1e293b]"} rounded-lg p-8 flex justify-center ${cardBorder}`}>
            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${isLightMode ? "border-[#0150BC]" : "border-[#59e0c5]"}`}></div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className={`${isLightMode ? "bg-[#F8FAFC]" : "bg-[#1e293b]"} rounded-lg p-8 text-center ${cardBorder}`}>
            <CalendarIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucun rendez-vous trouvé</h3>
            <p className="text-gray-400">
              {selectedDate
                ? `Aucun rendez-vous créé le ${formatDate(selectedDate)}.`
                : statusFilter !== 'all' 
                  ? "Essayez d'ajuster vos filtres pour voir plus de résultats." 
                  : "Aucun rendez-vous n'a été enregistré dans le système."}
            </p>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className={`mt-4 px-4 py-2 rounded-lg ${isLightMode ? "bg-[#0150BC] text-white" : "bg-[#59e0c5] text-[#0f172a]"}`}
              >
                Effacer le filtre de date
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Nombre de résultats et date sélectionnée */}
            <div className="flex justify-between items-center mb-2">
              <p className={`${isLightMode ? "text-gray-600" : "text-gray-300"}`}>
                {filteredAppointments.length} rendez-vous trouvés
              </p>
              {selectedDate && (
                <div className="flex items-center">
                  <span className={`mr-2 ${isLightMode ? "text-gray-600" : "text-gray-300"}`}>
                    Filtrés par date: {formatDate(selectedDate)}
                  </span>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Effacer le filtre de date"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {filteredAppointments.map((appointment) => {
              const { date, time } = formatDateTime(appointment.appointment_date);
              const statusInfo = getStatusInfo(appointment.confirmation_status);
              const propertyId = appointment.property?.property_id;
              const propertyImagesArray = propertyId ? propertyImages[propertyId] || [] : [];
               
              return (
                <div 
                  key={appointment.appointment_id} 
                  className={`${isLightMode ? "bg-[#F8FAFC] hover:bg-[#F8FAFC]/80" : "bg-[#1e293b] hover:bg-[#1e293b]/80"} rounded-lg p-4 transition-colors ${cardBorder}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div className="flex items-center mb-2 md:mb-0">
                      <div className={`w-10 h-10 ${isLightMode ? "bg-[#0150BC]/20" : "bg-[#59e0c5]/20"} rounded-full flex items-center justify-center mr-3`}>
                        <CalendarIcon className={`w-5 h-5 ${isLightMode ? "text-[#0150BC]" : "text-[#59e0c5]"}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">Rendez-vous #</h3>
                        <div className="flex items-center text-sm text-gray-400">
                          <ClockIcon className="w-3.5 h-3.5 mr-1" />
                          <span>Créé le {new Date(appointment.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                     
                    <div className={`${statusInfo.bgColor} ${statusInfo.color} px-3 py-1 rounded-full flex items-center self-start md:self-center`}>
                      {statusInfo.icon}
                      <span className="ml-1 text-sm">{appointment.confirmation_status}</span>
                    </div>
                  </div>
                   
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className={`${isLightMode ? "bg-white" : "bg-[#0f172a]"} p-3 rounded-lg ${cardBorder}`}>
                      <h4 className={`${isLightMode ? "text-[#0150BC]" : "text-[#59e0c5]"} text-sm font-medium mb-2`}>Détails du rendez-vous</h4>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <CalendarIcon className="w-4 h-4 text-gray-400 mt-1 mr-2" />
                          <div>
                            <p className="text-sm">{date}</p>
                            <p className="text-sm text-gray-400">{time}</p>
                          </div>
                        </div>
                         
                        {appointment.property && (
                          <div className="flex items-start">
                            <HomeIcon className="w-4 h-4 text-gray-400 mt-1 mr-2" />
                            <div>
                              <p className="text-sm">{appointment.property.title}</p>
                              <p className="text-sm text-gray-400">{appointment.property.location}</p>
                            </div>
                          </div>
                        )}
                         
                        {appointment.notes && (
                          <div className={`border-t ${isLightMode ? "border-gray-200" : "border-gray-700"} pt-2 mt-2`}>
                            <p className="text-xs text-gray-400">Notes:</p>
                            <p className="text-sm">{appointment.notes}</p>
                          </div>
                        )}
                        
                        {/* Images de la propriété */}
                        {propertyId && (
                          <div className="mt-4">
                            <p className={`${isLightMode ? "text-gray-500" : "text-gray-400"} text-xs mb-2 flex items-center`}>
                              <ImageIcon size={12} className="mr-1" />
                              Photos de la propriété
                            </p>
                            
                            {loadingImages[propertyId] ? (
                              <div className="flex justify-center py-2">
                                <div className={`animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 ${isLightMode ? "border-[#0150BC]" : "border-[#59e0c5]"}`}></div>
                              </div>
                            ) : propertyImagesArray.length > 0 ? (
                              <div className="grid grid-cols-3 gap-1">
                                {propertyImagesArray.slice(0, 3).map((image) => (
                                  <div key={image.media_id} className={`h-16 ${isLightMode ? "bg-gray-100" : "bg-black/40"} rounded overflow-hidden`}>
                                    {imageErrors[image.media_id] ? (
                                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                        <FileIcon size={12} />
                                        <p className="text-[8px] mt-1">Image non disponible</p>
                                      </div>
                                    ) : (
                                      <img 
                                        src={getImageUrl(image)} 
                                        alt={`Image ${image.media_id}`} 
                                        className="w-full h-full object-cover"
                                        onError={() => handleImageError(image.media_id)}
                                      />
                                    )}
                                  </div>
                                ))}
                                {propertyImagesArray.length > 3 && (
                                  <div className={`h-16 ${isLightMode ? "bg-gray-100" : "bg-black/40"} rounded flex items-center justify-center text-gray-500`}>
                                    <span>+{propertyImagesArray.length - 3}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-gray-400 text-xs">Aucune image disponible</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                     
                    <div className={`${isLightMode ? "bg-white" : "bg-[#0f172a]"} p-3 rounded-lg ${cardBorder}`}>
                      <h4 className={`${isLightMode ? "text-[#0150BC]" : "text-[#59e0c5]"} text-sm font-medium mb-2`}>Informations de contact</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <p className="text-sm">{appointment.contact_name || appointment.user?.full_name || "Non spécifié"}</p>
                        </div>
                         
                        <div className="flex items-center">
                          <PhoneIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <p className="text-sm">{appointment.contact_phone || appointment.user?.phone || "Non spécifié"}</p>
                        </div>
                         
                        <div className="flex items-center">
                          <MailIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <p className="text-sm">{appointment.contact_email || appointment.user?.email || "Non spécifié"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                   
                  {appointment.confirmation_status === 'En attente' && (
                    <div className="flex justify-end space-x-3">
                      <button 
                        onClick={() => updateAppointmentStatus(appointment.appointment_id, 'Annulé')}
                        disabled={processing[appointment.appointment_id]}
                        className="px-4 py-2 border border-red-500 text-red-500 rounded-lg flex items-center hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processing[appointment.appointment_id] ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                        ) : (
                          <XCircleIcon className="w-4 h-4 mr-2" />
                        )}
                        Refuser
                      </button>
                      <button 
                        onClick={() => updateAppointmentStatus(appointment.appointment_id, 'Confirmé')}
                        disabled={processing[appointment.appointment_id]}
                        className={`px-4 py-2 ${isLightMode ? "bg-[#0150BC] text-white" : "bg-[#59e0c5] text-[#0f172a]"} rounded-lg flex items-center hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {processing[appointment.appointment_id] ? (
                          <div className={`w-4 h-4 border-2 ${isLightMode ? "border-white" : "border-[#0f172a]"} border-t-transparent rounded-full animate-spin mr-2`}></div>
                        ) : (
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                        )}
                        Confirmer
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentManagement; 