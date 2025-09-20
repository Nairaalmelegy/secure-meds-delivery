
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileText, Upload, Download, Search, Calendar, User, Eye, Trash2, Filter, Plus } from 'lucide-react';
import { prescriptionApi, userApi } from '@/lib/api';
import type { MedicalRecords, ScanRecord } from '@/lib/api';
import React from 'react';

export default function MedicalRecords() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editMode, setEditMode] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecords>({});
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [scanMeta, setScanMeta] = useState({ type: '', date: '', notes: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch prescriptions
  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: prescriptionApi.getMyPrescriptions,
  });

  // Fetch medical records (from user profile)
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: userApi.getProfile,
  });

  React.useEffect(() => {
    if (profile) {
      setMedicalRecords({
        chronicDiseases: profile.chronicDiseases || [],
        allergies: profile.allergies || [],
        pastMedications: profile.pastMedications || [],
        scans: profile.scans || [],
      });
    }
  }, [profile]);

  // Mutations
  const updateMedicalRecordsMutation = useMutation({
    mutationFn: (data: MedicalRecords) => userApi.updateMedicalRecords(data),
    onSuccess: (res) => {
      toast({ title: 'Medical records updated' });
      setEditMode(false);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => toast({ title: 'Failed to update records', variant: 'destructive' }),
  });

  const uploadScanMutation = useMutation({
    mutationFn: ({ file, meta }: { file: File, meta: Record<string, string> }) => userApi.uploadScan(file, meta),
    onSuccess: (res) => {
      toast({ title: 'Scan uploaded' });
      setScanFile(null);
      setScanMeta({ type: '', date: '', notes: '' });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => toast({ title: 'Failed to upload scan', variant: 'destructive' }),
  });
  // Handlers for medical records edit
  const handleArrayChange = (field: keyof MedicalRecords, value: string, idx: number) => {
    setMedicalRecords((prev) => {
      const arr = prev[field] ? [...(prev[field] as string[])] : [];
      arr[idx] = value;
      return { ...prev, [field]: arr };
    });
  };
  const handleAddToArray = (field: keyof MedicalRecords) => {
    setMedicalRecords((prev) => {
      const arr = prev[field] ? [...(prev[field] as string[])] : [];
      arr.push('');
      return { ...prev, [field]: arr };
    });
  };
  const handleRemoveFromArray = (field: keyof MedicalRecords, idx: number) => {
    setMedicalRecords((prev) => {
      const arr = prev[field] ? [...(prev[field] as string[])] : [];
      arr.splice(idx, 1);
      return { ...prev, [field]: arr };
    });
  };
  const handleSaveRecords = () => {
    updateMedicalRecordsMutation.mutate({
      chronicDiseases: medicalRecords.chronicDiseases,
      allergies: medicalRecords.allergies,
      pastMedications: medicalRecords.pastMedications,
    });
  };

  // Scan upload
  const handleScanFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScanFile(e.target.files[0]);
    }
  };
  const handleUploadScan = () => {
    if (!scanFile) return;
    uploadScanMutation.mutate({ file: scanFile, meta: scanMeta });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'pending': 'bg-warning/10 text-warning border-warning/20',
      'approved': 'bg-success/10 text-success border-success/20',
      'rejected': 'bg-destructive/10 text-destructive border-destructive/20',
    };
    return variants[status] || 'bg-muted/10 text-muted-foreground border-muted/20';
  };

  type Prescription = {
    id: string;
    doctor?: string;
    status: string;
    createdAt: string;
    verifiedBy?: string;
    description?: string;
  };
  const filteredPrescriptions = (prescriptions as Prescription[] | undefined)?.filter((prescription) => {
    const matchesSearch = !searchQuery || 
      prescription.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.doctor?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || prescription.status === filterStatus;
    return matchesSearch && matchesFilter;
  }) || [];

  const handleDownload = (prescriptionId: string) => {
    toast({
      title: "Download started",
      description: "Your prescription is being downloaded",
    });
  };

  const handleDelete = async (prescriptionId: string) => {
    try {
      // API call to delete prescription would go here
      toast({
        title: "Prescription deleted",
        description: "Prescription has been removed from your records",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete prescription",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto p-6">

        {/* Header + Medical Records Edit */}
        <div className="mb-8 p-6 bg-gradient-primary rounded-2xl text-white shadow-hero">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <FileText className="h-8 w-8" />
                Medical Records
              </h1>
              <p className="text-white/80 text-lg">View and manage your medical history and scans</p>
            </div>
            <Button onClick={() => setEditMode((v) => !v)} className="bg-white/20 hover:bg-white/30 text-white border-white/20">
              {editMode ? 'Cancel Edit' : 'Edit Medical Records'}
            </Button>
          </div>

          {/* Medical Records Form */}
          {editMode && (
            <div className="mt-6 bg-white/10 p-4 rounded-xl">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Chronic Diseases */}
                <div>
                  <div className="font-semibold mb-2">Chronic Diseases</div>
                  {(medicalRecords.chronicDiseases || []).map((d, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <Input value={d} onChange={e => handleArrayChange('chronicDiseases', e.target.value, i)} />
                      <Button size="icon" variant="ghost" onClick={() => handleRemoveFromArray('chronicDiseases', i)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={() => handleAddToArray('chronicDiseases')}><Plus className="h-4 w-4 mr-1" />Add</Button>
                </div>
                {/* Allergies */}
                <div>
                  <div className="font-semibold mb-2">Allergies</div>
                  {(medicalRecords.allergies || []).map((a, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <Input value={a} onChange={e => handleArrayChange('allergies', e.target.value, i)} />
                      <Button size="icon" variant="ghost" onClick={() => handleRemoveFromArray('allergies', i)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={() => handleAddToArray('allergies')}><Plus className="h-4 w-4 mr-1" />Add</Button>
                </div>
                {/* Past Medications */}
                <div>
                  <div className="font-semibold mb-2">Past Medications</div>
                  {(medicalRecords.pastMedications || []).map((m, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <Input value={m} onChange={e => handleArrayChange('pastMedications', e.target.value, i)} />
                      <Button size="icon" variant="ghost" onClick={() => handleRemoveFromArray('pastMedications', i)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={() => handleAddToArray('pastMedications')}><Plus className="h-4 w-4 mr-1" />Add</Button>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={handleSaveRecords} disabled={updateMedicalRecordsMutation.isPending}>Save</Button>
                <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
        {/* Scan Upload & List */}
        <Card className="border-0 shadow-card bg-card/50 backdrop-blur-sm mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Medical Scans & Documents</CardTitle>
              <div>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleScanFileChange}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mr-2"
                >
                  <Upload className="h-4 w-4 mr-1" />Upload Scan
                </Button>
                {scanFile && (
                  <span className="text-sm text-muted-foreground mr-2">{scanFile.name}</span>
                )}
                {scanFile && (
                  <Button size="sm" onClick={handleUploadScan} disabled={uploadScanMutation.isPending}>Submit</Button>
                )}
              </div>
            </div>
            {scanFile && (
              <div className="mt-4 grid md:grid-cols-3 gap-4">
                <Input
                  placeholder="Type (e.g. MRI, X-ray, Blood Test)"
                  value={scanMeta.type}
                  onChange={e => setScanMeta(meta => ({ ...meta, type: e.target.value }))}
                />
                <Input
                  type="date"
                  value={scanMeta.date}
                  onChange={e => setScanMeta(meta => ({ ...meta, date: e.target.value }))}
                />
                <Input
                  placeholder="Notes (optional)"
                  value={scanMeta.notes}
                  onChange={e => setScanMeta(meta => ({ ...meta, notes: e.target.value }))}
                />
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {(medicalRecords.scans || []).length === 0 && <div className="text-muted-foreground">No scans uploaded yet.</div>}
              {(medicalRecords.scans || []).map((scan, i) => (
                <div key={i} className="bg-muted rounded-lg p-3 flex flex-col gap-2">
                  <div className="font-semibold">{scan.type || 'Scan'}</div>
                  <div className="text-sm text-muted-foreground">{scan.date ? new Date(scan.date).toLocaleDateString() : ''}</div>
                  <div className="text-xs text-muted-foreground">{scan.notes}</div>
                  <a href={scan.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline flex items-center gap-1"><Eye className="h-4 w-4" />View</a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card className="border-0 shadow-card bg-card/50 backdrop-blur-sm mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by prescription ID or doctor name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('pending')}
                >
                  Pending
                </Button>
                <Button
                  variant={filterStatus === 'approved' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('approved')}
                >
                  Approved
                </Button>
                <Button
                  variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('rejected')}
                >
                  Rejected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Records Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredPrescriptions.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPrescriptions.map((prescription) => (
              <Card key={prescription.id} className="border-0 shadow-card bg-card/50 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Prescription #{prescription.id?.slice(-6)}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {prescription.doctor ? `Dr. ${prescription.doctor}` : 'Self-uploaded'}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${getStatusBadge(prescription.status)} border`}>
                      {prescription.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Uploaded: {new Date(prescription.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    {prescription.verifiedBy && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>Verified by: Dr. {prescription.verifiedBy}</span>
                      </div>
                    )}

                    {prescription.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {prescription.description}
                      </p>
                    )}

                    <div className="flex gap-2 pt-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDownload(prescription.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(prescription.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-card bg-card/50 backdrop-blur-sm">
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No prescriptions found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || filterStatus !== 'all' 
                    ? 'Try adjusting your search filters' 
                    : "You haven't uploaded any prescriptions yet"}
                </p>
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <a href="/upload-prescription">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Your First Prescription
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        {prescriptions && prescriptions.length > 0 && (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card className="border-0 shadow-card bg-gradient-primary text-white">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{prescriptions.length}</div>
                  <div className="text-white/80 text-sm">Total Prescriptions</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-card bg-gradient-secondary text-white">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {(prescriptions as Prescription[]).filter((p) => p.status === 'approved').length}
                  </div>
                  <div className="text-white/80 text-sm">Approved</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-card bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {(prescriptions as Prescription[]).filter((p) => p.status === 'pending').length}
                  </div>
                  <div className="text-muted-foreground text-sm">Pending Review</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}