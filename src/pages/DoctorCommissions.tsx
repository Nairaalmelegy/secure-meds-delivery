import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import DocumentImage from '@/components/DocumentImage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Commission {
  _id: string;
  amount: number;
  status: string;
  requestedAt: string;
  paidAt?: string;
  details?: string;
  order?: unknown;
}

export default function DoctorCommissions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);
  const [selected, setSelected] = useState<Commission | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestAmount, setRequestAmount] = useState<string>('');
  const [requestDetails, setRequestDetails] = useState('');

  const { data, isLoading } = useQuery<{
    commissions: Commission[];
    total: number;
    page: number;
    totalPages: number;
  }, Error>({
    queryKey: ['doctor-commissions', page, perPage],
    queryFn: async () => {
      const res = await apiClient.get<{
        commissions: Commission[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/api/commissions/mine?page=${page}&limit=${perPage}`);
      return res;
    },
  });

  const paged = (data as { commissions: Commission[]; total: number; page: number; totalPages: number } | undefined) ?? { commissions: [], total: 0, page: 1, totalPages: 1 };
  const commissions = paged.commissions ?? [];
  const total = paged.total ?? 0;
  const totalPages = paged.totalPages ?? 1;
  const { toast } = useToast();

  return (
    <DashboardLayout title="Commissions" subtitle="Your recent commission requests and status">
      <div>
        {isLoading ? <div>Loading...</div> : (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <label className="text-sm mr-2">Per page:</label>
                <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="border rounded px-2 py-1">
                  <option value={5}>5</option>
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                </select>
              </div>
              <div>
                <Button size="sm" onClick={() => setShowRequestForm(s => !s)}>{showRequestForm ? 'Cancel' : 'Request Payout'}</Button>
              </div>
            </div>

            {showRequestForm && (
              <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Request Payout</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm mb-1">Amount (EGP)</label>
                      <input type="number" placeholder="Amount" value={requestAmount} onChange={e => setRequestAmount(e.target.value)} className="border rounded px-2 py-1 w-full" />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Details</label>
                      <input placeholder="Details" value={requestDetails} onChange={e => setRequestDetails(e.target.value)} className="border rounded px-2 py-1 w-full" />
                    </div>
                  </div>
                  <DialogFooter>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowRequestForm(false)}>Cancel</Button>
                      <Button onClick={async () => {
                        const amt = Number(requestAmount || 0);
                        if (!amt || amt <= 0) {
                          toast({ title: 'Invalid amount', description: 'Enter a valid amount', variant: 'destructive' });
                          return;
                        }
                        try {
                          await apiClient.post('/api/commissions/request', { amount: amt, details: requestDetails });
                          setShowRequestForm(false);
                          setRequestAmount('');
                          setRequestDetails('');
                          queryClient.invalidateQueries({ queryKey: ['doctor-commissions'] });
                          toast({ title: 'Requested', description: 'Payout request sent', variant: 'default' });
                        } catch (err: unknown) {
                          const message = err instanceof Error ? err.message : String(err || 'Failed to request payout');
                          toast({ title: 'Error', description: message, variant: 'destructive' });
                        }
                      }}>Send</Button>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            <div className="space-y-3">
              {commissions.map((c: Commission) => (
                <div key={c._id} className="border rounded p-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">Request #{c._id.slice(-6)}</div>
                    <div className="text-sm text-muted-foreground">{c.details || ''}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">EGP {c.amount.toFixed(2)}</div>
                    <div className="text-sm">{c.status}</div>
                    <div className="text-xs">Requested: {new Date(c.requestedAt).toLocaleDateString()}</div>
                    <div className="text-xs">Paid: {c.paidAt ? new Date(c.paidAt).toLocaleDateString() : '-'}</div>
                    <div className="mt-2 flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setSelected(c)}>View Details</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm">Showing page {page} of {totalPages} — {total} total</div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                <Button size="sm" onClick={() => setPage(p => (p < totalPages ? p + 1 : p))} disabled={page >= totalPages}>Next</Button>
              </div>
            </div>
          </div>
        )}
        {selected && (
          <div className="mt-6 border rounded p-4 bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">Commission Details</h3>
            <div><strong>Amount:</strong> EGP {selected.amount.toFixed(2)}</div>
            <div><strong>Status:</strong> {selected.status}</div>
            <div><strong>Requested:</strong> {new Date(selected.requestedAt).toLocaleString()}</div>
            <div className="mt-2"><strong>Details:</strong> {selected.details || '-'}</div>
            {selected.order && (
              <div className="mt-4">
                <h4 className="font-medium">Order</h4>
                {(() => {
                  const ord = selected.order as Record<string, unknown> | undefined;
                  if (!ord) return <div>-</div>;
                  const orderId = String(ord._id ?? ord['id'] ?? ord['order'] ?? '-');
                  const status = String(ord.status ?? '-');
                  const total = Number(ord.total ?? ord.totalAmount ?? 0);
                  return (
                    <div>
                      <div>Order ID: {orderId}</div>
                      <div>Status: {status}</div>
                      <div>Total: EGP {total.toFixed(2)}</div>
                      {Array.isArray(ord.items) && (
                        <div className="mt-2 space-y-2">
                          {(ord.items as unknown[]).map((it, idx) => {
                            const item = it as Record<string, unknown>;
                            const med = item.medicine as Record<string, unknown> | undefined;
                            const name = med && typeof med.name === 'string' ? med.name : String(item.name ?? item.medicine ?? 'Item');
                            const qty = Number(item.quantity ?? item.qty ?? 0) || 0;
                            const price = Number(item.price ?? 0) || 0;
                            return (
                              <div key={idx} className="flex items-center gap-3">
                                <div className="flex-1">{name}</div>
                                <div>Qty: {qty}</div>
                                <div>EGP {price.toFixed(2)}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelected(null)}>Close</Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
