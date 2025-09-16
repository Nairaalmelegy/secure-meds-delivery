import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiClient } from '../lib/api';

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
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-4 border rounded bg-white">
      <h2 className="text-lg font-bold mb-4">Search Patient by National ID</h2>
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
      {data && typeof data === 'object' && data.patient && (
        <div className="mb-6">
          <div className="font-semibold">Patient Info</div>
          <div>Name: {'name' in data.patient ? data.patient.name : ''}</div>
          <div>Email: {'email' in data.patient ? data.patient.email : ''}</div>
          <div>Phone: {'phone' in data.patient ? data.patient.phone : ''}</div>
          <div>National ID: {'nationalId' in data.patient ? data.patient.nationalId : ''}</div>
          <div>Clinic: {'clinic' in data.patient ? data.patient.clinic : ''}</div>
        </div>
      )}
      {data && typeof data === 'object' && Array.isArray(data.prescriptions) && data.prescriptions.length > 0 && (
        <div>
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
                    <img src={getImageUrl(pres.fileUrl)} alt="Prescription" className="max-h-32 border rounded" />
                  </div>
                )}
                {pres.ocrText && (
                  <div className="mt-2 p-2 bg-gray-100 rounded">
                    <div className="font-medium text-xs mb-1">Extracted Text:</div>
                    <div className="text-xs whitespace-pre-line">{pres.ocrText}</div>
                  </div>
                )}
                {pres.notes && Object.keys(pres.notes).length > 0 && (
                  <div className="mt-2">
                    <div className="font-medium text-xs mb-1">Notes:</div>
                    <ul className="text-xs list-disc ml-4">
                      {Object.entries(pres.notes).map(([med, note]) => (
                        <li key={med}><span className="font-semibold">{med}:</span> {note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {data && typeof data === 'object' && 'patient' in data && !data.patient && (
        <div className="text-red-500">No patient found with this National ID.</div>
      )}
    </div>
  );
}
