import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { apiClient } from '../lib/api';
import { PharmacyOrderForm } from './PharmacyOrderForm';

async function fetchPrescriptions() {
  const prescriptions = await apiClient.get<any[]>('/api/prescriptions');
  return prescriptions.filter((p: any) => p.status === 'pending');
}

async function fetchOrders() {
  const orders = await apiClient.get<any[]>('/api/orders');
  return orders.filter((o: any) => o.status === 'pending');
}

async function approvePrescription(id: string, doctorId?: string) {
  return apiClient.put(`/api/prescriptions/${id}/verify`, { action: 'verify', doctorId });
}

async function approveOrder(id: string) {
  return apiClient.put(`/api/orders/${id}`, { status: 'processing' });
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
              {prescriptions.map((pres: any) => (
                <div key={pres._id} className="border-b pb-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Prescription #{pres._id.slice(-6)}</div>
                      <div className="text-xs text-muted-foreground">Patient: {typeof pres.patient === 'object' ? (pres.patient?.name || pres.patient?._id || JSON.stringify(pres.patient)) : pres.patient}</div>
                    </div>
                    <Button size="sm" onClick={() => approvePresMutation.mutate({ id: pres._id })} disabled={approvePresMutation.isPending}>Approve</Button>
                  </div>
                  {pres.fileUrl && (
                    <div className="mt-2">
                      <img src={pres.fileUrl} alt="Prescription" className="max-h-48 border rounded" />
                    </div>
                  )}
                  {pres.ocrText && (
                    <div className="mt-2 p-2 bg-gray-100 rounded">
                      <div className="font-medium text-xs mb-1">Extracted Text:</div>
                      <div className="text-xs whitespace-pre-line">{pres.ocrText}</div>
                    </div>
                  )}
                  {/* UI for pharmacy to list medicines and send order for confirmation */}
                  <PharmacyOrderForm prescription={pres} />
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
              {orders.map((order: any) => (
                <div key={order._id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <div className="font-semibold">Order #{order._id.slice(-6)}</div>
                    <div className="text-xs text-muted-foreground">Patient: {typeof order.patient === 'object' ? (order.patient?.name || order.patient?._id || JSON.stringify(order.patient)) : order.patient}</div>
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
