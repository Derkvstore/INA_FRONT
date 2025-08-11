import React, { useEffect, useState } from 'react';
import {
  PencilIcon,
  TrashIcon,
  UserIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: '', telephone: '', adresse: '' });
  const [editingId, setEditingId] = useState(null);

  // ✅ LOGIQUE CORRIGÉE POUR GÉRER LOCAL ET PRODUCTION
  const backendUrl = import.meta.env.PROD
    ? 'https://inaback-production.up.railway.app'
    : 'http://localhost:3001';

  // Fonction pour formater le numero de telephone (par ex. "90 80 90 89")
  const formatPhoneNumber = (num) => {
    if (!num) return '';
    const cleaned = ('' + num).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{2})(\d{2})(\d{2})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }
    return cleaned;
  };

  // Charger clients
  const fetchClients = () => {
    fetch(`${backendUrl}/api/clients`)
      .then(res => res.json())
      .then(data => {
        setClients(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId
      ? `${backendUrl}/api/clients/${editingId}`
      : `${backendUrl}/api/clients`;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      // Enlever les espaces avant l'envoi et s'assurer que le numero est valide
      body: JSON.stringify({ ...form, telephone: form.telephone.replace(/\s/g, '') }), 
    });

    if (res.ok) {
      fetchClients();
      setForm({ nom: '', telephone: '', adresse: '' });
      setEditingId(null);
      setShowForm(false);
    }
  };

  const handleDelete = async (id) => {
    // IMPORTANT: Utilisez une modale personnalisee au lieu de confirm() pour une meilleure experience utilisateur
    // Par exemple, un composant de confirmation que vous affichez et masquez
    if (window.confirm('Confirmer la suppression ?')) { // Temporaire: utilisez une modale customisee
      const res = await fetch(`${backendUrl}/api/clients/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) fetchClients();
    }
  };

  const handleEdit = (client) => {
    setForm({
      nom: client.nom,
      telephone: client.telephone, // Stocker le numero brut
      adresse: client.adresse,
    });
    setEditingId(client.id);
    setShowForm(true);
  };

  const filteredClients = clients.filter((c) =>
    c.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-5xl mx-auto font-sans">
      <h1 className="text-3xl font-semibold text-gray-900 mb-6 flex items-center">
        <UserIcon className="h-8 w-8 text-blue-600 mr-2" />
        Liste des clients
      </h1>

      {/* 🔍 Barre de recherche avec style "Apple" */}
      <div className="flex items-center mb-4 space-x-2 relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher un client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
        />
      </div>

      {/* ➕ Bouton ajouter avec style "Apple" */}
      <button
        onClick={() => {
          setShowForm(true);
          setForm({ nom: '', telephone: '', adresse: '' });
          setEditingId(null);
        }}
        className="mb-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-200 transform hover:scale-105"
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        Ajouter un client
      </button>

      {/* 📝 Formulaire d'ajout/modification avec style "Apple" */}
      {showForm && (
        <form
          onSubmit={handleFormSubmit}
          className="bg-gray-50 p-6 rounded-xl shadow-md mb-6 space-y-4 border border-gray-200"
        >
          <input
            type="text"
            placeholder="Nom"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <input
            type="text"
            placeholder="Telephone"
            value={formatPhoneNumber(form.telephone)}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
              setForm({ ...form, telephone: cleaned });
            }}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <input
            type="text"
            placeholder="Adresse"
            value={form.adresse}
            onChange={(e) => setForm({ ...form, adresse: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-200"
            >
              {editingId ? 'Modifier' : 'Ajouter'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm({ nom: '', telephone: '', adresse: '' });
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-400 transition-colors duration-200"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* 🧾 Table des clients avec style "Apple" */}
      {loading ? (
        <p className="text-gray-500 text-center mt-8">Chargement...</p>
      ) : filteredClients.length === 0 ? (
        <p className="text-gray-500 text-center mt-8">Aucun client trouve.</p>
      ) : (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 mt-6">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100 text-gray-700 text-left">
              <tr>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider">Telephone</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider">Adresse</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider">Date d'ajout</th>
                <th className="px-6 py-3 text-right font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {client.nom}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {formatPhoneNumber(client.telephone) || '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {client.adresse || '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {client.created_at
                      ? new Date(client.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(client)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded-md transition-colors duration-200"
                    >
                      <PencilIcon className="w-5 h-5 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded-md transition-colors duration-200"
                    >
                      <TrashIcon className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
