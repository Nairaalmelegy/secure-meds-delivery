import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Users, FileText, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { prescriptionApi, doctorApi, orderApi, apiClient } from '@/lib/api';

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
}

interface Commission {
  _id: string;
  doctor: string | User;
  amount: number;
  createdAt: string;
}
import { useAuth } from '@/contexts/AuthContext';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const [patientResult, setPatientResult] = useState<User | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

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

  // Fetch commissions for this doctor for the current month
  const { data: commissions, isLoading: loadingCommissions } = useQuery<Commission[]>({
    queryKey: ['doctor-commissions'],
    queryFn: async () => {
      const allComms: Commission[] = await apiClient.get('/api/commissions');
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      return allComms.filter(
        (c) => {
          const docId = typeof c.doctor === 'object' ? (c.doctor as User).id : c.doctor;
          return (
            docId === user.id &&
            new Date(c.createdAt).getMonth() === thisMonth &&
            new Date(c.createdAt).getFullYear() === thisYear
          );
        }
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
      setPatientResult(result.patient as User);
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
  const totalPatients = orders
    ? new Set(orders.map((o) => typeof o.patient === 'object' ? (o.patient as User).id : o.patient)).size
    : 0;

  const pendingPrescriptions = prescriptions
    ? prescriptions.filter((p) => p.status === 'pending').length
    : 0;

  const totalPoints = prescriptions ? prescriptions.length : 0;

  const commissionAmount = commissions
    ? commissions.reduce((sum, c) => sum + (c.amount || 0), 0)
    : 0;

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
            <div className="text-2xl font-bold text-muted-foreground">
              {loadingOrders ? '...' : isNaN(totalPatients) ? 'N/A' : totalPatients}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Prescriptions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingPrescriptions ? '...' : pendingPrescriptions}
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
              {loadingCommissions ? '...' : `EGP ${commissionAmount.toLocaleString()}`}
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
              {loadingPrescriptions ? '...' : totalPoints}
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
            {patientResult ? (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{patientResult.name}</p>
                  <p className="text-sm text-muted-foreground">{patientResult.email}</p>
                  <p className="text-sm text-muted-foreground">ID: {patientResult.nationalId}</p>
                </div>
                <Button variant="outline" size="sm">
                  View Records
                </Button>
              </div>
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
                  .filter((p: Prescription) => p.status === 'pending')
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
                        <Badge>Pending</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleVerifyPrescription(prescription._id || prescription.id, true)}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleVerifyPrescription(prescription._id || prescription.id, false)}
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