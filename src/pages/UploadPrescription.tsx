// Helper to safely render doctor/person fields
function renderPerson(person: unknown) {
  if (!person) return '';
  if (typeof person === 'string') return person;
  if (typeof person === 'object' && person !== null) {
    const p = person as { name?: string; email?: string; _id?: string };
    if (typeof p.name === 'string') return p.name;
    if (typeof p.email === 'string') return p.email;
    if (typeof p._id === 'string') return p._id;
    return JSON.stringify(person);
  }
  return String(person);
}
import React, { useState } from 'react';
import LottieLoader from '@/components/LottieLoader';
import PatientSidebar from '@/components/PatientSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Autocomplete } from '@/components/ui/autocomplete';
import { userApi } from '@/lib/api';
import { useQuery as useReactQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Check, X } from 'lucide-react';
import { prescriptionApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export default function UploadPrescription() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [doctorOptions, setDoctorOptions] = useState<any[]>([]);
  const [doctorLoading, setDoctorLoading] = useState(false);
  // Autocomplete doctor search
  React.useEffect(() => {
    if (doctorSearch.length < 2) {
      setDoctorOptions([]);
      return;
    }
    setDoctorLoading(true);
    userApi.searchDoctors(doctorSearch, 8)
      .then(res => {
        setDoctorOptions(res.doctors.map((doc: any) => ({
          label: `${doc.name} (${doc.email})${doc.verifiedDoctor ? ' ✔️' : ''}`,
          value: doc._id,
          ...doc
        })));
      })
      .finally(() => setDoctorLoading(false));
  }, [doctorSearch]);

  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const { data: prescriptions, refetch } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: prescriptionApi.getMyPrescriptions,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.type.includes('pdf') || file.type.includes('image'));
    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid file type",
        description: "Please upload only PDF or image files",
        variant: "destructive",
      });
    }
    setSelectedFiles(validFiles);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select one or more prescription files to upload",
        variant: "destructive",
      });
      return;
    }
    setUploading(true);
    let successCount = 0;
    let failCount = 0;
    for (const file of selectedFiles) {
      try {
        await prescriptionApi.upload(file, doctorId || undefined);
        successCount++;
      } catch {
        failCount++;
      }
    }
    if (successCount > 0) {
      toast({
        title: `Uploaded ${successCount} prescription${successCount > 1 ? 's' : ''}`,
        description: failCount > 0 ? `${failCount} failed to upload.` : 'All uploaded successfully.',
      });
      setSelectedFiles([]);
      setDoctorId('');
      refetch();
    }
    if (failCount > 0) {
      toast({
        title: "Upload failed",
        description: `${failCount} prescription${failCount > 1 ? 's' : ''} failed to upload.`,
        variant: "destructive",
      });
    }
    setUploading(false);
  };

  return (
      <div className="px-4 pb-8 md:pb-10">
        <div className="mb-8 p-6 bg-gradient-primary rounded-2xl text-white shadow-hero">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <FileText className="h-8 w-8" />
                Upload Prescription
              </h1>
              <p className="text-white/80 text-lg">Upload your prescription for verification and order processing</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload New Prescription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="prescription-file">Prescription File (PDF/Image)</Label>
                <Input
                  id="prescription-file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={handleFileChange}
                  className="mt-2"
                />
                {selectedFiles.length > 0 && (
                  <ul className="text-sm text-muted-foreground mt-2">
                    {selectedFiles.map(file => (
                      <li key={file.name}>{file.name}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <Label htmlFor="doctor-autocomplete">Doctor (Optional)</Label>
                <Autocomplete
                  value={doctorSearch}
                  onChange={setDoctorSearch}
                  onSelect={option => {
                    setDoctorId(option.value);
                    setDoctorSearch(option.label);
                  }}
                  options={doctorOptions}
                  loading={doctorLoading}
                  placeholder="Search doctor by name or email"
                  label={undefined}
                  disabled={uploading}
                />
                {doctorId && (
                  <div className="text-xs text-muted-foreground mt-1">Selected doctor ID: {doctorId}</div>
                )}
              </div>

              <Button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || uploading}
                className="w-full"
              >
                {uploading ? <LottieLoader height={32} width={32} /> : 'Upload Prescription(s)'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                My Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {prescriptions && prescriptions.length > 0 ? (
                <div className="space-y-4">
                  {prescriptions.map((prescription: any) => (
                    <div key={prescription._id || prescription.id} className="flex items-center justify-between p-3 border border-border/50 rounded-xl">
                      <div>
                        <div className="font-medium text-foreground">Prescription #{prescription._id?.slice(-6) || prescription.id?.slice(-6)}</div>
                        <div className="text-xs text-muted-foreground">Doctor: {prescription.doctor ? renderPerson(prescription.doctor) : 'Self-uploaded'}</div>
                        <div className="text-xs text-muted-foreground">Uploaded: {prescription.createdAt ? new Date(prescription.createdAt).toLocaleDateString() : ''}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {prescription.status === 'approved' ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <Check className="h-4 w-4" />
                            <span className="text-sm">Approved</span>
                          </div>
                        ) : prescription.status === 'rejected' ? (
                          <div className="flex items-center gap-1 text-red-600">
                            <X className="h-4 w-4" />
                            <span className="text-sm">Rejected</span>
                          </div>
                        ) : (
                          <span className="text-sm text-yellow-600">Pending</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No prescriptions uploaded yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  );
}