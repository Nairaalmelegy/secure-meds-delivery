import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiClient, userApi } from '@/lib/api';
import { User as UserType, ScanRecord } from '@/types';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import DocumentImage from '@/components/DocumentImage';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  nationalId?: string;
  clinic?: string;
}

interface Prescription {
  _id: string;
  fileUrl: string;
  status: string;
  notes?: Record<string, string>;
  ocrText?: string;
  createdAt: string;
  doctor?: { name: string; email: string };
}

interface PatientSearchResponse {
  patient?: Patient;
  prescriptions?: Prescription[];
}

function getImageUrl(fileUrl: string) {
  // Use window.location.origin as base for API images
  if (!fileUrl) return '';
  if (fileUrl.startsWith('http')) return fileUrl;
  return `${window.location.origin}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
}

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  nationalId?: string;
  clinic?: string;
}

interface Prescription {
  _id: string;
  fileUrl: string;
  status: string;
  notes?: Record<string, string>;
  ocrText?: string;
  createdAt: string;
  doctor?: { name: string; email: string };
}

export default function PatientSearch() {
  const [nationalId, setNationalId] = useState('');
  const [searchId, setSearchId] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<UserType | null>(null);
  const { user } = useAuth();

  const {
    data,
    isLoading,
    error
  } = useQuery<PatientSearchResponse, Error>({
    queryKey: ['search-patient', searchId],
    enabled: !!searchId,
    queryFn: async () => {
      if (!searchId) return {} as PatientSearchResponse;
      return await apiClient.get(`/api/users/search/patient?nationalId=${searchId}`);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchId(nationalId.trim());
    setSelectedPatient(null);
  };

  const loadPatientById = async (id: string) => {
    try {
      const p = await userApi.getById(id);
      setSelectedPatient(p);
    } catch (err) {
      setSelectedPatient(null);
    }
  };

  // If the page is opened with ?id=..., load that patient immediately
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id') || params.get('patientId');
    if (id) loadPatientById(id);
  }, [location.search]);

  return (
    <DashboardLayout title="Patient Search" subtitle="Look up patient profiles and prescriptions">
      <div className="max-w-3xl mx-auto mt-4 p-4 bg-white rounded shadow">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <Input
            type="text"
            value={nationalId}
            onChange={e => setNationalId(e.target.value)}
            placeholder="Enter National ID"
            className="flex-1"
          />
          <Button type="submit" disabled={!nationalId.trim() || isLoading}>Search</Button>
        </form>

        {isLoading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error.message || 'Error searching patient'}</div>}

        {data && data.patient && (
          <div className="mb-6 border rounded p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{data.patient.name}</div>
                <div className="text-sm text-muted-foreground">{data.patient.email}</div>
              </div>
              <div className="text-right">
                <div className="text-xs">ID: <button className="text-primary underline" onClick={() => loadPatientById(data.patient._id)}>{data.patient._id}</button></div>
                <div className="text-xs">National ID: {data.patient.nationalId}</div>
              </div>
            </div>
          </div>
        )}

        {data && Array.isArray(data.prescriptions) && data.prescriptions.length > 0 && (
          <div className="mb-6">
            <div className="font-semibold mb-2">Prescriptions</div>
            <div className="space-y-4">
              {data.prescriptions.map((pres: Prescription) => (
                <div key={pres._id} className="border rounded p-2">
                  <div className="flex items-center justify-between">
                    <div>Prescription #{pres._id.slice(-6)}</div>
                    <div className="text-xs text-muted-foreground">{new Date(pres.createdAt).toLocaleString()}</div>
                  </div>
                  <div>Status: <span className="font-medium">{pres.status}</span></div>
                  {pres.doctor && <div>Doctor: {pres.doctor.name} ({pres.doctor.email})</div>}
                  {pres.fileUrl && (
                    <div className="mt-2">
                      <DocumentImage fileUrl={pres.fileUrl} maxHeight="max-h-32" />
                    </div>
                  )}
                  {pres.ocrText && (
                    <div className="mt-2 p-2 bg-gray-100 rounded">
                      <div className="font-medium text-xs mb-1">Extracted Text:</div>
                      <div className="text-xs whitespace-pre-line">{pres.ocrText}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedPatient && (
          <div className="mt-6 border rounded p-4 bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">Patient Report</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div><strong>Name:</strong> {selectedPatient.name}</div>
                <div><strong>Email:</strong> {selectedPatient.email}</div>
                <div><strong>Phone:</strong> {selectedPatient.phone || '-'}</div>
                <div><strong>National ID:</strong> {selectedPatient.nationalId || '-'}</div>
                <div><strong>Clinic:</strong> {selectedPatient.clinic || '-'}</div>
                <div><strong>Chronic Diseases:</strong> {(selectedPatient.chronicDiseases || []).join(', ') || '-'}</div>
                <div><strong>Allergies:</strong> {(selectedPatient.allergies || []).join(', ') || '-'}</div>
                <div><strong>Past Medications:</strong> {(selectedPatient.pastMedications || []).join(', ') || '-'}</div>
              </div>
              <div>
                <div className="font-semibold mb-2">Scans & Uploads</div>
                {Array.isArray(selectedPatient.scans) && selectedPatient.scans.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPatient.scans.map((s: ScanRecord, idx: number) => (
                      <div key={idx} className="border rounded p-2">
                        <div className="text-xs text-muted-foreground">{s.type || 'Scan'} — {s.date ? new Date(s.date).toLocaleString() : ''}</div>
                        <div className="mt-2">
                          <DocumentImage fileUrl={s.fileUrl} maxHeight="max-h-40" />
                        </div>
                        {s.notes && <div className="text-sm mt-1">Notes: {s.notes}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No scans or uploads for this patient.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
