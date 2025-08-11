import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  MagnifyingGlassIcon,
  PrinterIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  MinusIcon,
  ArrowUturnLeftIcon,
  CubeIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

export default function Rapport() {
  const [stockSummary, setStockSummary] = useState([]);
  const [dailyStats, setDailyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const backendUrl = import.meta.env.PROD
    ? 'https://inaback-production.up.railway.app'
    : 'http://localhost:3001';

  const getFormattedDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined || isNaN(parseFloat(amount))) {
      return 'N/A';
    }
    return Math.round(parseFloat(amount)).toLocaleString('fr-FR') + ' CFA';
  };

  const fetchStockSummary = async () => {
    setLoading(true);
    setStatusMessage({ type: '', text: '' });
    try {
      const response = await axios.get(`${backendUrl}/api/reports/stock-summary`);
      setStockSummary(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement du résumé du stock:', error);
      setStatusMessage({ type: 'error', text: `Erreur lors du chargement du rapport de stock: ${error.response?.data?.error || error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyStats = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/reports/dashboard-stats`);
      if (response.status !== 200) {
        throw new Error(response.data.error || 'Échec de la récupération des statistiques journalières.');
      }
      setDailyStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques journalières:', error);
      setStatusMessage({ type: 'error', text: `Erreur lors du chargement des statistiques journalières: ${error.response?.data?.error || error.message}` });
    }
  };

  useEffect(() => {
    fetchStockSummary();
    fetchDailyStats();
  }, []);

  const filteredStock = stockSummary.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const marqueMatch = item.marque ? item.marque.toLowerCase().includes(searchLower) : false;
    const modeleMatch = item.modele ? item.modele.toLowerCase().includes(searchLower) : false;
    const stockageMatch = item.stockage ? item.stockage.toLowerCase().includes(searchLower) : false;
    const typeMatch = item.type ? item.type.toLowerCase().includes(searchLower) : false;
    const typeCartonMatch = item.type_carton ? item.type_carton.toLowerCase().includes(searchLower) : false;

    return marqueMatch || modeleMatch || stockageMatch || typeMatch || typeCartonMatch;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="printableContent" className="p-4 sm:p-8 max-w-full mx-auto font-sans bg-gray-50 rounded-xl shadow border border-gray-200">
      <style>
        {`
        @media print {
          body * {
            visibility: hidden;
          }
          #printableContent, #printableContent * {
            visibility: visible;
          }
          #printableContent {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: none;
            box-shadow: none;
            border: none;
          }
          .no-print, .print-hidden {
            display: none !important;
          }
          #vite-error-overlay, #react-devtools-content {
            display: none !important;
          }
          .overflow-x-auto {
            overflow-x: visible !important;
          }
          .min-w-\\[800px\\] {
            min-width: unset !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            font-size: 9pt;
          }
          body {
            font-size: 10pt;
          }
          .print-header {
            display: block !important;
            text-align: center;
            margin-bottom: 20px;
            font-size: 18pt;
            font-weight: bold;
            color: #333;
          }
          .daily-stats-section {
            page-break-before: always;
          }
          .stock-yesterday-placeholder {
            border-bottom: 1px dotted #999;
            display: inline-block;
            min-width: 50px;
            text-align: center;
          }
        }
        `}
      </style>

      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-center flex items-center justify-center print-header">
        <ChartBarIcon className="h-6 w-6 text-gray-600 mr-2 print-hidden" />
        STOCK DU {getFormattedDate()}
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
            placeholder="Rechercher par marque, modèle, stockage..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          />
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-200 font-medium text-sm"
        >
          <PrinterIcon className="h-5 w-5 mr-2" />
          Imprimer le rapport
        </button>
      </div>

      {loading ? (
        <div className="p-4 bg-white rounded-xl shadow">
          <Skeleton height={40} className="mb-4" />
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <table className="table-auto w-full text-xs sm:text-sm divide-y divide-gray-200">
                <thead className="bg-gray-100 text-gray-700 text-left">
                  <tr>
                    {Array(6).fill(0).map((_, i) => (
                      <th key={i} className="px-3 py-2"><Skeleton height={20} /></th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      {Array(6).fill(0).map((_, j) => (
                        <td key={j} className="px-3 py-2"><Skeleton /></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : filteredStock.length === 0 ? (
        <p className="text-gray-500 text-center text-sm mt-8">Aucun produit trouvé correspondant à votre recherche.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <div className="min-w-[800px]">
            <table className="table-auto w-full text-xs divide-y divide-gray-200">
              <thead className="bg-gray-100 text-gray-700 text-left sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 font-medium">Marque</th>
                  <th className="px-3 py-2 font-medium">Modèle</th>
                  <th className="px-3 py-2 font-medium">Stockage</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Qualité Carton / Type Arrivage</th>
                  <th className="px-3 py-2 font-medium text-right">Qté Totale en Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStock.map((item, index) => (
                  <tr key={`${item.marque}-${item.modele}-${item.stockage}-${item.type}-${item.type_carton || ''}`} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-900">{item.marque}</td>
                    <td className="px-3 py-2 text-gray-700">{item.modele}</td>
                    <td className="px-3 py-2 text-gray-700">{item.stockage || '—'}</td>
                    <td className="px-3 py-2 text-gray-700">{item.type || '—'}</td>
                    <td className="px-3 py-2 text-gray-700">{item.type_carton || '—'}</td>
                    <td className="px-3 py-2 text-right font-medium text-gray-900">{item.total_quantite_en_stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Nouvelle section pour les statistiques journalières */}
      {!loading && dailyStats && (
        <div className="daily-stats-section mt-10 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 text-center">Mouvements de Stock Journaliers ({getFormattedDate()})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-5 shadow-sm border border-blue-200">
              <h4 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
                <CubeIcon className="h-6 w-6 mr-2 text-blue-600" />
                Mobiles en Carton
              </h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-2 text-gray-500" />
                  Stock d'hier: <span className="font-semibold ml-1">___</span>
                </li>
                <li className="flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2 text-green-600" />
                  Ajouté aujourd'hui: <span className="font-semibold ml-1">{dailyStats.addedTodayCarton}</span>
                </li>
                <li className="flex items-center">
                  <MinusIcon className="h-4 w-4 mr-2 text-red-600" />
                  Vendu aujourd'hui: <span className="font-semibold ml-1">{dailyStats.soldTodayCarton}</span>
                </li>
                <li className="flex items-center">
                  <ArrowUturnLeftIcon className="h-4 w-4 mr-2 text-orange-600" />
                  Retourné aujourd'hui: <span className="font-semibold ml-1">{dailyStats.returnedTodayCarton}</span>
                </li>
                <li className="flex items-center">
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2 text-cyan-600" />
                  Rendu aujourd'hui: <span className="font-semibold ml-1">{dailyStats.renduTodayCarton}</span>
                </li>
                <li className="flex items-center font-bold text-gray-900 border-t pt-2 mt-2">
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Facturé aujourd'hui: <span className="text-xl ml-1">{dailyStats.invoiceSalesCartonTodayCount ?? 0}</span>
                </li>
                <li className="flex items-center font-bold text-gray-900 border-t pt-2 mt-2">
                  <CubeIcon className="h-5 w-5 mr-2 text-blue-700" />
                  Stock Actuel: <span className="text-xl ml-1">{dailyStats.totalCartons}</span>
                </li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-lg p-5 shadow-sm border border-green-200">
              <h4 className="text-lg font-bold text-green-800 mb-3 flex items-center">
                <CubeIcon className="h-6 w-6 mr-2 text-green-600" />
                Mobiles en Arrivage
              </h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-2 text-gray-500" />
                  Stock d'hier: <span className="font-semibold ml-1">___</span>
                </li>
                <li className="flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2 text-green-600" />
                  Ajouté aujourd'hui: <span className="font-semibold ml-1">{dailyStats.addedTodayArrivage}</span>
                </li>
                <li className="flex items-center">
                  <MinusIcon className="h-4 w-4 mr-2 text-red-600" />
                  Vendu aujourd'hui: <span className="font-semibold ml-1">{dailyStats.soldTodayArrivage}</span>
                </li>
                <li className="flex items-center">
                  <ArrowUturnLeftIcon className="h-4 w-4 mr-2 text-orange-600" />
                  Retourné aujourd'hui: <span className="font-semibold ml-1">{dailyStats.returnedTodayArrivage}</span>
                </li>
                <li className="flex items-center">
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2 text-cyan-600" />
                  Rendu aujourd'hui: <span className="font-semibold ml-1">{dailyStats.renduTodayArrivage}</span>
                </li>
                <li className="flex items-center font-bold text-gray-900 border-t pt-2 mt-2">
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Facturé aujourd'hui: <span className="text-xl ml-1">{dailyStats.invoiceSalesArrivageTodayCount ?? 0}</span>
                </li>
                <li className="flex items-center font-bold text-gray-900 border-t pt-2 mt-2">
                  <CubeIcon className="h-5 w-5 mr-2 text-green-700" />
                  Stock Actuel: <span className="text-xl ml-1">{dailyStats.totalArrivage}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
