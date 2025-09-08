import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, FileText, ShoppingCart, Activity, Clock, CheckCircle, Package, TrendingUp, Heart, Pill } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { prescriptionApi, orderApi } from '@/lib/api';

export default function Dashboard() {
  const { user } = useAuth();

  const { data: prescriptions, isLoading: loadingPrescriptions } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: prescriptionApi.getMyPrescriptions,
  });

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: orderApi.getMyOrders,
  });

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
                  <Link to="/upload-prescription">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Prescription
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full border-white/20 text-white hover:bg-white/10">
                  <Link to="/order-medicines">
                    <Pill className="h-4 w-4 mr-2" />
                    Order Medicines
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