import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    apiClient.get(`/api/users/${patientId}`)
      .then(setProfile)
      .catch(() => setError('Failed to load medical records'))
      .finally(() => setLoading(false));
  }, [open, patientId]);

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
                  const isImage = scan.fileUrl && /\.(jpe?g|png|gif)$/i.test(scan.fileUrl);
                  const isPdf = scan.fileUrl && /\.pdf$/i.test(scan.fileUrl);
                  return (
                    <li key={i}>
                      <span>{scan.type} ({scan.date ? new Date(scan.date).toLocaleDateString() : ''})</span>
                      {isImage && (
                        <img
                          src={scan.fileUrl}
                          alt={scan.type}
                          style={{ maxWidth: 200, display: 'block', margin: '8px 0' }}
                        />
                      )}
                      {isPdf && (
                        <a
                          href={scan.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-primary underline"
                        >
                          View PDF
                        </a>
                      )}
                      {!isImage && !isPdf && scan.fileUrl && (
                        <a
                          href={scan.fileUrl}
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
