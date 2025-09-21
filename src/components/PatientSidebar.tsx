import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SidebarProvider, Sidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { to: "/dashboard", label: "Overview" },
  { to: "/medical-records", label: "Medical Records" },
  { to: "/upload-prescription", label: "Upload Prescription" },
  { to: "/orders", label: "Track Orders" },
  { to: "/order-medicines", label: "Order Medicines" },
  { to: "/checkout", label: "Checkout" },
];

export default function PatientSidebar({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex bg-[#fafbfc]">
        {/* Sidebar */}
        <Sidebar className="bg-white border-r border-[#f0f0f0] flex flex-col justify-between w-64 px-6 py-8 z-30">
          <div>
            <div className="text-2xl font-bold text-primary mb-10">Patient Portal</div>
            <nav className="flex flex-col gap-2">
              {links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded px-3 py-2 font-medium text-base transition-colors ${location.pathname === link.to ? "bg-blue-50 text-blue-600" : "text-gray-800 hover:bg-blue-50 hover:text-blue-600"}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <Button
            variant="destructive"
            className="w-full mt-8"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </Button>
        </Sidebar>
        {/* Mobile sidebar trigger */}
        <div className="md:hidden fixed top-0 left-0 w-full flex items-center bg-white border-b border-[#f0f0f0] z-40 h-14 px-2">
          <SidebarTrigger />
          <span className="ml-3 text-lg font-bold text-primary">Patient Portal</span>
        </div>
        {/* Main content */}
        <div className="flex-1 flex flex-col pt-0 md:pt-0">
          <div className="w-full px-4 py-8 md:py-10">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}
