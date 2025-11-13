import { useState } from 'react';
import LottieLoader from '@/components/LottieLoader';
import PrescriptionImage from '@/components/PrescriptionImage';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ModernTable } from '@/components/dashboard/ModernTable';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, ShoppingCart, Package, Plus, AlertCircle, XCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prescriptionApi, orderApi, apiClient } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ExtractedMedicine {
  medicine: string;
  name: string;
  qty: number;
  price: number;
}

interface Order {
  _id: string;
  id?: string;
  total?: number;
  status: string;
}

interface Prescription {
  _id: string;
  id?: string;
  doctor?: string;
  fileUrl?: string;
  status: string;
  extractedMedicines?: ExtractedMedicine[];
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmingLoading, setConfirmingLoading] = useState(false);

  const cancelOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.put(`/api/orders/${id}/cancel`, { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({ title: 'Success', description: 'Order cancelled successfully' });
    },
  });

  const { data: prescriptions, isLoading: loadingPrescriptions } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: prescriptionApi.getMyPrescriptions,
    refetchInterval: 3000,
  });

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: orderApi.getMyOrders,
    refetchInterval: 3000,
  });

  const awaitingConfirm: Prescription[] = prescriptions?.filter((p: Prescription) => p.status === 'awaiting_patient_confirmation') || [];
  const recentPrescriptions = prescriptions?.slice(0, 5) || [];
  const recentOrders = orders?.slice(0, 5) || [];
  const totalSpent = orders?.reduce((sum: number, order: Order) => sum + (order.total || 0), 0) || 0;

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      approved: { variant: 'default', label: 'Approved' },
      awaiting_patient_confirmation: { variant: 'default', label: 'Awaiting Confirmation' },
      delivered: { variant: 'default', label: 'Delivered' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    };
    const config = statusConfig[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const confirmPrescription = async (prescriptionId: string, confirm: boolean) => {
    setConfirmingLoading(true);
    try {
      await apiClient.post(`/api/prescriptions/${prescriptionId}/confirm`, { confirm });
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      setConfirmingId(null);
      toast({ 
        title: confirm ? 'Confirmed' : 'Rejected', 
        description: confirm ? 'Prescription order confirmed' : 'Prescription order rejected' 
      });
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to update', variant: 'destructive' });
    } finally {
      setConfirmingLoading(false);
    }
  };

  if (loadingPrescriptions || loadingOrders) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LottieLoader />
      </div>
    );
  }

  return (
    <DashboardLayout title="Dashboard" subtitle="Welcome back! Here's your health overview">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <StatCard
          title="Total Prescriptions"
          value={prescriptions?.length || 0}
          icon={FileText}
          trend={{ value: `${prescriptions?.filter((p: Prescription) => p.status === 'approved').length} approved`, isPositive: true }}
        />
        <StatCard
          title="Total Orders"
          value={orders?.length || 0}
          icon={ShoppingCart}
          trend={{ value: `${orders?.filter((o: Order) => o.status === 'delivered').length} delivered`, isPositive: true }}
        />
        <StatCard
          title="Total Spent"
          value={`EGP ${totalSpent.toFixed(2)}`}
          icon={Package}
        />
      </div>

      {/* Awaiting Confirmation Section */}
      {awaitingConfirm.length > 0 && (
        <Card className="mb-8 border-warning/50 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertCircle className="w-5 h-5" />
              Prescriptions Awaiting Your Confirmation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {awaitingConfirm.map((prescription) => (
                <Card key={prescription._id} className="bg-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">Prescription #{prescription._id.slice(-6)}</p>
                        {getStatusBadge(prescription.status)}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => setConfirmingId(prescription._id)}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Button asChild size="lg" className="h-24">
          <Link to="/order-medicines">
            <Plus className="w-5 h-5 mr-2" />
            Order New Medicines
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-24">
          <Link to="/upload-prescription">
            <FileText className="w-5 h-5 mr-2" />
            Upload Prescription
          </Link>
        </Button>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Prescriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Recent Prescriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentPrescriptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No prescriptions yet</p>
                <Button asChild variant="link" className="mt-2">
                  <Link to="/upload-prescription">Upload your first prescription</Link>
                </Button>
              </div>
            ) : (
              <ModernTable
                data={recentPrescriptions}
                columns={[
                  { header: 'ID', accessor: (row) => `#${row._id.slice(-6)}` },
                  { header: 'Status', accessor: 'status', cell: (value) => getStatusBadge(value) },
                  { 
                    header: 'Action', 
                    accessor: (row) => row,
                    cell: (value) => (
                      <Button size="sm" variant="ghost" asChild>
                        <Link to="/upload-prescription">View</Link>
                      </Button>
                    )
                  },
                ]}
              />
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No orders yet</p>
                <Button asChild variant="link" className="mt-2">
                  <Link to="/order-medicines">Place your first order</Link>
                </Button>
              </div>
            ) : (
              <ModernTable
                data={recentOrders}
                columns={[
                  { header: 'ID', accessor: (row) => `#${row._id.slice(-6)}` },
                  { header: 'Total', accessor: (row) => `EGP ${(row.total || 0).toFixed(2)}` },
                  { header: 'Status', accessor: 'status', cell: (value) => getStatusBadge(value) },
                  { 
                    header: 'Action', 
                    accessor: (row) => row,
                    cell: (value) => (
                      <Button size="sm" variant="ghost" asChild>
                        <Link to="/orders">Track</Link>
                      </Button>
                    )
                  },
                ]}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmingId} onOpenChange={() => setConfirmingId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Prescription Order</DialogTitle>
          </DialogHeader>
          {confirmingId && awaitingConfirm.find(p => p._id === confirmingId) && (
            <div className="space-y-4">
              {awaitingConfirm.find(p => p._id === confirmingId)?.fileUrl && (
                <PrescriptionImage fileUrl={awaitingConfirm.find(p => p._id === confirmingId)!.fileUrl!} />
              )}
              <div className="flex gap-4 justify-end">
                <Button variant="outline" onClick={() => confirmPrescription(confirmingId, false)} disabled={confirmingLoading}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button onClick={() => confirmPrescription(confirmingId, true)} disabled={confirmingLoading}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
