import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const sidebarLinks = [
  { to: '/admin-dashboard', label: 'Overview' },
  { to: '/admin-dashboard/applied-doctors', label: 'Applied Doctors' },
  { to: '/admin-dashboard/prescriptions-orders', label: 'Prescriptions & Orders' },
  { to: '/admin-dashboard/inventory', label: 'Inventory' },
  { to: '/admin-dashboard/settings', label: 'Settings' },
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-primary/90 text-white flex flex-col p-6 space-y-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
          {sidebarLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`py-2 px-4 rounded-lg transition-colors ${location.pathname === link.to ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <button
          className="mt-8 py-2 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
          onClick={() => {
            logout();
            navigate('/');
          }}
        >
          Logout
        </button>
      </aside>
      <main className="flex-1 bg-background p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
