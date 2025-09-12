import { Link, Outlet, useLocation } from 'react-router-dom';

const sidebarLinks = [
  { to: '/admin-dashboard', label: 'Overview' },
  { to: '/admin-dashboard/applied-doctors', label: 'Applied Doctors' },
  { to: '/admin-dashboard/prescriptions-orders', label: 'Prescriptions & Orders' },
  { to: '/admin-dashboard/inventory', label: 'Inventory' },
  { to: '/admin-dashboard/settings', label: 'Settings' },
];

export default function AdminLayout() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-primary/90 text-white flex flex-col p-6 space-y-4">
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
      </aside>
      <main className="flex-1 bg-background p-8">
        <Outlet />
      </main>
    </div>
  );
}
