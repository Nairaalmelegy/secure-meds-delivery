import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Truck, CheckCircle, Clock, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { orderApi, apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

type OrderItem = {
  medicine: { name: string } | string;
  qty: number;
  price?: number;
};

type Order = {
  _id: string;
  status: string;
  createdAt: string;
  total: number;
  deliveryAddress?: string;
  items?: OrderItem[];
};

export default function Orders() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: orderApi.getMyOrders,
  });
  const pendingCount = orders?.filter(o => o.status === 'pending').length || 0;
  // Patient cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      // Call the patient cancel endpoint
      return apiClient.put(`/api/orders/${id}/cancel`, { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: 'Order cancelled',
        description: 'Your order has been cancelled.',
      });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to cancel order', variant: 'destructive' });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="">
        <div className="text-center py-8">Loading orders...</div>
      </div>
    );
  }

  return (
      <div className="">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
          {pendingCount > 0 && (
            <Badge className="bg-yellow-400 text-black flex items-center gap-1"><Bell className="h-4 w-4" /> {pendingCount}</Badge>
          )}
        </div>
        <Button asChild>
          <Link to="/order-medicines">Order New Medicines</Link>
        </Button>
      </div>

      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order: Order) => (
            <Card key={order._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Order #{order._id.slice(-6)}</CardTitle>
                  <Badge className={getStatusColor(order.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <h4 className="font-medium mb-2">Order Details</h4>
                    <p className="text-sm text-muted-foreground">
                      Date: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    {order.items?.map((item: OrderItem, index: number) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        {typeof item.medicine === 'object' ? item.medicine.name : item.medicine} × {item.qty}
                      </p>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Delivery Address</h4>
                    <p className="text-sm text-muted-foreground">
                      {order.deliveryAddress || 'No address provided'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Items</h4>
                    {order.items?.map((item: OrderItem, index: number) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        {typeof item.medicine === 'object' ? item.medicine.name : item.medicine} × {item.qty}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Confirm Order section for pending orders */}
                {/* Allow patient to cancel order if status is processing or pending */}
                {(order.status === 'processing' || order.status === 'pending') && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-yellow-700">You can cancel this order if needed.</div>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={cancelOrderMutation.isPending}
                        onClick={() => cancelOrderMutation.mutate(order._id)}
                      >Cancel Order</Button>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-4">You haven't placed any orders yet</p>
              <Button asChild>
                <Link to="/order-medicines">Start Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
  );
}