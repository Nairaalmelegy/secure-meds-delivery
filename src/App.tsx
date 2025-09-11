import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UploadPrescription from "./pages/UploadPrescription";
import OrderMedicines from "./pages/OrderMedicines";
import Orders from "./pages/Orders";
import Checkout from "./pages/Checkout";
import DoctorDashboard from "./pages/DoctorDashboard";
import PharmacyDashboard from "./pages/PharmacyDashboard";
import Profile from "./pages/Profile";
import MedicalRecords from "./pages/MedicalRecords";
import AccountSettings from "./pages/AccountSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Patient Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/upload-prescription" element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <UploadPrescription />
                </ProtectedRoute>
              } />
              <Route path="/order-medicines" element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <OrderMedicines />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <Orders />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <Checkout />
                </ProtectedRoute>
              } />
              
              <Route path="/medical-records" element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <MedicalRecords />
                </ProtectedRoute>
              } />
              
              {/* Doctor Routes */}
              <Route path="/doctor-dashboard" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } />
              
              {/* Admin/Pharmacy Routes */}
              <Route path="/admin" element={
                <AdminRoute>
                  <PharmacyDashboard />
                </AdminRoute>
              } />
              <Route path="/pharmacy-dashboard" element={
                <ProtectedRoute allowedRoles={['pharmacy']}>
                  <PharmacyDashboard />
                </ProtectedRoute>
              } />
              
              {/* Shared Routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/account-settings" element={
                <ProtectedRoute>
                  <AccountSettings />
                </ProtectedRoute>
              } />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
