import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { prescriptionApi, userApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Prescription as PrescriptionType, User as UserType } from '@/types';

export default function DoctorPrescriptions() {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<UserType | null>(null);

  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ['doctor-prescriptions', user?.id],
    enabled: !!user,
    queryFn: async () => {
      return await prescriptionApi.getAll({ doctor: user?.id });
    }
  });

  const navigate = useNavigate();

  const loadPatient = async (id: string) => {
    // navigate to the patient search page and show the report
    navigate(`/doctor-dashboard/patient-search?id=${encodeURIComponent(id)}`);
  };

  return (
    <DashboardLayout title="Prescriptions" subtitle="Prescriptions assigned to you">
      <div className="mb-6">
        <div className="mb-4 font-semibold">Recent Prescriptions</div>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-3">
            {prescriptions.map((p: PrescriptionType) => (
              <div key={p._id} className="border rounded p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">#{p._id.slice(-6)}</div>
                  <div className="text-sm text-muted-foreground">Status: {p.status}</div>
                  <div className="text-sm">Patient: <button className="text-primary underline" onClick={() => {
                    const patientId = ((p.patient as unknown) as { _id?: string })?._id ?? ((p.patient as unknown) as string) ?? '';
                    if (patientId) loadPatient(patientId);
                  }}>{(((p.patient as unknown) as { _id?: string })?._id ?? ((p.patient as unknown) as string) ?? '-')}</button></div>
                </div>
                <div className="text-right">
                  <div className="text-xs">{new Date(p.createdAt).toLocaleString()}</div>
                  <Button variant="ghost" size="sm" className="mt-2">View</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPatient && (
        <div className="mt-6 border rounded p-4 bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Patient Report</h3>
          <div><strong>Name:</strong> {selectedPatient.name}</div>
          <div><strong>Email:</strong> {selectedPatient.email}</div>
          <div><strong>Phone:</strong> {selectedPatient.phone || '-'}</div>
        </div>
      )}
    </DashboardLayout>
  );
}
