import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import PatientSidebar from "@/components/PatientSidebar";
import ChatBotWidget from "@/components/ChatBotWidget";

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
    <PatientSidebar>
      <main className="flex-1 overflow-y-auto min-h-screen bg-muted/30">
        <div className="mx-auto py-8 px-6">
          <Outlet />
        </div>
        {/* Chat widget available to patients */}
        <ChatBotWidget />
      </main>
    </PatientSidebar>
  );
}
