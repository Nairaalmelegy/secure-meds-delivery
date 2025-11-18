import AdminCommissions from './pages/AdminCommissions';
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
import { Checkout } from "./pages/Checkout";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorPrescriptions from './pages/DoctorPrescriptions';
import DoctorCommissions from './pages/DoctorCommissions';
import DoctorPatientChats from './pages/DoctorPatientChats';
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
import DoctorLayout from "./pages/DoctorLayout";
import PatientLayout from "./pages/PatientLayout";
import PatientSearch from "./pages/PatientSearch";

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
              

              {/* Patient Routes with Sidebar Layout */}
              <Route element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientLayout />
                </ProtectedRoute>
              }>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/medical-records" element={<MedicalRecords />} />
                <Route path="/upload-prescription" element={<UploadPrescription />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/order-medicines" element={<OrderMedicines />} />
                <Route path="/checkout" element={<Checkout />} />
              </Route>
              
              {/* Doctor Routes with Sidebar Layout */}
              <Route path="/doctor-dashboard" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorLayout />
                </ProtectedRoute>
              }>
                <Route index element={<DoctorDashboard />} />
                <Route path="prescriptions" element={<DoctorPrescriptions />} />
                <Route path="patient-chats" element={<DoctorPatientChats />} />
                <Route path="commissions" element={<DoctorCommissions />} />
                <Route path="patient-search" element={<PatientSearch />} />
              </Route>
              
              

              {/* Admin/Pharmacy Routes with Sidebar */}
              <Route path="/admin-dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminOverview />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="applied-doctors" element={<AdminAppliedDoctors />} />
                <Route path="prescriptions-orders" element={<AdminPrescriptionsOrders />} />
                <Route path="commissions" element={<AdminCommissions />} />
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
