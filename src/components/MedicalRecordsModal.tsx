import React, { useEffect, useState } from 'react';
import LottieLoader from '@/components/LottieLoader';
// Helper to extract the storage path from a Supabase fileUrl
function extractStoragePath(fileUrl: string): string | null {
  // Try to match scans/filename or prescriptions/filename
  const match = fileUrl.match(/(?:uploads\/)?(scans|prescriptions)\/[\w\-.]+/i);
  return match ? match[0].replace(/^uploads\//, '') : null;
}

// Types for profile, scan, and prescription
interface ScanRecord {
  fileUrl: string;
  type?: string;
  date?: string;
  notes?: string;
}
interface PrescriptionRecord {
  fileUrl: string;
  _id?: string;
  createdAt?: string;
}
interface Profile {
  chronicDiseases?: string[];
  allergies?: string[];
  pastMedications?: string[];
  scans?: ScanRecord[];
  prescriptions?: PrescriptionRecord[];
}

// Helper component to show loader while image loads
function ImageWithLoader({ src, alt }: { src: string; alt: string }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  return (
    <div style={{ minHeight: 120, minWidth: 120, maxWidth: 200, margin: '8px 0', position: 'relative' }}>
      {loading && !error && (
        <div className="flex justify-center items-center h-24"><LottieLoader height={60} width={60} /></div>
      )}
      <img
        src={src}
        alt={alt}
        style={{ maxWidth: 200, display: loading ? 'none' : 'block', borderRadius: 8 }}
        onLoad={() => setLoading(false)}
        onError={() => { setLoading(false); setError(true); }}
      />
      {!loading && error && (
        <div className="text-destructive text-xs">Image not found or failed to load.</div>
      )}
    </div>
  );
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);

  // Map of original fileUrl to signed URL
  const [signedUrls, setSignedUrls] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    // Fetch user profile and prescriptions in parallel
    Promise.all([
      apiClient.get(`/api/users/${patientId}`),
      apiClient.get(`/api/prescriptions?patient=${patientId}`)
    ])
      .then(([profileData, prescriptionsDataRaw]) => {
        setProfile(profileData);
        // Fix: handle unknown type for prescriptionsDataRaw
        let prescriptionsList: PrescriptionRecord[] = [];
        if (Array.isArray(prescriptionsDataRaw)) {
          prescriptionsList = prescriptionsDataRaw as PrescriptionRecord[];
        } else if (
          prescriptionsDataRaw && typeof prescriptionsDataRaw === 'object' && 'prescriptions' in prescriptionsDataRaw && Array.isArray((prescriptionsDataRaw as any).prescriptions)
        ) {
          prescriptionsList = (prescriptionsDataRaw as { prescriptions: PrescriptionRecord[] }).prescriptions;
        }
        setPrescriptions(prescriptionsList);
      })
      .catch(() => setError('Failed to load medical records'))
      .finally(() => setLoading(false));
  }, [open, patientId]);

  // Fetch signed URLs for all scans and prescriptions when profile or prescriptions change
  useEffect(() => {
    if (!profile) return;
    (async () => {
      const urls: { [key: string]: string } = {};
      // Scans
      if (profile.scans) {
        for (const scan of profile.scans) {
          if (scan.fileUrl) {
            const path = extractStoragePath(scan.fileUrl);
            if (path) {
              try {
                const res = await fetch(`/api/users/scan/signed-url?path=${encodeURIComponent(path)}`);
                const data = await res.json();
                if (data.url) urls[scan.fileUrl] = data.url;
              } catch {
                // Ignore errors for individual scans
              }
            }
          }
        }
      }
      // Prescriptions (from separate fetch)
      if (prescriptions) {
        for (const pres of prescriptions) {
          if (pres.fileUrl) {
            const path = extractStoragePath(pres.fileUrl);
            if (path) {
              try {
                const res = await fetch(`/api/users/scan/signed-url?path=${encodeURIComponent(path)}`);
                const data = await res.json();
                if (data.url) urls[pres.fileUrl] = data.url;
              } catch {
                // Ignore errors for individual prescriptions
              }
            }

          }
        }
      }
      setSignedUrls(urls);
    })();
  }, [profile, prescriptions]);

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
                {(profile.scans || []).map((scan, i) => {
                  const signedUrl = signedUrls[scan.fileUrl];
                  const isImage = signedUrl && /\.(jpe?g|png|gif|bmp|webp|svg)$/i.test(signedUrl);
                  const isPdf = signedUrl && /\.pdf$/i.test(signedUrl);
                  return (
                    <li key={i}>
                      <span>{scan.type} ({scan.date ? new Date(scan.date).toLocaleDateString() : ''})</span>
                      {isImage && signedUrl && (
                        <ImageWithLoader src={signedUrl} alt={scan.type} />
                      )}
                      {isPdf && signedUrl && (
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
            <div>
              <b>Prescriptions:</b>
              <ul className="list-disc ml-6">
                {(prescriptions || []).map((pres, i) => {
                  const signedUrl = signedUrls[pres.fileUrl];
                  const isImage = signedUrl && /\.(jpe?g|png|gif|bmp|webp|svg)$/i.test(signedUrl);
                  const isPdf = signedUrl && /\.pdf$/i.test(signedUrl);
                  return (
                    <li key={i}>
                      <span>Prescription {(pres._id || '').slice(-6)} {pres.createdAt ? '(' + new Date(pres.createdAt).toLocaleDateString() + ')' : ''}</span>
                      {isImage && signedUrl && (
                        <ImageWithLoader src={signedUrl} alt="Prescription" />
                      )}
                      {isPdf && signedUrl && (
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
                {(!prescriptions || prescriptions.length === 0) && <li>None</li>}
              </ul>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
