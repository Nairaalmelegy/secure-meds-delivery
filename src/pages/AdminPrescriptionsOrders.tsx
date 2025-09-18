import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
// Simple Dialog component (if not already present in your UI library)
function Modal({ open, onClose, children }: { open: boolean, onClose: () => void, children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
      <div className="bg-white rounded shadow-lg max-w-2xl w-full p-6 relative" onClick={e => e.stopPropagation()}>
        <button className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-black" onClick={onClose}>&times;</button>
        {children}
      </div>
    </div>
  );
}
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
  const [showModal, setShowModal] = useState(false);
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
      <img
        src={imgUrl}
        alt="Prescription"
        className="max-h-48 border rounded cursor-zoom-in"
        onClick={() => setShowModal(true)}
        title="Click to enlarge"
      />
      <a
        href={imgUrl}
        download={fileUrl.split('/').pop() || 'prescription.png'}
        className="block text-xs text-blue-600 mt-1 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        Download
      </a>
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={() => setShowModal(false)}
        >
          <img
            src={imgUrl}
            alt="Prescription Fullscreen"
            className="max-h-[90vh] max-w-[90vw] border-4 border-white rounded shadow-lg"
            onClick={e => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white text-2xl font-bold bg-black bg-opacity-50 rounded-full px-3 py-1"
            onClick={() => setShowModal(false)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}
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
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [extractedMedicine, setExtractedMedicine] = useState('');
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
                <div key={pres._id} className="border-b pb-4 mb-4 cursor-pointer hover:bg-gray-50" onClick={() => {
                  setSelectedPrescription(pres);
                  setExtractedMedicine(pres.ocrText || '');
                }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Prescription #{pres._id.slice(-6)}</div>
                      <div className="text-xs text-muted-foreground">Patient: {typeof pres.patient === 'object' ? (pres.patient?.name || pres.patient?._id || JSON.stringify(pres.patient)) : pres.patient}</div>
                    </div>
                    <Button size="sm" variant="outline">Send order for confirmation</Button>
                  </div>
                  {pres.fileUrl && <PrescriptionImage fileUrl={pres.fileUrl} />}
                </div>
              ))}
      {/* Modal for prescription details and verify/fill step */}
      <Modal open={!!selectedPrescription} onClose={() => setSelectedPrescription(null)}>
        {selectedPrescription && (
          <div>
            <div className="mb-4">
              <div className="font-semibold text-lg mb-2">Prescription #{selectedPrescription._id.slice(-6)}</div>
              <div className="text-xs text-muted-foreground mb-2">Patient: {typeof selectedPrescription.patient === 'object' ? (selectedPrescription.patient?.name || selectedPrescription.patient?._id || JSON.stringify(selectedPrescription.patient)) : selectedPrescription.patient}</div>
              {selectedPrescription.fileUrl && <PrescriptionImage fileUrl={selectedPrescription.fileUrl} />}
            </div>
            <div className="mb-4">
              <div className="font-medium text-xs mb-1">Extracted Medicine (edit/confirm):</div>
              <textarea
                className="border rounded px-2 py-1 text-xs w-full min-h-[60px]"
                value={extractedMedicine}
                onChange={e => setExtractedMedicine(e.target.value)}
              />
            </div>
            {/* Medicine notes UI */}
            {Array.isArray(selectedPrescription.medicines) && selectedPrescription.medicines.length > 0 && (
              <div className="mb-4">
                <div className="font-medium text-xs mb-1">Doctor Notes for Medicines:</div>
                <div className="space-y-2">
                  {selectedPrescription.medicines.map((med) => (
                    <div key={med.name} className="flex items-center gap-2">
                      <span className="text-xs w-32 font-semibold">{med.name}</span>
                      <input
                        type="text"
                        className="border rounded px-2 py-1 text-xs flex-1"
                        placeholder="Enter note for this medicine"
                        value={prescriptionNotes[selectedPrescription._id]?.[med.name] || ''}
                        onChange={e => handleNoteChange(selectedPrescription._id, med.name, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedPrescription(null)}>Cancel</Button>
              <Button
                onClick={() => {
                  approvePresMutation.mutate({
                    id: selectedPrescription._id,
                    doctorId: selectedPrescription.doctor?._id,
                    notes: getNotesString(selectedPrescription._id),
                    extractedMedicine,
                    action: 'verify',
                  });
                  setSelectedPrescription(null);
                }}
                disabled={!extractedMedicine.trim() || approvePresMutation.isPending}
              >
                Approve & Send
              </Button>
            </div>
          </div>
        )}
      </Modal>
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
