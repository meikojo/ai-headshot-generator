'use client';
import { useState, useEffect } from 'react';
import { Settings, Lock, Save, Loader2, KeyRound, Cpu, Sliders } from 'lucide-react';

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [settings, setSettings] = useState({
    huggingface_api_key: '',
    model_text_to_image: '',
    model_cleanup: '',
    model_upscale: '',
    model_reimagine: '',
    model_uncrop: '',
    inference_steps: '',
    cfg_scale: '',
    negative_prompt: '',
    width: '',
    height: '',
    rate_limit_free: '',
  });

  const fetchSettings = async (pwd: string) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${pwd}` },
      });
      if (!res.ok) {
        throw new Error('Invalid password or unauthorized');
      }
      const data = await res.json();
      setSettings(data);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSettings(password);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4 relative overflow-hidden">
        {/* Decorative ambient light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="card max-w-md w-full p-10 relative z-10 border border-white/5 shadow-2xl backdrop-blur-xl">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-tr from-accent to-purple-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
              <Lock className="text-white transform -rotate-3" size={36} />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-center mb-2 text-text-primary">Admin Access</h1>
          <p className="text-muted text-center mb-8">Enter your secure passcode to manage AI settings</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface/50 border border-border rounded-xl px-4 py-3 text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-300"
                placeholder="Enter password..."
                required
              />
            </div>
            {error && (
              <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <span className="shrink-0">⚠️</span> {error}
              </div>
            )}
            <button 
              type="submit" 
              disabled={isLoading} 
              className="btn-primary w-full py-3 flex justify-center gap-2 text-base shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all duration-300"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Unlock Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-bg relative overflow-hidden">
      {/* Decorative ambient lights */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto p-8 relative z-10">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4 bg-surface/30 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-accent to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <Settings className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">System Control</h1>
              <p className="text-muted text-sm mt-1">Manage API keys and configure AI models</p>
            </div>
          </div>
          <button 
            onClick={handleSave} 
            disabled={isLoading} 
            className="btn-primary flex items-center gap-2 px-6 py-3 shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all duration-300"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Deploy Changes
          </button>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-error/10 text-error rounded-xl border border-error/20 flex items-center gap-3 animate-in fade-in">
            <span className="text-xl">⚠️</span> {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-success/10 text-success rounded-xl border border-success/20 flex items-center gap-3 animate-in fade-in">
            <span className="text-xl">✅</span> {success}
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8">
          {/* API Keys Column */}
          <div className="lg:col-span-4 space-y-8">
            <div className="card p-6 border border-white/5 bg-surface/40 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                  <KeyRound size={20} />
                </div>
                <h2 className="text-xl font-bold text-text-primary">Credentials</h2>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">Hugging Face API Key</label>
                <input
                  type="password"
                  value={settings.huggingface_api_key}
                  onChange={(e) => setSettings({ ...settings, huggingface_api_key: e.target.value })}
                  className="w-full bg-bg/50 border border-border rounded-xl px-4 py-3 text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  placeholder="hf_..."
                />
                <p className="text-xs text-muted leading-relaxed">
                  Required for generative features (Text-to-Image, Cleanup, Upscale, etc.)
                </p>
              </div>
            </div>

            <div className="card p-6 border border-white/5 bg-surface/40 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                  <Sliders size={20} />
                </div>
                <h2 className="text-xl font-bold text-text-primary">Site Controls</h2>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">Rate Limit (Attempts/IP/Fingerprint)</label>
                <input
                  type="text"
                  value={settings.rate_limit_free}
                  onChange={(e) => setSettings({ ...settings, rate_limit_free: e.target.value })}
                  className="w-full bg-bg/50 border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  placeholder="e.g. 10"
                />
                <p className="text-xs text-muted leading-relaxed">
                  Max free generations per IP/Fingerprint daily.
                </p>
              </div>
            </div>
            
            <div className="card p-6 border border-white/5 bg-surface/40 backdrop-blur-md flex flex-col items-center justify-center text-center space-y-3">
               <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success mb-2">
                 <span className="text-xl">🚀</span>
               </div>
               <h3 className="font-bold text-text-primary">Zero-Cost Mode Active</h3>
               <p className="text-sm text-muted">All background tools are running locally via WASM.</p>
            </div>
          </div>

          {/* AI Models Column */}
          <div className="lg:col-span-8 space-y-8">
            <div className="card p-6 border border-white/5 bg-surface/40 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Cpu size={20} />
                </div>
                <h2 className="text-xl font-bold text-text-primary">Model Configuration</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-secondary">Text to Image</label>
                  <input
                    type="text"
                    value={settings.model_text_to_image}
                    onChange={(e) => setSettings({ ...settings, model_text_to_image: e.target.value })}
                    className="w-full bg-bg/50 border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-secondary">Cleanup (Inpainting)</label>
                  <input
                    type="text"
                    value={settings.model_cleanup}
                    onChange={(e) => setSettings({ ...settings, model_cleanup: e.target.value })}
                    className="w-full bg-bg/50 border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-secondary">Upscale (Super Resolution)</label>
                  <input
                    type="text"
                    value={settings.model_upscale}
                    onChange={(e) => setSettings({ ...settings, model_upscale: e.target.value })}
                    className="w-full bg-bg/50 border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-secondary">Reimagine (Variations)</label>
                  <input
                    type="text"
                    value={settings.model_reimagine}
                    onChange={(e) => setSettings({ ...settings, model_reimagine: e.target.value })}
                    className="w-full bg-bg/50 border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-text-secondary">Uncrop (Outpainting)</label>
                  <input
                    type="text"
                    value={settings.model_uncrop}
                    onChange={(e) => setSettings({ ...settings, model_uncrop: e.target.value })}
                    className="w-full bg-bg/50 border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="card p-6 border border-white/5 bg-surface/40 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Sliders size={20} />
                </div>
                <h2 className="text-xl font-bold text-text-primary">Advanced AI Settings</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-secondary">Inference Steps</label>
                  <input
                    type="text"
                    value={settings.inference_steps}
                    onChange={(e) => setSettings({ ...settings, inference_steps: e.target.value })}
                    className="w-full bg-bg/50 border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                    placeholder="e.g. 20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-secondary">CFG Scale (Guidance Scale)</label>
                  <input
                    type="text"
                    value={settings.cfg_scale}
                    onChange={(e) => setSettings({ ...settings, cfg_scale: e.target.value })}
                    className="w-full bg-bg/50 border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                    placeholder="e.g. 7.5"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-secondary">Output Width (px)</label>
                  <input
                    type="text"
                    value={settings.width}
                    onChange={(e) => setSettings({ ...settings, width: e.target.value })}
                    className="w-full bg-bg/50 border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                    placeholder="e.g. 1024"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-secondary">Output Height (px)</label>
                  <input
                    type="text"
                    value={settings.height}
                    onChange={(e) => setSettings({ ...settings, height: e.target.value })}
                    className="w-full bg-bg/50 border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                    placeholder="e.g. 1024"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-text-secondary">Negative Prompt</label>
                  <input
                    type="text"
                    value={settings.negative_prompt}
                    onChange={(e) => setSettings({ ...settings, negative_prompt: e.target.value })}
                    className="w-full bg-bg/50 border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                    placeholder="e.g. blurry, low quality"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
