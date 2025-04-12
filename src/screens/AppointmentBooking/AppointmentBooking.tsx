import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { HomeIcon, SettingsIcon, CalendarIcon, ClockIcon } from "lucide-react";
import NotificationBadge from "../../components/NotificationBadge";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from 'date-fns/locale';
import axios from "axios";

// Types pour les propriétés
interface PropertyMedia {
  media_id: number;
  property_id: number;
  media_type: string;
  media_url: string;
  uploaded_at: string;
}

interface Property {
  property_id: number;
  title: string;
  description: string;
  price: number;
  surface: number;
  location: string;
  category: string;
  status: string;
  media?: PropertyMedia[];
}

// Données de secours en cas d'erreur
const fallbackProperty = {
  property_id: 1,
  title: "Villa moderne (données hors ligne)",
  description: "Cette propriété est affichée en mode hors ligne car nous n'avons pas pu charger les données réelles.",
  price: 450000000,
  surface: 120,
  location: "Tambohobe, Fianarantsoa",
  category: "PREMIUM",
  status: "Disponible"
};

// Generate time slots
const generateTimeSlots = () => {
  return [
    { time: "09:00", available: true },
    { time: "10:30", available: true },
    { time: "14:00", available: true },
    { time: "15:30", available: true },
    { time: "17:00", available: false },
  ];
};

export const AppointmentBooking = (): JSX.Element => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [timeSlots] = useState(generateTimeSlots());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Charger les données de la propriété
  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!id) {
        setError("ID de propriété non spécifié");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8000/api/properties/${id}`, {
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.data && response.data.status === "success" && response.data.data) {
          console.log("Propriété chargée:", response.data.data);
          setProperty(response.data.data);
        } else {
          throw new Error("Format de réponse inattendu");
        }
      } catch (err: any) {
        console.error("Erreur lors du chargement de la propriété:", err);
        setError(err.response?.data?.message || err.message || "Erreur lors du chargement des données");
        // Utiliser les données de secours
        setProperty({
          ...fallbackProperty, 
          property_id: parseInt(id)
        } as Property);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
  }, [id]);

  // Fonction pour filtrer les dates du calendrier (désactiver weekends et dates passées)
  const filterDate = (date: Date): boolean => {
    const day = date.getDay();
    // Permet seulement les jours de semaine (lundi-vendredi)
    return day !== 0 && day !== 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !contactName || !contactPhone) {
      setSubmitError("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    setSubmitting(true);
    setSubmitError(null);
    
    // Combiner la date et l'heure
    const appointmentDate = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    try {
      // Récupérer l'ID utilisateur du localStorage (utilisateur connecté)
      // Si l'utilisateur n'est pas connecté, nous utilisons par défaut le client Rasoa (ID 2)
      const userId = localStorage.getItem('user_id');
      
      if (!userId) {
        setSubmitError("Vous devez être connecté pour faire une réservation");
        return;
      }
      
      const appointmentData = {
        property_id: property?.property_id,
        user_id: parseInt(userId),
        appointment_date: appointmentDate.toISOString(),
        contact_name: contactName,
        contact_phone: contactPhone,
        contact_email: contactEmail,
        notes: notes,
        confirmation_status: 'En attente'
      };
      
      console.log("Envoi des données de rendez-vous:", appointmentData);
      
      // Envoi des données au backend
      const response = await axios.post('http://localhost:8000/api/appointments', appointmentData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      
      console.log("Réponse du serveur:", response.data);
      
      if (response.data && response.data.status === "success") {
        setBookingSuccess(true);
        
        // Reset form and redirect after success
        setTimeout(() => {
          navigate(`/property/${id}`);
        }, 3000);
      } else {
        throw new Error("La réservation n'a pas pu être enregistrée");
      }
    } catch (err: any) {
      console.error("Erreur lors de la réservation:", err);
      setSubmitError(err.response?.data?.message || err.message || "Une erreur est survenue lors de la réservation");
    } finally {
      setSubmitting(false);
    }
  };

  // Obtenir l'URL de l'image principale
  const getImageUrl = (): string => {
    if (property && property.media && property.media.length > 0) {
      const mediaUrl = property.media[0].media_url;
      if (mediaUrl.startsWith('/')) {
        return `http://localhost:8000${mediaUrl}`;
      }
      if (mediaUrl.startsWith('http')) {
        return mediaUrl;
      }
      return `http://localhost:8000/${mediaUrl}`;
    }
    
    // Images par défaut selon la catégorie
    if (property?.category === "LITE") {
      return "/public_Trano/calque-3.png";
    } else if (property?.category === "PREMIUM") {
      return "/public_Trano/maison-01.png";
    }
    
    return "/public_Trano/maison-01.png";
  };

  // Formater le prix
  const formatPrice = (price?: number): string => {
    if (!price) return "Prix non spécifié";
    return new Intl.NumberFormat('fr-FR').format(price) + " Ar";
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
          className="flex justify-between items-center py-2 xs:py-4 mb-6 sm:mb-8"
        >
          <div className="flex gap-2 xs:gap-4">
            <HomeIcon 
              className="w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-[#59e0c5] cursor-pointer hover:text-[#59e0c5]/80 transition-colors" 
              onClick={() => navigate('/home')}
            />
            <NotificationBadge size="lg" />
            <SettingsIcon 
              className="w-8 h-8 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-[#59e0c5] cursor-pointer hover:text-[#59e0c5]/80 transition-colors"
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

        {loading ? (
          // État de chargement
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-[#59e0c5] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          // Message d'erreur
          <div className="bg-red-500/20 text-white p-5 rounded-xl text-center">
            <p>{error}</p>
            <button 
              onClick={() => navigate('/trano')}
              className="mt-4 px-4 py-2 bg-[#59e0c5] text-[#0f172a] rounded-lg"
            >
              Retour aux annonces
            </button>
          </div>
        ) : property ? (
          // Booking Container
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#1E2B47] rounded-2xl overflow-hidden"
          >
            {/* Property Info Header */}
            <div className="flex items-center p-4 sm:p-6 border-b border-[#59e0c5]/30 bg-[#0f172a]">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden mr-4">
                <img
                  src={getImageUrl()}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">{property.title}</h2>
                <p className="text-[#59e0c5]">{formatPrice(property.price)}</p>
                <p className="text-gray-400 text-sm">{property.location}</p>
              </div>
            </div>

            {/* Success Message */}
            {bookingSuccess ? (
              <div className="p-6 sm:p-8">
                <div className="bg-green-500/20 border border-green-500 rounded-lg p-6 text-center">
                  <CalendarIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-white mb-2">Réservation confirmée !</h2>
                  <p className="text-gray-300 mb-1">
                    Votre demande de visite a été enregistrée avec succès.
                  </p>
                  <p className="text-gray-300">
                    Un conseiller vous contactera bientôt pour confirmer le rendez-vous.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center">
                  <CalendarIcon className="mr-2 text-[#59e0c5]" />
                  Réserver une visite
                </h1>
                
                {submitError && (
                  <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4 text-white text-center">
                    {submitError}
                  </div>
                )}
                
                {/* Date Selection with Calendar Icon */}
                <div className="mb-6">
                  <h3 className="text-[#59e0c5] font-semibold mb-3">Choisissez une date et heure</h3>
                  <div className="relative w-full">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                      <div 
                        className="flex items-center gap-2 py-2 px-4 bg-[#0f172a] border border-[#59e0c5]/50 rounded-lg cursor-pointer"
                        onClick={() => {
                          setIsCalendarOpen(!isCalendarOpen);
                          setIsTimePickerOpen(false);
                        }}
                      >
                        <CalendarIcon className="text-[#59e0c5] w-5 h-5" />
                        <span className="text-white">
                          {selectedDate 
                            ? selectedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                            : "Sélectionner une date"}
                        </span>
                      </div>
                      
                      {selectedDate && (
                        <div 
                          className="flex items-center gap-2 py-2 px-4 bg-[#0f172a] border border-[#59e0c5]/50 rounded-lg cursor-pointer"
                          onClick={() => {
                            setIsTimePickerOpen(!isTimePickerOpen);
                            setIsCalendarOpen(false);
                          }}
                        >
                          <ClockIcon className="text-[#59e0c5] w-5 h-5" />
                          <span className="text-white">
                            {selectedTime 
                              ? selectedTime
                              : "Sélectionner une heure"}
                          </span>
                        </div>
                      )}
                      
                      {(selectedDate || selectedTime) && (
                        <button 
                          type="button" 
                          className="text-gray-400 hover:text-white text-sm"
                          onClick={() => {
                            setSelectedDate(null);
                            setSelectedTime(null);
                          }}
                        >
                          Effacer tout
                        </button>
                      )}
                    </div>
                    
                    {isCalendarOpen && (
                      <div className="absolute z-10 mt-1">
                        <DatePicker
                          selected={selectedDate}
                          onChange={(date: Date | null) => {
                            setSelectedDate(date);
                            setIsCalendarOpen(false);
                            if (date) setIsTimePickerOpen(true);
                          }}
                          filterDate={filterDate}
                          minDate={new Date()}
                          maxDate={new Date(new Date().setMonth(new Date().getMonth() + 2))}
                          locale={fr}
                          inline
                          calendarClassName="bg-[#0f172a] border border-[#59e0c5]/30 rounded-lg"
                          dayClassName={() => "text-white hover:bg-[#1E2B47] rounded-lg"}
                          wrapperClassName="w-full"
                          monthClassName={() => "text-[#59e0c5]"}
                          weekDayClassName={() => "text-[#59e0c5]"}
                        />
                      </div>
                    )}
                    
                    {isTimePickerOpen && selectedDate && (
                      <div className="absolute z-10 mt-1 bg-[#0f172a] border border-[#59e0c5]/30 rounded-lg p-4">
                        <h4 className="text-[#59e0c5] font-semibold mb-3">Choisissez une heure</h4>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                          {timeSlots.map((slot, index) => (
                            <button
                              key={index}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => {
                                setSelectedTime(slot.time);
                                setIsTimePickerOpen(false);
                              }}
                              className={`p-3 text-center rounded-lg ${
                                !slot.available
                                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                                  : selectedTime === slot.time
                                  ? "bg-[#59e0c5] text-[#0f172a]"
                                  : "bg-[#0f172a] text-white hover:border-[#59e0c5] border border-[#59e0c5]/30"
                              }`}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
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
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full bg-[#0f172a] border border-[#59e0c5]/50 rounded-lg px-4 py-2 text-white"
                        placeholder="Votre email"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Notes */}
                <div className="mb-6">
                  <label htmlFor="notes" className="block text-sm text-gray-300 mb-1">
                    Commentaires ou questions
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#59e0c5]/50 rounded-lg px-4 py-2 text-white min-h-[100px]"
                    placeholder="Informations complémentaires pour votre visite"
                  />
                </div>
                
                {/* Submit Button */}
                <div className="text-center">
                  <button
                    type="submit"
                    disabled={!selectedDate || !selectedTime || !contactName || !contactPhone || submitting}
                    className={`px-8 py-3 rounded-lg font-bold ${
                      !selectedDate || !selectedTime || !contactName || !contactPhone || submitting
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-[#59e0c5] text-[#0f172a] hover:bg-[#59e0c5]/80"
                    }`}
                  >
                    {submitting ? "Traitement en cours..." : "Confirmer la réservation"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        ) : null}
      </div>
    </motion.div>
  );
};

export default AppointmentBooking; 