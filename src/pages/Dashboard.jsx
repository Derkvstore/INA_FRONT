// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  ShoppingCartIcon,
  CubeIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
  Bars3Icon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  DevicePhoneMobileIcon,
  TruckIcon,
  ArrowsRightLeftIcon,
  CurrencyDollarIcon,
  ListBulletIcon,
  ClipboardDocumentListIcon,
  MoonIcon,
  SunIcon
} from '@heroicons/react/24/outline';

import Clients from './Clients.jsx';
import Products from './Products.jsx';
import NouvelleVente from './NouvelleVentes.jsx';
import Sorties from './Sorties.jsx';
import Liste from './Listes.jsx';
import Rapport from './Rapport.jsx';
import Accueil from './Accueil.jsx';
import RetoursMobiles from './RetoursMobiles.jsx';
import RemplacementsFournisseur from './RemplacementsFournisseur.jsx';
import Recherche from './Recherche.jsx';
import Fournisseurs from './Fournisseurs.jsx';
import Factures from './Factures.jsx';
import Benefices from '../pages/Benefices.jsx';
import SpecialOrders from '../pages/SpecialOrders.jsx';

import logo from '../assets/logo.jpg';

const sections = [
  { name: 'Produits', icon: CubeIcon },
  { name: 'Vente', icon: PlusCircleIcon },
  { name: 'Sorties', icon: ClockIcon },
  { name: 'Factures', icon: DocumentTextIcon },
  { name: 'Recherche', icon: MagnifyingGlassIcon },
  { name: 'Bénéfices', icon: CurrencyDollarIcon },
  { name: 'Dettes', icon: Bars3Icon },
  { name: 'Rapport', icon: ChartBarIcon },
  { name: 'Clients', icon: UserGroupIcon },
  { name: 'Retour mobile', icon: ArrowLeftIcon },
  { name: 'Liste Fournisseurs', icon: TruckIcon },
  { name: 'Rtrs Fournisseur', icon: ArrowsRightLeftIcon },
  //{ name: 'Achat', icon: ClipboardDocumentListIcon }
];

export default function Dashboard() {
  const [active, setActive] = useState(() => {
    const savedSection = localStorage.getItem('activeSection');
    return savedSection || 'Accueil';
  });
  const [displayedName, setDisplayedName] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  const navigate = useNavigate();

  useEffect(() => {
    const storedFullName = localStorage.getItem('fullName');
    const storedUsername = localStorage.getItem('username');

    if (storedFullName) {
      setDisplayedName(storedFullName);
    } else if (storedUsername) {
      setDisplayedName(storedUsername);
    } else {
      navigate('/');
    }

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [navigate, isDarkMode]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('fullName');
    localStorage.removeItem('username');
    localStorage.removeItem('activeSection');
    localStorage.removeItem('theme');
    navigate('/');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
    localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
  };

  const renderSection = () => {
    switch (active) {
      case 'Clients':
        return <Clients />;
      case 'Produits':
        return <Products />;
      case 'Vente':
        return <NouvelleVente />;
      case 'Sorties':
        return <Sorties />;
      case 'Recherche':
        return <Recherche />;
      case 'Factures':
        return <Factures />;
      case 'Bénéfices':
        return <Benefices />;
      case 'Achat':
        return <SpecialOrders />;
      case 'Retour mobile':
        return <RetoursMobiles />;
      case 'Liste Fournisseurs':
        return <Fournisseurs />;
      case 'Rtrs Fournisseur':
        return <RemplacementsFournisseur />;
      case 'Dettes':
        return <Liste />;
      case 'Rapport':
        return <Rapport />;
      case 'Accueil':
        return <Accueil />;
      default:
        return <Accueil />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-blue-50 text-blue-900 font-sans dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300 mx-auto max-w-[1280px]">

      <header className="flex justify-between items-center bg-white shadow-md p-4 sticky top-0 z-10 dark:bg-gray-800 dark:text-gray-100 transition-colors duration-300 max-w-[1280px] mx-auto w-full">
        <div className="flex items-center">
          <img src={logo} alt="NIANGADOU ELECTRO Logo" className="h-10 w-10 mr-2" />
          <h1 className="text-2xl font-semibold text-blue-700 mr-4 dark:text-white transition-colors duration-300">ETS NIANGADOU ELECTRO</h1>
        </div>

        {displayedName && (
          <div className="flex items-center space-x-4">
            <p className="text-lg text-blue-800 dark:text-gray-200">
              Bienvenue, <span className="font-bold">{displayedName}</span>!
            </p>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-blue-700 hover:bg-blue-100 dark:text-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isDarkMode ? "Passer en mode clair" : "Passer en mode sombre"}
            >
              {isDarkMode ? (
                <SunIcon className="h-6 w-6" />
              ) : (
                <MoonIcon className="h-6 w-6" />
              )}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors dark:bg-red-900 dark:text-white dark:hover:bg-red-800"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              Se déconnecter
            </button>
          </div>
        )}
      </header>

      <div className="flex flex-grow w-full max-w-[1280px] mx-auto overflow-hidden">
        <nav className="w-64 min-w-[16rem] max-h-screen overflow-y-auto bg-white shadow-lg flex flex-col p-4 sm:p-6 dark:bg-gray-800 dark:text-gray-100 transition-colors duration-300">
          <ul className="flex flex-col space-y-4">
            <li>
              <button
                onClick={() => {
                  setActive('Accueil');
                  localStorage.setItem('activeSection', 'Accueil');
                }}
                className={`flex items-center w-full p-3 rounded-lg transition-colors
                  ${active === 'Accueil'
                    ? 'bg-blue-200 text-blue-900 font-semibold shadow dark:bg-blue-800 dark:text-white'
                    : 'text-blue-700 hover:bg-blue-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
              >
                <HomeIcon className="h-6 w-6 mr-3" />
                Accueil
              </button>
            </li>
            {sections.map(({ name, icon: Icon }) => (
              <li key={name}>
                <button
                  onClick={() => {
                    setActive(name);
                    localStorage.setItem('activeSection', name);
                  }}
                  className={`flex items-center w-full p-3 rounded-lg transition-colors
                    ${active === name
                      ? 'bg-blue-200 text-blue-900 font-semibold shadow dark:bg-blue-800 dark:text-white'
                      : 'text-blue-700 hover:bg-blue-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                >
                  <Icon className="h-6 w-6 mr-3" />
                  {name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="flex-grow p-6 sm:p-8 overflow-auto">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">
            {active}
          </h2>
          <div className="bg-white rounded-xl shadow p-4 sm:p-6 min-h-[400px] dark:bg-gray-700 dark:text-gray-100">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
