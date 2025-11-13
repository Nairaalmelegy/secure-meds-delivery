import React, { useEffect, useState } from 'react';
import { io as ioClient } from 'socket.io-client';
import { apiClient } from '../lib/api';

export default function PrescriptionOcrViewer({ prescriptionId, initialText, token, onSave }: { prescriptionId: string; initialText?: string; token?: string; onSave?: (text: string) => void }) {
  const [text, setText] = useState(initialText || '');
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    const socketUrl = (window as any).__ENV__?.SOCKET_IO_URL || (window.location.origin.replace(/:\d+$/, ':3000'));
    const socket = ioClient(socketUrl, { transports: ['websocket'] });
    socket.on('connect', () => {
      socket.emit('joinPrescription', prescriptionId);
    });
    socket.on('ocr:completed', (payload: any) => {
      if (payload && payload.prescriptionId === prescriptionId) {
        setText(payload.ocrText || '');
      }
    });
    return () => {
      try { socket.disconnect(); } catch (e) {}
    };
  }, [prescriptionId]);

  const save = async () => {
    try {
      const res = await apiClient.put(`/api/prescriptions/${prescriptionId}/ocr`, { ocrText: text });
      if (onSave) onSave(text);
      setEditing(false);
    } catch (err) {
      console.error('Failed to save OCR text', err);
      alert('Failed to save OCR text');
    }
  };

  return (
    <div className="mt-4">
      <div className="font-medium text-sm mb-2">Extracted Text</div>
      {!editing ? (
        <div>
          <pre className="whitespace-pre-wrap bg-gray-50 p-3 rounded border text-sm">{text || 'No OCR text yet'}</pre>
          <div className="mt-2 flex gap-2">
            <button className="px-3 py-1 border rounded text-sm" onClick={() => setEditing(true)}>Edit</button>
          </div>
        </div>
      ) : (
        <div>
          <textarea className="w-full border rounded p-2 text-sm" rows={6} value={text} onChange={e => setText(e.target.value)} />
          <div className="mt-2 flex gap-2">
            <button className="px-3 py-1 bg-green-600 text-white rounded text-sm" onClick={save}>Save</button>
            <button className="px-3 py-1 border rounded text-sm" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
