
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

async function fetchPrescriptions() {
  const res = await fetch('https://medilinkback-production.up.railway.app/api/prescriptions');
  return (await res.json()).filter((p:any) => p.status === 'pending');
}

async function fetchOrders() {
  const res = await fetch('https://medilinkback-production.up.railway.app/api/orders');
  return (await res.json()).filter((o:any) => o.status === 'pending');
}

async function approvePrescription(id: string, doctorId?: string) {
  const token = localStorage.getItem('token');
  const res = await fetch(`https://medilinkback-production.up.railway.app/api/prescriptions/${id}/verify`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'verify', doctorId }),
  });
  if (!res.ok) throw new Error('Failed to approve prescription');
  return res.json();
}

async function approveOrder(id: string) {
  const token = localStorage.getItem('token');
  const res = await fetch(`https://medilinkback-production.up.railway.app/api/orders/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ status: 'processing' }),
  });
  if (!res.ok) throw new Error('Failed to approve order');
  return res.json();
}

export default function AdminPrescriptionsOrders() {
  const queryClient = useQueryClient();
  const { data: prescriptions, isLoading: loadingPres } = useQuery({
    queryKey: ['pending-prescriptions'],
    queryFn: fetchPrescriptions,
  });
  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['pending-orders'],
    queryFn: fetchOrders,
  });
  const approvePresMutation = useMutation({
    mutationFn: ({ id, doctorId }: { id: string, doctorId?: string }) => approvePrescription(id, doctorId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pending-prescriptions'] }),
  });
  const approveOrderMutation = useMutation({
    mutationFn: (id: string) => approveOrder(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pending-orders'] }),
  });

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Prescriptions to Review</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingPres ? (
            <div>Loading...</div>
          ) : prescriptions && prescriptions.length > 0 ? (
            <div className="space-y-4">
              {prescriptions.map((pres:any) => (
                <div key={pres._id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <div className="font-semibold">Prescription #{pres._id.slice(-6)}</div>
                    <div className="text-xs text-muted-foreground">Patient: {pres.patient}</div>
                  </div>
                  <Button size="sm" onClick={() => approvePresMutation.mutate({ id: pres._id })} disabled={approvePresMutation.isPending}>Approve</Button>
                </div>
              ))}
            </div>
          ) : (
            <div>No pending prescriptions.</div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Pending Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingOrders ? (
            <div>Loading...</div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order:any) => (
                <div key={order._id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <div className="font-semibold">Order #{order._id.slice(-6)}</div>
                    <div className="text-xs text-muted-foreground">Patient: {order.patient}</div>
                  </div>
                  <Button size="sm" onClick={() => approveOrderMutation.mutate(order._id)} disabled={approveOrderMutation.isPending}>Approve</Button>
                </div>
              ))}
            </div>
          ) : (
            <div>No pending orders.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
