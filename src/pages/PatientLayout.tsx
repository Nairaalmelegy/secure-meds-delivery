import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import PatientSidebar from "@/components/PatientSidebar";
import ChatbotPanel from "@/components/ChatbotPanel";
import { useState } from "react";

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

        {/* Chatbot panel (responsive). We render the panel and a floating toggle button. */}
        {/* chatOpen state controls whether the panel is visible. */}
      </main>

      {/* Chatbot wiring */}
      {/* NOTE: ChatbotPanel expects props chatOpen and setChatOpen */}
      {/* We position the floating button globally so it's above content. */}
      <ChatbotPanelWrapper />
    </PatientSidebar>
  );
}

function ChatbotPanelWrapper() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <ChatbotPanel chatOpen={chatOpen} setChatOpen={setChatOpen} />

      <button
        onClick={() => setChatOpen(true)}
        aria-label={chatOpen ? "Open chat" : "Open chat"}
        className="fixed right-5 bottom-5 z-40 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none"
      >
        💬
      </button>
    </>
  );
}
