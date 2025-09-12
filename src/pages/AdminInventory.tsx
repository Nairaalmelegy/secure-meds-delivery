import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
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
  const { data: medicines, isLoading } = useQuery({
    queryKey: ['medicines'],
    queryFn: fetchMedicines,
  });

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
      <Card className="max-w-xl mx-auto mb-8">
        <CardHeader>
          <CardTitle>Add New Medicine</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
            <Input name="brand" placeholder="Brand" value={form.brand} onChange={handleChange} />
            <Input name="sku" placeholder="SKU" value={form.sku} onChange={handleChange} />
            <Input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
            <Input name="price" placeholder="Price" type="number" min="0" value={form.price} onChange={handleChange} required />
            <Input name="stock" placeholder="Stock" type="number" min="0" value={form.stock} onChange={handleChange} required />
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="w-full border rounded p-2" />
            <Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Medicine'}</Button>
          </form>
        </CardContent>
      </Card>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
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
                    <td>{med.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div>No medicines in inventory.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
