import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Check, X } from 'lucide-react';
import { prescriptionApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export default function UploadPrescription() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [doctorId, setDoctorId] = useState('');
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
      setSelectedFiles([]); // allow user to select and upload more prescriptions immediately
      // do not block further uploads, keep UI ready for more
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
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Upload Prescription</h1>
        <p className="text-muted-foreground">Upload your prescription for verification and order processing</p>
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
              <Label htmlFor="doctor-id">Doctor ID (Optional)</Label>
              <Input
                id="doctor-id"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                placeholder="Enter doctor ID if known"
                className="mt-2"
              />
            </div>

            <Button 
              onClick={handleUpload} 
              disabled={selectedFiles.length === 0 || uploading}
              className="w-full"
            >
              {uploading ? 'Uploading...' : 'Upload Prescription(s)'}
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
              <div className="space-y-3">
                {prescriptions.map((prescription: any) => (
                  <div key={prescription.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Prescription #{prescription.id}</p>
                      <p className="text-sm text-muted-foreground">
                        Uploaded: {new Date(prescription.createdAt).toLocaleDateString()}
                      </p>
                      {prescription.doctor && (
                        <p className="text-sm text-muted-foreground">
                          Doctor: {prescription.doctor}
                        </p>
                      )}
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