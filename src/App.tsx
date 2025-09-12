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
import Profile from "./pages/Profile";
import MedicalRecords from "./pages/MedicalRecords";
import AccountSettings from "./pages/AccountSettings";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOverview from "./pages/AdminOverview";
import AdminInventory from "./pages/AdminInventory";
import AdminAppliedDoctors from "./pages/AdminAppliedDoctors";
import AdminPrescriptionsOrders from "./pages/AdminPrescriptionsOrders";
import AdminSettings from "./pages/AdminSettings";

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
              

              {/* Admin/Pharmacy Routes with Sidebar */}
              <Route path="/admin-dashboard" element={
                <ProtectedRoute allowedRoles={['pharmacy','admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminOverview />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="applied-doctors" element={<AdminAppliedDoctors />} />
                <Route path="prescriptions-orders" element={<AdminPrescriptionsOrders />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              
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
