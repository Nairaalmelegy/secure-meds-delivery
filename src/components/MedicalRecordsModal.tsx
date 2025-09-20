import React, { useEffect, useState } from 'react';
// Helper to extract the storage path from a Supabase fileUrl
function extractStoragePath(fileUrl: string): string | null {
  // Try to match scans/filename or prescriptions/filename
  const match = fileUrl.match(/(?:uploads\/)?(scans|prescriptions)\/[\w\-.]+/i);
  return match ? match[0].replace(/^uploads\//, '') : null;
}
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';

interface MedicalRecordsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
}

export default function MedicalRecordsModal({ open, onOpenChange, patientId }: MedicalRecordsModalProps) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Map of original fileUrl to signed URL
  const [signedUrls, setSignedUrls] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    apiClient.get(`/api/users/${patientId}`)
      .then(setProfile)
      .catch(() => setError('Failed to load medical records'))
      .finally(() => setLoading(false));
  }, [open, patientId]);

  // Fetch signed URLs for all scans when profile.scans changes
  useEffect(() => {
    if (!profile?.scans) return;
    (async () => {
      const urls: { [key: string]: string } = {};
      for (const scan of profile.scans) {
        if (scan.fileUrl) {
          const path = extractStoragePath(scan.fileUrl);
          if (path) {
            try {
              const res = await fetch(`/api/users/scan/signed-url?path=${encodeURIComponent(path)}`);
              const data = await res.json();
              if (data.url) urls[scan.fileUrl] = data.url;
            } catch {}
          }
        }
      }
      setSignedUrls(urls);
    })();
  }, [profile?.scans]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Medical Records</DialogTitle>
          <DialogClose asChild>
            <button className="absolute top-2 right-2">×</button>
          </DialogClose>
        </DialogHeader>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-destructive">{error}</div>
        ) : profile ? (
          <div className="space-y-4">
            <div>
              <b>Chronic Diseases:</b> {(profile.chronicDiseases || []).join(', ') || 'None'}
            </div>
            <div>
              <b>Allergies:</b> {(profile.allergies || []).join(', ') || 'None'}
            </div>
            <div>
              <b>Past Medications:</b> {(profile.pastMedications || []).join(', ') || 'None'}
            </div>
            <div>
              <b>Scans:</b>
              <ul className="list-disc ml-6">
                {(profile.scans || []).map((scan: any, i: number) => {
                  const signedUrl = signedUrls[scan.fileUrl];
                  const isImage = signedUrl && /\.(jpe?g|png|gif)$/i.test(signedUrl);
                  const isPdf = signedUrl && /\.pdf$/i.test(signedUrl);
                  return (
                    <li key={i}>
                      <span>{scan.type} ({scan.date ? new Date(scan.date).toLocaleDateString() : ''})</span>
                      {isImage && (
                        <img
                          src={signedUrl}
                          alt={scan.type}
                          style={{ maxWidth: 200, display: 'block', margin: '8px 0' }}
                        />
                      )}
                      {isPdf && (
                        <a
                          href={signedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-primary underline"
                        >
                          View PDF
                        </a>
                      )}
                      {!isImage && !isPdf && signedUrl && (
                        <a
                          href={signedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-primary underline"
                        >
                          View File
                        </a>
                      )}
                    </li>
                  );
                })}
                {(!profile.scans || profile.scans.length === 0) && <li>None</li>}
              </ul>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
