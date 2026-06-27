import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Image Studio — 7 Free AI Image Tools',
  description: 'Remove backgrounds, enhance photos, generate images — all free, no signup needed.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg text-text-primary min-h-screen">{children}</body>
    </html>
  );
}
