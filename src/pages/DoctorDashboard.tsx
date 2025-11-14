import { useState } from 'react';
import LottieLoader from '@/components/LottieLoader';
import MedicalRecordsModal from '@/components/MedicalRecordsModal';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Users, FileText, DollarSign, CheckCircle, XCircle, LogOut } from 'lucide-react';
import { prescriptionApi, doctorApi, orderApi, apiClient } from '@/lib/api';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  nationalId?: string;
}

interface Prescription {
  _id: string;
  id?: string;
  patient: string | User;
  doctor: string | User;
  status: string;
  createdAt: string;
  patientName?: string;
}

interface Order {
  _id: string;
  id?: string;
  patient: string | User;
  prescription: string | Prescription;
  doctor?: string | User;
  status?: string;
}

interface Commission {
  _id: string;
  doctor: string | User;
  amount: number;
  createdAt: string;
  requestedAt: string;
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [patientResult, setPatientResult] = useState<User | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [viewRecordsOpen, setViewRecordsOpen] = useState(false);

  // Logout handler
  const handleLogout = async () => {
    try {
      await apiClient.post('/api/auth/logout');
      navigate('/login');
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to logout', variant: 'destructive' });
    }
  };

  // Fetch all orders for this doctor (to count unique patients)
  const { data: orders, isLoading: loadingOrders } = useQuery<Order[]>({
    queryKey: ['doctor-orders'],
    queryFn: async () => {
      if (!user?.id) return [];
      const allOrders: Order[] = await apiClient.get('/api/orders');
      return allOrders.filter((order) => {
        if (order.prescription && typeof order.prescription === 'object') {
          return (order.prescription as Prescription).doctor === user.id;
        }
        if (order.doctor && typeof order.doctor === 'string') {
          return order.doctor === user.id;
        }
        return false;
      });
    },
    enabled: !!user?.id,
  });

  // Fetch all prescriptions for this doctor
  const { data: prescriptions, isLoading: loadingPrescriptions } = useQuery<Prescription[]>({
    queryKey: ['doctor-prescriptions'],
    queryFn: async () => {
      const { getPrescriptionsForCurrentUser } = await import('@/lib/api');
      return getPrescriptionsForCurrentUser() as Promise<Prescription[]>;
    },
    enabled: !!user?.id,
  });

  // Fetch commissions for this doctor for the current month using /api/commissions/mine
  const { data: commissions, isLoading: loadingCommissions } = useQuery<Commission[]>({
    queryKey: ['doctor-commissions'],
    queryFn: async () => {
      const res = await apiClient.get<{ commissions: Commission[] }>('/api/commissions/mine');
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      return res.commissions.filter(
        (c) => new Date(c.requestedAt).getMonth() === thisMonth &&
                new Date(c.requestedAt).getFullYear() === thisYear
      );
    },
    enabled: !!user?.id,
  });

  // Patient search logic
  const handlePatientSearch = async () => {
    setSearching(true);
    setSearchError(null);
    setPatientResult(null);
    try {
      if (!searchQuery.trim()) {
        setSearchError('Please enter a national ID.');
        setSearching(false);
        return;
      }
      const result = await doctorApi.getPatientByNationalId(searchQuery.trim());
      // Ensure patientResult has an id field (map _id to id if needed)
      const patient = result.patient;
      if (patient) {
        setPatientResult({
          ...patient,
          id: patient.id || patient._id,
        });
      } else {
        setPatientResult(null);
      }
    } catch (err) {
      setSearchError((err as Error)?.message || 'Patient not found');
    } finally {
      setSearching(false);
    }
  };

  const handleVerifyPrescription = async (prescriptionId: string, approved: boolean) => {
    try {
      await prescriptionApi.verify(prescriptionId, approved);
      toast({
        title: approved ? "Prescription approved" : "Prescription rejected",
        description: `Prescription has been ${approved ? 'approved' : 'rejected'} successfully`,
      });
      // Optionally refetch prescriptions
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update prescription status",
        variant: "destructive",
      });
    }
  };

  // Calculate statistics
  // Only count patients who made a CONFIRMED order with a prescription holding this doctor ID
  const totalPatients = orders && user?.id
    ? new Set(
        orders
          .filter((o) => {
            // Order must be confirmed and prescription must belong to this doctor
            const isConfirmed = o.status === 'confirmed';
            if (isConfirmed && o.prescription && typeof o.prescription === 'object') {
              return (o.prescription as Prescription).doctor === user.id;
            }
            return false;
          })
          .map((o) => typeof o.patient === 'object' ? (o.patient as User).id : o.patient)
      ).size
    : 0;

  // Total prescriptions for this doctor that were confirmed by the patient
  // Assuming status 'patient_confirmed' means confirmed by patient
  const verifiedPrescriptions = prescriptions
    ? prescriptions.filter((p) => p.status === 'patient_confirmed').length
    : 0;

  const totalPoints = prescriptions ? prescriptions.length : 0;

  const commissionAmount = commissions
    ? commissions.reduce((sum, c) => sum + (c.amount || 0), 0)
    : 0;

  return (
    <div className="container mx-auto p-6">
      {/* Header styled like patient overview */}
      <div className="mb-8 p-6 bg-gradient-primary rounded-2xl text-white shadow-hero">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Users className="h-8 w-8" />
              Doctor Dashboard
            </h1>
            <p className="text-white/80 text-lg">Welcome back, Dr. {user?.name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <FileText className="h-8 w-8 text-white/80" />
            <DollarSign className="h-8 w-8 text-white/80" />
            <Button onClick={handleLogout} variant="outline" className="text-gray-500 border-white/30 hover:bg-white/40 flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {loadingOrders ? <LottieLoader height={32} width={32} /> : isNaN(totalPatients) ? 'N/A' : totalPatients}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Verified Prescriptions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingPrescriptions ? <LottieLoader height={32} width={32} /> : verifiedPrescriptions}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month's Commission</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingCommissions ? <LottieLoader height={32} width={32} /> : `EGP ${commissionAmount.toLocaleString()}`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingPrescriptions ? <LottieLoader height={32} width={32} /> : totalPoints}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Search Patients</CardTitle>
            <div className="relative flex gap-2 items-center">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by National ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => { if (e.key === 'Enter') handlePatientSearch(); }}
                disabled={searching}
              />
              <Button size="sm" onClick={handlePatientSearch} disabled={searching}>
                Search
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {searchError && <p className="text-destructive mb-2">{searchError}</p>}
            {searching ? (
              <div className="flex justify-center items-center py-4"><LottieLoader height={48} width={48} /></div>
            ) : patientResult ? (
              <>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{patientResult.name}</p>
                    <p className="text-sm text-muted-foreground">{patientResult.email}</p>
                    <p className="text-sm text-muted-foreground">ID: {patientResult.nationalId}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/doctor-dashboard/patient-search?id=${patientResult.id}`)}>
                    View Records
                  </Button>
                </div>
                {/* MedicalRecordsModal retained for in-place view; navigation will show full report in Patient Search */}
                <MedicalRecordsModal open={viewRecordsOpen} onOpenChange={setViewRecordsOpen} patientId={patientResult.id} />
              </>
            ) : (
              searchError ? null : <p className="text-muted-foreground">Enter a national ID and search</p>
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
                  .filter((p: Prescription) => p.status === 'patient_confirmed')
                  .map((prescription: Prescription) => (
                    <div key={prescription._id || prescription.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">Prescription #{prescription._id || prescription.id}</p>
                          <p className="text-sm text-muted-foreground">
                            Patient: {prescription.patientName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Uploaded: {new Date(prescription.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge>Confirmed</Badge>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No confirmed prescriptions</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}