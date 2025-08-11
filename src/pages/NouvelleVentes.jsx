import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, ShoppingCartIcon, CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function NouvelleVente() {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [form, setForm] = useState({
    client_nom: '',
    client_telephone: '',
    items: [{ imei: '' }],
    montant_paye: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ LOGIQUE CORRIGÉE POUR GÉRER LOCAL ET PRODUCTION
  const backendUrl = import.meta.env.PROD
    ? 'https://inaback-production.up.railway.app'
    : 'http://localhost:3001';

  const formatCFA = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return 'N/A CFA';
    }
    return parseFloat(amount).toLocaleString('fr-FR', {
      useGrouping: false,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }) + ' CFA';
  };

  const fetchData = async () => {
    setLoading(true);
    setStatusMessage({ type: '', text: '' });
    try {
      const clientsRes = await fetch(`${backendUrl}/api/clients`);
      if (!clientsRes.ok) {
        const errorData = await clientsRes.json();
        throw new Error(errorData.error || 'Échec de la récupération des clients.');
      }
      const clientsData = await clientsRes.json();
      setClients(clientsData);

      const productsRes = await fetch(`${backendUrl}/api/products`);
      if (!productsRes.ok) {
        const errorData = await productsRes.json();
        throw new Error(errorData.error || 'Échec de la récupération des produits.');
      }
      const productsData = await productsRes.json().then(data => {
        return data.filter(p => p.status === 'active' && p.quantite === 1).map(p => ({
          ...p,
          prix_vente: p.prix_vente !== undefined && p.prix_vente !== null ? parseFloat(p.prix_vente) : null
        }));
      });
      setProducts(productsData);

    } catch (error) {
      console.error('Erreur lors du chargement des données initiales:', error);
      setStatusMessage({ type: 'error', text: `Erreur lors du chargement des données: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalMontantCalcule = form.items.reduce((sum, item) => {
    const foundProduct = products.find(p => p.imei === item.imei);
    const qty = 1;
    const price = (foundProduct && foundProduct.prix_vente !== null) ? foundProduct.prix_vente : 0;
    return sum + (qty * price);
  }, 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => {
      const newForm = { ...prevForm, [name]: value };
      if (name === 'client_nom') {
        const foundClient = clients.find(client => client.nom === value);
        if (foundClient) {
          newForm.client_telephone = foundClient.telephone || '';
        } else {
          newForm.client_telephone = '';
        }
      }
      return newForm;
    });
    setStatusMessage({ type: '', text: '' });
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [name]: value };
    setForm({ ...form, items: newItems });
    setStatusMessage({ type: '', text: '' });
  };

  const handleAddItem = () => {
    setForm({
      ...form,
      items: [...form.items, { imei: '' }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    setIsSubmitting(true);

    if (!form.client_nom) {
      setStatusMessage({ type: 'error', text: 'Veuillez sélectionner ou entrer un nom de client.' });
      setIsSubmitting(false);
      return;
    }
    if (form.items.length === 0) {
      setStatusMessage({ type: 'error', text: 'Veuillez ajouter au moins un produit à vendre.' });
      setIsSubmitting(false);
      return;
    }

    const itemsToSend = [];
    for (const item of form.items) {
      if (!item.imei || !/^\d{6}$/.test(item.imei)) {
        setStatusMessage({ type: 'error', text: `IMEI invalide ou manquant: "${item.imei}". Doit contenir 6 chiffres.` });
        setIsSubmitting(false);
        return;
      }

      const foundProduct = products.find(p => p.imei === item.imei);
      if (!foundProduct) {
        setStatusMessage({ type: 'error', text: `Produit non trouvé pour l'IMEI "${item.imei}".` });
        setIsSubmitting(false);
        return;
      }
      if (foundProduct.prix_vente === null || foundProduct.prix_vente === undefined || isNaN(foundProduct.prix_vente) || parseFloat(foundProduct.prix_vente) <= 0) {
        setStatusMessage({ type: 'error', text: `Prix de vente invalide ou manquant pour le produit avec IMEI "${item.imei}".` });
        setIsSubmitting(false);
        return;
      }

      const qtyRequested = 1;
      if (foundProduct.quantite < qtyRequested || foundProduct.quantite !== 1) {
        setStatusMessage({ type: 'error', text: `Le produit avec IMEI "${item.imei}" n'est pas disponible en quantité suffisante ou n'a pas une quantité de 1 pour la vente.` });
        setIsSubmitting(false);
        return;
      }

      itemsToSend.push({
        imei: item.imei,
        quantite_vendue: qtyRequested,
        prix_unitaire_vente: parseFloat(foundProduct.prix_vente),
        marque: foundProduct.marque,
        modele: foundProduct.modele,
        stockage: foundProduct.stockage,
        type: foundProduct.type,
        type_carton: foundProduct.type_carton || null,
      });
    }

    const parsedMontantPaye = parseFloat(form.montant_paye);
    if (isNaN(parsedMontantPaye) || parsedMontantPaye < 0) {
      setStatusMessage({ type: 'error', text: 'Le montant payé est invalide.' });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/api/ventes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom_client: form.client_nom,
          client_telephone: form.client_telephone,
          items: itemsToSend,
          montant_paye: parsedMontantPaye,
        })
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: 'Vente enregistrée avec succès.' });
        setForm({
          client_nom: '',
          client_telephone: '',
          items: [{ imei: '' }],
          montant_paye: 0
        });
        fetchData();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Erreur inconnue lors de la vente.' });
      }
    } catch (error) {
      console.error('Erreur lors de la soumission de la vente:', error);
      setStatusMessage({ type: 'error', text: 'Erreur de communication avec le serveur.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto font-sans bg-gray-50 rounded-3xl shadow-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center dark:text-gray-100">
          <ShoppingCartIcon className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 mr-2 dark:text-blue-400" />
          Nouvelle Vente
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <div className="space-y-2">
            <Skeleton height={20} width="80%" />
            <Skeleton height={48} />
          </div>
          <div className="space-y-2">
            <Skeleton height={20} width="70%" />
            <Skeleton height={48} />
          </div>
        </div>
        <div className="mb-6 space-y-2">
          <Skeleton height={20} width="60%" />
          <Skeleton height={48} />
        </div>
        <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-gray-100 border border-gray-200 shadow-inner dark:bg-gray-700 dark:border-gray-600">
          <Skeleton height={25} width="50%" />
          {Array(2).fill(0).map((_, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end p-4 border border-gray-200 rounded-xl bg-white shadow-sm dark:bg-gray-600 dark:border-gray-500">
              <div className="space-y-1">
                <Skeleton height={15} width="40%" />
                <Skeleton height={40} />
                <Skeleton count={2} height={15} width="90%" />
              </div>
              <div className="flex justify-end items-center h-full pt-4 md:pt-0">
                <Skeleton circle height={30} width={30} />
              </div>
            </div>
          ))}
          <Skeleton height={40} width={150} />
        </div>
        <div className="text-right pt-4 border-t border-gray-200 dark:border-gray-700">
          <Skeleton height={30} width="70%" className="ml-auto" />
        </div>
        <div className="flex justify-center pt-4">
          <Skeleton height={60} width={200} />
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
        /* Animation de chargement pour le bouton */
        @keyframes loading-dot {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
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
        `}
      </style>
      <div className="p-4 sm:p-8 max-w-4xl mx-auto font-sans bg-gray-50 rounded-3xl shadow-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center dark:text-gray-100">
          <ShoppingCartIcon className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 mr-2 dark:text-blue-400" />
          Nouvelle Vente
        </h2>

        {statusMessage.text && (
          <div className={`mb-6 p-3 rounded-lg flex items-start justify-between text-sm sm:text-base
            ${statusMessage.type === 'success' ? 'bg-green-100 text-green-700 border border-green-400 dark:bg-green-900 dark:text-green-200 dark:border-green-700' : 'bg-red-100 text-red-700 border border-red-400 dark:bg-red-900 dark:text-red-200 dark:border-red-700'}`}>
            <span className="flex items-center">
              {statusMessage.type === 'success' ? <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" /> : <XCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />}
              {statusMessage.text}
            </span>
            <button onClick={() => setStatusMessage({ type: '', text: '' })} className="ml-4 flex-shrink-0">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="client_nom" className="block text-sm font-semibold text-gray-700 mb-2 dark:text-gray-300">
                Nom du Client *
              </label>
              <input
                list="clients-list"
                id="client_nom"
                name="client_nom"
                placeholder="Sélectionner ou entrer un client"
                value={form.client_nom}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                required
              />
              <datalist id="clients-list">
                {clients.map((client) => (
                  <option key={client.id} value={client.nom} />
                ))}
              </datalist>
            </div>

            <div>
              <label htmlFor="client_telephone" className="block text-sm font-semibold text-gray-700 mb-2 dark:text-gray-300">
                Téléphone du Client
              </label>
              <input
                type="text"
                id="client_telephone"
                name="client_telephone"
                placeholder="Numéro de téléphone du client"
                value={form.client_telephone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
              />
            </div>
          </div>

          <div>
            <label htmlFor="montant_paye" className="block text-sm font-semibold text-gray-700 mb-2 dark:text-gray-300">
              Montant Payé (CFA) *
            </label>
            <input
              type="number"
              id="montant_paye"
              name="montant_paye"
              placeholder="Montant reçu du client"
              value={form.montant_paye}
              onChange={handleChange}
              min={0}
              step="1"
              className={`w-full border rounded-xl px-4 py-3 text-gray-900 focus:outline-none transition duration-200 border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600`}
              required
            />
          </div>


          <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-gray-100 border border-gray-200 shadow-inner dark:bg-gray-700 dark:border-gray-600">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4 dark:text-gray-100 dark:border-gray-600">Articles à vendre</h3>
            {form.items.map((item, index) => {
              const foundProduct = products.find(p => p.imei === item.imei);
              const displayPrice = foundProduct && foundProduct.prix_vente !== null ? formatCFA(foundProduct.prix_vente) : 'N/A CFA';
              const storageInfo = foundProduct && foundProduct.stockage ? ` (${foundProduct.stockage})` : '';
              const displayProductInfo = foundProduct ?
                `${foundProduct.marque} ${foundProduct.modele}${storageInfo} - Qté dispo: ${foundProduct.quantite}` :
                'Produit inconnu';

              return (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end p-4 border border-gray-200 rounded-xl bg-white shadow-sm dark:bg-gray-600 dark:border-gray-500">
                  <div>
                    <label htmlFor={`imei-${index}`} className="block text-xs font-medium text-gray-600 mb-1 dark:text-gray-400">
                      IMEI (6 chiffres) *
                    </label>
                    <input
                      list="products-imei-list"
                      id={`imei-${index}`}
                      name="imei"
                      placeholder="IMEI du produit"
                      value={item.imei}
                      onChange={(e) => handleItemChange(index, e)}
                      maxLength={6}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition duration-200 dark:bg-gray-500 dark:text-gray-100 dark:border-gray-400"
                      required
                    />
                    <datalist id="products-imei-list">
                      {products.map((p) => (
                        <option key={p.id || p.imei} value={p.imei}>
                          {p.marque} {p.modele} {p.stockage ? `(${p.stockage})` : ''} - Qté: {p.quantite} - Prix: {formatCFA(p.prix_vente)}
                        </option>
                      ))}
                    </datalist>
                    <p className="text-xs text-gray-700 mt-1 dark:text-gray-300">
                      <span className="font-semibold">{displayProductInfo}</span><br/>
                      Prix unitaire: <span className="font-semibold">{displayPrice}</span>
                    </p>
                  </div>
                  <div className="flex justify-end items-center h-full pt-4 md:pt-0">
                    {form.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition duration-200"
                        title="Supprimer cet article"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {/* <button
              type="button"
              onClick={handleAddItem}
              className="mt-4 flex items-center px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition duration-200 text-sm font-medium shadow-md"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Ajouter un article
            </button> */}
          </div>

          <div className="text-right text-xl sm:text-2xl font-bold text-gray-800 pt-4 border-t border-gray-200 dark:text-gray-200 dark:border-gray-700">
            Montant Total: <span className="text-blue-600 dark:text-blue-400">{formatCFA(totalMontantCalcule)}</span>
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 sm:px-10 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg shadow-lg transform transition duration-300 flex items-center justify-center
                ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl hover:scale-105'}`}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-dot"></span>
                  <span className="loading-dot"></span>
                  <span className="loading-dot"></span>
                </>
              ) : (
                'Valider la Vente'
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}