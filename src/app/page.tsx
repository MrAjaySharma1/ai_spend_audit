import { AuditForm } from "@/components/AuditForm";
import { Logo } from "@/components/Logo";
import { TrendingDown, Shield, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-indigo-600/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
        {/* Nav */}
        <nav className="flex items-center justify-between mb-16">
          <Logo />
          <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-medium">
            Free · No signup required
          </span>
        </nav>

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs bg-violet-500/15 text-violet-300 border border-violet-500/25 px-4 py-2 rounded-full mb-6 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Trusted by 500+ startup teams
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            Stop overpaying
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400">
              for AI tools
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/55 max-w-xl mx-auto mb-8 leading-relaxed">
            Get a free, personalized audit of your team&apos;s AI tooling spend. Identify waste, find better alternatives,
            and see exactly how much you could save — in under 2 minutes.
          </p>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 text-sm text-white/40 flex-wrap">
            <div className="flex items-center gap-1.5">
              <TrendingDown size={14} className="text-emerald-400" />
              Avg. $340/mo saved
            </div>
            <div className="w-px h-4 bg-white/15" />
            <div className="flex items-center gap-1.5">
              <Shield size={14} className="text-violet-400" />
              No data sold
            </div>
            <div className="w-px h-4 bg-white/15" />
            <div className="flex items-center gap-1.5">
              <Zap size={14} className="text-amber-400" />
              Results in 30 seconds
            </div>
          </div>
        </div>

        {/* Form */}
        <AuditForm />
      </div>
    </main>
  );
}
