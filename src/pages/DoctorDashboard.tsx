import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Search, Users, FileText, DollarSign, CheckCircle, XCircle, TrendingUp, Activity, Stethoscope, Award, Clock } from 'lucide-react';
import { doctorApi, prescriptionApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: doctorApi.getPatients,
  });

  const { data: prescriptions, refetch: refetchPrescriptions } = useQuery({
    queryKey: ['doctor-prescriptions'],
    queryFn: prescriptionApi.getMyPrescriptions, // This should be updated for doctor's view
  });

  const handleVerifyPrescription = async (prescriptionId: string, approved: boolean) => {
    try {
      await prescriptionApi.verify(prescriptionId, approved);
      toast({
        title: approved ? "Prescription approved" : "Prescription rejected",
        description: `Prescription has been ${approved ? 'approved' : 'rejected'} successfully`,
      });
      refetchPrescriptions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update prescription status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Doctor Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Dr. {user?.name}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Prescriptions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {prescriptions?.filter((p: any) => p.status === 'pending').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month's Commission</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">EGP 2,450</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,250</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Search Patients</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by National ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {patients && patients.length > 0 ? (
              <div className="space-y-3">
                {patients.map((patient: any) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">{patient.email}</p>
                      <p className="text-sm text-muted-foreground">ID: {patient.nationalId}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Records
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No patients found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prescription Verification</CardTitle>
          </CardHeader>
          <CardContent>
            {prescriptions && prescriptions.length > 0 ? (
              <div className="space-y-3">
                {prescriptions
                  .filter((p: any) => p.status === 'pending')
                  .map((prescription: any) => (
                    <div key={prescription.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">Prescription #{prescription.id}</p>
                          <p className="text-sm text-muted-foreground">
                            Patient: {prescription.patientName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Uploaded: {new Date(prescription.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge>Pending</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleVerifyPrescription(prescription.id, true)}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleVerifyPrescription(prescription.id, false)}
                          className="flex items-center gap-1"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No pending prescriptions</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}