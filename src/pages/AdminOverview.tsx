import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { apiClient } from '../lib/api';

interface Doctor {
  verifiedDoctor?: boolean;
  // add other fields as needed
}

interface DoctorsResponse {
  users: Doctor[];
  count: number;
}

interface Order {
  status: string;
  // add other fields as needed
}

interface Prescription {
  status: string;
  // add other fields as needed
}

async function fetchStats() {
  const [meds, doctors, orders, prescriptions] = await Promise.all([
    apiClient.get<any[]>('/api/medicines'),
    apiClient.get<DoctorsResponse>('/api/users?role=doctor'),
    apiClient.get<Order[]>('/api/orders'),
    apiClient.get<Prescription[]>('/api/prescriptions'),
  ]);
  return {
    totalStocks: meds.length || 0,
    pendingDoctors: (doctors.users || []).filter(d => !d.verifiedDoctor).length,
    pendingOrders: (orders || []).filter(o => o.status === 'pending').length,
    prescriptionsToReview: (prescriptions || []).filter(p => p.status === 'pending').length,
  };
}

export default function AdminOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-overview-stats'],
    queryFn: fetchStats,
  });

  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="text-lg font-bold">Total Stocks</div>
              <div className="text-2xl">{isLoading ? '--' : data?.totalStocks}</div>
            </div>
            <div className="bg-secondary/10 p-4 rounded-lg">
              <div className="text-lg font-bold">Pending Doctors</div>
              <div className="text-2xl">{isLoading ? '--' : data?.pendingDoctors}</div>
            </div>
            <div className="bg-warning/10 p-4 rounded-lg">
              <div className="text-lg font-bold">Pending Orders</div>
              <div className="text-2xl">{isLoading ? '--' : data?.pendingOrders}</div>
            </div>
            <div className="bg-info/10 p-4 rounded-lg">
              <div className="text-lg font-bold">Prescriptions to Review</div>
              <div className="text-2xl">{isLoading ? '--' : data?.prescriptionsToReview}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* TODO: Add recent activity widgets here */}
    </div>
  );
}
