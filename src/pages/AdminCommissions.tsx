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
  const [commissionRate, setCommissionRate] = useState<number>(5);
  const [savingRate, setSavingRate] = useState(false);

  // Fetch commission rate from backend (optional, fallback to 5%)
  const fetchCommissionRate = async () => {
    try {
      const res = await apiClient.get<{ rate: number }>('/api/commissions/rate');
      setCommissionRate(res.rate);
    } catch {
      setCommissionRate(5);
    }
  };

  const saveCommissionRate = async () => {
    setSavingRate(true);
    await apiClient.put('/api/commissions/rate', { rate: commissionRate });
    setSavingRate(false);
  };

  const fetchCommissions = async () => {
    setLoading(true);
    const data = await apiClient.get<Commission[]>('/api/commissions');
    setCommissions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCommissionRate();
    fetchCommissions();
  }, []);

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
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Commission Percentage Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <span>Current Rate:</span>
            <input
              type="number"
              min={0}
              max={100}
              value={commissionRate}
              onChange={e => setCommissionRate(Number(e.target.value))}
              className="border rounded px-2 py-1 w-20 text-center"
              disabled={savingRate}
            />
            <span>%</span>
            <Button size="sm" onClick={saveCommissionRate} disabled={savingRate}>
              {savingRate ? 'Saving...' : 'Save Rate'}
            </Button>
          </div>
        </CardContent>
      </Card>
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
    </>
  );
}
