import { useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, FileText, ShoppingCart, Activity, Clock, CheckCircle, Package, TrendingUp, Heart, Pill } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { prescriptionApi, orderApi } from '@/lib/api';

interface ExtractedMedicine {
  medicine: string;
  name: string;
  qty: number;
  price: number;
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
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmingLoading, setConfirmingLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const { user } = useAuth();

  const { data: prescriptions, isLoading: loadingPrescriptions } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: prescriptionApi.getMyPrescriptions,
  });

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: orderApi.getMyOrders,
  });

// Find prescriptions awaiting patient confirmation
const awaitingConfirm: Prescription[] = prescriptions?.filter((p: Prescription) => p.status === 'awaiting_patient_confirmation') || [];

const recentPrescriptions = prescriptions?.slice(0, 3) || [];
const recentOrders = orders?.slice(0, 3) || [];

const totalSpent = orders?.reduce((sum: number, order: any) => sum + (order.total || 0), 0) || 0;
const approvedPrescriptions = prescriptions?.filter((p: any) => p.status === 'approved').length || 0;
const pendingOrders = orders?.filter((o: any) => o.status === 'pending').length || 0;
const deliveredOrders = orders?.filter((o: any) => o.status === 'delivered').length || 0;

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending': return <Clock className="h-4 w-4 text-warning" />;
    case 'approved': return <CheckCircle className="h-4 w-4 text-success" />;
    case 'delivered': return <Package className="h-4 w-4 text-success" />;
    default: return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, string> = {
    'pending': 'bg-warning/10 text-warning border-warning/20',
    'approved': 'bg-success/10 text-success border-success/20',
    'delivered': 'bg-success/10 text-success border-success/20',
    'shipped': 'bg-info/10 text-info border-info/20',
    'processing': 'bg-primary/10 text-primary border-primary/20',
  };
  return variants[status] || 'bg-muted/10 text-muted-foreground border-muted/20';
};

return (
  <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
    <div className="container mx-auto p-6">
      {/* Notification for new order request */}
      {awaitingConfirm.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded shadow flex items-center justify-between">
          <div>
            <span className="font-semibold text-yellow-700">You have a new order request for your prescription!</span>
            <span className="block text-yellow-800 text-xs mt-1">Please review and confirm or reject the order below.</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => setConfirmingId(awaitingConfirm[0]._id)}>View</Button>
        </div>
      )}
      {/* Modal for confirming/rejecting prescription order */}
      {confirmingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setConfirmingId(null)}>
          <div className="bg-white rounded shadow-lg max-w-lg w-full p-6 relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-black" onClick={() => setConfirmingId(null)}>&times;</button>
            {awaitingConfirm.filter((p) => p._id === confirmingId).map((pres) => (
              <div key={pres._id}>
                <div className="font-semibold text-lg mb-2">Prescription Order Confirmation</div>
                <div className="mb-2 text-xs text-muted-foreground">Prescription #{pres._id.slice(-6)}</div>
                {pres.fileUrl && (
                  <img src={pres.fileUrl} alt="Prescription" className="max-h-40 border rounded mb-2" />
                )}
                <div className="mb-2">
                  <div className="font-medium text-xs mb-1">Medicines in Order:</div>
                  {Array.isArray(pres.extractedMedicines) && pres.extractedMedicines.length > 0 ? (
                    <ul className="text-xs mb-2">
                      {pres.extractedMedicines.map((med) => (
                        <li key={med.medicine} className="flex gap-2 items-center">
                          <span className="font-semibold">{med.name}</span>
                          <span>x {med.qty}</span>
                          <span>EGP {med.price} each</span>
                          <span className="font-bold">= EGP {med.qty * med.price}</span>
                        </li>
                      ))}
                    </ul>
                  ) : <span className="text-xs text-muted-foreground">No medicines listed.</span>}
                  <div className="font-semibold mt-2">Total: EGP {pres.extractedMedicines?.reduce((sum, m) => sum + (m.qty * m.price), 0) || 0}</div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setConfirmingId(null)}>Cancel</Button>
                  <Button
                    variant="destructive"
                    disabled={confirmingLoading}
                    onClick={async () => {
                      setConfirmingLoading(true);
                      await prescriptionApi.confirmPrescription(pres._id, false);
                      setNotification('Order rejected.');
                      setConfirmingId(null);
                      setConfirmingLoading(false);
                      window.location.reload();
                    }}
                  >Reject</Button>
                  <Button
                    disabled={confirmingLoading}
                    onClick={async () => {
                      setConfirmingLoading(true);
                      await prescriptionApi.confirmPrescription(pres._id, true);
                      setNotification('Order confirmed!');
                      setConfirmingId(null);
                      setConfirmingLoading(false);
                      window.location.reload();
                    }}
                  >Confirm</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {notification && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-800 px-4 py-2 rounded shadow z-50">
          {notification}
          <button className="ml-2 text-green-800 font-bold" onClick={() => setNotification(null)}>&times;</button>
        </div>
      )}
        {/* Welcome Header */}
        <div className="mb-8 p-6 bg-gradient-primary rounded-2xl text-white shadow-hero">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
              <p className="text-white/80 text-lg">Your health journey continues here</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Heart className="h-8 w-8 text-white/80" />
              <Pill className="h-8 w-8 text-white/80" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-0 shadow-card bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Prescriptions</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{prescriptions?.length || 0}</div>
              <p className="text-xs text-success mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                {approvedPrescriptions} approved
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <div className="p-2 bg-secondary/10 rounded-lg">
                <ShoppingCart className="h-4 w-4 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{orders?.length || 0}</div>
              <p className="text-xs text-success mt-1">
                <Package className="h-3 w-3 inline mr-1" />
                {deliveredOrders} delivered
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
              <div className="p-2 bg-warning/10 rounded-lg">
                <Activity className="h-4 w-4 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">EGP {totalSpent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Lifetime spending</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card bg-gradient-secondary text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button asChild size="sm" className="w-full bg-white/20 hover:bg-white/30 text-white border-white/20">
                  <Link to="/order-medicines">
                    <Pill className="h-4 w-4 mr-2" />
                    Order Medicine
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full border-white/20 text-white hover:bg-white/10">
                  <Link to="#find-doctor">
                    <Plus className="h-4 w-4 mr-2" />
                    Find Doctor
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="w-full border-white/20 text-white hover:bg-white/10">
                  <Link to="#track-order">
                    <Package className="h-4 w-4 mr-2" />
                    Track Order
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-0 shadow-card bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Recent Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPrescriptions ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : recentPrescriptions.length > 0 ? (
                <div className="space-y-3">
                  {recentPrescriptions.map((prescription: any) => (
                    <div key={prescription.id} className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(prescription.status)}
                        <div>
                          <p className="font-medium text-foreground">Prescription #{prescription.id?.slice(-6)}</p>
                          <p className="text-sm text-muted-foreground">
                            {prescription.doctor ? `Dr. ${prescription.doctor}` : 'Uploaded'}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${getStatusBadge(prescription.status)} border`}>
                        {prescription.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No prescriptions yet</p>
                  <Button asChild variant="outline" className="mt-4">
                    <Link to="/upload-prescription">Upload Your First Prescription</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-secondary" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingOrders ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(order.status)}
                        <div>
                          <p className="font-medium text-foreground">Order #{order.id?.slice(-6)}</p>
                          <p className="text-sm text-muted-foreground">EGP {order.total || 0}</p>
                        </div>
                      </div>
                      <Badge className={`${getStatusBadge(order.status)} border`}>
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No orders yet</p>
                  <Button asChild variant="outline" className="mt-4">
                    <Link to="/order-medicines">Start Shopping</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}