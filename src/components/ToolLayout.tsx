'use client';
import Link from 'next/link';
import Navbar from './Navbar';
import { ArrowLeft, Download, Share2 } from 'lucide-react';

interface Props {
  toolName: string;
  title: string;
  description: string;
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  resultUrl?: string;
  onDownload?: () => void;
}

export function ToolLayout({ toolName, title, description, leftPanel, rightPanel, resultUrl, onDownload }: Props) {
  const handleShare = async () => {
    if (navigator.share && resultUrl) {
      await navigator.share({ title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-muted hover:text-text-primary transition-colors mb-8">
          <ArrowLeft size={16} />
          <span className="text-sm">Back to all tools</span>
        </Link>
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-text-primary mb-2">{title}</h1>
          <p className="text-muted">{description}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">{leftPanel}</div>
          <div className="lg:col-span-3">
            {rightPanel}
            {resultUrl && (
              <div className="flex gap-3 mt-4">
                <button onClick={onDownload}
                  className="flex items-center gap-2 btn-primary">
                  <Download size={16} /> Download
                </button>
                <button onClick={handleShare}
                  className="flex items-center gap-2 btn-secondary">
                  <Share2 size={16} /> Share
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-muted text-sm text-center mb-4">Try another tool</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { name: 'Remove BG', href: '/tools/remove-background' },
              { name: 'Cleanup', href: '/tools/cleanup' },
              { name: 'Replace BG', href: '/tools/replace-background' },
              { name: 'Reimagine', href: '/tools/reimagine' },
              { name: 'Upscale', href: '/tools/upscale' },
              { name: 'Uncrop', href: '/tools/uncrop' },
              { name: 'Text to Image', href: '/tools/text-to-image' },
            ].filter(t => !t.href.includes(toolName)).map(t => (
              <Link key={t.href} href={t.href}
                className="text-sm text-muted hover:text-accent border border-border hover:border-accent px-4 py-2 rounded-full transition-colors">
                {t.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
