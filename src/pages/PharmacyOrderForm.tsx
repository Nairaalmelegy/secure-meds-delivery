
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { medicineApi, orderApi, userApi } from '../lib/api';

// Set your main pharmacy ID here
const MAIN_PHARMACY_ID = 'F82qwa123sd';
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
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pharmacyId, setPharmacyId] = useState(MAIN_PHARMACY_ID);
  const { data: medicines, isLoading } = useQuery({
    queryKey: ['medicines'],
    queryFn: medicineApi.getAll,
  });
  // Fetch pharmacies
  const { data: pharmacies, isLoading: loadingPharmacies } = useQuery({
    queryKey: ['pharmacies'],
    queryFn: async () => {
      const res = await userApi.search('', 'pharmacy');
      return res.users;
    },
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
      if (!deliveryAddress.trim()) throw new Error('Delivery address is required');
  if (!pharmacyId) throw new Error('Pharmacy selection is required');
      await orderApi.create({
        items,
        prescriptionId: prescription._id,
        deliveryAddress,
  pharmacyId,
        paymentMethod: 'cash',
        patientId: typeof prescription.patient === 'object' ? prescription.patient._id : prescription.patient,
      });
      toast({ title: 'Order sent for confirmation!' });
      setSelected({});
      setDeliveryAddress('');
      setPharmacyId('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 border-t pt-2 space-y-3">
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
      <div>
        <label className="block text-xs font-medium mb-1">Delivery Address<span className="text-red-500">*</span></label>
        <Input
          type="text"
          value={deliveryAddress}
          onChange={e => setDeliveryAddress(e.target.value)}
          placeholder="Enter delivery address"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Select Pharmacy<span className="text-red-500">*</span></label>
        {loadingPharmacies ? (
          <div>Loading pharmacies...</div>
        ) : pharmacies && pharmacies.length > 0 ? (
          <select
            className="border rounded px-2 py-1 text-xs w-full"
            value={pharmacyId}
            onChange={e => setPharmacyId(e.target.value)}
            required
          >
            <option value="">Select pharmacy</option>
            {pharmacies.map((ph: any) => (
              <option key={ph._id} value={ph._id}>{ph.name || ph.email}</option>
            ))}
          </select>
        ) : (
          <div>No pharmacies available.</div>
        )}
      </div>
      <Button type="submit" className="mt-3" disabled={loading}>{loading ? 'Sending...' : 'Send Order for Confirmation'}</Button>
    </form>
  );
}