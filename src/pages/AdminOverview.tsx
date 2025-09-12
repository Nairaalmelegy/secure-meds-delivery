
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

async function fetchStats() {
  const [meds, doctors, orders, prescriptions] = await Promise.all([
    fetch('https://medilinkback-production.up.railway.app/api/medicines').then(r => r.json()),
    fetch('https://medilinkback-production.up.railway.app/api/users?role=doctor').then(r => r.json()),
    fetch('https://medilinkback-production.up.railway.app/api/orders').then(r => r.json()),
    fetch('https://medilinkback-production.up.railway.app/api/prescriptions').then(r => r.json()),
  ]);
  return {
    totalStocks: meds.length || 0,
    pendingDoctors: (doctors.users || []).filter((d:any) => !d.verifiedDoctor).length,
    pendingOrders: (orders || []).filter((o:any) => o.status === 'pending').length,
    prescriptionsToReview: (prescriptions || []).filter((p:any) => p.status === 'pending').length,
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
