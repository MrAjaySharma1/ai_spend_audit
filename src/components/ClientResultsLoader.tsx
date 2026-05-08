"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import type { AuditResult } from "@/lib/audit-engine";

interface StoredData extends AuditResult {
  aiSummary: string;
  shareId: string;
}

export function ClientResultsLoader({ shareId }: { shareId: string }) {
  const router = useRouter();
  const [data, setData] = useState<StoredData | null>(null);

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
    }
  }, [router]);

  if (!data) return null;

  return (
    <ResultsDashboard
      result={data}
      aiSummary={data.aiSummary}
      shareId={shareId}
    />
  );
}
