'use client';
import { useState } from 'react';
import { UsageGate } from '@/components/UsageGate';
import { ToolLayout } from '@/components/ToolLayout';
import { UploadZone } from '@/components/UploadZone';
import { Loader2, Sparkles } from 'lucide-react';

async function incrementUsage(toolName: string) {
  const fingerprint = sessionStorage.getItem('fp') || '';
  await fetch('/api/increment-usage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fingerprint, toolName }),
  });
}

export default function ReimagingPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [resultUrl, setResultUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

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
      const res = await fetch('/api/reimagine', { method: 'POST', body: form });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
      await incrementUsage('reimagine');
    } catch (e: any) {
      setError(e.message || 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'reimagined.jpg';
    a.click();
  };

  const leftPanel = (
    <div className="space-y-4">
      <UploadZone onFile={handleFile} preview={previewUrl} label="Upload image to reimagine" />
      {file && !isProcessing && (
        <button
          onClick={() => handleProcess(file)}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Sparkles size={16} /> Reimagine
        </button>
      )}
      {isProcessing && (
        <button disabled className="btn-primary w-full flex items-center justify-center gap-2 opacity-70">
          <Loader2 size={16} className="animate-spin" /> Generating variation...
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
          <p>Reimagining image...</p>
        </div>
      ) : resultUrl ? (
        <div className="grid grid-cols-2 gap-4 w-full">
          <div>
            <p className="text-xs text-muted mb-2 text-center">Original</p>
            <img
              src={previewUrl}
              alt="Original"
              className="rounded-xl w-full object-contain max-h-64"
            />
          </div>
          <div>
            <p className="text-xs text-muted mb-2 text-center">AI Variation</p>
            <img
              data-testid="result-image"
              src={resultUrl}
              alt="Result"
              className="rounded-xl w-full object-contain max-h-64"
            />
          </div>
        </div>
      ) : (
        <div className="text-center text-muted">
          <Sparkles size={48} className="mx-auto mb-4 opacity-30" />
          <p>Your AI variation will appear here</p>
        </div>
      )}
    </div>
  );

  return (
    <UsageGate toolName="reimagine">
      <ToolLayout
        toolName="reimagine"
        title="Reimagine"
        description="Generate stunning AI creative variations of any photo in seconds."
        leftPanel={leftPanel}
        rightPanel={rightPanel}
        resultUrl={resultUrl}
        onDownload={handleDownload}
      />
    </UsageGate>
  );
}
