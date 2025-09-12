import React, { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Commission {
  _id: string;
  doctor: { _id: string; name: string; email: string };
  order: string;
  amount: number;
  status: string;
  requestedAt: string;
  paidAt?: string;
}

export default function AdminCommissions() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);

  const fetchCommissions = async () => {
    setLoading(true);
    const data = await apiClient.get<Commission[]>('/api/commissions');
    setCommissions(data);
    setLoading(false);
  };

  useEffect(() => { fetchCommissions(); }, []);

  const handlePay = async (id: string) => {
    setPaying(id);
    await apiClient.put(`/api/commissions/${id}/pay`);
    await fetchCommissions();
    setPaying(null);
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all paid commissions?')) return;
    await apiClient.post('/api/commissions/reset');
    await fetchCommissions();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Doctor Commissions</CardTitle>
        <Button variant="destructive" onClick={handleReset} className="ml-4">Reset All Paid</Button>
      </CardHeader>
      <CardContent>
        {loading ? <div>Loading...</div> : (
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Email</th>
                <th>Order</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Requested</th>
                <th>Paid</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map(c => (
                <tr key={c._id} className={c.status === 'paid' ? 'text-green-600' : ''}>
                  <td>{c.doctor?.name}</td>
                  <td>{c.doctor?.email}</td>
                  <td>{c.order}</td>
                  <td>{c.amount.toFixed(2)}</td>
                  <td>{c.status}</td>
                  <td>{new Date(c.requestedAt).toLocaleDateString()}</td>
                  <td>{c.paidAt ? new Date(c.paidAt).toLocaleDateString() : '-'}</td>
                  <td>
                    {c.status !== 'paid' && (
                      <Button size="sm" onClick={() => handlePay(c._id)} disabled={paying === c._id}>
                        {paying === c._id ? 'Paying...' : 'Pay' }
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
