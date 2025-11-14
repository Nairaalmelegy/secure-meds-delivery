import React, { useEffect, useState } from 'react';

interface DocumentImageProps {
  fileUrl: string;
  maxHeight?: string;
}

export default function DocumentImage({ fileUrl, maxHeight = 'max-h-40' }: DocumentImageProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchSignedUrl() {
      if (!fileUrl) return;
      // If it's already a full URL, use it directly
      if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
        if (!cancelled) setSignedUrl(fileUrl);
        return;
      }
      // Normalize path (remove leading uploads/ if present)
      let path = fileUrl;
      const match = path.match(/(?:uploads\/)?(scans|prescriptions)\/[\w\-.]+/i);
      if (match) path = match[0].replace(/^uploads\//, '');

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/users/scan/signed-url?path=${encodeURIComponent(path)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (!cancelled && data?.url) setSignedUrl(data.url);
        else if (!cancelled) setSignedUrl(null);
      } catch (err) {
        if (!cancelled) setSignedUrl(null);
      }
    }

    fetchSignedUrl();
    return () => { cancelled = true; };
  }, [fileUrl]);

  if (!signedUrl) return <div className="text-xs text-muted-foreground">Image unavailable</div>;

  return (
    <div className="mt-2">
      <img src={signedUrl} alt="Document" className={`${maxHeight} border rounded`} />
      <a href={signedUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-600 mt-1 hover:underline">Open</a>
    </div>
  );
}
