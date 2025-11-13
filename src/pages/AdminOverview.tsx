import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ModernTable, Badge } from '@/components/dashboard/ModernTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, FileText, ShoppingCart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import LottieLoader from '@/components/LottieLoader';

interface Order {
  _id: string;
  status: string;
  total?: number;
}

interface Prescription {
  _id: string;
  status: string;
}

interface Doctor {
  _id: string;
  name: string;
  isVerified: boolean;
}

async function fetchStats() {
  const [medicines, doctors, orders, prescriptions] = await Promise.all([
    apiClient.get('/api/medicines'),
    apiClient.get('/api/doctors'),
    apiClient.get('/api/orders'),
    apiClient.get('/api/prescriptions'),
  ]);

  return {
    totalStocks: medicines.length || 0,
    pendingDoctors: doctors.filter((d: Doctor) => !d.isVerified).length || 0,
    pendingOrders: orders.filter((o: Order) => o.status === 'pending').length || 0,
    prescriptionsToReview: prescriptions.filter((p: Prescription) => p.status === 'pending').length || 0,
    recentOrders: orders.slice(0, 5),
    recentPrescriptions: prescriptions.slice(0, 5),
    recentDoctors: doctors.slice(0, 5),
  };
}

export default function AdminOverview() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchStats,
  });

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><LottieLoader /></div>;

  return (
    <DashboardLayout title="Admin Overview" subtitle="Manage your pharmacy operations">
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <StatCard title="Total Stocks" value={stats?.totalStocks || 0} icon={Package} />
        <StatCard title="Pending Doctors" value={stats?.pendingDoctors || 0} icon={Users} />
        <StatCard title="Pending Orders" value={stats?.pendingOrders || 0} icon={ShoppingCart} />
        <StatCard title="Prescriptions to Review" value={stats?.prescriptionsToReview || 0} icon={FileText} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ModernTable
              data={stats?.recentOrders || []}
              columns={[
                { header: 'ID', accessor: (row) => `#${row._id.slice(-6)}` },
                { header: 'Status', accessor: 'status', cell: (value) => <Badge variant="secondary">{value}</Badge> },
                { header: 'Total', accessor: (row) => `EGP ${(row.total || 0).toFixed(2)}` },
              ]}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />Recent Prescriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ModernTable
              data={stats?.recentPrescriptions || []}
              columns={[
                { header: 'ID', accessor: (row) => `#${row._id.slice(-6)}` },
                { header: 'Status', accessor: 'status', cell: (value) => <Badge variant="secondary">{value}</Badge> },
              ]}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />Recent Doctors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ModernTable
              data={stats?.recentDoctors || []}
              columns={[
                { header: 'Name', accessor: 'name' },
                { header: 'Status', accessor: (row) => row.isVerified ? 'Verified' : 'Pending', cell: (value) => <Badge variant={value === 'Verified' ? 'default' : 'secondary'}>{value}</Badge> },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
