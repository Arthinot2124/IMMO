import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  BellIcon, HomeIcon, SettingsIcon, ArrowLeftIcon, 
  CheckCircleIcon, XCircleIcon, RefreshCwIcon,
  CalendarIcon, ClockIcon, UserIcon, MapPinIcon, PhoneIcon, MailIcon
} from "lucide-react";
import axios from "axios";

// Types pour les rendez-vous
interface AppointmentUser {
  user_id: number;
  full_name: string;
  email: string;
  phone?: string;
}

interface AppointmentProperty {
  property_id: number;
  title: string;
  location: string;
  price: number;
  category: string;
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

export const AppointmentManagement = (): JSX.Element => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'En attente' | 'Confirmé' | 'Annulé'>('all');
  const [dateFilter, setDateFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [processing, setProcessing] = useState<{[key: number]: boolean}>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Charger les rendez-vous au chargement du composant
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get('http://localhost:8000/api/appointments', {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });
        
        console.log("Rendez-vous chargés:", response.data);
        
        if (response.data && response.data.status === "success" && response.data.data) {
          // Vérifier si les données sont paginées
          const appointmentsData = Array.isArray(response.data.data) 
            ? response.data.data 
            : (response.data.data.data || []);
          
          setAppointments(appointmentsData);
          applyFilters(appointmentsData, statusFilter, dateFilter);
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
    status: 'all' | 'En attente' | 'Confirmé' | 'Annulé', 
    date: 'upcoming' | 'past' | 'all'
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
    
    // Filtre par date
    const now = new Date();
    if (date === 'upcoming') {
      filtered = filtered.filter(app => new Date(app.appointment_date) >= now);
    } else if (date === 'past') {
      filtered = filtered.filter(app => new Date(app.appointment_date) < now);
    }
    
    // Tri par date (plus récent en premier)
    filtered.sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());
    
    setFilteredAppointments(filtered);
  };

  // Mettre à jour les filtres
  useEffect(() => {
    applyFilters(appointments, statusFilter, dateFilter);
  }, [statusFilter, dateFilter, appointments]);

  // Mettre à jour le statut d'un rendez-vous
  const updateAppointmentStatus = async (appointmentId: number, newStatus: 'Confirmé' | 'Annulé') => {
    setProcessing(prev => ({ ...prev, [appointmentId]: true }));
    setError(null);
    setSuccessMessage(null);
    
    try {
      // 1. Mettre à jour le statut du rendez-vous
      const response = await axios.put(
        `http://localhost:8000/api/appointments/${appointmentId}`,
        { confirmation_status: newStatus },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        }
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
            const notificationResponse = await axios.post(
              'http://localhost:8000/api/notifications',
              notificationData,
              {
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
              }
            );
            
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
            
            // Essayons une méthode alternative pour créer une notification
            try {
              console.log("Tentative alternative de création de notification...");
              const alternativeResponse = await fetch('http://localhost:8000/api/notifications', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: JSON.stringify({
                  user_id: parseInt(appointment.user_id.toString()),
                  message: notificationMessage,
                  is_read: false
                })
              });
              
              const alternativeData = await alternativeResponse.json();
              console.log("Réponse alternative:", alternativeData);
            } catch (altError) {
              console.error("Échec de la méthode alternative:", altError);
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

  return (
    <div className="bg-[#0f172a] min-h-screen text-white">
      <div className="max-w-[1440px] mx-auto px-4 py-6">
        {/* En-tête */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 rounded-full bg-[#1e293b] text-[#59e0c5] mr-4"
          >
            <ArrowLeftIcon size={20} />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-[#59e0c5]">
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
        <div className="bg-[#1e293b] rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filtres</h2>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Statut</label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-[#0f172a] border border-[#59e0c5]/30 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="En attente">En attente</option>
                <option value="Confirmé">Confirmé</option>
                <option value="Annulé">Annulé</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Date</label>
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="bg-[#0f172a] border border-[#59e0c5]/30 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">Toutes les dates</option>
                <option value="upcoming">À venir</option>
                <option value="past">Passés</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Liste des rendez-vous */}
        {loading ? (
          <div className="bg-[#1e293b] rounded-lg p-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#59e0c5]"></div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-[#1e293b] rounded-lg p-8 text-center">
            <CalendarIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Aucun rendez-vous trouvé</h3>
            <p className="text-gray-400">
              {statusFilter !== 'all' || dateFilter !== 'all' 
                ? "Essayez d'ajuster vos filtres pour voir plus de résultats." 
                : "Aucun rendez-vous n'a été enregistré dans le système."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => {
              const { date, time } = formatDateTime(appointment.appointment_date);
              const statusInfo = getStatusInfo(appointment.confirmation_status);
              
              return (
                <div 
                  key={appointment.appointment_id} 
                  className="bg-[#1e293b] rounded-lg p-4 hover:bg-[#1e293b]/80 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div className="flex items-center mb-2 md:mb-0">
                      <div className="w-10 h-10 bg-[#59e0c5]/20 rounded-full flex items-center justify-center mr-3">
                        <CalendarIcon className="w-5 h-5 text-[#59e0c5]" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Rendez-vous #{appointment.appointment_id}</h3>
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
                    <div className="bg-[#0f172a] p-3 rounded-lg">
                      <h4 className="text-[#59e0c5] text-sm font-medium mb-2">Détails du rendez-vous</h4>
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
                          <div className="border-t border-gray-700 pt-2 mt-2">
                            <p className="text-xs text-gray-400">Notes:</p>
                            <p className="text-sm">{appointment.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-[#0f172a] p-3 rounded-lg">
                      <h4 className="text-[#59e0c5] text-sm font-medium mb-2">Informations de contact</h4>
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
                        className="px-4 py-2 bg-[#59e0c5] text-[#0f172a] rounded-lg flex items-center hover:bg-[#59e0c5]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processing[appointment.appointment_id] ? (
                          <div className="w-4 h-4 border-2 border-[#0f172a] border-t-transparent rounded-full animate-spin mr-2"></div>
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