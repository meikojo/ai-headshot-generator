'use client';
import { useState } from 'react';
import { UsageGate } from '@/components/UsageGate';
import { ToolLayout } from '@/components/ToolLayout';
import { UploadZone } from '@/components/UploadZone';
import { Loader2, Maximize2 } from 'lucide-react';

async function incrementUsage(toolName: string) {
  const fingerprint = sessionStorage.getItem('fp') || '';
  await fetch('/api/increment-usage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fingerprint, toolName }),
  });
}

export default function UncropPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [resultUrl, setResultUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [extend, setExtend] = useState({ left: 256, right: 256, up: 128, down: 128 });

  const handleFile = (f: File) => {
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setResultUrl('');
    setError('');
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError('');
    try {
      const form = new FormData();
      form.append('image', file);
      form.append('left', extend.left.toString());
      form.append('right', extend.right.toString());
      form.append('up', extend.up.toString());
      form.append('down', extend.down.toString());
      const res = await fetch('/api/uncrop', { method: 'POST', body: form });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
      await incrementUsage('uncrop');
    } catch (e: any) {
      setError(e.message || 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'uncropped.png';
    a.click();
  };

  const ExtendControl = ({
    label,
    side,
  }: {
    label: string;
    side: keyof typeof extend;
  }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted w-16">{label}</span>
      <input
        type="range"
        min={0}
        max={512}
        step={64}
        value={extend[side]}
        onChange={(e) => setExtend((prev) => ({ ...prev, [side]: +e.target.value }))}
        className="flex-1 mx-3"
      />
      <span className="text-sm text-text-primary w-12 text-right">{extend[side]}px</span>
    </div>
  );

  const leftPanel = (
    <div className="space-y-4">
      <UploadZone onFile={handleFile} preview={previewUrl} label="Upload image to expand" />
      <div className="card space-y-3">
        <p className="text-sm font-semibold text-text-primary">Expansion controls</p>
        <ExtendControl label="Left" side="left" />
        <ExtendControl label="Right" side="right" />
        <ExtendControl label="Top" side="up" />
        <ExtendControl label="Bottom" side="down" />
      </div>
      {file && !isProcessing && (
        <button
          onClick={handleProcess}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Maximize2 size={16} /> Expand Image
        </button>
      )}
      {isProcessing && (
        <button disabled className="btn-primary w-full flex items-center justify-center gap-2 opacity-70">
          <Loader2 size={16} className="animate-spin" /> Expanding...
        </button>
      )}
      {error && <p className="text-error text-sm">{error}</p>}
    </div>
  );

  const rightPanel = (
    <div className="card min-h-64 flex items-center justify-center">
      {resultUrl ? (
        <img src={resultUrl} alt="Result" className="rounded-xl max-h-96 max-w-full object-contain" />
      ) : (
        <div className="text-center text-muted">
          <Maximize2 size={48} className="mx-auto mb-4 opacity-30" />
          <p>Your expanded image will appear here</p>
        </div>
      )}
    </div>
  );

  return (
    <UsageGate toolName="uncrop">
      <ToolLayout
        toolName="uncrop"
        title="Uncrop (Outpaint)"
        description="Expand your image beyond its original borders using generative AI."
        leftPanel={leftPanel}
        rightPanel={rightPanel}
        resultUrl={resultUrl}
        onDownload={handleDownload}
      />
    </UsageGate>
  );
}
