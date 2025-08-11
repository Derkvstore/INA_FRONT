import React, { useEffect, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon, BuildingOfficeIcon, XMarkIcon } from "@heroicons/react/24/outline";

// Liste des quartiers de Bamako pour l'autocomplétion
const QUARTIERS_BAMAKO = [
  "ACI 2000", "Badalabougou", "Bolibana", "Boulkassoumbougou", "Djelibougou",
  "Djicoroni Para", "Faladiè", "Hippodrome", "Magnambougou", "Missira",
  "Niamakoro", "Quinzambougou", "Sebénikoro", "Sogoniko", "Toumambougou",
  "Yirimadio", "Kalabancoura", "Sikasso", "Koulikoro", "Ségou"
];

export default function Fournisseurs() {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    nom: "",
    telephone: "",
    adresse: "",
  });
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // États pour la modale de confirmation
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalContent, setConfirmModalContent] = useState({ title: "", message: "" });
  const [onConfirmAction, setOnConfirmAction] = useState(null);

  // ✅ LOGIQUE CORRIGÉE POUR GÉRER LOCAL ET PRODUCTION
  const backendUrl = import.meta.env.PROD
    ? 'https://inaback-production.up.railway.app'
    : 'http://localhost:3001';

  const openConfirmModal = (title, message, action) => {
    setConfirmModalContent({ title, message });
    setOnConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setConfirmModalContent({ title: "", message: "" });
    setOnConfirmAction(null);
  };

  const fetchFournisseurs = () => {
    setLoading(true);
    setFormError("");
    setSuccessMessage("");
    fetch(`${backendUrl}/api/fournisseurs`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erreur réseau lors de la récupération des fournisseurs.");
        }
        return res.json();
      })
      .then((data) => {
        setFournisseurs(data);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des fournisseurs :", error);
        setFormError("Impossible de charger les fournisseurs. Veuillez réessayer plus tard.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Logique de formatage du numéro de téléphone
    if (name === "telephone") {
      // Nettoie la valeur pour ne garder que les chiffres
      const digits = value.replace(/\D/g, '');
      // Applique le formatage 2 par 2 avec un espace
      const formatted = digits.match(/.{1,2}/g)?.join(' ') || '';
      newValue = formatted;
    }

    setForm((prevForm) => ({ ...prevForm, [name]: newValue }));
    setFormError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    if (!form.nom || !form.telephone || !form.adresse) {
      setFormError("Le nom, le numéro de téléphone et l'adresse sont obligatoires.");
      setIsSubmitting(false);
      return;
    }

    // Validation du numéro de téléphone
    const cleanedTelephone = form.telephone.replace(/\s/g, '');
    if (!/^\d{8}$/.test(cleanedTelephone)) {
        setFormError("Le numéro de téléphone doit contenir exactement 8 chiffres.");
        setIsSubmitting(false);
        return;
    }

    let url = `${backendUrl}/api/fournisseurs`;
    let method = "POST";

    if (editingId) {
      url = `${url}/${editingId}`;
      method = "PUT";
    }

    const payload = {
        ...form,
        telephone: cleanedTelephone, // Envoie le numéro sans espaces au backend
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();

      if (res.ok) {
        setSuccessMessage(editingId ? "Fournisseur modifié avec succès !" : "Fournisseur ajouté avec succès !");
        fetchFournisseurs();
        resetForm();
        setShowForm(false);
      } else {
        let errorMessage = responseData.error || 'Erreur inconnue.';
        // Gérer l'erreur de duplication de manière plus spécifique
        if (responseData.message && responseData.message.includes('duplicate key')) {
          errorMessage = "Un fournisseur avec ce nom, adresse ou numéro de téléphone existe déjà.";
        }
        setFormError(`Erreur lors de l'enregistrement : ${errorMessage}`);
      }
    } catch (error) {
      console.error("Erreur réseau ou serveur :", error);
      setFormError("Erreur de communication avec le serveur. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    openConfirmModal(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer ce fournisseur ? Cette action est irréversible et ne peut être effectuée que si aucun produit n'est lié à lui.",
      async () => {
        try {
          const res = await fetch(`${backendUrl}/api/fournisseurs/${id}`, {
            method: "DELETE",
          });
          if (res.ok) {
            setSuccessMessage("Fournisseur supprimé avec succès.");
            fetchFournisseurs();
          } else {
            const errorData = await res.json();
            setFormError(`Erreur lors de la suppression : ${errorData.error || 'Erreur inconnue.'}`);
          }
        } catch (error) {
          console.error("Erreur de suppression :", error);
          setFormError("Erreur de communication avec le serveur lors de la suppression.");
        } finally {
          closeConfirmModal();
        }
      }
    );
  };

  const handleEdit = (f) => {
    // Affiche le numéro de téléphone formaté pour l'édition
    const formattedTelephone = f.telephone.replace(/(\d{2})(?=\d)/g, '$1 ');
    setForm({
      nom: f.nom,
      telephone: formattedTelephone || "",
      adresse: f.adresse || "",
    });
    setEditingId(f.id);
    setShowForm(true);
    setFormError("");
    setSuccessMessage("");
  };

  const resetForm = () => {
    setForm({
      nom: "",
      telephone: "",
      adresse: "",
    });
    setEditingId(null);
    setFormError("");
    setSuccessMessage("");
  };

  return (
    <div className="p-4 sm:p-8 max-w-full mx-auto font-sans">
      <style>
        {`
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
        `}
      </style>
      <h1 className="text-2xl sm:text-3xl font-semibold text-blue-700 mb-6 flex items-center">
        <BuildingOfficeIcon className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600 mr-2" />
        Gestion des fournisseurs
      </h1>

      <button
        onClick={() => {
          setShowForm(true);
          resetForm();
        }}
        className="mb-6 flex items-center px-5 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-md"
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        Ajouter un fournisseur
      </button>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4 flex items-start justify-between" role="alert">
          <span className="block sm:inline mr-2">{successMessage}</span>
          <button onClick={() => setSuccessMessage("")} className="ml-4 text-green-700 hover:text-green-900 flex-shrink-0">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}
      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 flex items-start justify-between whitespace-pre-wrap" role="alert">
          <span className="block sm:inline mr-2">{formError}</span>
          <button onClick={() => setFormError("")} className="ml-4 text-red-700 hover:text-red-900 flex-shrink-0">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl shadow-lg max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 border border-blue-200 mb-8"
          autoComplete="off"
        >
          <h2 className="text-xl sm:text-2xl font-semibold text-blue-700 mb-4 text-center col-span-full">
            {editingId ? "Modifier le fournisseur" : "Nouveau fournisseur"}
          </h2>

          <div className="col-span-full">
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
              Nom du fournisseur *
            </label>
            <input
              type="text"
              id="nom"
              name="nom"
              placeholder="Nom du fournisseur"
              value={form.nom}
              onChange={handleChange}
              required
              className="w-full border border-blue-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
          </div>

          <div className="col-span-full">
            <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone *
            </label>
            <input
              type="text"
              id="telephone"
              name="telephone"
              placeholder="Numéro de téléphone (ex: 73 82 79 24)"
              value={form.telephone}
              onChange={handleChange}
              maxLength={11} // 8 chiffres + 3 espaces
              required
              className="w-full border border-blue-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
          </div>

          <div className="col-span-full">
            <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-1">
              Adresse *
            </label>
            <input
              id="adresse"
              name="adresse"
              list="quartiers-list"
              placeholder="Adresse du fournisseur (ex: Hippodrome)"
              value={form.adresse}
              onChange={handleChange}
              required
              className="w-full border border-blue-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
            <datalist id="quartiers-list">
              {QUARTIERS_BAMAKO.map((quartier) => (
                <option key={quartier} value={quartier} />
              ))}
            </datalist>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4 col-span-full">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`rounded-full px-8 py-3 font-semibold transition flex items-center justify-center
                ${isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? (
                  <>
                    <span className="loading-dot"></span>
                    <span className="loading-dot"></span>
                    <span className="loading-dot"></span>
                  </>
                ) : (editingId ? "Modifier le fournisseur" : "Ajouter le fournisseur")}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="border border-blue-600 text-blue-600 rounded-full px-8 py-3 font-semibold hover:bg-blue-100 transition"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500 text-center mt-8">Chargement des fournisseurs...</p>
      ) : fournisseurs.length === 0 ? (
        <p className="text-gray-500 text-center mt-8">Aucun fournisseur trouvé.</p>
      ) : (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100 text-gray-700 text-left">
              <tr>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider">Téléphone</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider">Adresse</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider">Date d'ajout</th>
                <th className="px-6 py-3 text-right font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fournisseurs.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{f.nom}</td>
                  <td className="px-6 py-4 text-gray-700 whitespace-nowrap">{f.telephone.replace(/(\d{2})(?=\d)/g, '$1 ')}</td>
                  <td className="px-6 py-4 text-gray-700 whitespace-nowrap">{f.adresse || "N/A"}</td>
                  <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                    {f.date_ajout
                      ? new Date(f.date_ajout).toLocaleDateString('fr-FR', {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(f)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded-md transition-colors duration-200"
                      title="Modifier"
                    >
                      <PencilIcon className="w-5 h-5 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(f.id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded-md transition-colors duration-200"
                      title="Supprimer"
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

      {/* Modale de confirmation personnalisée */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full m-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{confirmModalContent.title}</h3>
            <p className="text-gray-700 mb-6">{confirmModalContent.message}</p>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={closeConfirmModal}
                className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
              >
                Annuler
              </button>
              <button
                onClick={onConfirmAction}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
