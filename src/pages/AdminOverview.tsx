// --- Recent Activity Widgets ---
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import LottieLoader from '@/components/LottieLoader';
import { apiClient } from '../lib/api';
function RecentOrders() {
  const { data: ordersData, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['recent-orders'],
    queryFn: async () => (await apiClient.get('/api/orders?limit=5&sort=-createdAt')) as Order[],
  });
  if (ordersLoading) return <div className="flex justify-center items-center py-4"><LottieLoader height={32} width={32} /></div>;
  if (!ordersData || ordersData.length === 0) return <div className="text-muted-foreground">No recent orders.</div>;
  return (
    <ul className="divide-y">
      {ordersData.slice(0, 5).map((order, i) => (
        <li key={order._id || i} className="py-2">
          <div className="flex justify-between items-center">
            <span>Order #{String(order._id).slice(-6)}</span>
            <span className="text-xs px-2 py-1 rounded bg-muted">{order.status}</span>
          </div>
          <div className="text-xs text-muted-foreground">{order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}</div>
        </li>
      ))}
    </ul>
  );
}

function RecentPrescriptions() {
  const { data: prescriptionsData, isLoading: prescriptionsLoading } = useQuery<Prescription[]>({
    queryKey: ['recent-prescriptions'],
    queryFn: async () => (await apiClient.get('/api/prescriptions?limit=5&sort=-createdAt')) as Prescription[],
  });
  if (prescriptionsLoading) return <div className="flex justify-center items-center py-4"><LottieLoader height={32} width={32} /></div>;
  if (!prescriptionsData || prescriptionsData.length === 0) return <div className="text-muted-foreground">No recent prescriptions.</div>;
  return (
    <ul className="divide-y">
      {prescriptionsData.slice(0, 5).map((prescription, i) => (
        <li key={prescription._id || i} className="py-2">
          <div className="flex justify-between items-center">
            <span>Prescription #{String(prescription._id).slice(-6)}</span>
            <span className="text-xs px-2 py-1 rounded bg-muted">{prescription.status}</span>
          </div>
          <div className="text-xs text-muted-foreground">{prescription.createdAt ? new Date(prescription.createdAt).toLocaleString() : ''}</div>
        </li>
      ))}
    </ul>
  );
}

function RecentDoctors() {
  const { data: doctorsData, isLoading: doctorsLoading } = useQuery<Doctor[]>({
    queryKey: ['recent-doctors'],
    queryFn: async () => {
      const res = await apiClient.get('/api/users?role=doctor&limit=5&sort=-createdAt');
      return (res as DoctorsResponse).users;
    },
  });
  if (doctorsLoading) return <div className="flex justify-center items-center py-4"><LottieLoader height={32} width={32} /></div>;
  if (!doctorsData || doctorsData.length === 0) return <div className="text-muted-foreground">No recent doctors.</div>;
  return (
    <ul className="divide-y">
      {doctorsData.slice(0, 5).map((doctor, i) => (
        <li key={doctor._id || i} className="py-2">
          <div className="flex justify-between items-center">
            <span>Doctor {doctor.name || doctor.email || String(doctor._id).slice(-6)}</span>
            <span className={`text-xs px-2 py-1 rounded ${doctor.verifiedDoctor ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{doctor.verifiedDoctor ? 'Verified' : 'Pending'}</span>
          </div>
          <div className="text-xs text-muted-foreground">{doctor.createdAt ? new Date(doctor.createdAt).toLocaleString() : ''}</div>
        </li>
      ))}
    </ul>
  );
}


interface Doctor {
  _id: string;
  name?: string;
  email?: string;
  createdAt?: string;
  verifiedDoctor?: boolean;
}

interface DoctorsResponse {
  users: Doctor[];
  count: number;
}

interface Order {
  _id: string;
  status: string;
  createdAt?: string;
}

interface Prescription {
  _id: string;
  status: string;
  createdAt?: string;
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
              <div className="text-2xl">{isLoading ? <LottieLoader height={32} width={32} /> : data?.totalStocks}</div>
            </div>
            <div className="bg-secondary/10 p-4 rounded-lg">
              <div className="text-lg font-bold">Pending Doctors</div>
              <div className="text-2xl">{isLoading ? <LottieLoader height={32} width={32} /> : data?.pendingDoctors}</div>
            </div>
            <div className="bg-warning/10 p-4 rounded-lg">
              <div className="text-lg font-bold">Pending Orders</div>
              <div className="text-2xl">{isLoading ? <LottieLoader height={32} width={32} /> : data?.pendingOrders}</div>
            </div>
            <div className="bg-info/10 p-4 rounded-lg">
              <div className="text-lg font-bold">Prescriptions to Review</div>
              <div className="text-2xl">{isLoading ? <LottieLoader height={32} width={32} /> : data?.prescriptionsToReview}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Recent Activity Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentOrders />
          </CardContent>
        </Card>
        {/* Recent Prescriptions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentPrescriptions />
          </CardContent>
        </Card>
        {/* Recent Doctors */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentDoctors />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
