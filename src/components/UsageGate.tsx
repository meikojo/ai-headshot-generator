'use client';
import { useUsageLimit } from '@/hooks/useLimit';
import { Loader2, Lock, Zap } from 'lucide-react';

interface Props {
  toolName: string;
  children: React.ReactNode;
}

function PlanCard({ name, price, desc, priceId, highlighted, toolName }: any) {
  const handleCheckout = async () => {
    const fp = sessionStorage.getItem('fp') || '';
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, toolName, fingerprint: fp }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <div className={`card flex flex-col items-center gap-3 p-8 ${
      highlighted ? 'border-accent shadow-glow' : ''
    }`}>
      {highlighted && (
        <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
      )}
      <h3 className="text-xl font-bold text-text-primary">{name}</h3>
      <div className="text-4xl font-extrabold gradient-text">{price}</div>
      <p className="text-muted text-sm text-center">{desc}</p>
      <button onClick={handleCheckout} className={`w-full py-3 rounded-btn font-semibold transition-all ${
        highlighted
          ? 'bg-gradient-to-r from-accent to-purple text-white hover:opacity-90'
          : 'btn-secondary'
      }`}>
        Get Started
      </button>
    </div>
  );
}

export function UsageGate({ toolName, children }: Props) {
  const { allowed, remaining, isPaid, isLoading } = useUsageLimit(toolName);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-accent" size={36} />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="text-error" size={28} />
        </div>
        <h2 className="text-3xl font-extrabold text-text-primary mb-2">You've used your 3 free tries</h2>
        <p className="text-muted mb-10">Unlock unlimited access to all 7 AI tools</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <PlanCard
            name="Pay Per Use"
            price="$3"
            desc="30 credits — use any tool"
            priceId={process.env.NEXT_PUBLIC_STRIPE_PACK_PRICE_ID}
            toolName={toolName}
          />
          <PlanCard
            name="Unlimited"
            price="$12/mo"
            desc="Unlimited all 7 tools, forever"
            priceId={process.env.NEXT_PUBLIC_STRIPE_SUB_PRICE_ID}
            highlighted
            toolName={toolName}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {!isPaid && remaining <= 3 && (
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="flex items-center gap-1.5 bg-surface border border-border text-sm text-muted px-4 py-2 rounded-full">
            <Zap size={14} className="text-accent" />
            <span data-testid="free-uses-remaining" className="text-text-primary font-semibold">{remaining}</span> free {remaining === 1 ? 'try' : 'tries'} remaining
          </span>
        </div>
      )}
      {children}
    </>
  );
}
