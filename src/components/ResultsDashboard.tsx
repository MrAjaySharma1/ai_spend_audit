"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Info,
  Share2,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LeadCaptureModal } from "@/components/LeadCaptureModal";
import type { AuditResult } from "@/lib/audit-engine";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ResultsDashboardProps {
  result: AuditResult;
  aiSummary: string;
  shareId: string;
}

const severityConfig = {
  critical: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", label: "Critical" },
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", label: "Warning" },
  info: { icon: Info, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30", label: "Info" },
  ok: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", label: "Optimized" },
};

export function ResultsDashboard({ result, aiSummary, shareId }: ResultsDashboardProps) {
  const [copied, setCopied] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/results/${shareId}` : "";

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const chartData = result.findings.map((f) => ({
    name: f.toolName.split(" ")[0], // short name
    current: f.currentMonthlyCost,
    recommended: f.recommendedMonthlyCost,
    savings: f.savingsPerMonth,
  }));

  const scoreColor =
    result.overallScore >= 80
      ? "text-emerald-400"
      : result.overallScore >= 50
      ? "text-amber-400"
      : "text-red-400";

  return (
    <>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        {/* Score Ring */}
        <div className="inline-flex items-center justify-center w-28 h-28 rounded-full border-4 border-white/10 bg-white/5 mb-6 relative">
          <div
            className={cn("text-4xl font-bold", scoreColor)}
            style={{
              background: `conic-gradient(from 0deg, currentColor ${result.overallScore}%, transparent ${result.overallScore}%)`,
            }}
          >
            {result.overallScore}
          </div>
          <div className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(${result.overallScore >= 80 ? '#34d399' : result.overallScore >= 50 ? '#fbbf24' : '#f87171'} ${result.overallScore * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
              borderRadius: '50%',
            }}
          />
          <div className="absolute inset-2 bg-[#0a0a14] rounded-full flex items-center justify-center flex-col">
            <span className={cn("text-3xl font-bold", scoreColor)}>{result.overallScore}</span>
            <span className="text-xs text-white/40">/ 100</span>
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
          {result.monthlySavings > 0 ? (
            <>
              Save{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
                {formatCurrency(result.monthlySavings)}/mo
              </span>
            </>
          ) : (
            <>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Spend Optimized
              </span>{" "}
              ✓
            </>
          )}
        </h1>

        <p className="text-white/60 text-lg mb-2">{result.summaryLine}</p>

        {result.monthlySavings > 0 && (
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{formatCurrency(result.monthlySavings)}</div>
              <div className="text-sm text-white/50">Monthly Savings</div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">{formatCurrency(result.annualSavings)}</div>
              <div className="text-sm text-white/50">Annual Savings</div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{formatCurrency(result.currentMonthlyTotal)}</div>
              <div className="text-sm text-white/50">Current Monthly</div>
            </div>
          </div>
        )}

        {/* CTA for high savings */}
        {result.consultationRecommended && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-500/10 to-purple-500/10 p-6 max-w-xl mx-auto"
          >
            <div className="flex items-start gap-3 text-left">
              <Sparkles className="text-violet-400 mt-1 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-white mb-1">
                  You&apos;re leaving {formatCurrency(result.annualSavings)}/year on the table
                </p>
                <p className="text-sm text-white/60 mb-4">
                  Our team at Credex can implement these changes, negotiate enterprise contracts, and set up
                  ongoing spend monitoring — typically recovering the consultation cost in week one.
                </p>
                <Button
                  onClick={() => setShowLeadModal(true)}
                  className="bg-gradient-to-r from-violet-600 to-purple-600"
                >
                  Book Free Consultation
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* AI Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <Card className="border-white/10 bg-gradient-to-br from-violet-500/5 to-purple-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-violet-400" />
              <CardTitle className="text-base">AI Audit Summary</CardTitle>
              <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">
                AI-generated
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-white/70 leading-relaxed text-sm">{aiSummary}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Chart */}
      {chartData.some((d) => d.current > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <Card className="border-white/10">
            <CardHeader>
              <CardTitle className="text-base">Cost Comparison by Tool</CardTitle>
              <CardDescription>Current vs recommended monthly spend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barGap={4} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }}
                      formatter={(value: any) => [`$${Number(value).toFixed(0)}`, ""]}
                    />
                    <Bar dataKey="current" name="Current" radius={[6, 6, 0, 0]}>
                      {chartData.map((_, index) => (
                        <Cell key={index} fill="rgba(139, 92, 246, 0.6)" />
                      ))}
                    </Bar>
                    <Bar dataKey="recommended" name="Recommended" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.savings > 0 ? "rgba(52, 211, 153, 0.7)" : "rgba(139, 92, 246, 0.6)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-4 mt-3 justify-center">
                <div className="flex items-center gap-1.5 text-xs text-white/50">
                  <div className="w-3 h-3 rounded-sm bg-violet-500/60" />
                  Current
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/50">
                  <div className="w-3 h-3 rounded-sm bg-emerald-500/70" />
                  Recommended
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Per-Tool Findings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Tool-by-Tool Breakdown</h2>
        <div className="space-y-3">
          {result.findings.map((finding, idx) => {
            const config = severityConfig[finding.severity];
            const Icon = config.icon;
            return (
              <motion.div
                key={finding.toolId + idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
              >
                <Card className={cn("border", config.bg)}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={cn("mt-0.5 flex-shrink-0", config.color)}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-semibold text-white text-sm">{finding.toolName}</span>
                            <span className={cn("text-xs px-2 py-0.5 rounded-full bg-current/10", config.color)}>
                              {config.label}
                            </span>
                          </div>
                          {finding.issue && (
                            <p className="text-sm text-white/80 mb-2">{finding.issue}</p>
                          )}
                          <p className="text-xs text-white/50 leading-relaxed">{finding.reasoning}</p>
                          {finding.recommendedPlanName && finding.severity !== "ok" && (
                            <div className="mt-2 flex items-center gap-2 text-xs">
                              <span className="text-white/40">Recommended:</span>
                              <span className="text-white font-medium">{finding.recommendedPlanName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm text-white/50 mb-1">
                          {formatCurrency(finding.currentMonthlyCost)}/mo
                        </div>
                        {finding.savingsPerMonth > 0 && (
                          <div className="text-emerald-400 font-bold text-sm flex items-center gap-1 justify-end">
                            <TrendingDown size={14} />
                            -{formatCurrency(finding.savingsPerMonth)}/mo
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Duplicate Warnings */}
      {result.duplicates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-amber-400 mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <p className="font-semibold text-white text-sm mb-1">Duplicate Subscriptions Detected</p>
                  {result.duplicates.map((group, i) => (
                    <p key={i} className="text-xs text-white/60">
                      Your team is subscribed to multiple overlapping tools:{" "}
                      <span className="text-amber-300 font-medium">{group.join(" + ")}</span>. Consider consolidating to one platform.
                    </p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Share Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="mb-8"
      >
        <Card className="border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Share2 size={16} className="text-white/50" />
                <span className="text-sm text-white/70">Share this audit</span>
              </div>
              <div className="flex items-center gap-2 flex-1 max-w-sm">
                <div className="flex-1 text-xs text-white/40 bg-white/5 border border-white/10 rounded-lg px-3 py-2 truncate">
                  {shareUrl}
                </div>
                <Button size="sm" variant="outline" onClick={handleCopyLink}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom CTA (non-critical) */}
      {!result.consultationRecommended && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center pb-8"
        >
          <p className="text-white/40 text-sm mb-3">
            Get notified when your AI tool pricing changes
          </p>
          <Button variant="outline" onClick={() => setShowLeadModal(true)}>
            Subscribe to Price Alerts
          </Button>
        </motion.div>
      )}

      <LeadCaptureModal
        open={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        monthlySavings={result.monthlySavings}
        shareId={shareId}
      />
    </>
  );
}
