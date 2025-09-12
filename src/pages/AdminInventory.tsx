import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function InventoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: '', brand: '', sku: '', description: '', price: '', stock: '', category: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://medilinkback-production.up.railway.app/api/medicines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          stock: parseInt(form.stock, 10),
        }),
      });
      if (!res.ok) throw new Error('Failed to add medicine');
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
      {/* TODO: Add inventory table here */}
    </div>
  );
}
