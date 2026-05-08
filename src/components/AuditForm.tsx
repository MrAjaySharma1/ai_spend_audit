"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Zap, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectOption } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TOOL_CATALOG } from "@/lib/pricing-data";
import type { AuditInput, ToolEntry, UseCase } from "@/lib/audit-engine";
import { cn } from "@/lib/utils";

const USE_CASES: { value: UseCase; label: string; emoji: string }[] = [
  { value: "coding", label: "Software Development", emoji: "💻" },
  { value: "writing", label: "Content & Writing", emoji: "✍️" },
  { value: "research", label: "Research & Analysis", emoji: "🔬" },
  { value: "data", label: "Data & Analytics", emoji: "📊" },
  { value: "mixed", label: "Mixed / General", emoji: "⚡" },
];

const TOOL_OPTIONS = Object.values(TOOL_CATALOG).map((t) => ({
  id: t.id,
  name: t.name,
  category: t.category,
}));

const STORAGE_KEY = "ai-spend-audit-draft";

function emptyTool(): ToolEntry {
  return { toolId: "cursor", planId: "cursor_pro", seats: 1, monthlySpend: 0 };
}

export function AuditForm() {
  const router = useRouter();
  const [tools, setTools] = useState<ToolEntry[]>([emptyTool()]);
  const [teamSize, setTeamSize] = useState(5);
  const [useCase, setUseCase] = useState<UseCase>("coding");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Persist to localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<AuditInput>;
        if (parsed.tools) setTools(parsed.tools);
        if (parsed.teamSize) setTeamSize(parsed.teamSize);
        if (parsed.useCase) setUseCase(parsed.useCase as UseCase);
      } catch {
        // ignore corrupt data
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tools, teamSize, useCase }));
  }, [tools, teamSize, useCase]);

  const updateTool = useCallback((idx: number, field: keyof ToolEntry, value: string | number) => {
    setTools((prev) => {
      const next = [...prev];
      if (field === "toolId") {
        // Auto-select first plan of new tool
        const firstPlan = TOOL_CATALOG[value as string]?.plans[0];
        next[idx] = { ...next[idx], toolId: value as string, planId: firstPlan?.id ?? "" };
      } else {
        next[idx] = { ...next[idx], [field]: value };
      }
      return next;
    });
  }, []);

  const addTool = useCallback(() => {
    setTools((prev) => [...prev, emptyTool()]);
  }, []);

  const removeTool = useCallback((idx: number) => {
    setTools((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (tools.length === 0) newErrors.tools = "Add at least one AI tool";
    if (teamSize < 1) newErrors.teamSize = "Team size must be at least 1";
    tools.forEach((t, i) => {
      if (t.seats < 1) newErrors[`seats_${i}`] = "Seats must be ≥ 1";
      if (!t.planId) newErrors[`plan_${i}`] = "Select a plan";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload: AuditInput = { tools, teamSize, useCase };
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Audit failed");
      const data = await res.json();
      localStorage.setItem("audit-result", JSON.stringify(data));
      router.push(`/results?id=${data.shareId}`);
    } catch (err) {
      setErrors({ submit: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">
      {/* Use Case Selection */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Primary Use Case</CardTitle>
            <CardDescription>How does your team primarily use AI tools?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {USE_CASES.map((uc) => (
                <button
                  key={uc.value}
                  type="button"
                  onClick={() => setUseCase(uc.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl p-3 border text-center transition-all duration-200 cursor-pointer",
                    useCase === uc.value
                      ? "border-violet-500 bg-violet-500/20 text-white shadow-lg shadow-violet-500/10"
                      : "border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:bg-white/10"
                  )}
                >
                  <span className="text-2xl">{uc.emoji}</span>
                  <span className="text-xs font-medium leading-tight">{uc.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Team Size */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Team Size</CardTitle>
            <CardDescription>Total number of people on your team (not just AI users)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-xs">
                <Input
                  id="teamSize"
                  type="number"
                  min={1}
                  max={10000}
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  placeholder="e.g. 5"
                />
                {errors.teamSize && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.teamSize}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {[1, 5, 10, 25, 50].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setTeamSize(n)}
                    className={cn(
                      "h-8 px-3 rounded-lg text-xs font-medium border transition-all cursor-pointer",
                      teamSize === n
                        ? "border-violet-500 bg-violet-500/20 text-violet-300"
                        : "border-white/15 bg-white/5 text-white/50 hover:border-white/30"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tools */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">AI Tools & Plans</CardTitle>
            <CardDescription>Add each AI tool your team is paying for</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errors.tools && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.tools}
              </p>
            )}

            <AnimatePresence initial={false}>
              {tools.map((tool, idx) => {
                const toolDef = TOOL_CATALOG[tool.toolId];
                const plans = toolDef?.plans ?? [];
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="rounded-xl border border-white/10 bg-white/3 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm font-semibold text-white/80">Tool #{idx + 1}</span>
                        {tools.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTool(idx)}
                            className="text-white/30 hover:text-red-400 transition-colors cursor-pointer"
                            aria-label="Remove tool"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Tool */}
                        <div className="space-y-1.5">
                          <Label>Tool</Label>
                          <Select
                            value={tool.toolId}
                            onChange={(e) => updateTool(idx, "toolId", e.target.value)}
                          >
                            {TOOL_OPTIONS.map((t) => (
                              <SelectOption key={t.id} value={t.id}>
                                {t.name}
                              </SelectOption>
                            ))}
                          </Select>
                        </div>

                        {/* Plan */}
                        <div className="space-y-1.5">
                          <Label>Plan</Label>
                          <Select
                            value={tool.planId}
                            onChange={(e) => updateTool(idx, "planId", e.target.value)}
                          >
                            {plans.map((p) => (
                              <SelectOption key={p.id} value={p.id}>
                                {p.name}
                              </SelectOption>
                            ))}
                          </Select>
                          {errors[`plan_${idx}`] && (
                            <p className="text-red-400 text-xs">{errors[`plan_${idx}`]}</p>
                          )}
                        </div>

                        {/* Seats */}
                        <div className="space-y-1.5">
                          <Label>Seats</Label>
                          <Input
                            type="number"
                            min={1}
                            max={10000}
                            value={tool.seats}
                            onChange={(e) => updateTool(idx, "seats", Number(e.target.value))}
                            placeholder="1"
                          />
                          {errors[`seats_${idx}`] && (
                            <p className="text-red-400 text-xs">{errors[`seats_${idx}`]}</p>
                          )}
                        </div>

                        {/* Monthly Spend */}
                        <div className="space-y-1.5">
                          <Label>
                            Monthly Spend ($)
                            <span className="text-white/30 font-normal ml-1">actual</span>
                          </Label>
                          <Input
                            type="number"
                            min={0}
                            value={tool.monthlySpend || ""}
                            onChange={(e) => updateTool(idx, "monthlySpend", Number(e.target.value))}
                            placeholder="Auto-calc"
                          />
                        </div>
                      </div>

                      {/* Plan hint */}
                      {toolDef && (
                        <p className="mt-2 text-xs text-white/35">
                          {toolDef.plans.find((p) => p.id === tool.planId)?.notes}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <Button
              type="button"
              variant="outline"
              onClick={addTool}
              className="w-full border-dashed border-white/20 hover:border-violet-500/50"
            >
              <Plus size={16} />
              Add another tool
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Submit */}
      {errors.submit && (
        <p className="text-red-400 text-sm flex items-center gap-1">
          <AlertCircle size={14} />
          {errors.submit}
        </p>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full h-14 text-base font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-xl shadow-violet-500/25"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Analyzing your spend...
            </>
          ) : (
            <>
              <Zap size={18} />
              Run AI Spend Audit
              <ChevronRight size={18} />
            </>
          )}
        </Button>
        <p className="text-center text-xs text-white/30 mt-3">
          Free, instant analysis · No credit card required · Results saved automatically
        </p>
      </motion.div>
    </form>
  );
}
