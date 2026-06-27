'use client';
import { useState } from 'react';
import { UsageGate } from '@/components/UsageGate';
import { ToolLayout } from '@/components/ToolLayout';
import { UploadZone } from '@/components/UploadZone';
import { Loader2, Scissors } from 'lucide-react';

async function incrementUsage(toolName: string) {
  const fingerprint = sessionStorage.getItem('fp') || '';
  await fetch('/api/increment-usage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fingerprint, toolName }),
  });
}

export default function RemoveBackgroundPage() {
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
      const formData = new FormData();
      formData.append('image', targetFile);

      const response = await fetch('/api/remove-background', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const blob = await response.blob();
      setResultUrl(URL.createObjectURL(blob));
      await incrementUsage('remove-bg');
    } catch (e: any) {
      setError(e.message || 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'removed-background.png';
    a.click();
  };

  const leftPanel = (
    <div className="space-y-4">
      <UploadZone onFile={handleFile} preview={previewUrl} label="Upload your image" />
      {isProcessing && (
        <button disabled className="btn-primary w-full flex items-center justify-center gap-2 opacity-70">
          <Loader2 size={16} className="animate-spin" /> Processing...
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
          <p>Removing background...</p>
        </div>
      ) : resultUrl ? (
        <div className="relative">
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              backgroundImage:
                'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAACVJREFUOI1j+P///38GPEBJSYmBgYGBgZGSkhINAAAA//8DAJ96C8sBUE8TAAAAAElFTkSuQmCC")',
              backgroundSize: '20px 20px',
            }}
          ></div>
          <img
            data-testid="result-image"
            src={resultUrl}
            alt="Result"
            className="relative rounded-xl max-h-96 max-w-full object-contain"
          />
        </div>
      ) : (
        <div className="text-center text-muted">
          <Scissors size={48} className="mx-auto mb-4 opacity-30" />
          <p>Your result will appear here</p>
        </div>
      )}
    </div>
  );

  return (
    <UsageGate toolName="remove-bg">
      <ToolLayout
        toolName="remove-bg"
        title="Remove Background"
        description="Instantly remove any background with AI precision. Works on people, products, animals, and more."
        leftPanel={leftPanel}
        rightPanel={rightPanel}
        resultUrl={resultUrl}
        onDownload={handleDownload}
      />
    </UsageGate>
  );
}
