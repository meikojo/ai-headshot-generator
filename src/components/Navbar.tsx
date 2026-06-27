'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Zap } from 'lucide-react';

const tools = [
  { name: 'Remove BG', href: '/tools/remove-background' },
  { name: 'Cleanup', href: '/tools/cleanup' },
  { name: 'Replace BG', href: '/tools/replace-background' },
  { name: 'Reimagine', href: '/tools/reimagine' },
  { name: 'Upscale', href: '/tools/upscale' },
  { name: 'Uncrop', href: '/tools/uncrop' },
  { name: 'Text to Image', href: '/tools/text-to-image' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 w-full z-50 bg-bg/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Zap className="text-accent" size={22} />
          <span className="gradient-text">AI Studio</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {tools.map(t => (
            <Link key={t.href} href={t.href}
              className="text-muted hover:text-text-primary text-sm px-3 py-2 rounded-lg hover:bg-surface transition-colors">
              {t.name}
            </Link>
          ))}
        </div>
        <Link href="#pricing"
          className="hidden md:block bg-gradient-to-r from-accent to-purple text-white font-semibold text-sm px-4 py-2 rounded-btn hover:opacity-90 transition-opacity">
          Get Unlimited
        </Link>
        <button className="md:hidden text-muted" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-surface border-t border-border p-4 space-y-1">
          {tools.map(t => (
            <Link key={t.href} href={t.href} onClick={() => setOpen(false)}
              className="block text-muted hover:text-text-primary px-3 py-2 rounded-lg hover:bg-bg transition-colors">
              {t.name}
            </Link>
          ))}
          <Link href="#pricing" onClick={() => setOpen(false)}
            className="block bg-gradient-to-r from-accent to-purple text-white font-semibold px-3 py-2 rounded-btn text-center mt-2">
            Get Unlimited
          </Link>
        </div>
      )}
    </nav>
  );
}
