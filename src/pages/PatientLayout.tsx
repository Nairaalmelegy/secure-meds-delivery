import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

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
      <aside className="w-64 bg-white border-r flex flex-col justify-between fixed h-screen z-20">
        <nav className="flex-1 py-8 px-4 space-y-2">
          <div className="mb-8 text-2xl font-bold text-primary">Patient Portal</div>
          {patientNav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "block rounded px-3 py-2 text-base font-medium transition-colors hover:bg-primary/10 hover:text-primary",
                location.pathname === item.path ? "bg-primary/10 text-primary font-semibold" : "text-gray-700"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="m-4 mt-0 px-4 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </aside>
      <main className="flex-1 ml-64 overflow-y-auto bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
