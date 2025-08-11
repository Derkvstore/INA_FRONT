import React, { useState } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, CheckCircleIcon, XCircleIcon, CubeIcon } from '@heroicons/react/24/outline';

export default function Recherche() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const backendUrl = import.meta.env.PROD
    ? 'https://inaback-production.up.railway.app'
    : 'http://localhost:3001';

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredProducts([]);
      setHasSearched(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setFilteredProducts([]);

    try {
      const response = await fetch(`${backendUrl}/api/products`);
      if (!response.ok) {
        throw new Error('Échec de la récupération des produits.');
      }
      const data = await response.json();
      setProducts(data);

      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const results = data.filter(product =>
        [
          product.marque,
          product.modele,
          product.imei,
          product.stockage,
          product.type,
          product.type_carton,
          product.nom_fournisseur
        ].some(field => field?.toLowerCase().includes(lowerCaseSearchTerm))
      );

      setFilteredProducts(results);

    } catch (err) {
      setError("Erreur lors de la recherche des produits: " + err.message);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <MagnifyingGlassIcon className="h-5 sm:h-6 w-5 sm:w-6 text-gray-600 mr-2" />
        Recherche de Produits
      </h3>

      <div className="mb-6 flex justify-center">
        <div className="relative w-full max-w-lg">
          {/* Icône de recherche à gauche */}
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          </span>

          <input
            type="text"
            placeholder="Rechercher par marque, modèle, IMEI, stockage, type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-full bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          />

          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilteredProducts([]);
                setHasSearched(false);
                setError(null);
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              title="Effacer la recherche"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-4">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm sm:text-base" role="alert">
          <strong className="font-bold">Erreur!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {!loading && !error && hasSearched && filteredProducts.length === 0 && (
        <p className="text-center text-gray-600 text-sm sm:text-base">
          Aucun produit trouvé pour "{searchTerm}".
        </p>
      )}

      {!loading && !error && !hasSearched && searchTerm === '' && (
        <p className="text-center text-gray-600 text-sm sm:text-base">
          Veuillez entrer un terme de recherche pour afficher les produits.
        </p>
      )}

      {!loading && !error && hasSearched && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <CubeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                  {product.marque} {product.modele}
                </h4>
              </div>

              <div className="space-y-2 text-gray-700 text-xs sm:text-sm">
                <p><strong>IMEI:</strong> {product.imei || 'N/A'}</p>
                <p><strong>TYPE:</strong> {product.type || 'N/A'}</p>
                <p><strong>QUALITE:</strong> {product.type_carton || 'N/A'}</p>
                <p><strong>Stockage:</strong> {product.stockage || 'N/A'} </p>
                <p><strong>Fournisseur:</strong> {product.nom_fournisseur || 'N/A'} </p>
                <p>
                  <strong>Date d'arrivée:</strong>{' '}
                  {product.date_ajout
                    ? (() => {
                        try {
                          const date = new Date(product.date_ajout);
                          return isNaN(date.getTime())
                            ? 'Invalide'
                            : date.toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              });
                        } catch {
                          return 'Invalide';
                        }
                      })()
                    : 'N/A'}
                </p>
                <div className="flex items-center pt-2">
                  {product.status === 'active' ? (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      <CheckCircleIcon className="h-4 w-4 mr-1" /> Disponible
                    </span>
                  ) : (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      <XCircleIcon className="h-4 w-4 mr-1" /> Non disponible
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
