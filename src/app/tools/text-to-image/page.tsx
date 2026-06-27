'use client';
import { useState } from 'react';
import { UsageGate } from '@/components/UsageGate';
import { ToolLayout } from '@/components/ToolLayout';
import { Loader2, Type, Wand2 } from 'lucide-react';

async function incrementUsage(toolName: string) {
  const fingerprint = sessionStorage.getItem('fp') || '';
  await fetch('/api/increment-usage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fingerprint, toolName }),
  });
}

const STYLES = [
  { label: 'Realistic', prefix: 'a photorealistic' },
  { label: 'Artistic', prefix: 'an artistic painting of' },
  { label: '3D Render', prefix: 'a 3D rendered image of' },
  { label: 'Anime', prefix: 'an anime illustration of' },
];

export default function TextToImagePage() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState(STYLES[0]);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const handleProcess = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setError('');
    try {
      const fullPrompt = `${style.prefix} ${prompt}`;
      const res = await fetch('/api/text-to-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt }),
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
      await incrementUsage('text-to-image');
    } catch (e: any) {
      setError(e.message || 'Generation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'generated.jpg';
    a.click();
  };

  const leftPanel = (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-text-primary block mb-2">Style</label>
        <div className="grid grid-cols-2 gap-2">
          {STYLES.map((s) => (
            <button
              key={s.label}
              onClick={() => setStyle(s)}
              className={`py-2 px-3 rounded-btn text-sm font-semibold border transition-all ${
                style.label === s.label
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-muted hover:border-accent'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold text-text-primary block mb-2">Your prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="a futuristic city at sunset with flying cars..."
          className="w-full bg-surface border border-border rounded-xl p-4 text-text-primary text-sm placeholder-muted resize-none focus:outline-none focus:border-accent transition-colors"
          rows={5}
        />
      </div>
      {!isProcessing ? (
        <button
          onClick={handleProcess}
          disabled={!prompt.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Wand2 size={16} /> Generate Image
        </button>
      ) : (
        <button disabled className="btn-primary w-full flex items-center justify-center gap-2 opacity-70">
          <Loader2 size={16} className="animate-spin" /> Generating...
        </button>
      )}
      {error && <p className="text-error text-sm">{error}</p>}
    </div>
  );

  const rightPanel = (
    <div className="card min-h-64 flex items-center justify-center">
      {resultUrl ? (
        <img src={resultUrl} alt="Generated" className="rounded-xl max-h-96 max-w-full object-contain" />
      ) : (
        <div className="text-center text-muted">
          <Type size={48} className="mx-auto mb-4 opacity-30" />
          <p className="mb-2">Your generated image will appear here</p>
          <p className="text-xs">Powered by Clipdrop Stable Diffusion</p>
        </div>
      )}
    </div>
  );

  return (
    <UsageGate toolName="text-to-image">
      <ToolLayout
        toolName="text-to-image"
        title="Text to Image"
        description="Generate stunning images from text prompts using Stable Diffusion AI."
        leftPanel={leftPanel}
        rightPanel={rightPanel}
        resultUrl={resultUrl}
        onDownload={handleDownload}
      />
    </UsageGate>
  );
}
