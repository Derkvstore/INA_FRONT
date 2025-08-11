import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';   
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Products from './pages/Products';
import { TriangleAlert } from 'lucide-react'; // Importation de l'icône d'alerte

// 💡 Composant pour gérer la protection des routes
// Il vérifie si l'utilisateur est authentifié. Si ce n'est pas le cas, il redirige vers la page de connexion.
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    // Redirige vers la page de connexion si aucun token n'est trouvé
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Affiche le composant enfant si l'utilisateur est authentifié
  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Route pour la page de connexion */}
        <Route path="/login" element={<Login />} />
        
        {/* Routes pour les pages protégées */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <Clients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
        
        {/* 💡 Redirection par défaut vers la page de connexion */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 💡 Gérer les routes non trouvées (404) avec une animation */}
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            {/* Animation de pulsation sur l'icône */}
            <div className="animate-pulse text-red-500 mb-4">
              <TriangleAlert size={80} />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">404: Page non trouvée</h1>
            <p className="text-lg text-gray-600 text-center">
              Oups ! Il semble que vous vous soyez trompé de chemin.
            </p>
          </div>
        } />

      </Routes>
    </Router>
  );
}
