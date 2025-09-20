import React, { useEffect, useState } from 'react';
// Helper to fetch patient name by ID (with local cache)
const patientNameCache: Record<string, string> = {};
async function fetchPatientName(id: string): Promise<string> {
  if (patientNameCache[id]) return patientNameCache[id];
  try {
    const res = await apiClient.get<{ name: string }>(`/api/users/${id}`);
    patientNameCache[id] = res.name;
    return res.name;
  } catch {
    return id;
  }
}

// Dedicated cell component for patient name
type PatientType = string | { _id: string; name?: string; phone?: string };
function PatientNameCell({ patient }: { patient: PatientType }) {
  const [name, setName] = useState<string>(typeof patient === 'object' ? (patient?.name || patient?._id || '-') : '-');
  useEffect(() => {
    if (typeof patient === 'string') {
      fetchPatientName(patient).then(setName);
    } else if (patient?.name) {
      setName(patient.name);
    }
  }, [patient]);
  return <>{name}</>;
}
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
import { apiClient, medicineApi, orderApi } from '../lib/api';
import { useQuery as useReactQuery } from '@tanstack/react-query';
// Medicine selector for admin modal
interface ExtractedMedicine {
  medicine: string;
  name: string;
  qty: number;
  price: number;
}

function MedicineSelector({ value, onChange }: { value: ExtractedMedicine[]; onChange: (val: ExtractedMedicine[]) => void }) {
  const [search, setSearch] = useState('');
  const { data: options, isLoading } = useReactQuery({
    queryKey: ['medicines', search],
    queryFn: () => search.length > 1 ? medicineApi.search(search) : Promise.resolve([]),
    enabled: search.length > 1,
  });
  const addMedicine = (med: { _id: string; name: string; price: number }) => {
    if (!value.some((m) => m.medicine === med._id)) {
      onChange([...value, { medicine: med._id, name: med.name, qty: 1, price: med.price }]);
    }
  };
  const setQty = (idx: number, qty: number) => {
    const arr = [...value];
    arr[idx].qty = qty;
    onChange(arr);
  };
  const remove = (idx: number) => {
    const arr = [...value];
    arr.splice(idx, 1);
    onChange(arr);
  };
  const total = value.reduce((sum, m) => sum + (m.qty * m.price), 0);
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input
          className="border rounded px-2 py-1 text-xs flex-1"
          placeholder="Search medicine by name"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {isLoading && <div className="text-xs text-muted-foreground">Loading...</div>}
      {options && options.length > 0 && (
        <ul className="border rounded bg-white max-h-32 overflow-auto mb-2">
          {options.map((med: { _id: string; name: string; price: number }) => (
            <li key={med._id} className="px-2 py-1 text-xs cursor-pointer hover:bg-primary/10" onClick={() => addMedicine(med)}>
              {med.name} (${med.price})
            </li>
          ))}
        </ul>
      )}
      {value.length > 0 && (
        <div className="mb-2">
          {value.map((med, idx) => (
            <div key={med.medicine} className="flex items-center gap-2 mb-1">
              <span className="text-xs w-32 font-semibold">{med.name}</span>
              <input
                type="number"
                min={1}
                className="border rounded px-2 py-1 text-xs w-16"
                value={med.qty}
                onChange={e => setQty(idx, Math.max(1, Number(e.target.value)))}
              />
              <span className="text-xs">x ${med.price}</span>
              <span className="text-xs font-bold">= ${med.qty * med.price}</span>
              <button className="text-xs text-red-500 ml-2" onClick={() => remove(idx)}>Remove</button>
            </div>
          ))}
        </div>
      )}
      <div className="font-semibold text-sm">Total: ${total}</div>
    </div>
  );
}

interface Medicine {
  name: string;
  qty: number;
}

interface Prescription {
  _id: string;
  patient: string | { _id: string; name: string; phone?: string };
  doctor?: { _id: string; name?: string };
  fileUrl?: string;
  medicines: Medicine[];
  ocrText?: string;
  status: string;
  extractedMedicines?: ExtractedMedicine[];
}

interface Order {
  _id: string;
  patient: string | { _id: string; name?: string; phone?: string };
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
async function approvePrescription(
  id: string,
  doctorId?: string,
  notes?: string,
  extractedMedicines?: ExtractedMedicine[]
) {
  return apiClient.put(`/api/prescriptions/${id}/verify`, {
    id,
    doctorId,
    notes: notes || 'Verified by admin',
    extractedMedicines,
    action: 'verify',
  });
}

async function approveOrder(id: string) {
  return apiClient.put(`/api/orders/${id}`, { status: 'processing' });
}

export default function AdminPrescriptionsOrders() {
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [extractedMedicines, setExtractedMedicines] = useState<ExtractedMedicine[]>([]);
  const queryClient = useQueryClient();
  const { data: prescriptions, isLoading: loadingPres } = useQuery({
    queryKey: ['pending-prescriptions'],
    queryFn: fetchPrescriptions,
  });
  interface OrderItem {
    medicine: { _id: string; name: string } | string;
    qty: number;
  }
  interface FullOrder {
    _id: string;
    patient: string | { _id: string; name?: string; phone?: string };
    items?: OrderItem[];
    notes?: string;
    deliveryAddress?: string;
    status: string;
  }
  const { data: orders, isLoading: loadingOrders } = useQuery<FullOrder[]>({
    queryKey: ['all-orders'],
    queryFn: async () => apiClient.get<FullOrder[]>('/api/orders'),
    refetchInterval: 3000, // Poll every 3 seconds for real-time updates
  });
  const approvePresMutation = useMutation({
    mutationFn: ({ id, doctorId, notes, extractedMedicines }: { id: string, doctorId?: string, notes?: string, extractedMedicines?: ExtractedMedicine[] }) =>
      approvePrescription(id, doctorId, notes, extractedMedicines),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pending-prescriptions'] }),
  });
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => orderApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
    },
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
    <div className="grid md:grid-rows-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Prescriptions to Review</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingPres ? (
            <div>Loading...</div>
          ) : prescriptions && prescriptions.length > 0 ? (
            <div className="space-y-4">
              {prescriptions
                .filter(p => p.status === 'pending' || p.status === 'awaiting_patient_confirmation')
                .map((pres) => (
                <div key={pres._id} className="border-b pb-4 mb-4 cursor-pointer hover:bg-gray-50" onClick={() => {
                  setSelectedPrescription(pres);
                  setExtractedMedicines(pres.extractedMedicines || []);
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
              <div className="font-medium text-xs mb-1">Extracted Medicines (search, set qty):</div>
              <MedicineSelector value={extractedMedicines} onChange={setExtractedMedicines} />
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
                    extractedMedicines,
                  });
                  setSelectedPrescription(null);
                }}
                disabled={extractedMedicines.length === 0 || approvePresMutation.isPending}
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
          <CardTitle>All Patient Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingOrders ? (
            <div>Loading...</div>
          ) : Array.isArray(orders) && orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Order #</th>
                    <th className="p-2 border">Patient Name</th>
                    <th className="p-2 border">Phone</th>
                    <th className="p-2 border">Medicines</th>
                    <th className="p-2 border">Notes</th>
                    <th className="p-2 border">Address</th>
                    <th className="p-2 border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const patientPhone = typeof order.patient === 'object' ? (order.patient?.phone || '-') : '-';
                    return (
                      <tr key={order._id} className="border-b">
                        <td className="p-2 border font-semibold">{order._id.slice(-6)}</td>
                        <td className="p-2 border"><PatientNameCell patient={order.patient} /></td>
                        <td className="p-2 border">{patientPhone}</td>
                        <td className="p-2 border">
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item) => (
                              <div key={typeof item.medicine === 'object' ? item.medicine._id : item.medicine}>
                                {typeof item.medicine === 'object' ? item.medicine.name : item.medicine} x {item.qty}
                              </div>
                            ))
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                        <td className="p-2 border">{order.notes || '-'}</td>
                        <td className="p-2 border">{order.deliveryAddress || '-'}</td>
                        <td className="p-2 border">
                          <select
                            value={order.status}
                            onChange={e => updateOrderStatusMutation.mutate({ id: order._id, status: e.target.value })}
                            className="border rounded px-2 py-1 text-xs"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="dispatched">Delivering</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div>No orders found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
