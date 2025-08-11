import React, { useState, useEffect } from 'react';
import {
  DevicePhoneMobileIcon, // Icône pour les mobiles
  TruckIcon, // Icône pour arrivage
  CurrencyDollarIcon, // Icône pour les ventes
  CalendarDaysIcon, // Icône pour la date
  ClockIcon, // Icône pour le chronomètre
  ArrowLeftIcon, // Icône pour les retours
  ArrowPathIcon,// Icône pour les remplacements (envoyé au fournisseur)
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';

export default function Accueil() {
  const [dashboardStats, setDashboardStats] = useState({
    totalCartons: 0,
    totalArrivage: 0,
    totalVentes: 0,
    totalReturned: 0, // Nouvelle stat pour les mobiles retournés
    totalSentToSupplier: 0, // Nouvelle stat pour les mobiles envoyés au fournisseur
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // NOUVEAU : État pour gérer l'index de la citation actuelle
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // NOUVEAU : Tableau de citations
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

  // Fonction pour obtenir la date du jour formatée
  const getFormattedDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('fr-FR', options);
  };

  // Fonction pour récupérer les statistiques du tableau de bord
  const fetchDashboardStats = async () => {
    setStatsLoading(true);
    setStatsError('');
    try {
      const response = await fetch('http://localhost:3001/api/reports/dashboard-stats');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de la récupération des statistiques du tableau de bord.');
      }
      const data = await response.json();
      setDashboardStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques du tableau de bord:', error);
      setStatsError(`Erreur: ${error.message}`);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats(); // Appel au chargement du composant

    // Configuration du chronomètre
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // NOUVEAU : Configuration du carrousel de citations
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 10000); // Change toutes les 10 secondes

    // Nettoyage des timers lors du démontage du composant
    return () => {
      clearInterval(timerId);
      clearInterval(quoteInterval); // Nettoyage du timer des citations
    };
  }, []); // Empty dependency array means it runs once on mount and cleans up on unmount

  // Formatage du temps pour le chronomètre
  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="py-10 px-4">
      {/* Styles pour l'animation d'entrée et de citation */}
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

        /* NOUVEAU : Styles pour l'animation de la citation */
        @keyframes quoteFadeInUp {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .quote-animation {
          animation: quoteFadeInUp 0.8s ease-out forwards;
        }
        `}
      </style>

      {/* NOUVEAU : La citation animée */}
      <h3
        key={currentQuoteIndex} // La clé change pour forcer la ré-animation
        className="text-2xl font-semibold text-blue-800 text-center mb-8 quote-animation"
      >
        {quotes[currentQuoteIndex]}
      </h3>

      {/* Appliquer l'animation au conteneur principal du contenu */}
      <div className="animate-fadeInUp">
        {/* Section Date et Heure */}
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

        

        {statsLoading ? (
          <p className="text-gray-600 text-center">Chargement des statistiques...</p>
        ) : statsError ? (
          <p className="text-red-600 text-center">{statsError}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto"> {/* Ajusté pour 5 colonnes */}
            {/* Carte Mobiles en Carton */}
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center border border-gray-200 transform transition-transform duration-300 hover:scale-105">
              <DevicePhoneMobileIcon className="h-12 w-12 text-blue-500 mb-3" />
              <p className="text-4xl font-bold text-blue-800">{dashboardStats.totalCartons}</p>
              <p className="text-lg text-gray-600 mt-2">Carton</p>
            </div>

            {/* Carte Mobiles en Arrivage */}
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center border border-gray-200 transform transition-transform duration-300 hover:scale-105">
              <DevicePhoneMobileIcon className="h-12 w-12 text-green-500 mb-3" />
              <p className="text-4xl font-bold text-green-800">{dashboardStats.totalArrivage}</p>
              <p className="text-lg text-gray-600 mt-2">Arrivage</p>
            </div>

            {/* Carte Mobiles Vendus */}
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center border border-gray-200 transform transition-transform duration-300 hover:scale-105">
              <CurrencyDollarIcon className="h-12 w-12 text-purple-500 mb-3" />
              <p className="text-4xl font-bold text-purple-800">{dashboardStats.totalVentes}</p>
              <p className="text-lg text-gray-600 mt-2">Vente</p>
            </div>

            {/* Nouvelle Carte Mobiles Retournés */}
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center border border-gray-200 transform transition-transform duration-300 hover:scale-105">
              <ArrowPathIcon className="h-12 w-12 text-orange-500 mb-3" />
              <p className="text-4xl font-bold text-red-800">{dashboardStats.totalReturned}</p>
              <p className="text-lg text-gray-600 mt-2">Retour Remplacer</p>
            </div>

            {/* Nouvelle Carte Mobiles Envoyés au Fournisseur */}
            {/* Si vous voulez afficher cette carte, décommentez-la et assurez-vous que la stat est bien renvoyée par le backend */}
             <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center border border-gray-200 transform transition-transform duration-300 hover:scale-105">
              <ArrowsRightLeftIcon className="h-12 w-12 text-red-500 mb-3"  />
              <p className="text-4xl font-bold text-pink-800">{dashboardStats.totalSentToSupplier}</p>
              <p className="text-lg text-gray-600 mt-2">Retour Fournisseurs</p>
            </div> 
          </div>
        )}
      </div>
    </div>
  );
}
