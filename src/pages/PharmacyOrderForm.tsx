
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { medicineApi, orderApi, userApi } from '../lib/api';

// Set your main pharmacy ID here
const MAIN_PHARMACY_ID = 'F82qwa123sd';
// Types
export interface Medicine {
  _id: string;
  name: string;
  stock: number;
}

export interface Prescription {
  _id: string;
  patient: { _id: string; name: string } | string;
  medicines?: Array<{ name: string; qty: number }>;
  fileUrl?: string;
  ocrText?: string;
  // Add any additional known fields here as needed
}

export interface Pharmacy {
  _id: string;
  name: string;
}
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface PharmacyOrderFormProps {
  prescription: Prescription;
}

export function PharmacyOrderForm({ prescription }: PharmacyOrderFormProps) {
  const { toast } = useToast();
  // selectedMedicines: { id, name, stock, qty }
  const [selectedMedicines, setSelectedMedicines] = useState<Array<Medicine & { qty: number }>>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pharmacyId, setPharmacyId] = useState(MAIN_PHARMACY_ID);
  const { data: medicines, isLoading } = useQuery<Medicine[]>({
    queryKey: ['medicines'],
    queryFn: medicineApi.getAll,
  });

  // Filtered medicines for search/autocomplete
  const filteredMedicines = useMemo(() => {
    if (!search.trim()) return [];
    if (!medicines) return [];
    return medicines.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) && !selectedMedicines.some(sel => sel._id === m._id));
  }, [search, medicines, selectedMedicines]);
  // Fetch pharmacies
  const { data: pharmacies, isLoading: loadingPharmacies } = useQuery({
    queryKey: ['pharmacies'],
    queryFn: async () => {
      const res = await userApi.search('', 'pharmacy');
      return res.users;
    },
  });

  const handleQtyChange = (id: string, qty: number) => {
    setSelectedMedicines(prev => prev.map(m => m._id === id ? { ...m, qty } : m));
  };

  const handleAddMedicine = (med: Medicine) => {
    // Uniqueness check: only add if not already present
    setSelectedMedicines(prev => {
      if (prev.some(m => m._id === med._id)) {
        console.log('Medicine already selected:', med._id);
        return prev;
      }
      const updated = [...prev, { ...med, qty: 1 }];
      console.log('Selected medicines:', updated);
      return updated;
    });
    setSearch('');
  };

  const handleRemoveMedicine = (id: string) => {
    setSelectedMedicines(prev => prev.filter(m => m._id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const items = selectedMedicines
        .filter(m => m.qty > 0)
        .map(m => ({ medicine: m._id, qty: m.qty }));
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
      setSelectedMedicines([]);
      setDeliveryAddress('');
      setPharmacyId('');
    } catch (err: any) {
      const errorMsg = (err as Error).message || 'Failed to send order';
      toast({ title: errorMsg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 border-t pt-2 space-y-3">
      <div className="font-medium mb-2">Select Medicines:</div>
      {/* Search/autocomplete UI */}
      <div className="mb-2">
        <Input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search medicines..."
          className="w-full"
        />
        {search && filteredMedicines.length > 0 && (
          <div className="border rounded bg-white shadow z-10 mt-1 max-h-40 overflow-y-auto absolute">
            {filteredMedicines.map((med) => (
              <div
                key={med._id}
                className="px-3 py-2 hover:bg-primary/10 cursor-pointer flex items-center justify-between"
                onClick={e => { e.stopPropagation(); handleAddMedicine(med); }}
              >
                <span>{med.name}</span>
                <span className="text-xs text-muted-foreground ml-2">Stock: {med.stock}</span>
                <span className="text-xs text-gray-400 ml-2">ID: {med._id}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Selected medicines with quantity controls */}
      {selectedMedicines.length > 0 && (
        <div className="space-y-2 mt-2">
          {selectedMedicines.map(med => (
            <div key={med._id} className="flex items-center gap-2">
              <span className="w-32 truncate">{med.name}</span>
              <Input
                type="number"
                min={1}
                max={med.stock}
                value={med.qty}
                onChange={e => handleQtyChange(med._id, Math.max(1, Math.min(Number(e.target.value), med.stock)))}
                className="w-20"
                placeholder="Qty"
              />
              <span className="text-xs text-muted-foreground">Stock: {med.stock}</span>
              <Button type="button" size="sm" variant="destructive" onClick={() => handleRemoveMedicine(med._id)}>Remove</Button>
            </div>
          ))}
        </div>
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