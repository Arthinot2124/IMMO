import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TicketIcon, CopyIcon, TrashIcon, RefreshCwIcon, CheckIcon, 
  PlusIcon, SearchIcon, FilterIcon, DownloadIcon, ArrowLeftIcon
} from 'lucide-react';
import authService from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINT } from '../../config/api';

// Types
interface Coupon {
  id: number;
  code: string;
  created_at: string;
  is_used: boolean;
  used_at?: string;
  used_for_property_id?: number;
  used_by_user_id?: number;
  discount_type: string;
  discount_value?: number;
  expires_at?: string;
  usedByUser?: {
    id: number;
    name: string;
    email: string;
  };
  usedForProperty?: {
    id: number;
    title: string;
    property_type: string;
  };
}

const CouponManagement: React.FC = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'used' | 'unused'>('all');
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Vérifier si l'utilisateur est un administrateur
  useEffect(() => {
    const isAdmin = authService.isAdmin();
    if (!isAdmin) {
      // Rediriger vers la page de connexion si ce n'est pas un administrateur
      navigate('/login');
    }
  }, [navigate]);

  // Charger les coupons depuis l'API au montage
  useEffect(() => {
    const fetchCoupons = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${API_ENDPOINT}/coupons`);
        
        if (response.data.status === 'success') {
          setCoupons(response.data.data);
          setFilteredCoupons(response.data.data);
        } else {
          throw new Error('Failed to fetch coupons');
        }
      } catch (err) {
        console.error("Erreur lors du chargement des coupons:", err);
        setError('Erreur lors du chargement des coupons. Veuillez réessayer.');
        setCoupons([]);
        setFilteredCoupons([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCoupons();
  }, []);

  // Filtrer les coupons lorsque le terme de recherche ou le filtre change
  useEffect(() => {
    let result = [...coupons];
    
    // Appliquer le filtre utilisé/non utilisé
    if (filter === 'used') {
      result = result.filter(coupon => coupon.is_used);
    } else if (filter === 'unused') {
      result = result.filter(coupon => !coupon.is_used);
    }
    
    // Appliquer le terme de recherche
    if (searchTerm) {
      result = result.filter(coupon => 
        coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Trier par date de création (les plus récents en premier)
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    setFilteredCoupons(result);
  }, [coupons, searchTerm, filter]);

  // Fonction pour générer un nouveau coupon
  const generateCoupon = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_ENDPOINT}/coupons`, {});
      
      if (response.data.status === 'success') {
        const newCoupon = response.data.data;
        
        // Ajouter à la liste
        setCoupons(prevCoupons => [newCoupon, ...prevCoupons]);
        
        // Copier automatiquement le code dans le presse-papiers
        await navigator.clipboard.writeText(newCoupon.code);
        setShowCopiedMessage(true);
        setCopiedCode(newCoupon.code);
        
        setTimeout(() => {
          setShowCopiedMessage(false);
        }, 3000);
      } else {
        throw new Error('Failed to generate coupon');
      }
    } catch (error) {
      console.error("Erreur lors de la génération du coupon:", error);
      setError('Erreur lors de la génération du coupon. Veuillez réessayer.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Fonction pour générer plusieurs coupons
  const generateMultipleCoupons = async (quantity: number) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_ENDPOINT}/coupons/generate-batch`, {
        quantity
      });
      
      if (response.data.status === 'success') {
        const newCoupons = response.data.data;
        
        // Ajouter à la liste
        setCoupons(prevCoupons => [...newCoupons, ...prevCoupons]);
        
        // Message de succès temporaire
        alert(`${quantity} coupons ont été générés avec succès`);
      } else {
        throw new Error('Failed to generate coupons batch');
      }
    } catch (error) {
      console.error("Erreur lors de la génération des coupons:", error);
      setError('Erreur lors de la génération des coupons. Veuillez réessayer.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Fonction pour copier un code dans le presse-papiers
  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setShowCopiedMessage(true);
      setCopiedCode(code);
      
      setTimeout(() => {
        setShowCopiedMessage(false);
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de la copie du code:", error);
    }
  };

  // Fonction pour supprimer un coupon
  const deleteCoupon = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce coupon ?')) {
      return;
    }
    
    try {
      const response = await axios.delete(`${API_ENDPOINT}/coupons/${id}`);
      
      if (response.data.status === 'success') {
        // Mettre à jour la liste sans le coupon supprimé
        setCoupons(prevCoupons => prevCoupons.filter(coupon => coupon.id !== id));
      } else {
        throw new Error('Failed to delete coupon');
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du coupon:", error);
      setError('Erreur lors de la suppression du coupon. Veuillez réessayer.');
    }
  };

  // Fonction pour exporter tous les coupons au format CSV
  const exportCouponsAsCSV = () => {
    // Créer l'en-tête du CSV
    let csvContent = "Code,Créé le,Statut,Utilisé le,ID Utilisateur,ID Propriété\n";
    
    // Ajouter chaque coupon
    coupons.forEach(coupon => {
      const createdDate = new Date(coupon.created_at).toLocaleString();
      const status = coupon.is_used ? "Utilisé" : "Disponible";
      const usedDate = coupon.used_at ? new Date(coupon.used_at).toLocaleString() : '';
      const userId = coupon.used_by_user_id || '';
      const propertyId = coupon.used_for_property_id || '';
      
      csvContent += `${coupon.code},${createdDate},${status},${usedDate},${userId},${propertyId}\n`;
    });
    
    // Créer et déclencher le téléchargement
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `coupons_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 flex items-center justify-center transition-colors"
            >
              <ArrowLeftIcon size={18} />
            </button>
            <h1 className="text-2xl font-bold">Gestion des Coupons</h1>
          </div>
          <p className="text-gray-500">
            Générez et gérez des codes coupons à usage unique pour déverrouiller l'accès aux vidéos
          </p>
        </div>
      </div>
      
      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <span>{error}</span>
        </div>
      )}
      
      {/* Notification de copie */}
      {showCopiedMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-5 right-5 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-md shadow-md flex items-center space-x-2 z-50"
        >
          <CheckIcon size={18} />
          <span>Code <strong>{copiedCode}</strong> copié!</span>
        </motion.div>
      )}

      {/* Contrôles principaux */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => generateCoupon()}
          disabled={isGenerating}
          className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          {isGenerating ? (
            <>
              <RefreshCwIcon size={18} className="animate-spin" />
              <span>Génération...</span>
            </>
          ) : (
            <>
              <PlusIcon size={18} />
              <span>Générer un Coupon</span>
            </>
          )}
        </button>
        
        <button
          onClick={() => {
            const quantity = parseInt(prompt("Combien de coupons voulez-vous générer ? (1-100)", "10") || "0", 10);
            if (quantity > 0 && quantity <= 100) {
              generateMultipleCoupons(quantity);
            } else if (quantity > 100) {
              alert("Vous ne pouvez pas générer plus de 100 coupons à la fois.");
            }
          }}
          disabled={isGenerating}
          className="bg-purple-600 text-white px-4 py-2 rounded-md shadow hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <PlusIcon size={18} />
          <span>Générer en lot</span>
        </button>
        
        <button
          onClick={exportCouponsAsCSV}
          disabled={coupons.length === 0}
          className="bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DownloadIcon size={18} />
          <span>Exporter CSV</span>
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="relative flex-1 min-w-[250px]">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un code coupon..."
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-2">
          <FilterIcon size={18} className="text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'used' | 'unused')}
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les coupons</option>
            <option value="used">Utilisés</option>
            <option value="unused">Non utilisés</option>
          </select>
        </div>
      </div>

      {/* Liste des coupons */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des coupons...</p>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <TicketIcon size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-1">Aucun coupon trouvé</h2>
          <p className="text-gray-500 mb-4">
            {searchTerm || filter !== 'all' 
              ? "Essayez de modifier vos filtres de recherche"
              : "Générez votre premier coupon pour commencer"
            }
          </p>
          {searchTerm || filter !== 'all' ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilter('all');
              }}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Réinitialiser les filtres
            </button>
          ) : (
            <button
              onClick={generateCoupon}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              {isGenerating ? 'Génération...' : 'Générer un coupon'}
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Créé le
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Utilisé le
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                  Propriété
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCoupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <TicketIcon size={18} className="text-blue-500" />
                      <span className="font-mono font-medium">{coupon.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${coupon.is_used ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {coupon.is_used ? 'Utilisé' : 'Disponible'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                    {formatDate(coupon.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    {coupon.used_at ? formatDate(coupon.used_at) : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden xl:table-cell">
                    {coupon.usedForProperty ? (
                      <span className="text-blue-600 hover:underline">{coupon.usedForProperty.title}</span>
                    ) : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => copyToClipboard(coupon.code)}
                      className="text-blue-600 hover:text-blue-900 mx-1"
                      title="Copier le code"
                    >
                      <CopyIcon size={16} />
                    </button>
                    <button 
                      onClick={() => deleteCoupon(coupon.id)}
                      className="text-red-600 hover:text-red-900 mx-1"
                      title="Supprimer"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination (basique pour le moment) */}
      {filteredCoupons.length > 0 && (
        <div className="mt-4 flex justify-center">
          <span className="text-sm text-gray-500">
            Affichage de {filteredCoupons.length} coupon{filteredCoupons.length > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default CouponManagement; 