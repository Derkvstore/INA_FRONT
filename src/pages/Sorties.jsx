import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PencilIcon,
  ArrowUturnLeftIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function Sorties() {
  const [ventes, setVentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentSaleToEdit, setCurrentSaleToEdit] = useState(null);
  const [newMontantPaye, setNewMontantPaye] = useState('');
  const [newTotalAmountNegotiated, setNewTotalAmountNegotiated] = useState('');
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalContent, setConfirmModalContent] = useState({ title: "", message: null });
  const [onConfirmAction, setOnConfirmAction] = useState(null);
  const [returnReasonInput, setReturnReasonInput] = useState('');
  const [modalError, setModalError] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const textareaRef = useRef(null);

  const backendUrl = import.meta.env.PROD
    ? 'https://inaback-production.up.railway.app'
    : 'http://localhost:3001';

  const openConfirmModal = (title, message, action) => {
    setConfirmModalContent({ title, message });
    setOnConfirmAction(() => (currentReason) => action(currentReason));
    setModalError('');
    setIsConfirming(false);
    setReturnReasonInput('');
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setConfirmModalContent({ title: "", message: null });
    setOnConfirmAction(null);
    setReturnReasonInput('');
    setModalError('');
    setIsConfirming(false);
  };

  // ✅ MISE À JOUR IMPORTANTE: Formatage en 140 000 CFA
  const formatCFA = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return 'N/A';
    }
    const numericAmount = parseFloat(amount);
    return numericAmount.toLocaleString('fr-FR', {
      useGrouping: true, // Utilise l'espace comme séparateur de milliers
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }) + ' CFA';
  };

  const fetchVentes = async () => {
    setLoading(true);
    setStatusMessage({ type: '', text: '' });
    try {
      const ventesRes = await fetch(`${backendUrl}/api/ventes`);
      if (!ventesRes.ok) {
        const errorData = await ventesRes.json();
        throw new Error(errorData.error || 'Échec de la récupération des ventes.');
      }
      const ventesData = await ventesRes.json();
      setVentes(ventesData);
    } catch (error) {
      console.error('Erreur lors du chargement des ventes:', error);
      setStatusMessage({ type: 'error', text: `Erreur lors du chargement de l'historique des ventes: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVentes();
  }, []);

  const flattenedVentes = ventes.flatMap(vente => {
    const totalPrixAchatVente = (vente.articles || []).reduce((sum, item) => {
      const qty = parseFloat(item.quantite_vendue) || 0;
      const prixAchat = parseFloat(item.prix_unitaire_achat) || 0;
      return sum + (qty * prixAchat);
    }, 0);

    return (vente.articles || []).map(item => {
      let resteAPayerItem = 0;
      if (item.statut_vente === 'actif') {
        const totalVente = parseFloat(vente.montant_total) || 0;
        const montantPayeVente = parseFloat(vente.montant_paye) || 0;
        resteAPayerItem = totalVente - montantPayeVente;
      } else {
        resteAPayerItem = 0;
      }

      return {
        vente_id: vente.vente_id,
        date_vente: vente.date_vente,
        client_nom: vente.client_nom,
        client_telephone: vente.client_telephone || 'N/A',
        montant_total_vente: vente.montant_total,
        montant_paye_vente: vente.montant_paye,
        reste_a_payer_vente: resteAPayerItem,
        statut_paiement_vente: vente.statut_paiement,
        marque: item.marque,
        modele: item.modele,
        stockage: item.stockage,
        imei: item.imei,
        type_carton: item.type_carton,
        type: item.type,
        quantite_vendue: item.quantite_vendue,
        prix_unitaire_vente: item.prix_unitaire_vente,
        item_id: item.item_id,
        produit_id: item.produit_id,
        statut_vente: item.statut_vente,
        is_special_sale_item: item.is_special_sale_item,
        source_achat_id: item.source_achat_id,
        prix_unitaire_achat: item.prix_unitaire_achat,
        total_prix_achat_de_la_vente: totalPrixAchatVente,
      };
    });
  });

  const filteredVentes = flattenedVentes.filter(data => {
    const searchLower = searchTerm.toLowerCase();
    const clientMatch = data.client_nom.toLowerCase().includes(searchLower);
    const imeiMatch = data.imei ? data.imei.toLowerCase().includes(searchLower) : false;
    const marqueMatch = data.marque ? data.marque.toLowerCase().includes(searchLower) : false;
    const modeleMatch = data.modele ? data.modele.toLowerCase().includes(searchLower) : false;
    return clientMatch || imeiMatch || marqueMatch || modeleMatch;
  });

  const handleUpdatePaymentClick = (saleId, currentMontantPaye, montantTotal, totalPrixAchatDeLaVente) => {
    setCurrentSaleToEdit({
      id: saleId,
      montant_paye: currentMontantPaye,
      montant_total: montantTotal,
      total_prix_achat_de_la_vente: totalPrixAchatDeLaVente
    });
    setNewMontantPaye(String(Math.round(currentMontantPaye)));
    setNewTotalAmountNegotiated(String(Math.round(montantTotal)));
    setShowPaymentModal(true);
  };

  const handleConfirmUpdatePayment = async () => {
    setIsUpdatingPayment(true);
    const parsedNewMontantPaye = parseFloat(newMontantPaye);
    const parsedNewTotalAmountNegotiated = parseFloat(newTotalAmountNegotiated);
    const totalPrixAchatDeLaVente = currentSaleToEdit.total_prix_achat_de_la_vente;

    if (isNaN(parsedNewMontantPaye) || parsedNewMontantPaye < 0) {
      setStatusMessage({ type: 'error', text: 'Le nouveau montant payé est invalide.' });
      setIsUpdatingPayment(false);
      return;
    }

    if (isNaN(parsedNewTotalAmountNegotiated) || parsedNewTotalAmountNegotiated <= totalPrixAchatDeLaVente) {
      setStatusMessage({ type: 'error', text: `Le nouveau montant total (${formatCFA(parsedNewTotalAmountNegotiated)}) ne peut pas être inférieur ou égal au prix d'achat total de la vente (${formatCFA(totalPrixAchatDeLaVente)}).` });
      setIsUpdatingPayment(false);
      return;
    }

    if (parsedNewMontantPaye > parsedNewTotalAmountNegotiated) {
      setStatusMessage({ type: 'error', text: `Le montant payé (${formatCFA(parsedNewMontantPaye)}) ne peut pas être supérieur au nouveau montant total de la vente (${formatCFA(parsedNewTotalAmountNegotiated)}).` });
      setIsUpdatingPayment(false);
      return;
    }

    if (parsedNewMontantPaye > 0 && parsedNewTotalAmountNegotiated < currentSaleToEdit.montant_paye) {
        setStatusMessage({ type: 'error', text: `Le nouveau montant total (${formatCFA(parsedNewTotalAmountNegotiated)}) ne peut pas être inférieur au montant déjà payé (${formatCFA(currentSaleToEdit.montant_paye)}).` });
        setIsUpdatingPayment(false);
        return;
    }

    try {
      const payload = { montant_paye: parseInt(parsedNewMontantPaye, 10) };
      if (parsedNewTotalAmountNegotiated !== currentSaleToEdit.montant_total) {
        payload.new_total_amount = parseInt(parsedNewTotalAmountNegotiated, 10);
      }

      const res = await fetch(`${backendUrl}/api/ventes/${currentSaleToEdit.id}/update-payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: 'Paiement et/ou montant total mis à jour avec succès !' });
        fetchVentes();
        setShowPaymentModal(false);
        setCurrentSaleToEdit(null);
        setNewMontantPaye('');
        setNewTotalAmountNegotiated('');
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Erreur inconnue lors de la mise à jour du paiement.' });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du paiement:', error);
      setStatusMessage({ type: 'error', text: 'Erreur de communication avec le serveur lors de la mise à jour du paiement.' });
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const handleCancelItemClick = (item) => {
    openConfirmModal(
      "Confirmer l'annulation de l'article",
      `Êtes-vous sûr de vouloir annuler l'article "${item.marque} ${item.modele} (${item.imei})" et le remettre en stock ?`,
      async (currentReason) => {
        setIsConfirming(true);
        try {
          const res = await fetch(`${backendUrl}/api/ventes/cancel-item`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              venteId: item.vente_id,
              itemId: item.item_id,
              produitId: item.produit_id,
              imei: item.imei,
              quantite: item.quantite_vendue,
              reason: currentReason || 'Annulation standard',
              is_special_sale_item: item.is_special_sale_item,
            }),
          });

          const data = await res.json();
          if (res.ok) {
            setStatusMessage({ type: 'success', text: 'Article annulé et stock mis à jour avec succès !' });
            fetchVentes();
            closeConfirmModal();
          } else {
            setModalError(data.error || 'Erreur lors de l\'annulation de l\'article.');
          }
        } catch (error) {
          console.error('Erreur lors de l\'annulation de l\'article:', error);
          setModalError('Erreur de communication avec le serveur lors de l\'annulation.');
        } finally {
          setIsConfirming(false);
        }
      }
    );
  };

  const handleReturnItemClick = (item) => {
    const executeReturnAction = async (currentReason) => {
      if (!currentReason.trim()) {
        setModalError('Veuillez saisir le motif du retour.');
        return;
      }
      setIsConfirming(true);
      try {
        const res = await fetch(`${backendUrl}/api/ventes/return-item`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vente_item_id: item.item_id,
            vente_id: item.vente_id,
            client_nom: item.client_nom,
            imei: item.imei,
            reason: currentReason.trim(),
            produit_id: item.produit_id,
            is_special_sale_item: item.is_special_sale_item,
            source_achat_id: item.source_achat_id,
            marque: item.marque,
            modele: item.modele,
            stockage: item.stockage,
            type: item.type,
            type_carton: item.type_carton,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setStatusMessage({ type: 'success', text: 'Mobile marqué comme défectueux et retiré du stock !' });
          fetchVentes();
          closeConfirmModal();
        } else {
          setModalError(data.error || 'Erreur lors du retour du mobile.');
        }
      } catch (error) {
        console.error('Erreur lors du retour du mobile:', error);
        setModalError('Erreur de communication avec le serveur lors du retour du mobile.');
      } finally {
        setIsConfirming(false);
      }
    };

    openConfirmModal(
      "Confirmer le retour de mobile défectueux",
      (
        <>
          <p className="text-gray-700 mb-4">
            Êtes-vous sûr de vouloir marquer le mobile "{item.marque} {item.modele} ({item.imei})" comme défectueux et le retirer du stock ? Il sera ensuite visible dans la section "Retour mobile".
          </p>
          <label htmlFor="returnReason" className="block text-sm font-medium text-gray-700 mb-2">
            Veuillez décrire le problème du mobile :
          </label>
          <textarea
            ref={textareaRef}
            id="returnReason"
            value={returnReasonInput}
            onChange={(e) => {
              setReturnReasonInput(e.target.value);
            }}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
            style={{ color: 'black !important', backgroundColor: 'white !important' }}
            placeholder="Ex: Écran cassé, batterie défectueuse, ne s'allume pas..."
            required
            autoFocus
          ></textarea>
          {modalError && (
            <p className="text-red-500 text-sm mt-2">{modalError}</p>
          )}
        </>
      ),
      executeReturnAction
    );
  };

  const handleMarkAsRenduClick = (item) => {
    const executeRenduAction = async (currentReason) => {
      if (!currentReason.trim()) {
        setModalError('Veuillez saisir le motif du rendu.');
        return;
      }
      setIsConfirming(true);
      try {
        const res = await fetch(`${backendUrl}/api/ventes/mark-as-rendu`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vente_item_id: item.item_id,
            vente_id: item.vente_id,
            client_nom: item.client_nom,
            imei: item.imei,
            reason: currentReason.trim(),
            produit_id: item.produit_id,
            is_special_sale_item: item.is_special_sale_item,
            source_achat_id: item.source_achat_id,
            marque: item.marque,
            modele: item.modele,
            stockage: item.stockage,
            type: item.type,
            type_carton: item.type_carton,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setStatusMessage({ type: 'success', text: 'Mobile marqué comme rendu avec succès !' });
          fetchVentes();
          closeConfirmModal();
        } else {
          setModalError(data.error || 'Erreur lors du marquage comme rendu du mobile.');
        }
      } catch (error) {
        console.error('Erreur lors du marquage comme rendu du mobile:', error);
        setModalError('Erreur de communication avec le serveur lors du marquage comme rendu.');
      } finally {
        setIsConfirming(false);
      }
    };

    openConfirmModal(
      "Confirmer le Rendu du mobile",
      (
        <>
          <p className="text-gray-700 mb-4">
            Êtes-vous sûr de vouloir marquer le mobile "{item.marque} {item.modele} ({item.imei})" comme "Rendu" ? Il sera enregistré comme tel et son statut sera mis à jour.
          </p>
          <label htmlFor="returnReason" className="block text-sm font-medium text-gray-700 mb-2">
            Veuillez saisir le motif du rendu :
          </label>
          <textarea
            ref={textareaRef}
            id="returnReason"
            value={returnReasonInput}
            onChange={(e) => {
              setReturnReasonInput(e.target.value);
            }}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-200"
            style={{ color: 'black !important', backgroundColor: 'white !important' }}
            placeholder="Ex: Changement d'avis du client, erreur de modèle..."
            required
            autoFocus
          ></textarea>
          {modalError && (
            <p className="text-red-500 text-sm mt-2">{modalError}</p>
          )}
        </>
      ),
      executeRenduAction
    );
  };

  useEffect(() => {
    if (showConfirmModal && textareaRef.current) {
      const timer = setTimeout(() => {
        textareaRef.current.focus();
        textareaRef.current.value = returnReasonInput;
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [showConfirmModal, returnReasonInput]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-full mx-auto font-sans bg-gray-50 rounded-xl shadow border border-gray-200">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center">
          <ShoppingCartIcon className="h-6 w-6 sm:h-7 sm:w-7 text-gray-600 mr-2" />
          Historique des Sorties
        </h2>
        <div className="flex justify-center mb-6">
          <Skeleton height={40} width="100%" maxWidth={400} />
        </div>
        <div className="overflow-x-auto min-w-full">
          <table className="table-auto w-full text-xs sm:text-sm divide-y divide-gray-200">
            <thead className="bg-gray-100 text-gray-700 text-left">
              <tr>
                {Array(16).fill(0).map((_, i) => (
                  <th key={i} className="px-3 py-2"><Skeleton height={20} /></th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array(5).fill(0).map((_, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  {Array(16).fill(0).map((_, j) => (
                    <td key={j} className="px-3 py-2"><Skeleton /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div id="printableContent" className="p-4 sm:p-8 max-w-full mx-auto font-sans bg-white sm:bg-gray-50 rounded-xl sm:shadow border border-gray-200 sm:border">
      <style>
        {`
        /* Styles pour l'animation de chargement du bouton (style Apple) */
        @keyframes loading-dot {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        .loading-dot {
          animation: loading-dot 1.4s infinite ease-in-out both;
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
          display: inline-block;
          margin: 0 2px;
        }
        .loading-dot:nth-child(1) { animation-delay: -0.32s; }
        .loading-dot:nth-child(2) { animation-delay: -0.16s; }

        @media print {
          body * { visibility: hidden; }
          #printableContent, #printableContent * { visibility: visible; }
          #printableContent { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; background: none; box-shadow: none; border: none; }
          .no-print, .print-hidden { display: none !important; }
          #vite-error-overlay, #react-devtools-content { display: none !important; }
          .overflow-x-auto { overflow-x: visible !important; }
          .min-w-\\[1200px\\] { min-width: unset !important; }
          table { width: 100% !important; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; font-size: 8pt; white-space: normal; }
          body { font-size: 9pt; }
          .print-header { display: block !important; text-align: center; margin-bottom: 20px; font-size: 16pt; font-weight: bold; color: #333; }
        }
        `}
      </style>

      <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center flex items-center justify-center print-header">
        <ShoppingCartIcon className="h-6 w-6 text-gray-600 mr-2 print-hidden" />
        Historique des Sorties
      </h2>

      {statusMessage.text && (
        <div className={`mb-4 p-3 rounded-md flex items-center justify-between text-sm sm:text-base no-print
          ${statusMessage.type === 'success' ? 'bg-green-100 text-green-700 border border-green-400' : 'bg-red-100 text-red-700 border border-red-400'}`}>
          <span>
            {statusMessage.type === 'success' ? <CheckCircleIcon className="h-5 w-5 inline mr-2" /> : <XCircleIcon className="h-5 w-5 inline mr-2" />}
            {statusMessage.text}
          </span>
          <button onClick={() => setStatusMessage({ type: '', text: '' })} className="ml-4">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center no-print space-y-4 sm:space-y-0">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          />
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200 font-medium text-sm"
        >
          <PrinterIcon className="h-5 w-5 mr-2" />
          Imprimer
        </button>
      </div>

      {filteredVentes.length === 0 ? (
        <p className="text-gray-500 text-center text-sm">Aucune vente trouvée.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <div className="min-w-[1200px] table-container">
            <table className="w-full text-xs divide-y divide-gray-200">
              <thead className="bg-gray-100 text-gray-700 text-left sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 font-medium w-[4%]">ID Vente</th>
                  <th className="px-3 py-2 font-medium w-[9%]">Date Vente</th>
                  <th className="px-3 py-2 font-medium w-[9%]">Client</th>
                  <th className="px-3 py-2 font-medium w-[7%]">Marque</th>
                  <th className="px-3 py-2 font-medium w-[7%]">Modèle</th>
                  <th className="px-3 py-2 font-medium w-[6%]">Type</th>
                  <th className="px-3 py-2 font-medium w-[6%]">Type Carton</th>
                  <th className="px-3 py-2 font-medium w-[6%]">Stockage</th>
                  <th className="px-3 py-2 font-medium w-[7%]">IMEI</th>
                  <th className="px-3 py-2 font-medium text-right w-[4%]">Qté</th>
                  <th className="px-3 py-2 font-medium text-right w-[7%]">Prix Unit.</th>
                  <th className="px-3 py-2 font-medium text-right w-[7%]">Total Vente</th>
                  <th className="px-3 py-2 font-medium text-right w-[7%]">Montant Payé</th>
                  <th className="px-3 py-2 font-medium text-right w-[7%]">Reste à Payer</th>
                  <th className="px-3 py-2 font-medium text-center w-[7%]">Statut</th>
                  <th className="px-3 py-2 text-right no-print w-[8%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVentes.map((data) => {
                  const saleDate = new Date(data.date_vente);
                  const now = new Date();
                  const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
                  const isOlderThan24Hours = (now.getTime() - saleDate.getTime()) > twentyFourHoursInMs;

                  return (
                    <tr key={`${data.vente_id}-${data.item_id}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 text-gray-900 font-medium">
                        <div className="max-w-[60px] truncate" title={data.vente_id}>{data.vente_id}</div>
                      </td>
                      <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                        {new Date(data.date_vente).toLocaleDateString('fr-FR', {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        <div className="max-w-[100px] truncate" title={data.client_nom}>{data.client_nom}</div>
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        <div className="max-w-[80px] truncate" title={data.marque}>{data.marque}</div>
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        <div className="max-w-[80px] truncate" title={data.modele}>{data.modele}</div>
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        <div className="max-w-[60px] truncate" title={data.type || '—'}>{data.type || '—'}</div>
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        <div className="max-w-[60px] truncate" title={data.type_carton || '—'}>{data.type_carton || '—'}</div>
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        <div className="max-w-[60px] truncate" title={data.stockage || '—'}>{data.stockage || '—'}</div>
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        <div className="max-w-[80px] truncate" title={data.imei}>{data.imei}</div>
                      </td>
                      <td className="px-3 py-2 text-right text-gray-700">{data.quantite_vendue}</td>
                      <td className="px-3 py-2 text-right text-gray-700 whitespace-nowrap">{formatCFA(data.prix_unitaire_vente)}</td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900 whitespace-nowrap">{formatCFA(data.montant_total_vente)}</td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900 whitespace-nowrap">{formatCFA(data.montant_paye_vente)}</td>
                      <td className="px-3 py-2 text-right font-medium text-red-600 whitespace-nowrap">{formatCFA(data.reste_a_payer_vente)}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap
                          ${data.statut_vente === 'annule' ? 'bg-orange-100 text-orange-800' : ''}
                          ${data.statut_vente === 'retourne' ? 'bg-purple-100 text-purple-800' : ''}
                          ${data.statut_vente === 'remplace' ? 'bg-indigo-100 text-indigo-800' : ''}
                          ${data.statut_vente === 'rendu' ? 'bg-cyan-100 text-cyan-800' : ''}
                          ${data.statut_vente === 'actif' && data.reste_a_payer_vente <= 0 ? 'bg-green-100 text-green-800' : ''}
                          ${data.statut_vente === 'actif' && data.reste_a_payer_vente > 0 ? 'bg-blue-100 text-blue-800' : ''}
                        `}>
                          {data.statut_vente === 'annule' ? 'ANNULÉ'
                            : data.statut_vente === 'retourne' ? 'REMPLACER'
                              : data.statut_vente === 'remplace' ? 'REMPLACÉ'
                                : data.statut_vente === 'rendu' ? 'RENDU'
                                  : data.reste_a_payer_vente <= 0 ? 'VENDU' : 'EN COURS'
                          }
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right space-x-1 no-print">
                        {!data.is_special_sale_item && data.statut_paiement_vente !== 'payee_integralement' && data.statut_paiement_vente !== 'annulee' && data.statut_vente === 'actif' && (
                          <button
                            onClick={() => handleUpdatePaymentClick(data.vente_id, data.montant_paye_vente, data.montant_total_vente, data.total_prix_achat_de_la_vente)}
                            className="p-1 rounded-full text-blue-600 hover:bg-blue-100 transition"
                            title="Modifier paiement de la vente"
                            disabled={isUpdatingPayment}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                        {data.statut_vente === 'actif' && !isOlderThan24Hours && (
                          <button
                            onClick={() => handleCancelItemClick(data)}
                            className="p-1 rounded-full text-red-600 hover:bg-red-100 transition"
                            title="Annuler cet article et remettre en stock"
                            disabled={isConfirming}
                          >
                            <ArrowUturnLeftIcon className="h-4 w-4" />
                          </button>
                        )}
                        {data.statut_vente === 'actif' && (
                          <button
                            onClick={() => handleReturnItemClick(data)}
                            className="p-1 rounded-full text-purple-600 hover:bg-purple-100 transition"
                            title="Retourner ce mobile (défectueux)"
                            disabled={isConfirming}
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                        )}
                        {data.statut_vente === 'actif' && isOlderThan24Hours && (
                          <button
                            onClick={() => handleMarkAsRenduClick(data)}
                            className="p-1 rounded-full text-cyan-600 hover:bg-cyan-100 transition"
                            title="Marquer comme Rendu"
                            disabled={isConfirming}
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modale de modification de paiement */}
      {showPaymentModal && currentSaleToEdit && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 no-print">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full m-4">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Mise à jour du Paiement de la Vente #{currentSaleToEdit.id}</h3>
            <p className="text-gray-700 text-sm sm:text-base mb-3">Montant Total Initial: <span className="font-semibold">{formatCFA(currentSaleToEdit.montant_total)}</span></p>
            <p className="text-gray-700 text-sm sm:text-base mb-4">Montant Actuellement Payé: <span className="font-semibold">{formatCFA(currentSaleToEdit.montant_paye)}</span></p>

            <label htmlFor="newTotalAmountNegotiated" className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
              Nouveau Montant Total Négocié (CFA):
            </label>
            <input
              type="number"
              id="newTotalAmountNegotiated"
              name="newTotalAmountNegotiated"
              value={newTotalAmountNegotiated}
              onChange={(e) => setNewTotalAmountNegotiated(e.target.value)}
              min={0}
              step="1"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 shadow-sm mb-4"
            />

            <label htmlFor="newMontantPaye" className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
              Nouveau Montant Payé Total (CFA):
            </label>
            <input
              type="number"
              id="newMontantPaye"
              name="newMontantPaye"
              value={newMontantPaye}
              onChange={(e) => setNewMontantPaye(e.target.value)}
              min={0}
              step="1"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 shadow-sm"
            />
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setNewTotalAmountNegotiated('');
                  setIsUpdatingPayment(false);
                }}
                className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition duration-200 font-medium"
                disabled={isUpdatingPayment}
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmUpdatePayment}
                className={`w-full sm:w-auto px-6 py-3 rounded-full font-medium shadow-md transition-colors flex items-center justify-center
                  ${isUpdatingPayment ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
                disabled={isUpdatingPayment}
              >
                {isUpdatingPayment ? (
                  <>
                    <span className="loading-dot"></span>
                    <span className="loading-dot"></span>
                    <span className="loading-dot"></span>
                  </>
                ) : (
                  'Confirmer la Mise à Jour'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de confirmation personnalisée */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 no-print">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full m-4 relative z-[60] pointer-events-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{confirmModalContent.title}</h3>
            {typeof confirmModalContent.message === 'string' ? (
              <p className="text-gray-700 mb-6">{confirmModalContent.message}</p>
            ) : (
              <div className="text-gray-700 mb-6">{confirmModalContent.message}</div>
            )}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={closeConfirmModal}
                className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
                disabled={isConfirming}
              >
                Annuler
              </button>
              <button
                onClick={() => onConfirmAction(returnReasonInput)}
                className={`w-full sm:w-auto px-4 py-2 rounded-md transition-colors flex items-center justify-center
                  ${isConfirming || (confirmModalContent.message && typeof confirmModalContent.message !== 'string' && !returnReasonInput.trim())
                    ? 'bg-red-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
                disabled={isConfirming || (confirmModalContent.message && typeof confirmModalContent.message !== 'string' && !returnReasonInput.trim())}
              >
                {isConfirming ? (
                  <>
                    <span className="loading-dot"></span>
                    <span className="loading-dot"></span>
                    <span className="loading-dot"></span>
                  </>
                ) : (
                  'Confirmer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}