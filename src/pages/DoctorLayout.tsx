import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Users, FileText, DollarSign, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const doctorNav = [
  { to: "/doctor-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/doctor-dashboard/patient-search", label: "Patient Search", icon: Users },
  { to: "/doctor-dashboard/prescriptions", label: "Prescriptions", icon: FileText },
  { to: "/doctor-dashboard/commissions", label: "Commissions", icon: DollarSign },
];

export default function DoctorLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-primary text-primary-foreground flex flex-col border-r fixed left-0 top-0 h-screen overflow-y-auto">
        <div className="p-6 border-b border-primary-foreground/10">
          <h2 className="text-2xl font-bold">MediCare</h2>
          <p className="text-xs text-primary-foreground/60 mt-1">Doctor Portal</p>
        </div>
        
        <div className="flex-1 p-4">
          <nav className="space-y-1">
            {doctorNav.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 py-2.5 px-4 rounded-lg transition-all text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10",
                    isActive && "bg-primary-foreground/20 text-primary-foreground font-semibold shadow-sm"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-primary-foreground/10">
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      <main className="flex-1 overflow-y-auto min-h-screen bg-muted/30 ml-64">
        <div className="mx-auto py-8 px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
