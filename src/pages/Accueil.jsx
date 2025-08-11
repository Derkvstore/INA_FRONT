import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DevicePhoneMobileIcon,
  TruckIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ClockIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';
import { CloudOff } from 'lucide-react'; // Icône pour l'erreur de connexion

export default function Accueil() {
  const [dashboardStats, setDashboardStats] = useState({
    totalCartons: 0,
    totalArrivage: 0,
    totalVentes: 0,
    totalReturned: 0,
    totalSentToSupplier: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  const quotes = [
   "DAFF TELECOM 🌟, l'univers des mobiles authentiques. L'innovation à portée de main.",
    "Votre satisfaction, notre priorité. Découvrez la qualité DAFF TELECOM 📱.",
    "DAFF TELECOM 🪐 : Des mobiles fiables, un service irréproquable. Connectez-vous à l'excellence.",
    "L'authenticité au meilleur prix. C'est la promesse DAFF TELECOM ✨.",
    "DAFF TELECOM 💡 : La technologie mobile réinventée pour vous. Simplicité et performance.",
    "DAFF TELECOM 🌟 : L'excellence mobile à votre service. Des produits qui durent.",
    "Chez DAFF TELECOM 🛡️, la sécurité de vos données et la qualité de votre appareil sont garanties.",
    "DAFF TELECOM 💎 : Chaque mobile est une promesse de performance et de durabilité.",
    "Libérez le potentiel de votre communication avec DAFF TELECOM 📶. Toujours connecté, toujours au top.",
    "DAFF TELECOM 🤝 : Votre partenaire de confiance pour tous vos besoins en téléphonie mobile.",
    "Découvrez la différence DAFF TELECOM 🔋 : Des batteries qui tiennent, des performances qui durent.",
    "DAFF TELECOM 🌐 : Le monde de la mobile authentique, à portée de clic."
  ];

  const getFormattedDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('fr-FR', options);
  };

  const fetchDashboardStats = async () => {
    setStatsLoading(true);
    setStatsError('');
    setIsNetworkError(false);
    try {
      const backendUrl = import.meta.env.PROD
        ? 'https://inaback-production.up.railway.app'
        : 'http://localhost:3001';

      const response = await fetch(`${backendUrl}/api/reports/dashboard-stats`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de la récupération des statistiques du tableau de bord.');
      }
      const data = await response.json();
      setDashboardStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques du tableau de bord:', error);
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        setIsNetworkError(true);
      } else {
        setStatsError(`Erreur: ${error.message}`);
      }
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 10000);
    return () => {
      clearInterval(timerId);
      clearInterval(quoteInterval);
    };
  }, []);

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="py-10 px-4">
      <style>
        {`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        /* 💡 NOUVELLE ANIMATION pour la citation: fondu et légère mise à l'échelle */
        @keyframes quote-fade-and-scale {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .quote-animation {
          animation: quote-fade-and-scale 0.8s ease-out forwards;
        }

        @keyframes pulse-once {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pulse-once { animation: pulse-once 1s ease-in-out; }

        @keyframes spinner-grow {
          0% {
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: none;
          }
        }
        .spinner-grow {
          display: inline-block;
          width: 2rem;
          height: 2rem;
          vertical-align: -0.125em;
          background-color: currentColor;
          border-radius: 50%;
          opacity: 0;
          animation: 0.75s linear infinite spinner-grow;
        }
        `}
      </style>

      <h3
        key={currentQuoteIndex}
        className="text-2xl font-semibold text-blue-800 text-center mb-8 quote-animation"
      >
        {quotes[currentQuoteIndex]}
      </h3>

      <div className="animate-fadeInUp">
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-md p-5 flex items-center space-x-4 border border-gray-100 transform transition-transform duration-300 hover:scale-105">
            <CalendarDaysIcon className="h-8 w-8 text-indigo-500" />
            <div>
              <p className="text-sm text-gray-500">Nous sommes le</p>
              <p className="text-xl font-bold text-gray-800">{getFormattedDate()}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-5 flex items-center space-x-4 border border-gray-100 transform transition-transform duration-300 hover:scale-105">
            <ClockIcon className="h-8 w-8 text-indigo-500" />
            <div>
              <p className="text-sm text-gray-500">Heure Actuelle</p>
              <p className="text-xl font-bold text-gray-800">{formatTime(currentTime)}</p>
            </div>
          </div>
        </div>

        {isNetworkError ? (
          <div className="flex flex-col items-center justify-center p-10 bg-red-50 rounded-xl shadow-lg mt-8">
            <CloudOff className="h-16 w-16 text-red-500 mb-4 animate-pulse-once" />
            <p className="text-xl font-semibold text-red-700 text-center">
              Impossible de se connecter au serveur.
            </p>
            <p className="text-gray-600 text-center mt-2">
              Vérifiez votre connexion Internet et réessayez.
            </p>
          </div>
        ) : statsLoading ? (
          <div className="flex flex-col items-center justify-center p-10 mt-8">
            <div className="flex justify-center text-blue-500 mb-4">
              <div className="spinner-grow" role="status">
                <span className="sr-only">Chargement...</span>
              </div>
            </div>
            <p className="text-gray-600 text-center">Chargement des statistiques...</p>
          </div>
        ) : statsError ? (
          <p className="text-red-600 text-center">{statsError}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center border border-gray-200 transform transition-transform duration-300 hover:scale-105">
              <DevicePhoneMobileIcon className="h-12 w-12 text-blue-500 mb-3" />
              <p className="text-4xl font-bold text-blue-800">{dashboardStats.totalCartons}</p>
              <p className="text-lg text-gray-600 mt-2">Carton</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center border border-gray-200 transform transition-transform duration-300 hover:scale-105">
              <DevicePhoneMobileIcon className="h-12 w-12 text-green-500 mb-3" />
              <p className="text-4xl font-bold text-green-800">{dashboardStats.totalArrivage}</p>
              <p className="text-lg text-gray-600 mt-2">Arrivage</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center border border-gray-200 transform transition-transform duration-300 hover:scale-105">
              <CurrencyDollarIcon className="h-12 w-12 text-purple-500 mb-3" />
              <p className="text-4xl font-bold text-purple-800">{dashboardStats.totalVentes}</p>
              <p className="text-lg text-gray-600 mt-2">Vente</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center border border-gray-200 transform transition-transform duration-300 hover:scale-105">
              <ArrowPathIcon className="h-12 w-12 text-orange-500 mb-3" />
              <p className="text-4xl font-bold text-red-800">{dashboardStats.totalReturned}</p>
              <p className="text-lg text-gray-600 mt-2">Retour Remplacer</p>
            </div>

             <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center border border-gray-200 transform transition-transform duration-300 hover:scale-105">
              <ArrowsRightLeftIcon className="h-12 w-12 text-red-500 mb-3" />
              <p className="text-4xl font-bold text-pink-800">{dashboardStats.totalSentToSupplier}</p>
              <p className="text-lg text-gray-600 mt-2">Retour Fournisseurs</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
