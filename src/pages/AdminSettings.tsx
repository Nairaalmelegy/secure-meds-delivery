
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LottieLoader from '@/components/LottieLoader';
import { Input } from '@/components/ui/input';

import { useToast } from '@/hooks/use-toast';
import { apiClient } from '../lib/api';

export default function AdminSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.put('/api/users/me', { name, ...(password ? { password } : {}) });
      toast({ title: 'Profile updated!' });
      setPassword('');
    } catch (err: unknown) {
      let message = 'An error occurred';
      if (err instanceof Error) message = err.message;
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Admin Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Display Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block mb-1 font-medium">New Password</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep current password" minLength={6} />
            </div>
            <Button type="submit" disabled={loading} className="flex items-center gap-2">
              {loading && <LottieLoader height={20} width={20} />}
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
