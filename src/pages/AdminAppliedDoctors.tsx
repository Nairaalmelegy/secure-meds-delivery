
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

async function fetchPendingDoctors() {
  const res = await fetch('https://medilinkback-production.up.railway.app/api/users?role=doctor');
  const data = await res.json();
  return (data.users || []).filter((d:any) => !d.verifiedDoctor);
}

async function approveDoctor(id: string) {
  const token = localStorage.getItem('token');
  const res = await fetch(`https://medilinkback-production.up.railway.app/api/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ verifiedDoctor: true }),
  });
  if (!res.ok) throw new Error('Failed to approve doctor');
  return res.json();
}

async function rejectDoctor(id: string) {
  const token = localStorage.getItem('token');
  const res = await fetch(`https://medilinkback-production.up.railway.app/api/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to reject doctor');
  return res.json();
}

export default function AdminAppliedDoctors() {
  const queryClient = useQueryClient();
  const { data: doctors, isLoading } = useQuery({
    queryKey: ['pending-doctors'],
    queryFn: fetchPendingDoctors,
  });
  const approveMutation = useMutation({
    mutationFn: approveDoctor,
    onSuccess: () => queryClient.invalidateQueries(['pending-doctors']),
  });
  const rejectMutation = useMutation({
    mutationFn: rejectDoctor,
    onSuccess: () => queryClient.invalidateQueries(['pending-doctors']),
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
              {doctors.map((doc:any) => (
                <div key={doc._id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <div className="font-semibold">{doc.name}</div>
                    <div className="text-sm text-muted-foreground">{doc.email}</div>
                    <div className="text-xs text-muted-foreground">License: {doc.medicalLicense}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => approveMutation.mutate(doc._id)} disabled={approveMutation.isLoading}>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => rejectMutation.mutate(doc._id)} disabled={rejectMutation.isLoading}>Reject</Button>
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
