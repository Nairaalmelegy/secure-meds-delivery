import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, ShoppingCart, Minus } from 'lucide-react';
import { medicineApi } from '@/lib/api';
import { Link } from 'react-router-dom';

export default function OrderMedicines() {
  const [searchQuery, setSearchQuery] = useState('');
  const { items, addItem, updateQuantity, total } = useCart();
  const { toast } = useToast();

  const { data: medicines, isLoading } = useQuery({
    queryKey: ['medicines', searchQuery],
    queryFn: () => searchQuery ? medicineApi.search(searchQuery) : medicineApi.getAll(),
  });

  const handleAddToCart = (medicine: any) => {
    addItem({
      id: medicine._id,
      name: medicine.name,
      price: medicine.price,
    });
    toast({
      title: "Added to cart",
      description: `${medicine.name} has been added to your cart`,
    });
  };

  const getCartQuantity = (medicineId: string) => {
    return items.find(item => item.id === medicineId)?.quantity || 0;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Order Medicines</h1>
          <p className="text-muted-foreground">Search and add medicines to your cart</p>
        </div>
        
        {items.length > 0 && (
          <Button asChild>
            <Link to="/checkout" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Cart ({items.length}) - EGP {total}
            </Link>
          </Button>
        )}
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search medicines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading medicines...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {medicines?.map((medicine: any) => {
            const cartQuantity = getCartQuantity(medicine._id);
            return (
              <Card key={medicine._id} className="h-80 flex flex-col">
                <CardHeader className="flex-1">
                  <CardTitle className="text-lg">{medicine.name}</CardTitle>
                  {medicine.description && (
                    <p className="text-sm text-muted-foreground line-clamp-6 overflow-hidden">{medicine.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-primary">
                      EGP {medicine.price}
                    </div>
                    {medicine.stock && (
                      <Badge variant={medicine.stock > 10 ? "default" : "destructive"}>
                        Stock: {medicine.stock}
                      </Badge>
                    )}
                  </div>

                  {cartQuantity > 0 ? (
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(medicine._id, cartQuantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="mx-3 font-medium">{cartQuantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(medicine._id, cartQuantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => handleAddToCart(medicine)}
                      className="w-full"
                      disabled={medicine.stock === 0}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}