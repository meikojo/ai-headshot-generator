'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Zap, Loader2 } from 'lucide-react';

function SuccessContent() {
  const [seconds, setSeconds] = useState(5);
  const params = useSearchParams();

  useEffect(() => {
    const t = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) { clearInterval(t); window.location.href = '/'; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="card max-w-md w-full text-center p-10">
      <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="text-success" size={40} />
      </div>
      <h1 className="text-3xl font-extrabold text-text-primary mb-3">Payment Successful!</h1>
      <p className="text-muted mb-8">You now have unlimited access to all 7 AI tools. Enjoy!</p>
      <Link href="/" className="btn-primary inline-flex items-center gap-2">
        <Zap size={16} /> Start Creating
      </Link>
      <p className="text-muted text-xs mt-6">Redirecting in {seconds}s...</p>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="card max-w-md w-full text-center p-10">
          <Loader2 className="animate-spin text-accent mx-auto" size={40} />
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
