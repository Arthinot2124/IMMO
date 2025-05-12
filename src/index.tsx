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
import { ContactAgency } from "./screens/ContactAgency/ContactAgency";
import { Parametres } from "./screens/Parametres";
import ProtectedRoute from "./components/ProtectedRoute";
import SplashScreen from "./components/SplashScreen";
import BackButtonHandler from "./components/BackButtonHandler";
import { PropertyOrder } from "./screens/PropertyOrder";
import { 
  AdminDashboard as AdminDashboardAdmin, 
  PropertyManagement as PropertyManagementAdmin, 
  UserManagement as UserManagementAdmin, 
  AppointmentManagement as AppointmentManagementAdmin, 
  PropertyRequestApproval as PropertyRequestApprovalAdmin,
  OrderManagement as OrderManagementAdmin 
} from "./screens/Admin";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <Router>
      <BackButtonHandler />
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<ElementAccueilSombre />} />
        <Route path="/trano" element={<TranoSombre />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/parametres" element={<Parametres />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/property/:id/contact" element={<ContactAgency />} />
        <Route path="/property/:id/order" element={<PropertyOrder />} />
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
              <AdminDashboardAdmin />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/properties" 
          element={
            <ProtectedRoute requiredRole="admin">
              <PropertyManagementAdmin />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute requiredRole="admin">
              <UserManagementAdmin />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/appointments" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AppointmentManagementAdmin />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/property-requests" 
          element={
            <ProtectedRoute requiredRole="admin">
              <PropertyRequestApprovalAdmin />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/property-requests/:id" 
          element={
            <ProtectedRoute requiredRole="admin">
              <PropertyRequestApprovalAdmin />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/orders" 
          element={
            <ProtectedRoute requiredRole="admin">
              <OrderManagementAdmin />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  </StrictMode>,
);
