import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { orderApi } from '@/lib/api';
import { CreditCard, MapPin, Package } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function Checkout() {
  const { items, total, clearCart, addItem } = useCart();
  const location = useLocation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Prefill cart with extractedMedicines from navigation state if present
  useEffect(() => {
    const state = location.state as { extractedMedicines?: any[] } | undefined;
    if (state && state.extractedMedicines && state.extractedMedicines.length > 0 && items.length === 0) {
      state.extractedMedicines.forEach(med => {
        addItem({
          id: med.medicine,
          name: med.name,
          price: med.price,
        });
        // Set correct quantity
        for (let i = 1; i < med.qty; i++) {
          addItem({
            id: med.medicine,
            name: med.name,
            price: med.price,
          });
        }
      });
    }
    // eslint-disable-next-line
  }, []);

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      toast({
        title: "Address required",
        description: "Please enter your delivery address",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some medicines to your cart first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get prescriptionId and pharmacyId from navigation state if present
      const state = location.state as { prescriptionId?: string, pharmacyId?: string } | undefined;
      const prescriptionId = state?.prescriptionId;
      // Use a default pharmacyId (replace with your actual default pharmacy ObjectId)
      const pharmacyId = state?.pharmacyId || "652c1e0f8b3c2a0012345678";
      const orderData: any = {
        items: items.map(item => ({
          medicine: item.id,
          qty: item.quantity,
        })),
        deliveryAddress: address,
        pharmacyId,
        paymentMethod: "cod",
        phone,
        notes,
      };
      // Only include prescriptionId if present
      if (prescriptionId) {
        orderData.prescriptionId = prescriptionId;
      }
      await orderApi.create(orderData);
      toast({
        title: "Order placed successfully",
        description: "Your order has been placed and will be processed soon",
      });
      clearCart();
      navigate('/orders');
    } catch (error) {
      toast({
        title: "Order failed",
        description: "Failed to place your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-4">Add some medicines to proceed with checkout</p>
              <Button onClick={() => navigate('/order-medicines')}>
                Start Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
        <p className="text-muted-foreground">Review your order and complete the purchase</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Delivery Address *</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your full delivery address..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <Label htmlFor="notes">Order Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions for delivery..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input type="radio" id="cod" name="payment" value="cod" defaultChecked />
                  <Label htmlFor="cod">Cash on Delivery</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="radio" id="card" name="payment" value="card" disabled />
                  <Label htmlFor="card" className="text-muted-foreground">
                    Credit Card (Coming Soon)
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      EGP {item.price} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    EGP {item.price * item.quantity}
                  </p>
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>EGP {total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>EGP 30</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>EGP {total + 30}</span>
                </div>
              </div>

              <Button 
                onClick={handlePlaceOrder} 
                disabled={loading || !address.trim()}
                className="w-full"
                size="lg"
              >
                {loading ? 'Placing Order...' : `Place Order - EGP ${total + 30}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}