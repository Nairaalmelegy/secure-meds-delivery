import React, { useEffect, useState } from 'react';

interface PrescriptionImageProps {
  fileUrl: string;
  maxHeight?: string;
}

export default function PrescriptionImage({ fileUrl, maxHeight = 'max-h-40' }: PrescriptionImageProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function fetchSignedUrl() {
      if (!fileUrl) return;
      let path = fileUrl;
      const match = path.match(/(?:uploads\/)?(scans|prescriptions)\/[\w\-.]+/i);
      if (match) {
        path = match[0].replace(/^uploads\//, '');
      }
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/users/scan/signed-url?path=${encodeURIComponent(path)}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        const data = await res.json();
        if (!cancelled && data.url) setSignedUrl(data.url);
        else if (!cancelled) setSignedUrl(null);
      } catch {
        if (!cancelled) setSignedUrl(null);
      }
    }
    fetchSignedUrl();
    return () => { cancelled = true; };
  }, [fileUrl]);
  if (!signedUrl) return <div className="text-xs text-muted-foreground">Image unavailable</div>;

  return (
    <div className="mt-2">
      <img
        src={signedUrl}
        alt="Prescription"
        className={`${maxHeight} border rounded cursor-zoom-in`}
        onClick={() => setShowModal(true)}
        title="Click to enlarge"
      />
      <a
        href={signedUrl}
        download={fileUrl.split('/').pop() || 'prescription.png'}
        className="block text-xs text-blue-600 mt-1 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        Download
      </a>
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={() => setShowModal(false)}
        >
          <img
            src={signedUrl}
            alt="Prescription Fullscreen"
            className="max-h-[90vh] max-w-[90vw] border-4 border-white rounded shadow-lg"
            onClick={e => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white text-2xl font-bold bg-black bg-opacity-50 rounded-full px-3 py-1"
            onClick={() => setShowModal(false)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}