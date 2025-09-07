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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [doctorId, setDoctorId] = useState('');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const { data: prescriptions, refetch } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: prescriptionApi.getMyPrescriptions,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.includes('pdf') || file.type.includes('image')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or image file",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a prescription file to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      await prescriptionApi.upload(selectedFile, doctorId || undefined);
      toast({
        title: "Prescription uploaded",
        description: "Your prescription has been uploaded successfully",
      });
      setSelectedFile(null);
      setDoctorId('');
      refetch();
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload prescription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
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
                onChange={handleFileChange}
                className="mt-2"
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {selectedFile.name}
                </p>
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
              disabled={!selectedFile || uploading}
              className="w-full"
            >
              {uploading ? 'Uploading...' : 'Upload Prescription'}
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