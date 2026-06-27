'use client';
import { useState } from 'react';
import { UsageGate } from '@/components/UsageGate';
import { ToolLayout } from '@/components/ToolLayout';
import { UploadZone } from '@/components/UploadZone';
import { Loader2, ArrowUpCircle } from 'lucide-react';

async function incrementUsage(toolName: string) {
  const fingerprint = sessionStorage.getItem('fp') || '';
  await fetch('/api/increment-usage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fingerprint, toolName }),
  });
}

export default function UpscalePage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [resultUrl, setResultUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [targetSize, setTargetSize] = useState(2048);

  const handleFile = (f: File) => {
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setResultUrl('');
    setError('');
    handleProcess(f);
  };

  const handleProcess = async (targetFile: File) => {
    setIsProcessing(true);
    setError('');
    try {
      const form = new FormData();
      form.append('image', targetFile);
      form.append('width', targetSize.toString());
      form.append('height', targetSize.toString());
      const res = await fetch('/api/upscale', { method: 'POST', body: form });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
      await incrementUsage('upscale');
    } catch (e: any) {
      setError(e.message || 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `upscaled-${targetSize}.png`;
    a.click();
  };

  const leftPanel = (
    <div className="space-y-4">
      <UploadZone onFile={handleFile} preview={previewUrl} label="Upload image to upscale" />
      <div>
        <p className="text-sm text-muted mb-2">Target size: {targetSize}px</p>
        <div className="flex gap-2">
          {[1024, 2048, 4096].map((s) => (
            <button
              key={s}
              onClick={() => setTargetSize(s)}
              className={`flex-1 py-2 rounded-btn text-sm font-semibold border transition-all ${
                targetSize === s
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-muted hover:border-accent'
              }`}
            >
              {s}px
            </button>
          ))}
        </div>
      </div>
      {file && !isProcessing && (
        <button
          onClick={() => handleProcess(file)}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <ArrowUpCircle size={16} /> Upscale Image
        </button>
      )}
      {isProcessing && (
        <button disabled className="btn-primary w-full flex items-center justify-center gap-2 opacity-70">
          <Loader2 size={16} className="animate-spin" /> Upscaling...
        </button>
      )}
      {error && <p className="text-error text-sm">{error}</p>}
    </div>
  );

  const rightPanel = (
    <div className="card min-h-64 flex items-center justify-center" data-testid="result-zone">
      {isProcessing ? (
        <div className="text-center text-muted" data-testid="loading-indicator">
          <Loader2 size={48} className="animate-spin mx-auto mb-4 text-accent" />
          <p>Upscaling image...</p>
        </div>
      ) : resultUrl ? (
        <div className="w-full">
          <div className="flex justify-between text-xs text-muted mb-3">
            <span>Original: {file ? (file.size / 1024).toFixed(0) + ' KB' : '-'}</span>
            <span>
              Target: {targetSize}×{targetSize}px
            </span>
          </div>
          <img
            data-testid="result-image"
            src={resultUrl}
            alt="Upscaled"
            className="rounded-xl max-h-96 max-w-full w-full object-contain"
          />
        </div>
      ) : (
        <div className="text-center text-muted">
          <ArrowUpCircle size={48} className="mx-auto mb-4 opacity-30" />
          <p>Your upscaled image will appear here</p>
        </div>
      )}
    </div>
  );

  return (
    <UsageGate toolName="upscale">
      <ToolLayout
        toolName="upscale"
        title="Upscale Image"
        description="Enhance your image resolution up to 4096px without losing quality."
        leftPanel={leftPanel}
        rightPanel={rightPanel}
        resultUrl={resultUrl}
        onDownload={handleDownload}
      />
    </UsageGate>
  );
}
