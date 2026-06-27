'use client';
import { useState, useRef } from 'react';
import { UsageGate } from '@/components/UsageGate';
import { ToolLayout } from '@/components/ToolLayout';
import { UploadZone } from '@/components/UploadZone';
import { Loader2, Wand2, Eraser } from 'lucide-react';

async function incrementUsage(toolName: string) {
  const fingerprint = sessionStorage.getItem('fp') || '';
  await fetch('/api/increment-usage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fingerprint, toolName }),
  });
}

export default function CleanupPage() {
  const [file, setFile] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [brushSize, setBrushSize] = useState(30);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setResultUrl('');
    setError('');
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      if (!canvas || !maskCanvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      maskCanvas.width = img.width;
      maskCanvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const mCtx = maskCanvas.getContext('2d')!;
      mCtx.fillStyle = 'black';
      mCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    };
    img.src = URL.createObjectURL(f);
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { x, y } = getPos(e);
    const canvas = canvasRef.current!;
    const maskCanvas = maskCanvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(239,68,68,0.5)';
    ctx.fill();
    const mCtx = maskCanvas.getContext('2d')!;
    mCtx.beginPath();
    mCtx.arc(x, y, brushSize, 0, Math.PI * 2);
    mCtx.fillStyle = 'white';
    mCtx.fill();
  };

  const handleProcess = async () => {
    if (!file || !maskCanvasRef.current) return;
    setIsProcessing(true);
    setError('');
    try {
      const form = new FormData();
      form.append('image', file);
      const maskBlob = await new Promise<Blob>((res) =>
        maskCanvasRef.current!.toBlob((b) => res(b!), 'image/png')
      );
      form.append('mask', maskBlob, 'mask.png');
      const response = await fetch('/api/cleanup', { method: 'POST', body: form });
      if (!response.ok) throw new Error(await response.text());
      const blob = await response.blob();
      setResultUrl(URL.createObjectURL(blob));
      await incrementUsage('cleanup');
    } catch (e: any) {
      setError(e.message || 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'cleanup.png';
    a.click();
  };

  const leftPanel = (
    <div className="space-y-4">
      {!file ? (
        <UploadZone onFile={handleFile} label="Upload image to clean" />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Brush size: {brushSize}px</span>
            <input
              type="range"
              min={5}
              max={80}
              value={brushSize}
              onChange={(e) => setBrushSize(+e.target.value)}
              className="w-32"
            />
          </div>
          <p className="text-xs text-muted">Paint over the area you want to remove</p>
          <canvas
            ref={canvasRef}
            className="w-full rounded-xl cursor-crosshair border border-border"
            style={{ maxHeight: '300px', objectFit: 'contain' }}
            onMouseDown={() => setIsDrawing(true)}
            onMouseUp={() => setIsDrawing(false)}
            onMouseLeave={() => setIsDrawing(false)}
            onMouseMove={draw}
          />
          <canvas ref={maskCanvasRef} className="hidden" />
          <button
            onClick={() => handleFile(file)}
            className="btn-secondary w-full text-sm"
          >
            <Eraser size={14} className="inline mr-1" />
            Reset Mask
          </button>
        </div>
      )}
      {file && !isProcessing && (
        <button
          onClick={handleProcess}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Wand2 size={16} /> Apply Cleanup
        </button>
      )}
      {isProcessing && (
        <button disabled className="btn-primary w-full flex items-center justify-center gap-2 opacity-70">
          <Loader2 size={16} className="animate-spin" /> Processing...
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
          <Wand2 size={48} className="mx-auto mb-4 opacity-30" />
          <p>Your cleaned image will appear here</p>
        </div>
      )}
    </div>
  );

  return (
    <UsageGate toolName="cleanup">
      <ToolLayout
        toolName="cleanup"
        title="Magic Cleanup"
        description="Paint over unwanted objects and watch them disappear instantly with AI."
        leftPanel={leftPanel}
        rightPanel={rightPanel}
        resultUrl={resultUrl}
        onDownload={handleDownload}
      />
    </UsageGate>
  );
}
