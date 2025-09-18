import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { apiClient } from '../lib/api';

interface Medicine {
  name: string;
  qty: number;
}

interface Prescription {
  _id: string;
  patient: string | { _id: string; name: string };
  doctor?: { _id: string; name?: string };
  fileUrl?: string;
  medicines: Medicine[];
  ocrText?: string;
  status: string;
}

interface Order {
  _id: string;
  patient: string | { _id: string; name?: string };
  status: string;
}
import { PharmacyOrderForm } from './PharmacyOrderForm';

// Helper component to fetch and display prescription image using apiClient
function PrescriptionImage({ fileUrl }: { fileUrl: string }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  useEffect(() => {
    let revoked = false;
    async function fetchImage() {
      try {
        const baseUrl = apiClient.getBaseUrl();
        const response = await fetch(baseUrl + fileUrl, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch image');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        if (!revoked) setImgUrl(url);
      } catch {
        if (!revoked) setImgUrl(null);
      }
    }
    fetchImage();
    return () => {
      revoked = true;
      if (imgUrl) URL.revokeObjectURL(imgUrl);
    };
    // eslint-disable-next-line
  }, [fileUrl]);
  if (!imgUrl) return <div className="text-xs text-muted-foreground">Image unavailable</div>;
  return (
    <div className="mt-2">
      <img src={imgUrl} alt="Prescription" className="max-h-48 border rounded" />
    </div>
  );
}

async function fetchPrescriptions(): Promise<Prescription[]> {
  const prescriptions = await apiClient.get<Prescription[]>('/api/prescriptions');
  return prescriptions.filter((p) => p.status === 'pending');
}

async function fetchOrders(): Promise<Order[]> {
  const orders = await apiClient.get<Order[]>('/api/orders');
  return orders.filter((o) => o.status === 'pending');
}

// Approve prescription with required fields for backend
async function approvePrescription(id: string, doctorId?: string, notes?: string) {
  return apiClient.put(`/api/prescriptions/${id}/verify`, {
    id,
    doctorId,
    notes: notes || 'Verified by admin',
    action: 'verify',
  });
}

async function approveOrder(id: string) {
  return apiClient.put(`/api/orders/${id}`, { status: 'processing' });
}

export default function AdminPrescriptionsOrders() {
  const queryClient = useQueryClient();
  const { data: prescriptions, isLoading: loadingPres } = useQuery({
    queryKey: ['pending-prescriptions'],
    queryFn: fetchPrescriptions,
  });
  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['pending-orders'],
    queryFn: fetchOrders,
  });
  const approvePresMutation = useMutation({
    mutationFn: ({ id, doctorId, notes }: { id: string, doctorId?: string, notes?: string }) => approvePrescription(id, doctorId, notes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pending-prescriptions'] }),
  });
  const approveOrderMutation = useMutation({
    mutationFn: (id: string) => approveOrder(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pending-orders'] }),
  });

  // Store notes for each prescription (by prescription id)
  const [prescriptionNotes, setPrescriptionNotes] = useState<Record<string, Record<string, string>>>({});

  // Handle note change for a specific medicine in a prescription
  const handleNoteChange = (presId: string, medName: string, value: string) => {
    setPrescriptionNotes((prev) => ({
      ...prev,
      [presId]: {
        ...(prev[presId] || {}),
        [medName]: value,
      },
    }));
  };

  // Compose notes string for backend (JSON string of medicine: note)
  const getNotesString = (presId: string) => {
    const notesObj = prescriptionNotes[presId] || {};
    return Object.keys(notesObj).length > 0 ? JSON.stringify(notesObj) : 'Verified by admin';
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Prescriptions to Review</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingPres ? (
            <div>Loading...</div>
          ) : prescriptions && prescriptions.length > 0 ? (
            <div className="space-y-4">
              {prescriptions.map((pres) => (
                <div key={pres._id} className="border-b pb-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Prescription #{pres._id.slice(-6)}</div>
                      <div className="text-xs text-muted-foreground">Patient: {typeof pres.patient === 'object' ? (pres.patient?.name || pres.patient?._id || JSON.stringify(pres.patient)) : pres.patient}</div>
                    </div>
                    <Button size="sm" onClick={() => approvePresMutation.mutate({ id: pres._id, doctorId: pres.doctor?._id, notes: getNotesString(pres._id) })} disabled={approvePresMutation.isPending}>Approve</Button>
                  </div>
                  {pres.fileUrl && <PrescriptionImage fileUrl={pres.fileUrl} />}
                  {/* Medicine notes UI */}
                  {Array.isArray(pres.medicines) && pres.medicines.length > 0 && (
                    <div className="mt-2">
                      <div className="font-medium text-xs mb-1">Doctor Notes for Medicines:</div>
                      <div className="space-y-2">
                        {pres.medicines.map((med) => (
                          <div key={med.name} className="flex items-center gap-2">
                            <span className="text-xs w-32 font-semibold">{med.name}</span>
                            <input
                              type="text"
                              className="border rounded px-2 py-1 text-xs flex-1"
                              placeholder="Enter note for this medicine"
                              value={prescriptionNotes[pres._id]?.[med.name] || ''}
                              onChange={e => handleNoteChange(pres._id, med.name, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {pres.ocrText && (
                    <div className="mt-2 p-2 bg-gray-100 rounded">
                      <div className="font-medium text-xs mb-1">Extracted Text:</div>
                      <div className="text-xs whitespace-pre-line">{pres.ocrText}</div>
                    </div>
                  )}
                  {/* UI for pharmacy to list medicines and send order for confirmation */}
                  <PharmacyOrderForm prescription={pres} />
                </div>
              ))}
            </div>
          ) : (
            <div>No pending prescriptions.</div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Pending Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingOrders ? (
            <div>Loading...</div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <div className="font-semibold">Order #{order._id.slice(-6)}</div>
                    <div className="text-xs text-muted-foreground">Patient: {typeof order.patient === 'object' ? (order.patient?.name || order.patient?._id || JSON.stringify(order.patient)) : order.patient}</div>
                  </div>
                  <Button size="sm" onClick={() => approveOrderMutation.mutate(order._id)} disabled={approveOrderMutation.isPending}>Approve</Button>
                </div>
              ))}
            </div>
          ) : (
            <div>No pending orders.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
