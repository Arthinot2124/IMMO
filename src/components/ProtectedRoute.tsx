import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: 'admin' | 'client' | null; // null signifie que l'utilisateur doit être connecté, peu importe son rôle
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const location = useLocation();
  const currentUser = authService.getCurrentUser();
  
  // Vérifier si l'utilisateur est connecté
  if (!currentUser) {
    // Rediriger vers la page de connexion et conserver l'URL cible dans l'état
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  // Vérifier le rôle si nécessaire
  if (requiredRole === 'admin' && !authService.isAdmin()) {
    // Rediriger vers la page d'accueil si l'utilisateur n'est pas admin
    return <Navigate to="/home" replace />;
  }
  
  if (requiredRole === 'client' && !authService.isClient()) {
    // Rediriger vers le tableau de bord admin si l'utilisateur n'est pas client
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  // Si toutes les vérifications sont passées, autoriser l'accès à la route
  return <>{children}</>;
};

export default ProtectedRoute; 