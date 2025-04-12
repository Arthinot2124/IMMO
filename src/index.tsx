import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ElementAccueilSombre } from "./screens/ElementAccueilSombre";
import { TranoSombre } from "./screens/TranoSombre";
import { Login } from "./screens/Login";
import { Profile } from "./screens/Profile";
import { PropertyDetail } from "./screens/PropertyDetail";
import { PropertyRequest } from "./screens/PropertyRequest";
import { Notifications } from "./screens/Notifications";
import { Dashboard } from "./screens/Dashboard";
import { Favorites } from "./screens/Favorites";
import { AppointmentBooking } from "./screens/AppointmentBooking";
import { Checkout } from "./screens/Checkout";
import { Guide } from "./screens/Guide";
import { AdminDashboard } from "./screens/Admin/AdminDashboard";
import { PropertyRequestApproval } from "./screens/Admin/PropertyRequestApproval";
import { AppointmentManagement } from "./screens/Admin/AppointmentManagement";
import ProtectedRoute from "./components/ProtectedRoute";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<ElementAccueilSombre />} />
        <Route path="/trano" element={<TranoSombre />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/property-request" element={<PropertyRequest />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/property/:id/book" element={<AppointmentBooking />} />
        <Route path="/property/:id/checkout" element={<Checkout />} />
        <Route path="/guide" element={<Guide />} />
        
        {/* Routes admin protégées */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/property-requests/:id" 
          element={
            <ProtectedRoute requiredRole="admin">
              <PropertyRequestApproval />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/property-requests" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/property-requests/:id/approve" 
          element={
            <ProtectedRoute requiredRole="admin">
              <PropertyRequestApproval />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/appointments" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AppointmentManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  </StrictMode>,
);
