import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, FileText, Upload, Package, ShoppingCart, CreditCard, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const patientNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/medical-records', label: 'Medical Records', icon: FileText },
  { to: '/upload-prescription', label: 'Upload Prescription', icon: Upload },
  { to: '/orders', label: 'Track Orders', icon: Package },
  { to: '/order-medicines', label: 'Order Medicines', icon: ShoppingCart },
  { to: '/checkout', label: 'Checkout', icon: CreditCard },
];

export default function PatientSidebar({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="flex">
      <aside className="w-64 h-screen fixed left-0 top-0 bg-primary text-primary-foreground flex flex-col border-r overflow-y-auto">
        <div className="p-6 border-b border-primary-foreground/10">
          <h2 className="text-2xl font-bold">MediCare</h2>
          <p className="text-xs text-primary-foreground/60 mt-1">Patient Portal</p>
        </div>
        
        <div className="flex-1 p-4">
          <nav className="space-y-1">
            {patientNav.map((item) => {
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
      
      <main className="flex-1 min-h-screen overflow-y-auto ml-64">{children}</main>
    </div>
  );
}
