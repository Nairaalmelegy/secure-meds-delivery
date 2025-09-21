import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import LottieLoader from '@/components/LottieLoader';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

async function fetchMedicines() {
  return await apiClient.get<any[]>('/api/medicines');
}

export default function InventoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: '', brand: '', sku: '', description: '', price: '', stock: '', category: ''
  });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: medicines, isLoading } = useQuery({
    queryKey: ['medicines'],
    queryFn: fetchMedicines,
  });

  // Editable stock state
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingStockValue, setEditingStockValue] = useState<string>('');
  const [savingStock, setSavingStock] = useState(false);

  const handleEditStock = (id: string, currentStock: number) => {
    setEditingStockId(id);
    setEditingStockValue(String(currentStock));
  };

  const handleSaveStock = async (id: string) => {
    setSavingStock(true);
    try {
      await apiClient.put(`/api/medicines/${id}`, { stock: parseInt(editingStockValue, 10) });
      toast({ title: 'Stock updated!' });
      setEditingStockId(null);
      setEditingStockValue('');
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
    } catch (err: unknown) {
      let message = 'An error occurred';
      if (err instanceof Error) message = err.message;
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSavingStock(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/api/medicines', {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
      });
      toast({ title: 'Medicine added!' });
      setForm({ name: '', brand: '', sku: '', description: '', price: '', stock: '', category: '' });
    } catch (err: unknown) {
      let message = 'An error occurred';
      if (err instanceof Error) {
        message = err.message;
      }
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <Card className="mt-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Inventory</CardTitle>
            <DialogTrigger asChild>
              <Button onClick={() => setModalOpen(true)} className="ml-auto">+ Add Medicine</Button>
            </DialogTrigger>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-4"><LottieLoader height={32} width={32} /></div>
            ) : medicines && medicines.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left">Name</th>
                    <th>Brand</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((med:any) => (
                    <tr key={med._id} className="border-b">
                      <td>{med.name}</td>
                      <td>{med.brand}</td>
                      <td>{med.sku}</td>
                      <td>{med.category}</td>
                      <td>{med.price}</td>
                      <td>
                        {editingStockId === med._id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              value={editingStockValue}
                              onChange={e => setEditingStockValue(e.target.value)}
                              className="w-20"
                              disabled={savingStock}
                            />
                            <Button size="sm" onClick={() => handleSaveStock(med._id)} disabled={savingStock} className="px-2">Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingStockId(null)} disabled={savingStock} className="px-2">Cancel</Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>{med.stock}</span>
                            <Button size="sm" variant="outline" onClick={() => handleEditStock(med._id, med.stock)} className="px-2">Edit</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div>No medicines in inventory.</div>
            )}
          </CardContent>
        </Card>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Medicine</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
            <Input name="brand" placeholder="Brand" value={form.brand} onChange={handleChange} />
            <Input name="sku" placeholder="SKU" value={form.sku} onChange={handleChange} />
            <Input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
            <Input name="price" placeholder="Price" type="number" min="0" value={form.price} onChange={handleChange} required />
            <Input name="stock" placeholder="Stock" type="number" min="0" value={form.stock} onChange={handleChange} required />
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="w-full border rounded p-2" />
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={loading} className="flex items-center gap-2">
                {loading && <LottieLoader height={20} width={20} />}
                {loading ? 'Adding...' : 'Add Medicine'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
