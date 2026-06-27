'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Scissors, Wand2, Image, Sparkles, ArrowUpCircle, Maximize2, Type, Star, Check, Upload, Cpu, Download, ArrowRight } from 'lucide-react';

const tools = [
  {
    icon: <Scissors className="text-accent" size={28} />,
    name: 'Remove Background',
    desc: 'Instantly remove any background with AI precision',
    href: '/tools/remove-background',
    gradient: 'from-accent/10 to-transparent',
  },
  {
    icon: <Wand2 className="text-purple" size={28} />,
    name: 'Magic Cleanup',
    desc: 'Erase unwanted objects with a brush stroke',
    href: '/tools/cleanup',
    gradient: 'from-purple/10 to-transparent',
  },
  {
    icon: <Image className="text-green-400" size={28} />,
    name: 'Replace Background',
    desc: 'Swap backgrounds with beautiful presets',
    href: '/tools/replace-background',
    gradient: 'from-green-500/10 to-transparent',
  },
  {
    icon: <Sparkles className="text-yellow-400" size={28} />,
    name: 'Reimagine',
    desc: 'Generate creative AI variations of any photo',
    href: '/tools/reimagine',
    gradient: 'from-yellow-500/10 to-transparent',
  },
  {
    icon: <ArrowUpCircle className="text-pink-400" size={28} />,
    name: 'Upscale Image',
    desc: 'Enhance resolution up to 4x without quality loss',
    href: '/tools/upscale',
    gradient: 'from-pink-500/10 to-transparent',
  },
  {
    icon: <Maximize2 className="text-orange-400" size={28} />,
    name: 'Uncrop (Outpaint)',
    desc: 'Expand your image beyond its original borders',
    href: '/tools/uncrop',
    gradient: 'from-orange-500/10 to-transparent',
  },
  {
    icon: <Type className="text-cyan-400" size={28} />,
    name: 'Text to Image',
    desc: 'Generate stunning images from text prompts',
    href: '/tools/text-to-image',
    gradient: 'from-cyan-500/10 to-transparent',
  },
];

const steps = [
  { icon: <Upload size={28} className="text-accent" />, title: 'Upload', desc: 'Drop your image or click to browse. We accept JPEG, PNG, and WebP up to 10MB.' },
  { icon: <Cpu size={28} className="text-purple" />, title: 'AI Processes', desc: 'Our AI engine powered by Clipdrop analyzes and transforms your image in seconds.' },
  { icon: <Download size={28} className="text-green-400" />, title: 'Download', desc: 'Get your high-quality result instantly. No watermarks, no sign-up required.' },
];

const reviews = [
  { name: 'Sarah K.', text: 'The background removal is insanely accurate. Saved me hours of Photoshop work!' },
  { name: 'Mike T.', text: 'Used the upscaler for my product photos. The quality is unbelievable for free.' },
  { name: 'Layla A.', text: 'Text to image feature is mind-blowing. Generated a full ad campaign in minutes.' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-24 px-4 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 text-accent text-sm font-semibold px-4 py-2 rounded-full mb-8">
          <Sparkles size={14} /> 7 AI Tools · Free · No Signup
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-text-primary leading-tight mb-6">
          Professional <span className="gradient-text">AI Image Tools</span>
        </h1>
        <p className="text-xl text-muted max-w-2xl mx-auto mb-10">
          Remove backgrounds, enhance photos, generate images — all powered by Clipdrop AI and completely free to try.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/tools/remove-background"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-accent to-purple text-white font-bold px-8 py-4 rounded-btn text-lg hover:opacity-90 transition-opacity">
            Try Free — No Signup <ArrowRight size={18} />
          </Link>
          <Link href="#tools"
            className="inline-flex items-center gap-2 btn-secondary text-lg px-8 py-4">
            See All 7 Tools
          </Link>
        </div>
      </section>

      {/* Tools Grid */}
      <section id="tools" className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-text-primary mb-4">7 Powerful AI Tools</h2>
          <p className="text-muted text-lg">Each tool gives you 3 free tries — no credit card, no signup</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href}
              className={`card bg-gradient-to-br ${tool.gradient} hover:border-accent hover:shadow-glow hover:-translate-y-1 transition-all duration-300 group`}>
              <div className="mb-4">{tool.icon}</div>
              <h3 className="font-bold text-text-primary mb-2 group-hover:text-accent transition-colors">{tool.name}</h3>
              <p className="text-muted text-sm leading-relaxed">{tool.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-accent text-sm font-semibold">
                Try Free <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-surface/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-text-primary mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-surface border border-border rounded-full flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <div className="text-accent font-bold text-sm mb-2">STEP {i + 1}</div>
                <h3 className="text-xl font-bold text-text-primary mb-2">{step.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-text-primary mb-4">Simple Pricing</h2>
          <p className="text-muted">Start free. Upgrade when you need more.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-bold text-text-primary mb-1">Pay Per Use</h3>
            <div className="text-5xl font-extrabold text-accent mb-2">$3</div>
            <p className="text-muted text-sm mb-6">30 credits · use any tool</p>
            <ul className="space-y-2 mb-6">
              {['30 API credits', 'All 7 tools', 'No expiry', 'HD downloads'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted">
                  <Check size={14} className="text-success" /> {f}
                </li>
              ))}
            </ul>
            <Link href="#" className="block btn-secondary text-center">Get Started</Link>
          </div>
          <div className="card border-accent shadow-glow">
            <div className="inline-block bg-accent text-white text-xs font-bold px-3 py-1 rounded-full mb-3">MOST POPULAR</div>
            <h3 className="text-xl font-bold text-text-primary mb-1">Unlimited</h3>
            <div className="text-5xl font-extrabold gradient-text mb-2">$12<span className="text-2xl">/mo</span></div>
            <p className="text-muted text-sm mb-6">Unlimited all tools · cancel anytime</p>
            <ul className="space-y-2 mb-6">
              {['Unlimited credits', 'All 7 tools', 'Priority processing', 'API access', 'HD downloads'].map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted">
                <Check size={14} className="text-success" /> {f}
              </li>
              ))}
            </ul>
            <Link href="#" className="block text-center py-3 rounded-btn font-semibold bg-gradient-to-r from-accent to-purple text-white hover:opacity-90 transition-opacity">Get Unlimited</Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 bg-surface/30">
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-5xl font-extrabold gradient-text mb-2">50,000+</div>
          <p className="text-muted text-lg mb-10">creators trust AI Studio every month</p>
          <div className="flex justify-center gap-1 mb-10">
            {[...Array(5)].map((_, i) => <Star key={i} size={24} className="text-yellow-400 fill-yellow-400" />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r, i) => (
              <div key={i} className="card text-left">
                <p className="text-muted text-sm mb-4">&ldquo;{r.text}&rdquo;</p>
                <p className="font-semibold text-text-primary text-sm">{r.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted text-sm">© 2025 AI Studio. All rights reserved.</p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <Link key={l} href="#" className="text-muted hover:text-text-primary text-sm transition-colors">{l}</Link>
            ))}
            <Link href="/admin" className="text-muted hover:text-text-primary text-sm transition-colors">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
