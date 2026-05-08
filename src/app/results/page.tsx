"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import type { AuditResult } from "@/lib/audit-engine";

interface StoredData extends AuditResult {
  aiSummary: string;
  shareId: string;
}

function ResultsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="text-center">
        <div className="w-28 h-28 rounded-full bg-white/5 mx-auto mb-6" />
        <div className="h-12 bg-white/5 rounded-xl max-w-xs mx-auto mb-4" />
        <div className="h-4 bg-white/5 rounded max-w-sm mx-auto" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-white/5 rounded-2xl" />
      ))}
    </div>
  );
}

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get("id");
  const [data, setData] = useState<StoredData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("audit-result");
    if (!raw) {
      router.push("/");
      return;
    }
    try {
      const parsed = JSON.parse(raw) as StoredData;
      setData(parsed);
    } catch {
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-600/8 blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-purple-600/8 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        <nav className="flex items-center justify-between mb-12">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo />
          </Link>
          <Link
            href="/"
            className="text-sm text-white/50 hover:text-white transition-colors border border-white/10 hover:border-white/25 px-4 py-2 rounded-xl"
          >
            Run New Audit →
          </Link>
        </nav>

        {loading || !data ? (
          <ResultsSkeleton />
        ) : (
          <ResultsDashboard
            result={data}
            aiSummary={data.aiSummary}
            shareId={idFromUrl || data.shareId}
          />
        )}
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<ResultsSkeleton />}>
      <ResultsContent />
    </Suspense>
  );
}
