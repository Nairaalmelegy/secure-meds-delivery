import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Users, FileText, Package, DollarSign, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarLinks = [
  { to: '/admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin-dashboard/applied-doctors', label: 'Applied Doctors', icon: Users },
  { to: '/admin-dashboard/prescriptions-orders', label: 'Prescriptions & Orders', icon: FileText },
  { to: '/admin-dashboard/inventory', label: 'Inventory', icon: Package },
  { to: '/admin-dashboard/commissions', label: 'Commissions', icon: DollarSign },
  { to: '/admin-dashboard/settings', label: 'Settings', icon: Settings },
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-primary text-primary-foreground flex flex-col border-r">
        <div className="p-6 border-b border-primary-foreground/10">
          <h2 className="text-2xl font-bold">MediCare</h2>
          <p className="text-xs text-primary-foreground/60 mt-1">Admin Panel</p>
        </div>
        
        <div className="flex-1 p-4">
          <nav className="space-y-1">
            {sidebarLinks.map(link => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "flex items-center gap-3 py-2.5 px-4 rounded-lg transition-all text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10",
                    isActive && "bg-primary-foreground/20 text-primary-foreground font-semibold shadow-sm"
                  )}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-primary-foreground/10">
          <button
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground font-medium transition-colors"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      <main className="flex-1 bg-muted/30">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
