
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { apiClient } from '../lib/api';

type Doctor = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  clinic?: string;
  medicalLicense?: string;
  verifiedDoctor?: boolean;
};

async function fetchPendingDoctors(): Promise<Doctor[]> {
  const data = await apiClient.get<{ users: Doctor[] }>('/api/users?role=doctor');
  return (data.users || []).filter((d: Doctor) => !d.verifiedDoctor);
}

async function approveDoctor(id: string) {
  // Fetch current doctor data
  const doc = await apiClient.get<Doctor>(`/api/users/${id}`);
  // Build payload with all required fields and verifiedDoctor: true
  const payload: Doctor & { verifiedDoctor: true } = {
    _id: doc._id,
    name: doc.name,
    email: doc.email,
    phone: doc.phone || '',
    role: doc.role,
    clinic: doc.role === 'doctor' ? (doc.clinic || '') : '',
    medicalLicense: doc.medicalLicense,
    verifiedDoctor: true,
  };
  return apiClient.put(`/api/users/${id}`, payload);
}

async function rejectDoctor(id: string) {
  return apiClient.delete(`/api/users/${id}`);
}

export default function AdminAppliedDoctors() {
  const queryClient = useQueryClient();
  const { data: doctors, isLoading } = useQuery<Doctor[]>({
    queryKey: ['pending-doctors'],
    queryFn: fetchPendingDoctors,
  });
  const approveMutation = useMutation({
    mutationFn: approveDoctor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pending-doctors'] }),
  });
  const rejectMutation = useMutation({
    mutationFn: rejectDoctor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pending-doctors'] }),
  });

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Applied Doctors</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : doctors && doctors.length > 0 ? (
            <div className="space-y-4">
              {doctors.map((doc) => (
                <div key={doc._id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <div className="font-semibold">{doc.name}</div>
                    <div className="text-sm text-muted-foreground">{doc.email}</div>
                    <div className="text-xs text-muted-foreground">License: {doc.medicalLicense}</div>
                    <div className="text-xs text-muted-foreground">Clinic: {doc.clinic || 'N/A'}</div>
                    <div className="text-xs text-muted-foreground">Verified: {doc.verifiedDoctor ? 'Yes' : 'No'}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => approveMutation.mutate(doc._id)} disabled={approveMutation.isPending}>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => rejectMutation.mutate(doc._id)} disabled={rejectMutation.isPending}>Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>No pending doctors.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
