import React, { useState } from 'react';
import { 
  Globe, 
  Rocket, 
  Zap, 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Server, 
  X, 
  Layers, 
  CheckCircle2, 
  Download,
  Flame,
  Award,
  Sparkles
} from 'lucide-react';

interface FreeDeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type HostingProvider = 'VERCEL' | 'NETLIFY' | 'GITHUB_PAGES' | 'CLOUDFLARE' | 'CLOUDRUN';

export const FreeDeploymentGuideModal: React.FC<FreeDeploymentGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const [provider, setProvider] = useState<HostingProvider>('VERCEL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-cyan-500/40 rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl relative flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-500/20">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  FREE HOSTING & DEPLOYMENT
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>LIGHTNING SPEED & ZERO COST</span>
                </span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight mt-0.5">
                How to Deploy Icestock Sport TMS for Free
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Provider Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 border-b border-slate-800 pb-4">
          {[
            { id: 'VERCEL', label: 'Vercel', badge: 'Fastest 1-Click', icon: '▲' },
            { id: 'NETLIFY', label: 'Netlify', badge: 'Drag & Drop', icon: '💎' },
            { id: 'GITHUB_PAGES', label: 'GitHub Pages', badge: '100% Free', icon: '🐙' },
            { id: 'CLOUDFLARE', label: 'Cloudflare', badge: 'Edge CDN', icon: '⚡' },
            { id: 'CLOUDRUN', label: 'Cloud Run', badge: 'Production', icon: '☁️' }
          ].map((p) => {
            const isActive = provider === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setProvider(p.id as HostingProvider)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1 ${
                  isActive
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{p.icon}</span>
                  <span className="text-[9px] font-mono font-bold bg-slate-900 px-1.5 py-0.5 rounded text-slate-300">
                    {p.badge}
                  </span>
                </div>
                <div className="text-xs font-bold text-white mt-1">{p.label}</div>
              </button>
            );
          })}
        </div>

        {/* PROVIDER DETAILS */}

        {/* 1. VERCEL */}
        {provider === 'VERCEL' && (
          <div className="flex flex-col gap-5 text-xs font-mono">
            <div className="bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-500/30 p-4 rounded-2xl">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>▲ Deploy on Vercel (Global Edge Network — 0ms Cold Start)</span>
              </h4>
              <p className="text-slate-300 mt-1">
                Vercel provides free global hosting with automated SSL, lightning-fast CDN edge caching, and automated builds directly from your GitHub repository.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {/* Option A: CLI */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span>Method A: Fast Deploy via Vercel CLI (30 Seconds)</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard('npx vercel', 'cmd-vercel-1')}
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
                  >
                    {copiedId === 'cmd-vercel-1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'cmd-vercel-1' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl text-slate-200 border border-slate-800 text-xs">
                  <code>
                    # 1. Run in terminal<br />
                    <span className="text-cyan-300">npx vercel</span><br /><br />
                    # 2. Deploy directly to production<br />
                    <span className="text-cyan-300">npx vercel --prod</span>
                  </code>
                </div>
              </div>

              {/* Option B: Git Push */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span>Method B: Connect GitHub Repo to Vercel Dashboard</span>
                </span>
                <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed">
                  <li>Push your code to a GitHub repository (<code className="text-cyan-300">git push origin main</code>).</li>
                  <li>Go to <strong className="text-white">vercel.com</strong>, sign up for free, and click <strong className="text-cyan-300">"Add New Project"</strong>.</li>
                  <li>Import your GitHub repository.</li>
                  <li>Vercel automatically detects <strong className="text-white">Vite</strong>:
                    <ul className="list-disc list-inside pl-4 text-slate-400 mt-1">
                      <li>Build Command: <code className="text-cyan-300">npm run build</code></li>
                      <li>Output Directory: <code className="text-cyan-300">dist</code></li>
                    </ul>
                  </li>
                  <li>Click <strong className="text-emerald-400">"Deploy"</strong>. Your app will be live worldwide in ~20 seconds with a free <code className="text-cyan-300">.vercel.app</code> HTTPS domain!</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* 2. NETLIFY */}
        {provider === 'NETLIFY' && (
          <div className="flex flex-col gap-5 text-xs font-mono">
            <div className="bg-gradient-to-r from-teal-950/60 to-slate-900 border border-teal-500/30 p-4 rounded-2xl">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>💎 Deploy on Netlify (Drag & Drop or Git CI/CD)</span>
              </h4>
              <p className="text-slate-300 mt-1">
                Netlify offers 100GB/mo free bandwidth with instant global rollouts and automatic SPA routing support via the included <code className="text-cyan-300">_redirects</code> file.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Method 1: Instant Drag & Drop Build</span>
                <button
                  onClick={() => copyToClipboard('npm run build', 'cmd-build-net')}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
                >
                  {copiedId === 'cmd-build-net' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'cmd-build-net' ? 'Copied' : 'Copy Build Command'}</span>
                </button>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl text-slate-200 border border-slate-800">
                <code>
                  # Step 1: Build the production bundle<br />
                  <span className="text-cyan-300">npm run build</span>
                </code>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed">
                <li>Log in to <strong className="text-white">app.netlify.com/drop</strong></li>
                <li>Drag and drop the generated <strong className="text-cyan-300">dist</strong> folder onto the browser window.</li>
                <li>Your app is instantly published online with a live public URL!</li>
              </ol>
            </div>
          </div>
        )}

        {/* 3. GITHUB PAGES */}
        {provider === 'GITHUB_PAGES' && (
          <div className="flex flex-col gap-5 text-xs font-mono">
            <div className="bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-500/30 p-4 rounded-2xl">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>🐙 Deploy on GitHub Pages (100% Free Forever)</span>
              </h4>
              <p className="text-slate-300 mt-1">
                Deploy directly from your GitHub repository using GitHub Actions automated workflows.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">GitHub Actions Workflow YAML File</span>
                <button
                  onClick={() => copyToClipboard(`name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
      - id: deployment
        uses: actions/deploy-pages@v4`, 'gh-action-yaml')}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
                >
                  {copiedId === 'gh-action-yaml' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'gh-action-yaml' ? 'Copied YAML' : 'Copy Workflow File'}</span>
                </button>
              </div>
              <p className="text-slate-400 text-[11px]">
                Create file <code className="text-cyan-300">.github/workflows/deploy.yml</code> in your repository, paste this workflow, and enable Pages in repository settings!
              </p>
            </div>
          </div>
        )}

        {/* 4. CLOUDFLARE PAGES */}
        {provider === 'CLOUDFLARE' && (
          <div className="flex flex-col gap-5 text-xs font-mono">
            <div className="bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/30 p-4 rounded-2xl">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>⚡ Deploy on Cloudflare Pages (Fastest Worldwide Edge CDN)</span>
              </h4>
              <p className="text-slate-300 mt-1">
                Cloudflare Pages delivers sub-10ms latency worldwide with unlimited bandwidth on their global 300+ city Anycast network.
              </p>
            </div>

            <ol className="list-decimal list-inside space-y-2 text-slate-300 bg-slate-950 border border-slate-800 p-4 rounded-2xl leading-relaxed">
              <li>Sign in to <strong className="text-white">dash.cloudflare.com</strong> and select <strong className="text-amber-300">Workers & Pages</strong>.</li>
              <li>Click <strong className="text-cyan-300">"Create application"</strong> → <strong className="text-cyan-300">"Pages"</strong> → Connect your GitHub repository.</li>
              <li>Framework preset: <strong className="text-white">Vite</strong></li>
              <li>Build command: <code className="text-cyan-300">npm run build</code></li>
              <li>Build output directory: <code className="text-cyan-300">dist</code></li>
              <li>Click <strong className="text-emerald-400">"Save and Deploy"</strong>.</li>
            </ol>
          </div>
        )}

        {/* 5. GOOGLE CLOUD RUN */}
        {provider === 'CLOUDRUN' && (
          <div className="flex flex-col gap-5 text-xs font-mono">
            <div className="bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-500/30 p-4 rounded-2xl">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>☁️ Deploy on Google Cloud Run (Containerized Production)</span>
              </h4>
              <p className="text-slate-300 mt-1">
                High-concurrency serverless container hosting backed by Google Cloud infrastructure with free tier (2 million requests/mo).
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Google Cloud SDK Command</span>
                <button
                  onClick={() => copyToClipboard('gcloud run deploy icestock-tms --source . --port 3000 --allow-unauthenticated', 'gcloud-cmd')}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
                >
                  {copiedId === 'gcloud-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'gcloud-cmd' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl text-slate-200 border border-slate-800">
                <code>
                  gcloud run deploy icestock-tms \<br />
                  &nbsp;&nbsp;--source . \<br />
                  &nbsp;&nbsp;--port 3000 \<br />
                  &nbsp;&nbsp;--allow-unauthenticated
                </code>
              </div>
            </div>
          </div>
        )}

        {/* SPEED & OPTIMIZATION CHECKLIST */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              High Performance & Fast Loading Checklist (Pre-Configured)
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Gzip & Brotli HTTP/2 compression</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>1-Year Immutable asset caching</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero-latency local state persistence</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
