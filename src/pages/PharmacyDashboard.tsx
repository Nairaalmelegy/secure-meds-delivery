import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Search, Package, ShoppingCart, DollarSign, TrendingUp, Users, FileText, Plus, Edit, Trash2, CheckCircle, Clock, Activity } from 'lucide-react';
import { medicineApi, orderApi } from '@/lib/api';

export default function PharmacyDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const { data: medicines, isLoading: loadingMedicines } = useQuery({
    queryKey: ['medicines'],
    queryFn: medicineApi.getAll,
  });

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: orderApi.getMyOrders, // This should be pharmacy orders
  });

  const pendingOrders = orders?.filter((order: any) => order.status === 'pending') || [];
  const processingOrders = orders?.filter((order: any) => order.status === 'processing') || [];
  const totalRevenue = orders?.reduce((sum: number, order: any) => sum + (order.total || 0), 0) || 0;
  const lowStockMedicines = medicines?.filter((med: any) => med.stock && med.stock < 10) || [];

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await orderApi.updateStatus(orderId, status);
      toast({
        title: "Order updated",
        description: `Order status changed to ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto p-6">
        {/* Pharmacy Header */}
        <div className="mb-8 p-6 bg-gradient-primary rounded-2xl text-white shadow-hero">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Package className="h-8 w-8" />
                Pharmacy Admin Panel
              </h1>
              <p className="text-white/80 text-lg">Manage medicines, orders, and pharmacy operations</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <ShoppingCart className="h-8 w-8 text-white/80" />
              <DollarSign className="h-8 w-8 text-white/80" />
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-0 shadow-card bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Medicines</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{medicines?.length || 0}</div>
              <p className="text-xs text-warning mt-1">
                {lowStockMedicines.length} low stock
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
              <div className="p-2 bg-warning/10 rounded-lg">
                <Clock className="h-4 w-4 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{pendingOrders.length}</div>
              <p className="text-xs text-warning mt-1">Requires processing</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <div className="p-2 bg-success/10 rounded-lg">
                <DollarSign className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">EGP {totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-success mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                All time
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card bg-gradient-secondary text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Order Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{processingOrders.length}</div>
              <Progress value={orders?.length > 0 ? (processingOrders.length / orders.length) * 100 : 0} className="mt-2 bg-white/20" />
              <p className="text-xs text-white/80 mt-1">Active orders</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Medicine Management */}
          <Card className="border-0 shadow-card bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Medicine Inventory
                </CardTitle>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medicine
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search medicines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {loadingMedicines ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : medicines && medicines.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {medicines
                      .filter((medicine: any) => 
                        !searchQuery || 
                        medicine.name?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((medicine: any) => (
                        <div key={medicine.id} className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{medicine.name}</p>
                              <p className="text-sm text-muted-foreground">EGP {medicine.price}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  className={`text-xs ${
                                    medicine.stock > 10 
                                      ? 'bg-success/10 text-success border-success/20' 
                                      : 'bg-warning/10 text-warning border-warning/20'
                                  }`}
                                >
                                  Stock: {medicine.stock || 0}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No medicines found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Management */}
          <Card className="border-0 shadow-card bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-secondary" />
                Order Management
                {pendingOrders.length > 0 && (
                  <Badge className="bg-warning/10 text-warning border-warning/20">
                    {pendingOrders.length} pending
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingOrders ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : orders && orders.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {orders
                    .filter((order: any) => order.status === 'pending' || order.status === 'processing')
                    .map((order: any) => (
                      <div key={order.id} className="p-4 border border-border/50 rounded-xl bg-warning/5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                              <ShoppingCart className="h-5 w-5 text-warning" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Order #{order.id?.slice(-6)}</p>
                              <p className="text-sm text-muted-foreground">
                                Total: EGP {order.total || 0}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Date: {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge className={`${
                            order.status === 'pending' 
                              ? 'bg-warning/10 text-warning border-warning/20'
                              : 'bg-info/10 text-info border-info/20'
                          }`}>
                            {order.status}
                          </Badge>
                        </div>
                        {order.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                              className="bg-primary hover:bg-primary/90"
                            >
                              <Activity className="h-4 w-4 mr-1" />
                              Accept Order
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                            >
                              Mark as Shipped
                            </Button>
                          </div>
                        )}
                        {order.status === 'processing' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                            className="bg-success hover:bg-success/90"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark as Shipped
                          </Button>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-success mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No pending orders</p>
                  <p className="text-sm text-muted-foreground mt-1">All orders are up to date!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}