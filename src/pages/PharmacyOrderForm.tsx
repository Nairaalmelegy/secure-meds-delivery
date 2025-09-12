import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { medicineApi, orderApi } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface PharmacyOrderFormProps {
  prescription: any;
}

export function PharmacyOrderForm({ prescription }: PharmacyOrderFormProps) {
  const { toast } = useToast();
  const [selected, setSelected] = useState<{ [id: string]: number }>({});
  const [loading, setLoading] = useState(false);
  const { data: medicines, isLoading } = useQuery({
    queryKey: ['medicines'],
    queryFn: medicineApi.getAll,
  });

  const handleQtyChange = (id: string, qty: number) => {
    setSelected((prev) => ({ ...prev, [id]: qty }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const items = Object.entries(selected)
        .filter(([_, qty]) => qty > 0)
        .map(([medicine, qty]) => ({ medicine, qty }));
      if (items.length === 0) throw new Error('Select at least one medicine');
      await orderApi.create({
        items,
        prescriptionId: prescription._id,
        deliveryAddress: '', // Optionally prompt for address
        pharmacyId: '', // Optionally set pharmacyId
        paymentMethod: 'cash', // Or prompt for method
      });
      toast({ title: 'Order sent for confirmation!' });
      setSelected({});
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 border-t pt-2">
      <div className="font-medium mb-2">Select Medicines:</div>
      {isLoading ? (
        <div>Loading medicines...</div>
      ) : medicines && medicines.length > 0 ? (
        <div className="space-y-2">
          {medicines.map((med: any) => (
            <div key={med._id} className="flex items-center gap-2">
              <span className="w-32 truncate">{med.name}</span>
              <Input
                type="number"
                min={0}
                max={med.stock}
                value={selected[med._id] || ''}
                onChange={e => handleQtyChange(med._id, Number(e.target.value))}
                className="w-20"
                placeholder="Qty"
              />
              <span className="text-xs text-muted-foreground">Stock: {med.stock}</span>
            </div>
          ))}
        </div>
      ) : (
        <div>No medicines available.</div>
      )}
      <Button type="submit" className="mt-3" disabled={loading}>{loading ? 'Sending...' : 'Send Order for Confirmation'}</Button>
    </form>
  );
}