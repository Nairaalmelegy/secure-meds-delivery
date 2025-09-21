import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import PatientSidebar from "@/components/PatientSidebar";

const patientNav = [
  { label: "Overview", path: "/dashboard" },
  { label: "Medical Records", path: "/medical-records" },
  { label: "Upload Prescription", path: "/upload-prescription" },
  { label: "Track Orders", path: "/orders" },
  { label: "Order Medicines", path: "/order-medicines" },
  { label: "Checkout", path: "/checkout" },
];

export default function PatientLayout() {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen">
      <PatientSidebar>
      <main className="flex-1  overflow-y-auto bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <Outlet />
        </div>
      </main>
      </ PatientSidebar>
    </div>
  );
}
